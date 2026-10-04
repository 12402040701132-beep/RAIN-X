"""
RAIN-X Verification and Meteorological Metrics Engine
Problem Statement: SIH26080 (MoES / NCMRWF)
Team: CodeWarriors123

Implements all official MoES / NCMRWF required metrics:
1. Continuous: RMSE, MAE, Mean Bias
2. Categorical / Extreme:
   - CSI (Critical Success Index / Threat Score)
   - POD (Probability of Detection / Hit Rate)
   - FAR (False Alarm Ratio)
   - ETS (Equitable Threat Score / Gilbert Skill Score)
3. Spatial: FSS (Fractions Skill Score)
4. Probabilistic: Brier Score & Reliability Curve
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Any

def compute_continuous_metrics(obs: np.ndarray, pred: np.ndarray) -> Dict[str, float]:
    """Computes continuous verification metrics: RMSE, MAE, Bias."""
    obs = np.asarray(obs, dtype=float)
    pred = np.asarray(pred, dtype=float)
    errors = pred - obs
    rmse = float(np.sqrt(np.mean(errors ** 2)))
    mae = float(np.mean(np.abs(errors)))
    bias = float(np.mean(errors))
    return {
        "rmse": round(rmse, 2),
        "mae": round(mae, 2),
        "bias": round(bias, 2)
    }

def compute_contingency_table(obs: np.ndarray, pred: np.ndarray, threshold: float = 64.5) -> Dict[str, int]:
    """
    Computes 2x2 contingency table for rainfall exceedance >= threshold.
    Hits (a), False Alarms (b), Misses (c), Correct Negatives (d).
    """
    obs_event = (obs >= threshold).astype(int)
    pred_event = (pred >= threshold).astype(int)

    hits = int(np.sum((pred_event == 1) & (obs_event == 1)))
    false_alarms = int(np.sum((pred_event == 1) & (obs_event == 0)))
    misses = int(np.sum((pred_event == 0) & (obs_event == 1)))
    correct_neg = int(np.sum((pred_event == 0) & (obs_event == 0)))

    return {
        "hits": hits,
        "false_alarms": false_alarms,
        "misses": misses,
        "correct_negatives": correct_neg,
        "total": len(obs)
    }

def compute_categorical_metrics(obs: np.ndarray, pred: np.ndarray, threshold: float = 64.5) -> Dict[str, float]:
    """
    Computes official sponsor metrics: CSI, POD, FAR, ETS.
    """
    ct = compute_contingency_table(obs, pred, threshold)
    a = ct["hits"]
    b = ct["false_alarms"]
    c = ct["misses"]
    d = ct["correct_negatives"]
    n = ct["total"]

    # POD = Hits / (Hits + Misses)
    pod = (a / (a + c)) if (a + c) > 0 else 0.0

    # FAR = False Alarms / (Hits + False Alarms)
    far = (b / (a + b)) if (a + b) > 0 else 0.0

    # CSI = Hits / (Hits + Misses + False Alarms)
    csi = (a / (a + b + c)) if (a + b + c) > 0 else 0.0

    # ETS (Equitable Threat Score)
    # a_ref = (a + b) * (a + c) / n
    # ETS = (a - a_ref) / (a + b + c - a_ref)
    a_ref = ((a + b) * (a + c)) / n if n > 0 else 0.0
    denom = (a + b + c - a_ref)
    ets = ((a - a_ref) / denom) if denom > 0 else 0.0

    return {
        "csi": round(float(csi), 3),
        "pod": round(float(pod), 3),
        "far": round(float(far), 3),
        "ets": round(float(ets), 3),
        "hits": a,
        "false_alarms": b,
        "misses": c,
        "correct_negatives": d
    }

def compute_spatial_fss(obs_grid: np.ndarray, pred_grid: np.ndarray, threshold: float = 35.0, window_size: int = 3) -> float:
    """
    Fractions Skill Score (FSS) (Roberts & Lean 2008).
    Assesses spatial neighborhood agreement for 2D precipitation fields.
    """
    obs_binary = (obs_grid >= threshold).astype(float)
    pred_binary = (pred_grid >= threshold).astype(float)

    # Simplified 1D/2D neighborhood filter
    from scipy.ndimage import uniform_filter
    obs_frac = uniform_filter(obs_binary, size=window_size, mode="constant", cval=0.0)
    pred_frac = uniform_filter(pred_binary, size=window_size, mode="constant", cval=0.0)

    mse = np.mean((pred_frac - obs_frac) ** 2)
    ref_mse = np.mean(pred_frac ** 2) + np.mean(obs_frac ** 2)
    if ref_mse == 0:
        return 1.0
    fss = 1.0 - (mse / ref_mse)
    return round(float(np.clip(fss, 0.0, 1.0)), 3)

def compute_probabilistic_metrics(obs: np.ndarray, pred_probs: np.ndarray, threshold: float = 64.5) -> Dict[str, Any]:
    """
    Computes Brier Score and binned calibration curve data.
    """
    obs_binary = (obs >= threshold).astype(int)
    probs = np.asarray(pred_probs, dtype=float)

    # Brier Score = mean((p_i - o_i)^2)
    brier_score = float(np.mean((probs - obs_binary) ** 2))

    # Reliability curve across 5 probability bins [0-0.2, 0.2-0.4, 0.4-0.6, 0.6-0.8, 0.8-1.0]
    bins = np.linspace(0.0, 1.0, 6)
    bin_centers = (bins[:-1] + bins[1:]) / 2.0
    obs_freqs = []
    sample_counts = []

    for k in range(len(bins) - 1):
        low, high = bins[k], bins[k+1]
        mask = (probs >= low) & (probs <= high if k == len(bins)-2 else probs < high)
        n_in_bin = int(mask.sum())
        sample_counts.append(n_in_bin)
        if n_in_bin > 0:
            obs_freqs.append(round(float(np.mean(obs_binary[mask])), 3))
        else:
            obs_freqs.append(round(float(bin_centers[k]), 3)) # ideal fallback

    return {
        "brier_score": round(brier_score, 4),
        "bin_centers": [round(float(c), 2) for c in bin_centers],
        "obs_freqs": obs_freqs,
        "sample_counts": sample_counts
    }

def evaluate_baseline_ladder(
    obs: np.ndarray,
    preds_dict: Dict[str, np.ndarray],
    threshold: float = 64.5
) -> pd.DataFrame:
    """
    Generates the core SIH proof table comparing all models on unseen data:
    Columns: Model | RMSE (mm) | MAE (mm) | Bias (mm) | CSI | POD | FAR | ETS
    """
    rows = []
    for model_name, pred_arr in preds_dict.items():
        cont = compute_continuous_metrics(obs, pred_arr)
        cat = compute_categorical_metrics(obs, pred_arr, threshold)
        rows.append({
            "Model": model_name,
            "RMSE (mm)": cont["rmse"],
            "MAE (mm)": cont["mae"],
            "Bias (mm)": cont["bias"],
            "CSI": cat["csi"],
            "POD": cat["pod"],
            "FAR": cat["far"],
            "ETS": cat["ets"]
        })
    return pd.DataFrame(rows)
