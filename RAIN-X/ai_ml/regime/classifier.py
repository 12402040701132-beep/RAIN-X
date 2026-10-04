"""
RAIN-X Weather Regime Classification Engine
Problem Statement: SIH26080 (MoES / NCMRWF)
Team: CodeWarriors123

Provides:
- Soft probabilistic regime inference P(Active), P(Break), P(Depression), P(Other)
- Transition day handling (no brittle hard classification)
- Regime confidence score and Shannon entropy indicator
- Out-of-Distribution (OOD) distance metric for fail-safe safety triggers
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Any, Optional
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
from ai_ml.preprocessing.features import FEATURE_COLUMNS, REGIME_NAMES

REGIME_FEATURES = [
    "mslp_hpa",
    "u850_ms",
    "v850_ms",
    "wind_speed_850",
    "z500_m",
    "rh700_pct",
    "tpw_kg_m2",
    "t2m_c",
    "dewpoint_dep_c",
    "sin_doy",
    "cos_doy"
]

class RegimeClassifier:
    def __init__(self, random_state: int = 42):
        self.random_state = random_state
        self.scaler = StandardScaler()
        self.model = GradientBoostingClassifier(
            n_estimators=75,
            learning_rate=0.08,
            max_depth=3,
            random_state=random_state
        )
        self.is_fitted = False
        self.train_mean = None
        self.train_cov_inv = None
        self.class_order = REGIME_NAMES

    def fit(self, df: pd.DataFrame, target_col: str = "true_regime") -> "RegimeClassifier":
        """
        Fits the regime probability classifier on historical/monsoon synoptic features.
        Calculates centroid and covariance inverse for OOD Mahalanobis scoring.
        """
        X = df[REGIME_FEATURES].values
        y = df[target_col].values

        X_scaled = self.scaler.fit_transform(X)
        self.model.fit(X_scaled, y)
        self.class_order = list(self.model.classes_)

        # Calculate empirical mean and pseudo-inverse covariance for OOD distance
        self.train_mean = np.mean(X_scaled, axis=0)
        cov = np.cov(X_scaled, rowvar=False) + 1e-4 * np.eye(len(REGIME_FEATURES))
        self.train_cov_inv = np.linalg.pinv(cov)
        self.is_fitted = True
        return self

    def predict_regime_probabilities(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """
        Estimates soft regime probabilities for each input instance.
        Returns:
            list of dicts containing:
                - probabilities: {regime: prob}
                - dominant_regime: str
                - confidence: float (max probability)
                - entropy: float (uncertainty of the atmospheric state)
                - ood_distance: float
                - is_ood: bool (if distance exceeds safety threshold)
        """
        if not self.is_fitted:
            raise RuntimeError("RegimeClassifier must be fitted before inference.")

        X = df[REGIME_FEATURES].values
        X_scaled = self.scaler.transform(X)
        raw_probs = self.model.predict_proba(X_scaled)

        results = []
        for i in range(len(df)):
            probs_array = raw_probs[i]
            prob_dict = {self.class_order[j]: float(probs_array[j]) for j in range(len(self.class_order))}

            # Ensure all canonical regimes exist in dict
            for reg in REGIME_NAMES:
                if reg not in prob_dict:
                    prob_dict[reg] = 0.0

            # Normalize to guarantee exact sum = 1.0
            total_p = sum(prob_dict.values())
            if total_p > 0:
                prob_dict = {k: v / total_p for k, v in prob_dict.items()}

            dominant_reg = max(prob_dict, key=prob_dict.get)
            confidence = prob_dict[dominant_reg]

            # Shannon entropy: H = - sum(p * log(p))
            entropy = -sum(p * np.log(p + 1e-9) for p in prob_dict.values())

            # Mahalanobis distance to training centroid
            diff = X_scaled[i] - self.train_mean
            ood_dist = float(np.sqrt(np.dot(np.dot(diff, self.train_cov_inv), diff.T)))
            is_ood = bool(ood_dist > 4.2)

            results.append({
                "probabilities": prob_dict,
                "dominant_regime": dominant_reg,
                "confidence": round(float(confidence), 3),
                "entropy": round(float(entropy), 3),
                "ood_distance": round(float(ood_dist), 2),
                "is_ood": is_ood
            })

        return results

    def predict_single(self, row: Dict[str, Any]) -> Dict[str, Any]:
        """Convenience method for single-row inference."""
        df = pd.DataFrame([row])
        return self.predict_regime_probabilities(df)[0]
