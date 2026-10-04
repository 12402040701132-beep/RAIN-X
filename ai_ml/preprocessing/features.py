"""
RAIN-X Preprocessing and Feature Engineering Module
Problem Statement: SIH26080 (MoES / NCMRWF)
Team: CodeWarriors123

Provides:
- Quality control and data safety validation (PASS / WARNING / FALLBACK)
- Physics-based atmospheric & spatial feature extraction
- Leakage-free feature scaling and pipeline transformation
- Synthetic NCMRWF/IMD monsoon benchmark generator for instant hackathon demonstration
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Any, Optional

FEATURE_COLUMNS = [
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
    "day_of_monsoon",
    "precip_prev24h_mm",
    "sin_doy",
    "cos_doy"
]

REGIME_NAMES = ["active", "break", "depression", "other"]

def validate_input_data(row_or_df: Any) -> Tuple[str, List[str]]:
    """
    Automated Data Quality & Safety Layer (USP 10 / Section 12).
    Checks physical plausibility, units, missingness, and range sanity.
    Returns:
        status: 'PASS', 'WARNING', or 'FALLBACK'
        issues: list of descriptive warnings or fatal errors
    """
    issues = []
    status = "PASS"

    if isinstance(row_or_df, dict):
        df = pd.DataFrame([row_or_df])
    else:
        df = row_or_df.copy()

    # Check for empty dataframe
    if len(df) == 0:
        return "FALLBACK", ["Empty input batch."]

    # 1. Missing columns
    missing_cols = [c for c in FEATURE_COLUMNS if c not in df.columns]
    if missing_cols:
        issues.append(f"Missing required predictor fields: {missing_cols}")
        status = "FALLBACK"
        return status, issues

    # 2. Check nulls
    null_counts = df[FEATURE_COLUMNS].isnull().sum().to_dict()
    bad_nulls = {k: v for k, v in null_counts.items() if v > 0}
    if bad_nulls:
        issues.append(f"Null values detected: {bad_nulls}")
        status = "WARNING" if len(bad_nulls) <= 2 else "FALLBACK"

    # 3. Check physical ranges
    for _, row in df.iterrows():
        p_raw = row.get("precip_raw_nwp", 0.0)
        if p_raw < 0:
            issues.append(f"Negative precipitation ({p_raw:.1f} mm) is unphysical.")
            status = "FALLBACK"
        elif p_raw > 600:
            issues.append(f"Unusually high NWP rainfall ({p_raw:.1f} mm > 600 mm).")
            status = "WARNING"

        mslp = row.get("mslp_hpa", 1005.0)
        if mslp < 940 or mslp > 1030:
            issues.append(f"MSLP {mslp:.1f} hPa outside realistic tropical range [940, 1030].")
            status = "FALLBACK"

        rh = row.get("rh700_pct", 80.0)
        if rh < 0 or rh > 105:
            issues.append(f"Relative humidity {rh:.1f}% out of boundary [0, 105].")
            status = "FALLBACK"

    return status, issues

def build_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Computes derived atmospheric indicators without future observation leakage.
    """
    out = df.copy()

    # Ensure wind speed is derived if missing
    if "wind_speed_850" not in out.columns or out["wind_speed_850"].isnull().any():
        u = out["u850_ms"].values
        v = out["v850_ms"].values
        out["wind_speed_850"] = np.sqrt(u**2 + v**2)

    # Cyclical day of year
    if "day_of_monsoon" in out.columns and ("sin_doy" not in out.columns or "cos_doy" not in out.columns):
        # 1 to 122 days for JJAS
        day_rad = (out["day_of_monsoon"] / 122.0) * (2 * np.pi)
        out["sin_doy"] = np.sin(day_rad)
        out["cos_doy"] = np.cos(day_rad)

    # Fill any minor remaining NaNs with domain-safe defaults
    defaults = {
        "precip_raw_nwp": 5.0,
        "mslp_hpa": 1005.0,
        "u850_ms": 10.0,
        "v850_ms": 2.0,
        "wind_speed_850": 10.5,
        "z500_m": 5860.0,
        "rh700_pct": 75.0,
        "tpw_kg_m2": 45.0,
        "t2m_c": 28.0,
        "dewpoint_dep_c": 3.0,
        "elevation_m": 250.0,
        "dist_coast_km": 150.0,
        "slope_deg": 1.5,
        "lead_time_hr": 24,
        "day_of_monsoon": 45,
        "precip_prev24h_mm": 8.0,
        "sin_doy": 0.5,
        "cos_doy": 0.86
    }
    for col, val in defaults.items():
        if col not in out.columns:
            out[col] = val
        else:
            out[col] = out[col].fillna(val)

    return out

def generate_synthetic_monsoon_dataset(n_samples: int = 1500, random_state: int = 42) -> pd.DataFrame:
    """
    Generates a realistic, physically-grounded monsoon evaluation dataset
    spanning 4 recognized IMD regimes across Indian sub-regions.
    Used for instant demo, unit testing, and model fitting without requiring
    restricted NCMRWF operational credentials.
    """
    rng = np.random.RandomState(random_state)

    regions = [
        {"name": "Central Monsoon Zone", "elev": 350, "dist_coast": 400, "base_rain": 18.0},
        {"name": "Western Ghats / Konkan", "elev": 780, "dist_coast": 25, "base_rain": 45.0},
        {"name": "Gangetic Plain / Bihar", "elev": 110, "dist_coast": 650, "base_rain": 15.0},
        {"name": "Northeast Hills / Assam", "elev": 620, "dist_coast": 500, "base_rain": 38.0},
        {"name": "Southern Peninsula", "elev": 420, "dist_coast": 180, "base_rain": 8.0}
    ]

    records = []
    for i in range(n_samples):
        # Choose regime with realistic monsoon probabilities
        regime_choice = rng.choice(REGIME_NAMES, p=[0.40, 0.25, 0.20, 0.15])
        region = regions[rng.choice(len(regions))]
        lead_time = rng.choice([24, 48, 72, 96, 120])
        day_of_monsoon = rng.randint(1, 123)

        # Physical features tuned per regime
        if regime_choice == "active":
            mslp = rng.normal(1001.0, 2.5)
            u850 = rng.normal(14.0, 3.0)   # Strong westerlies
            v850 = rng.normal(3.0, 2.0)
            rh700 = np.clip(rng.normal(88.0, 6.0), 50, 100)
            tpw = rng.normal(56.0, 5.0)
            z500 = rng.normal(5840.0, 15.0)
            t2m = rng.normal(27.5, 1.5)
            nwp_bias_factor = rng.uniform(0.75, 1.25) # NWP often misses intense cores
            true_rain_intensity = region["base_rain"] * rng.uniform(1.2, 2.8)

        elif regime_choice == "break":
            mslp = rng.normal(1008.0, 2.0) # High pressure over central India
            u850 = rng.normal(6.0, 2.5)    # Weak low-level jet
            v850 = rng.normal(-1.0, 1.5)
            rh700 = np.clip(rng.normal(62.0, 8.0), 30, 85)
            tpw = rng.normal(40.0, 4.0)
            z500 = rng.normal(5885.0, 12.0)
            t2m = rng.normal(31.0, 1.8)
            # NWP often overforecasts "phantom rain" during break spells
            nwp_bias_factor = rng.uniform(1.6, 2.5)
            true_rain_intensity = region["base_rain"] * rng.uniform(0.05, 0.4)

        elif regime_choice == "depression":
            mslp = rng.normal(994.0, 3.0)  # Intense cyclonic vortex
            u850 = rng.normal(18.0, 4.0)   # Heavy gale-force cyclonic circulation
            v850 = rng.normal(8.0, 3.5)
            rh700 = np.clip(rng.normal(94.0, 4.0), 75, 100)
            tpw = rng.normal(64.0, 5.0)
            z500 = rng.normal(5810.0, 20.0)
            t2m = rng.normal(26.0, 1.2)
            # NWP displaces depression track or underestimates localized extreme cores
            nwp_bias_factor = rng.uniform(0.55, 0.90)
            true_rain_intensity = region["base_rain"] * rng.uniform(2.2, 4.5)

        else: # other
            mslp = rng.normal(1004.0, 3.0)
            u850 = rng.normal(9.0, 3.0)
            v850 = rng.normal(1.0, 2.0)
            rh700 = np.clip(rng.normal(74.0, 10.0), 40, 95)
            tpw = rng.normal(48.0, 6.0)
            z500 = rng.normal(5865.0, 15.0)
            t2m = rng.normal(29.0, 2.0)
            nwp_bias_factor = rng.uniform(0.85, 1.20)
            true_rain_intensity = region["base_rain"] * rng.uniform(0.6, 1.4)

        # Orographic boost if near Western Ghats / Hills
        if region["name"] == "Western Ghats / Konkan":
            orog_factor = 1.0 + (region["elev"] / 1000.0) * 0.4
            true_rain_intensity *= orog_factor

        # Generate True Observation with realistic gamma-like rainfall distribution
        shape_k = 1.5
        scale_theta = max(0.5, true_rain_intensity / shape_k)
        precip_obs_mm = round(float(rng.gamma(shape_k, scale_theta)), 1)
        if rng.rand() < (0.35 if regime_choice == "break" else 0.10):
            precip_obs_mm = 0.0

        # Simulate Raw NWP with systematic regime error + random forecast noise
        noise = rng.normal(1.0, 0.20 + (lead_time / 200.0))
        precip_raw_nwp = round(float(max(0.0, precip_obs_mm * nwp_bias_factor * noise)), 1)
        if regime_choice == "break" and precip_obs_mm == 0.0 and rng.rand() < 0.6:
            precip_raw_nwp = round(float(rng.uniform(3.0, 16.0)), 1) # Overforecast error

        wind_speed_850 = float(np.sqrt(u850**2 + v850**2))
        dewpoint_dep = float(np.clip((100.0 - rh700) / 5.0 + rng.normal(0, 0.4), 0.5, 12.0))
        precip_prev24h = round(float(rng.gamma(1.2, max(0.5, true_rain_intensity * 0.7))), 1)

        day_rad = (day_of_monsoon / 122.0) * (2 * np.pi)

        records.append({
            "sample_id": f"SMPL-{10000+i}",
            "region": region["name"],
            "true_regime": regime_choice,
            "precip_raw_nwp": precip_raw_nwp,
            "precip_obs_mm": precip_obs_mm,
            "mslp_hpa": round(float(mslp), 1),
            "u850_ms": round(float(u850), 2),
            "v850_ms": round(float(v850), 2),
            "wind_speed_850": round(wind_speed_850, 2),
            "z500_m": round(float(z500), 1),
            "rh700_pct": round(float(rh700), 1),
            "tpw_kg_m2": round(float(tpw), 1),
            "t2m_c": round(float(t2m), 1),
            "dewpoint_dep_c": round(dewpoint_dep, 1),
            "elevation_m": region["elev"],
            "dist_coast_km": region["dist_coast"],
            "slope_deg": 1.2 if region["elev"] < 300 else 6.5,
            "lead_time_hr": int(lead_time),
            "day_of_monsoon": int(day_of_monsoon),
            "precip_prev24h_mm": precip_prev24h,
            "sin_doy": round(float(np.sin(day_rad)), 4),
            "cos_doy": round(float(np.cos(day_rad)), 4),
        })

    return pd.DataFrame(records)
