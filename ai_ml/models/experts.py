"""
RAIN-X Mixture-of-Experts, Soft Fusion, and Baseline Ladder Engine
Problem Statement: SIH26080 (MoES / NCMRWF)
Team: CodeWarriors123

Includes:
- Baseline A: Raw NWP
- Baseline B: Empirical Quantile Mapping (QM)
- Baseline C: Generic ML (Regime-Blind Control)
- Proposed RAIN-X: Adaptive Mixture of Regime Experts + Soft Probability Fusion
- Generic-Model Shrinkage for small sample stability
- Probabilistic Uncertainty bounds (P10, P50, P90)
- Fail-Safe Fallback when confidence is low or inputs are OOD
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Any, Optional
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from ai_ml.preprocessing.features import FEATURE_COLUMNS, REGIME_NAMES

EXPERT_PREDICTOR_COLS = [
    "precip_raw_nwp",
    "mslp_hpa",
    "u850_ms",
    "v850_ms",
    "wind_speed_850",
    "z500_m",
    "rh700_pct",
    "tpw_kg_m2",
    "t2m_c",
    "dewpoint_dep_c",
    "elevation_m",
    "dist_coast_km",
    "slope_deg",
    "lead_time_hr",
    "precip_prev24h_mm"
]

class QuantileMapper:
    """
    Classical Empirical Quantile Mapping (QM) Baseline (Baseline B).
    Maps cumulative distribution of raw NWP precipitation to observed precipitation.
    """
    def __init__(self, n_quantiles: int = 50):
        self.n_quantiles = n_quantiles
        self.raw_quantiles = None
        self.obs_quantiles = None
        self.is_fitted = False

    def fit(self, raw_precip: np.ndarray, obs_precip: np.ndarray):
        probs = np.linspace(0.001, 0.999, self.n_quantiles)
        self.raw_quantiles = np.quantile(raw_precip, probs)
        self.obs_quantiles = np.quantile(obs_precip, probs)
        self.is_fitted = True
        return self

    def predict(self, raw_precip: np.ndarray) -> np.ndarray:
        if not self.is_fitted:
            return raw_precip
        # Monotonic piecewise linear interpolation
        mapped = np.interp(raw_precip, self.raw_quantiles, self.obs_quantiles)
        return np.maximum(0.0, mapped)

class RainXEngine:
    """
    Complete RAIN-X Model Ladder and Adaptive Mixture-of-Experts with Soft Fusion.
    """
    def __init__(self, random_state: int = 42):
        self.random_state = random_state
        self.scaler = StandardScaler()
        self.qm = QuantileMapper()
        self.generic_model = GradientBoostingRegressor(
            n_estimators=100,
            learning_rate=0.07,
            max_depth=4,
            loss="squared_error",
            random_state=random_state
        )
        self.experts: Dict[str, GradientBoostingRegressor] = {}
        self.expert_sample_counts: Dict[str, int] = {}
        self.expert_residual_std: Dict[str, float] = {}
        self.generic_residual_std: float = 8.5
        self.is_fitted = False

    def fit(self, df: pd.DataFrame, target_col: str = "precip_obs_mm", regime_col: str = "true_regime"):
        """
        Fits:
        1. Quantile Mapping baseline
        2. Generic ML control model
        3. Regime-specific expert models (Active, Break, Depression, Other)
        4. Calculates empirical shrinkage factors alpha_k
        """
        X = df[EXPERT_PREDICTOR_COLS].values
        y = df[target_col].values
        raw_nwp = df["precip_raw_nwp"].values

        # 1. Fit Quantile Mapping
        self.qm.fit(raw_nwp, y)

        # 2. Fit Generic ML baseline
        X_scaled = self.scaler.fit_transform(X)
        self.generic_model.fit(X_scaled, y)
        gen_preds = self.generic_model.predict(X_scaled)
        self.generic_residual_std = float(np.std(y - gen_preds))

        # 3. Fit Regime Experts
        for regime in REGIME_NAMES:
            mask = (df[regime_col] == regime)
            count = int(mask.sum())
            self.expert_sample_counts[regime] = count

            expert = GradientBoostingRegressor(
                n_estimators=75,
                learning_rate=0.08,
                max_depth=3,
                loss="squared_error",
                random_state=self.random_state
            )

            if count >= 30:
                expert.fit(X_scaled[mask], y[mask])
                preds = expert.predict(X_scaled[mask])
                res_std = float(np.std(y[mask] - preds))
            else:
                # If regime has very few samples, clone generic model
                expert.fit(X_scaled, y)
                res_std = self.generic_residual_std

            self.experts[regime] = expert
            self.expert_residual_std[regime] = max(1.5, res_std)

        self.is_fitted = True
        return self

    def predict_ladder_single(
        self,
        row: Dict[str, Any],
        regime_meta: Dict[str, Any],
        quality_status: str = "PASS"
    ) -> Dict[str, Any]:
        """
        Runs the complete baseline ladder and soft-fusion prediction for a single forecast instance.
        """
        df = pd.DataFrame([row])
        return self.predict_ladder(df, [regime_meta], [quality_status])[0]

    def predict_ladder(
        self,
        df: pd.DataFrame,
        regime_metas: List[Dict[str, Any]],
        quality_statuses: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """
        Produces predictions across all 4 tiers of the proof ladder:
        Tier 1: Raw NWP
        Tier 2: Quantile Mapping
        Tier 3: Generic ML (Control)
        Tier 4: RAIN-X (Soft Fusion of Regime Experts with Shrinkage & Uncertainty)
        """
        if not self.is_fitted:
            raise RuntimeError("RainXEngine must be fitted before predict.")

        if quality_statuses is None:
            quality_statuses = ["PASS"] * len(df)

        X = df[EXPERT_PREDICTOR_COLS].values
        raw_nwp_vals = df["precip_raw_nwp"].values
        X_scaled = self.scaler.transform(X)

        # Baseline B: Quantile Mapping
        qm_preds = self.qm.predict(raw_nwp_vals)

        # Baseline C: Generic ML
        generic_preds = np.maximum(0.0, self.generic_model.predict(X_scaled))

        # Individual Regime Expert predictions
        expert_preds_by_regime: Dict[str, np.ndarray] = {}
        for reg in REGIME_NAMES:
            expert = self.experts[reg]
            preds = np.maximum(0.0, expert.predict(X_scaled))

            # Apply Generic-Model Shrinkage:
            # alpha = min(1.0, max(0.3, n_samples / 120))
            count = self.expert_sample_counts.get(reg, 50)
            alpha = min(1.0, max(0.35, count / 150.0))
            shrunk_preds = alpha * preds + (1.0 - alpha) * generic_preds
            expert_preds_by_regime[reg] = shrunk_preds

        results = []
        for i in range(len(df)):
            q_status = quality_statuses[i]
            r_meta = regime_metas[i]
            probs = r_meta["probabilities"]
            confidence = r_meta["confidence"]
            is_ood = r_meta.get("is_ood", False)
            raw_val = float(raw_nwp_vals[i])
            qm_val = float(qm_preds[i])
            generic_val = float(generic_preds[i])

            # Expert values for this instance
            instance_expert_vals = {
                reg: float(expert_preds_by_regime[reg][i]) for reg in REGIME_NAMES
            }

            # Signature Innovation: Soft Fusion
            # ŷ = Σ P(regime = k) * Expert_k
            fused_rain = sum(probs[reg] * instance_expert_vals[reg] for reg in REGIME_NAMES)
            fused_rain = max(0.0, fused_rain)

            # Fail-Safe Fallback Logic (USP 10)
            is_fallback = False
            fallback_reason = None
            final_rain = fused_rain

            if q_status == "FALLBACK":
                is_fallback = True
                fallback_reason = "Fatal data quality error detected in NWP predictors."
                final_rain = qm_val
            elif is_ood:
                is_fallback = True
                fallback_reason = f"Atmospheric state is Out-Of-Distribution (Mahalanobis dist={r_meta.get('ood_distance', 0)}). Reverting to Generic ML."
                # Blend softly with generic model
                final_rain = 0.7 * generic_val + 0.3 * fused_rain
            elif confidence < 0.35:
                is_fallback = True
                fallback_reason = f"High regime ambiguity (confidence={confidence:.2f} < 0.35). Shrunk toward Generic ML baseline."
                final_rain = 0.5 * generic_val + 0.5 * fused_rain

            # Calculate Uncertainty Quantiles: P10, P50, P90
            # Dispersion accounts for expert disagreement + residual std
            expert_vals_list = list(instance_expert_vals.values())
            expert_dispersion = np.std(expert_vals_list)

            # Weighted residual std
            combined_std = sum(probs[reg] * self.expert_residual_std.get(reg, 5.0) for reg in REGIME_NAMES)

            # If uncertain or OOD, widen interval safely
            if is_fallback or is_ood or confidence < 0.45:
                combined_std *= 1.4

            p50 = final_rain
            p10 = max(0.0, p50 - 1.28 * (combined_std + 0.2 * expert_dispersion))
            p90 = max(p50, p50 + 1.28 * (combined_std + 0.2 * expert_dispersion))

            results.append({
                "raw_nwp": round(raw_val, 1),
                "quantile_mapping": round(qm_val, 1),
                "generic_ml": round(generic_val, 1),
                "rain_x": round(final_rain, 1),
                "expert_predictions": {k: round(v, 1) for k, v in instance_expert_vals.items()},
                "p10": round(float(p10), 1),
                "p50": round(float(p50), 1),
                "p90": round(float(p90), 1),
                "uncertainty_band_width": round(float(p90 - p10), 1),
                "is_fallback": is_fallback,
                "fallback_reason": fallback_reason,
                "quality_status": q_status
            })

        return results
