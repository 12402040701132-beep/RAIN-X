# RAIN-X: Technical Solution Architecture
### Problem Statement ID: SIH26080 – Regime-Aware AI Post-Processing of Monsoon Rainfall Forecasts
**Sponsor:** Ministry of Earth Sciences (MoES) / NCMRWF  
**Theme:** Smart Automation | **Category:** Software  
**Team Name:** CodeWarriors123 | **Team ID:** 156139  

---

## 1. Executive Scientific Summary

Official Numerical Weather Prediction (NWP) models (such as NCMRWF NEPS-G at 12 km grid resolution) generate critical rainfall forecasts for the Indian summer monsoon (JJAS). However, raw NWP forecasts suffer from systematic, state-dependent errors:
- **Active Monsoon:** Strong moisture convergence; NWP often underestimates peak orographic deluge along the Western Ghats.
- **Break Monsoon:** The monsoon trough shifts to Himalayan foothills; NWP generates spurious convective precipitation ("phantom rain") over dry central India, creating high False Alarm Ratios (FAR).
- **Monsoon Lows / Depressions:** Severe cyclonic vortices from the Bay of Bengal; NWP models frequently misplace the track by 100–200 km or smooth out localized catastrophic rainfall cores (>115 mm/day).
- **Western Disturbances & Peripheral regimes:** Mixed baroclinic forcing; high forecast uncertainty.

A generic, one-size-fits-all bias correction (or regime-blind ML) averages across these conflicting physical states, muting extreme events and failing on transition days.

**RAIN-X** solves this via an **Adaptive Mixture-of-Experts (MoE)** architecture with **Soft Regime Fusion**, **Calibrated Extreme Event Estimation**, and **Safe Failback Protocols**.

---

## 2. Core Architecture Pipeline

```
NCMRWF NWP Fields (Precipitation, MSLP, Winds, TPW, Z500, RH700, Surface T2M)
          │
          ▼
[Step 1: Data Quality & Safety Layer]
   ├── Physical range boundaries (MSLP 940–1030 hPa, RH 0–105%)
   ├── Timestamp & spatial monotonic grid alignment
   └── Status flag: PASS / WARNING / FALLBACK
          │
          ▼
[Step 2: Physics-Informed Feature Engineering]
   ├── Atmospheric dynamics: Vorticity proxy, 850 hPa wind speed, moisture flux
   ├── Spatial/Terrain: Elevation, distance to coast, slope
   └── Temporal: Lead time (24h to 120h), Day of monsoon (cyclical sin/cos)
          │
          ▼
[Step 3: Weather Regime Probability Engine]
   ├── Computes soft probability vector: [P(Active), P(Break), P(Depression), P(Other)]
   ├── Mahalanobis Out-of-Distribution (OOD) distance metric
   └── Shannon Entropy for atmospheric state ambiguity
          │
          ▼
[Step 4: Baseline Ladder & Adaptive Mixture of Experts]
   ├── Baseline A: Raw NWP (Reference)
   ├── Baseline B: Quantile Mapping (Statistical CDF transfer)
   ├── Baseline C: Generic ML (Regime-Blind Control)
   └── Proposed RAIN-X: Specialized LightGBM/GBDT experts per regime
          │
          ▼
[Step 5: Soft Regime Fusion with Shrinkage]
   ├── Formula: ŷ = Σ P(Regime = k) × Expert_k
   ├── Generic Model Shrinkage: Prevents overfitting for data-sparse regimes
   └── Safe Fallback: Reverts to generic baseline if OOD or low confidence
          │
          ▼
[Step 6: Heavy-Rain Probability & Uncertainty Quantification]
   ├── P(Rain ≥ 64.5 mm) calibrated via Platt scaling / Isotonic regression
   ├── Uncertainty bounds: P10 (lower), P50 (median), P90 (upper)
   └── IMD Alert mapping: Green / Yellow / Orange / Red
          │
          ▼
[Step 7: Products & Verification Deliverables]
   ├── District-level aggregated decision products
   ├── High-resolution grid fields & spatial FSS verification
   └── Multi-page operational Streamlit dashboard & FastAPI REST backend
```

---

## 3. The 10 Unique Selling Points (USPs)

1. **Regime-Aware Post-Processing:** Specialized corrections learned conditionally for distinct weather patterns.
2. **Soft Regime Fusion:** Eliminates brittle hard thresholding; smoothly transitions across ambiguous days.
3. **Scientific Proof Ladder:** Tests against Raw NWP, Quantile Mapping, and Generic ML to verify true AI value add.
4. **Calibrated Heavy-Rain Probability:** Separate probabilistic classifier for high-impact rain with low Brier score.
5. **Leakage-Free Temporal Validation:** Chronological seasonal splits (train on past seasons, test on unseen seasons).
6. **Uncertainty Quantification:** P10, P50, and P90 intervals communicate confidence to district disaster managers.
7. **Out-of-Distribution (OOD) Fail-Safe:** Detects rare anomalies (e.g. erratic cyclones) and falls back safely.
8. **Automated Data Quality Protocol:** Issues PASS/WARNING/FALLBACK flags before running inference.
9. **Spatial Neighborhood Verification:** Evaluates Fractions Skill Score (FSS) at 25km, 50km, and 100km radii.
10. **Explainable AI (SHAP):** Transparent feature attribution without misleading causal claims.
