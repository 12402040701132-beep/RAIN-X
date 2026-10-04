"""
RAIN-X Automated Verification and Quality Assurance Test Suite
Problem Statement: SIH26080 | Team: CodeWarriors123
"""

import pytest
import numpy as np
import pandas as pd

from ai_ml.preprocessing.features import (
    validate_input_data,
    build_features,
    generate_synthetic_monsoon_dataset,
    REGIME_NAMES
)
from ai_ml.regime.classifier import RegimeClassifier
from ai_ml.models.experts import RainXEngine, QuantileMapper
from ai_ml.probabilistic.heavy_rain import HeavyRainProbabilityModel
from ai_ml.verification.metrics import (
    compute_continuous_metrics,
    compute_categorical_metrics,
    compute_spatial_fss,
    compute_probabilistic_metrics
)

def test_data_quality_validation():
    # Valid sample
    valid_row = {
        "precip_raw_nwp": 12.0, "mslp_hpa": 1002.0, "u850_ms": 10.0, "v850_ms": 2.0,
        "wind_speed_850": 10.2, "z500_m": 5850.0, "rh700_pct": 80.0, "tpw_kg_m2": 45.0,
        "t2m_c": 28.0, "dewpoint_dep_c": 3.0, "elevation_m": 200.0, "dist_coast_km": 100.0,
        "slope_deg": 1.0, "lead_time_hr": 24, "day_of_monsoon": 30, "precip_prev24h_mm": 5.0,
        "sin_doy": 0.5, "cos_doy": 0.86
    }
    status, issues = validate_input_data(valid_row)
    assert status == "PASS"
    assert len(issues) == 0

    # Unphysical negative rain
    bad_row = valid_row.copy()
    bad_row["precip_raw_nwp"] = -10.0
    status, issues = validate_input_data(bad_row)
    assert status == "FALLBACK"
    assert any("Negative precipitation" in s for s in issues)

def test_regime_classifier():
    df = generate_synthetic_monsoon_dataset(n_samples=200, random_state=42)
    rc = RegimeClassifier(random_state=42)
    rc.fit(df)

    test_row = df.iloc[0:5]
    preds = rc.predict_regime_probabilities(test_row)
    assert len(preds) == 5

    for p in preds:
        probs = p["probabilities"]
        assert len(probs) == 4
        # Probabilities must sum to 1.0 within floating point precision
        assert abs(sum(probs.values()) - 1.0) < 1e-4
        assert 0.0 <= p["confidence"] <= 1.0
        assert p["dominant_regime"] in REGIME_NAMES

def test_soft_fusion_math():
    df = generate_synthetic_monsoon_dataset(n_samples=250, random_state=42)
    engine = RainXEngine(random_state=42)
    engine.fit(df)

    sample = df.iloc[0:2].copy()
    mock_regime = [{
        "probabilities": {"active": 0.70, "depression": 0.30, "break": 0.0, "other": 0.0},
        "dominant_regime": "active",
        "confidence": 0.70,
        "is_ood": False
    }, {
        "probabilities": {"break": 0.90, "other": 0.10, "active": 0.0, "depression": 0.0},
        "dominant_regime": "break",
        "confidence": 0.90,
        "is_ood": False
    }]

    preds = engine.predict_ladder(sample, mock_regime)
    assert len(preds) == 2
    for p in preds:
        assert p["rain_x"] >= 0.0
        assert p["p10"] <= p["p50"] <= p["p90"]

def test_heavy_rain_probability():
    df = generate_synthetic_monsoon_dataset(n_samples=200, random_state=42)
    hr = HeavyRainProbabilityModel(threshold_mm=64.5, random_state=42)
    hr.fit(df)

    res = hr.predict_probability(df.iloc[0:5])
    assert len(res) == 5
    for r in res:
        assert 0.0 <= r["heavy_rain_prob"] <= 1.0
        assert r["imd_category"] in ["GREEN", "YELLOW", "ORANGE", "RED"]

def test_verification_metrics():
    obs = np.array([0.0, 10.0, 75.0, 120.0, 0.0, 45.0])
    pred = np.array([2.0, 12.0, 68.0, 110.0, 0.0, 50.0])

    cont = compute_continuous_metrics(obs, pred)
    assert cont["rmse"] > 0.0
    assert cont["mae"] > 0.0

    cat = compute_categorical_metrics(obs, pred, threshold=64.5)
    assert 0.0 <= cat["csi"] <= 1.0
    assert 0.0 <= cat["pod"] <= 1.0
    assert 0.0 <= cat["far"] <= 1.0

    fss = compute_spatial_fss(obs, pred, threshold=30.0)
    assert 0.0 <= fss <= 1.0
