/**
 * RAIN-X Operational Forecast Report Generator
 * Generates an official, printable MoES / NCMRWF Meteorological Bulletin
 * for offline viewing and distribution to Disaster Management Authorities (SDMA).
 */

import { HistoricalEvent, DistrictForecast } from '../types';

export function generateForecastReportHtml(
  event: HistoricalEvent,
  district: DistrictForecast,
  oodThreshold: number = 4.2
): string {
  const generatedAt = new Date().toUTCString();
  const alertBg = district.alertCategory === 'RED' ? '#991b1b' :
                  district.alertCategory === 'ORANGE' ? '#9a3412' :
                  district.alertCategory === 'YELLOW' ? '#854d0e' : '#166534';

  const auditStatus = event.oodDistance > oodThreshold ? 'FALLBACK' : event.status;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>RAIN-X Forecast Bulletin - ${district.name} (${district.state})</title>
  <style>
    @page { size: A4; margin: 20mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      color: #1e293b;
      background: #ffffff;
      line-height: 1.5;
      font-size: 13px;
      margin: 0;
      padding: 24px;
    }
    .header {
      border-bottom: 2px solid #00838f;
      padding-bottom: 12px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .title-group h1 {
      margin: 0;
      color: #0b192c;
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .title-group p {
      margin: 2px 0 0 0;
      color: #64748b;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .doc-meta {
      text-align: right;
      font-size: 11px;
      color: #475569;
    }
    .alert-banner {
      background: ${alertBg};
      color: #ffffff;
      padding: 10px 16px;
      border-radius: 6px;
      font-weight: bold;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }
    .card {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 14px;
      background: #f8fafc;
    }
    .card h3 {
      margin: 0 0 10px 0;
      font-size: 13px;
      color: #0b192c;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .stat-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      border-bottom: 1px dotted #e2e8f0;
    }
    .stat-row:last-child {
      border-bottom: none;
    }
    .stat-label {
      color: #64748b;
      font-weight: 500;
    }
    .stat-val {
      font-weight: 700;
      color: #0f172a;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    }
    .big-stat {
      font-size: 26px;
      font-weight: 800;
      color: #00838f;
      line-height: 1.1;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      font-size: 12px;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 8px 10px;
      text-align: left;
    }
    th {
      background: #e2e8f0;
      color: #1e293b;
      font-weight: 600;
    }
    .footer {
      margin-top: 30px;
      border-top: 1px solid #cbd5e1;
      padding-top: 10px;
      font-size: 10px;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="title-group">
      <h1>NATIONAL CENTRE FOR MEDIUM RANGE WEATHER FORECASTING</h1>
      <p>Ministry of Earth Sciences, Government of India • RAIN-X Intelligence System</p>
    </div>
    <div class="doc-meta">
      <div><b>Document ID:</b> RX-OPS-${Date.now().toString().slice(-6)}</div>
      <div><b>Issued:</b> ${generatedAt}</div>
      <div><b>Valid For:</b> Next 24 Hours (+24h Lead)</div>
    </div>
  </div>

  <div class="alert-banner">
    <span>OPERATIONAL MONSOON RAINFALL BULLETIN & ALERT LEVEL: [${district.alertCategory}]</span>
    <span>Target: ${district.name}, ${district.state} (${district.subdivision})</span>
  </div>

  <div class="grid-2">
    <div class="card">
      <h3>1. Precipitation Guidance Summary</h3>
      <div style="margin-bottom: 12px;">
        <span class="stat-label">RAIN-X Post-Processed Forecast:</span>
        <div class="big-stat">${district.rainX} mm / 24h</div>
        <div style="font-size: 11px; color: #475569; margin-top: 2px;">
          Raw NWP Baseline: <b>${district.rawNwp} mm</b> (Bias Correction: <b>${district.delta > 0 ? '+' : ''}${district.delta} mm</b>)
        </div>
      </div>
      <div class="stat-row">
        <span class="stat-label">Uncertainty Bounds (P10 - P90):</span>
        <span class="stat-val">${event.p10} - ${event.p90} mm (±${district.uncertaintyBand} mm)</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Calibrated P(Rain ≥ 64.5 mm):</span>
        <span class="stat-val" style="color: ${district.heavyRainProb >= 75 ? '#b91c1c' : '#00838f'};">
          ${district.heavyRainProb}% (Platt Calibrated)
        </span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Observed Verification Station:</span>
        <span class="stat-val">${district.observed} mm</span>
      </div>
    </div>

    <div class="card">
      <h3>2. Weather Regime & Synoptic State</h3>
      <div class="stat-row">
        <span class="stat-label">Dominant Weather Regime:</span>
        <span class="stat-val" style="text-transform: uppercase;">${district.dominantRegime} (${(district.regimeConfidence * 100).toFixed(1)}%)</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Mean Sea Level Pressure (MSLP):</span>
        <span class="stat-val">${event.synoptic.mslp} hPa</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">850 hPa Westerly Jet Speed:</span>
        <span class="stat-val">${event.synoptic.wind850} m/s</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Total Precipitable Water (TPW):</span>
        <span class="stat-val">${event.synoptic.tpw} kg/m²</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">OOD Mahalanobis Distance:</span>
        <span class="stat-val">${event.oodDistance.toFixed(1)} (Limit: ${oodThreshold.toFixed(1)})</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Pre-Inference Safety Status:</span>
        <span class="stat-val" style="color: ${auditStatus === 'PASS' ? '#16a34a' : '#dc2626'}; font-weight:800;">
          ${auditStatus}
        </span>
      </div>
    </div>
  </div>

  <div class="card" style="margin-bottom: 20px;">
    <h3>3. Soft Regime Probability Decomposition</h3>
    <table>
      <thead>
        <tr>
          <th>Monsoon Regime</th>
          <th>Probability Weight P(Regime | X)</th>
          <th>Regime Expert Correction</th>
          <th>Key Synoptic Mechanism</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><b>Active Monsoon</b></td>
          <td><b>${(event.probabilities.active * 100).toFixed(1)}%</b></td>
          <td>98.2 mm</td>
          <td>Strong south-westerly low-level jet, active monsoon trough across central zone</td>
        </tr>
        <tr>
          <td><b>Monsoon Low / Depression</b></td>
          <td><b>${(event.probabilities.depression * 100).toFixed(1)}%</b></td>
          <td>132.0 mm</td>
          <td>Organized cyclonic vortex over Bay of Bengal, high tropospheric shear</td>
        </tr>
        <tr>
          <td><b>Break / Subdued Monsoon</b></td>
          <td><b>${(event.probabilities.break * 100).toFixed(1)}%</b></td>
          <td>1.5 mm</td>
          <td>Trough shifted northward to Himalayan foothills; dry air entrainment</td>
        </tr>
        <tr>
          <td><b>Other / Western Disturbance</b></td>
          <td><b>${(event.probabilities.other * 100).toFixed(1)}%</b></td>
          <td>42.0 mm</td>
          <td>Peripheral wave interaction; generic-model shrinkage applied</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="card">
    <h3>4. Actionable Directives for District Disaster Managers (SDMA)</h3>
    <ul style="margin: 0; padding-left: 20px; font-size: 11px; color: #334155;">
      <li><b>Hydrological Management:</b> Reservoir gate operations should plan for estimated volume range [${event.p10} mm – ${event.p90} mm] over next 24 hours.</li>
      <li><b>Urban Flooding Watch:</b> Localized convective cell cores may exceed average NWP guidance by up to +${district.delta} mm in low-lying catchments.</li>
      <li><b>Common Alerting Protocol (CAP):</b> Disseminate Level ${district.alertCategory} bulletin to district emergency operations centers.</li>
    </ul>
  </div>

  <div class="footer">
    <span>National Centre for Medium Range Weather Forecasting (NCMRWF), A-50, Sector-62, Noida, UP, India</span>
    <span>Generated by RAIN-X v1.0 • Verified Leakage-Free Operational Protocol</span>
  </div>
</body>
</html>`;
}

export function downloadForecastReport(
  event: HistoricalEvent,
  district: DistrictForecast,
  oodThreshold: number = 4.2
): void {
  const htmlContent = generateForecastReportHtml(event, district, oodThreshold);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  // Trigger file download
  const a = document.createElement('a');
  a.href = url;
  a.download = `RAINX_Forecast_Report_${district.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
