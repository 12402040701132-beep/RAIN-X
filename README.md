# RAIN-X
### Regime-Aware Extreme Rainfall Intelligence Engine

**Smart India Hackathon 2026**  
**Problem Statement ID:** SIH26080 – Regime-Aware AI Post-Processing of Monsoon Rainfall Forecasts  
**Sponsoring Ministry:** Ministry of Earth Sciences (MoES) / NCMRWF  
**Theme:** Smart Automation | **Category:** Software  
**Team Name:** CodeWarriors123 | **Team ID:** 156139

> *"Don't correct rainfall blindly. Understand the atmosphere first."*

---

## Project Overview

RAIN-X is an intelligent post-processing layer that sits on top of NCMRWF Numerical Weather Prediction (NWP) models.  

It does **not** replace the official weather model. Instead, it improves the existing forecast by:

1. Identifying the prevailing monsoon weather regime (Active, Break, Monsoon Low/Depression, Other)
2. Blending regime-specific expert models using soft probabilities  
   $$\hat{y} = \sum P(\text{regime}_k) \times \text{Expert}_k$$
3. Applying generic-model shrinkage to avoid overfitting rare regimes
4. Generating calibrated heavy-rainfall probability (≥ 64.5 mm/day) and uncertainty bounds (P10, P50, P90)
5. Triggering a safe fallback for out-of-distribution or low-confidence cases
6. Proving every improvement on unseen chronological test data against Raw NWP, Quantile Mapping, and Generic ML baselines

---

## Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
2. Run the Interactive Dashboard (Recommended for Demo)
Bashstreamlit run frontend/app.py
3. Run the Full End-to-End Pipeline
Bashpython scripts/run_pipeline_demo.py
4. Start the FastAPI Inference Server
Bashuvicorn backend.api.main:app --host 0.0.0.0 --port 8000 --reload
Swagger docs available at: http://127.0.0.1:8000/docs
5. Run Tests
Bashpytest tests/ -v

Repository Structure
textRAIN-X/
├── frontend/
│   └── app.py                          # 5-Page Streamlit Dashboard
├── backend/
│   └── api/
│       └── main.py                     # FastAPI Inference Server
├── ai_ml/
│   ├── preprocessing/
│   │   └── features.py                 # Feature engineering & synthetic data
│   ├── regime/
│   │   └── classifier.py               # Soft regime probability engine
│   ├── models/
│   │   └── experts.py                  # Expert models + Soft Fusion
│   ├── probabilistic/
│   │   └── heavy_rain.py               # Heavy-rain probability + Uncertainty
│   └── verification/
│       └── metrics.py                  # RMSE, CSI, POD, FAR, ETS, FSS, Brier
├── config/
│   └── settings.yaml                   # Configuration & thresholds
├── data/                               # Data storage
├── scripts/
│   └── run_pipeline_demo.py            # One-command full pipeline
├── docs/
│   └── sih_2026_solution_architecture.md
├── tests/
│   └── test_rainx_pipeline.py
├── requirements.txt
└── README.md

5-Page Streamlit Dashboard





























PageWhat it Shows1. Operational ForecastCorrected rainfall, Heavy-rain probability, Dominant regime, P10–P90 uncertainty band, District-level view2. Weather Regime EngineSoft probability bars for Active / Break / Depression / Other + Confidence score3. Model ComparisonSide-by-side comparison: Observed vs Raw NWP vs Quantile Mapping vs Generic ML vs RAIN-X4. Verification & MetricsRMSE, MAE, Bias, CSI, POD, FAR, ETS, FSS on unseen chronological test data5. Explainability & SafetyFeature importance, Data quality flag, Safe fallback status (PASS / WARNING / FALLBACK)

Scientific Proof Ladder
RAIN-X is always evaluated against strong baselines on unseen chronological data:






























ModelMethodPurposeBaseline ARaw NWPOfficial forecast without any correctionBaseline BQuantile MappingClassical statistical bias correctionBaseline CGeneric MLOne ML model for all weather situationsProposedRAIN-XRegime experts + Soft Fusion + Uncertainty
Key Principle: We only claim improvement when RAIN-X beats all three baselines on the held-out test set.

Safe Fallback Mechanism
RAIN-X automatically switches to a safer mode when:

Input values are physically impossible
Maximum regime probability is very low (high uncertainty)
The weather situation looks unfamiliar (Out-of-Distribution)

In these cases the system:

Sets status to FALLBACK
Shrinks predictions toward the validated generic model
Widens the uncertainty band (P10–P90)

This ensures the system never becomes overconfident.

Key Innovations

Soft Regime Fusion – No brittle hard switching between regimes
Mixture of Experts – Specialized models for different monsoon situations
Separate Heavy-Rain Model – Extremes are not averaged away
Uncertainty Quantification – P10 / P50 / P90 on every forecast
Safe Fallback – Protects decision-makers when confidence is low
Leakage-Free Evaluation – Strict chronological train / validate / test splits


Technology Stack





























LayerToolsData & FeaturesPython, Pandas, NumPy, xarray, GeoPandasMachine LearningLightGBM / XGBoost, scikit-learn, SHAPDashboardStreamlit + PlotlyAPIFastAPI + UvicornDeploymentDocker-ready

Important Note for Judges

RAIN-X is a post-processing layer. It does not replace NCMRWF models.
It does not issue official weather warnings.
All performance claims are based only on leakage-free chronological evaluation.
Demo data is clearly labelled when real operational NWP access is not available.


Team
CodeWarriors123

Team ID: 156139

Smart India Hackathon 2026 | SIH26080

Sponsored by: Ministry of Earth Sciences (MoES) / NCMRWF
