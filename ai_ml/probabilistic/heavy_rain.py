"""
RAIN-X Calibrated Heavy-Rainfall Probability Engine
Problem Statement: SIH26080 (MoES / NCMRWF)
Team: CodeWarriors123

Estimates calibrated operational probability:
P(Precipitation >= T | NWP, atmospheric state, regime, location, lead time)
Default operational threshold T = 64.5 mm/day (Official IMD Heavy Rainfall Threshold).
Calibrated using Isotonic / Platt logistic regression to guarantee probabilistic reliability and minimize Brier score.
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Any, Optional
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.calibration import CalibratedClassifierCV
from sklearn.preprocessing import StandardScaler
from ai_ml.preprocessing.features import FEATURE_COLUMNS

HEAVY_RAIN_FEATURES = [
    "precip_raw_nwp",
    "mslp_hpa",
    "wind_speed_850",
    "rh700_pct",
    "tpw_kg_m2",
    "elevation_m",
    "dist_coast_km",
    "precip_prev24h_mm",
    "lead_time_hr"
]

class HeavyRainProbabilityModel:
    def __init__(self, threshold_mm: float = 64.5, random_state: int = 42):
        self.threshold_mm = threshold_mm
        self.random_state = random_state
        self.scaler = StandardScaler()
        base_gb = GradientBoostingClassifier(
            n_estimators=60,
            learning_rate=0.08,
            max_depth=3,
            random_state=random_state
        )
        self.calibrated_model = CalibratedClassifierCV(
            estimator=base_gb,
            method="sigmoid", # Platt scaling
            cv=3
        )
        self.is_fitted = False

    def fit(self, df: pd.DataFrame, target_precip_col: str = "precip_obs_mm") -> "HeavyRainProbabilityModel":
        """
        Fits the extreme rain binary classifier and calibrates probabilities against observed exceedance.
        """
        X = df[HEAVY_RAIN_FEATURES].values
        y_binary = (df[target_precip_col].values >= self.threshold_mm).astype(int)

        X_scaled = self.scaler.fit_transform(X)
        self.calibrated_model.fit(X_scaled, y_binary)
        self.is_fitted = True
        return self

    def predict_probability(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """
        Returns calibrated heavy-rain probability P(Rain >= T) and warning levels.
        IMD Warning Category Mapping:
        - Green (< 25%): No Warning / Light
        - Yellow (25% - 50%): Watch / Be Aware
        - Orange (50% - 75%): Alert / Be Prepared
        - Red (> 75%): Warning / Take Action
        """
        if not self.is_fitted:
            raise RuntimeError("HeavyRainProbabilityModel must be fitted before predict.")

        X = df[HEAVY_RAIN_FEATURES].values
        X_scaled = self.scaler.transform(X)
        probs = self.calibrated_model.predict_proba(X_scaled)[:, 1]

        results = []
        for p in probs:
            p_float = float(np.clip(p, 0.001, 0.999))
            if p_float < 0.25:
                category = "GREEN"
                alert_text = "No Warning"
                color = "#16a34a"
            elif p_float < 0.50:
                category = "YELLOW"
                alert_text = "Watch (Be Updated)"
                color = "#ca8a04"
            elif p_float < 0.75:
                category = "ORANGE"
                alert_text = "Alert (Be Prepared)"
                color = "#ea580c"
            else:
                category = "RED"
                alert_text = "Warning (Take Action)"
                color = "#dc2626"

            results.append({
                "threshold_mm": self.threshold_mm,
                "heavy_rain_prob_pct": round(p_float * 100.0, 1),
                "heavy_rain_prob": round(p_float, 3),
                "imd_category": category,
                "alert_text": alert_text,
                "badge_color": color
            })

        return results

    def predict_single(self, row: Dict[str, Any]) -> Dict[str, Any]:
        df = pd.DataFrame([row])
        return self.predict_probability(df)[0]
