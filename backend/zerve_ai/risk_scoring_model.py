
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.inspection import permutation_importance
from sklearn.metrics import classification_report, roc_auc_score
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import warnings
warnings.filterwarnings('ignore')

# ── Zerve Design System ────────────────────────────────────────────────────────
_BG  = '#1D1D20'
_FG  = '#fbfbff'
_FG2 = '#909094'
_PAL = ['#A1C9F4', '#FFB482', '#8DE5A1', '#FF9F9B', '#D0BBFF', '#ffd400']

FEATURES = ['debt_equity_ratio', 'revenue_growth', 'cashflow_stability',
            'litigation_score', 'news_sentiment', 'sector_risk']

# ── 1. Synthetic Training Data ─────────────────────────────────────────────────
np.random.seed(42)
_N = 2000

def _make_dataset(n):
    """Generate synthetic credit risk features with realistic correlations."""
    _der  = np.random.gamma(2, 0.8, n)
    _rg   = np.random.normal(0.08, 0.25, n)
    _cs   = np.random.beta(3, 2, n)
    _ls   = np.random.beta(1.5, 6, n)
    _ns   = np.random.normal(0.1, 0.4, n).clip(-1, 1)
    _sr   = np.random.uniform(0, 1, n)

    _raw = (0.35 * (_der / 5.0) +
            0.20 * (1 - (_rg + 1) / 2) +
            0.20 * (1 - _cs) +
            0.10 * _ls +
            0.10 * (1 - (_ns + 1) / 2) +
            0.05 * _sr)
    _label = (_raw + np.random.normal(0, 0.1, n) > 0.45).astype(int)

    return pd.DataFrame({
        'debt_equity_ratio':  _der,
        'revenue_growth':     _rg,
        'cashflow_stability': _cs,
        'litigation_score':   _ls,
        'news_sentiment':     _ns,
        'sector_risk':        _sr,
        'default':            _label
    })

df_risk = _make_dataset(_N)
X = df_risk[FEATURES].values
y = df_risk['default'].values

print(f"Dataset: {_N} samples | Default rate: {y.mean():.1%}")

# ── 2. Train / Test Split + RandomForest ──────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

risk_model = RandomForestClassifier(
    n_estimators=300,
    max_depth=8,
    min_samples_leaf=10,
    class_weight='balanced',
    random_state=42,
    n_jobs=-1
)
risk_model.fit(X_train, y_train)

y_pred  = risk_model.predict(X_test)
y_proba = risk_model.predict_proba(X_test)[:, 1]
auc     = roc_auc_score(y_test, y_proba)

print(f"\nModel Performance  |  AUC-ROC: {auc:.4f}")
print(classification_report(y_test, y_pred, target_names=['Low Risk', 'High Risk']))

# ── 3. Manual TreeExplainer (SHAP-style per-instance attribution) ─────────────
# Uses the mean decrease in probability when each feature is masked to its
# training mean — a single-sample conditional perturbation approach.

def tree_explain_instance(model, x_row, feature_names, background_mean):
    """
    Compute per-feature risk contributions for a single sample.
    For each feature we measure: P(risk|x) − P(risk|x with feature=mean)
    This gives a signed attribution analogous to SHAP values.
    """
    base_prob = model.predict_proba(x_row.reshape(1, -1))[0, 1]
    attribs = {}
    for i, feat in enumerate(feature_names):
        x_masked = x_row.copy()
        x_masked[i] = background_mean[i]
        masked_prob = model.predict_proba(x_masked.reshape(1, -1))[0, 1]
        attribs[feat] = round(float(base_prob - masked_prob), 5)
    return attribs, base_prob

# Background = training mean (represents "average" applicant)
_bg_mean = X_train.mean(axis=0)

# Global feature importance via permutation on test set
_perm = permutation_importance(risk_model, X_test, y_test, n_repeats=10,
                                random_state=42, scoring='roc_auc')
global_importance = dict(zip(FEATURES, _perm.importances_mean))

print("\nGlobal Feature Importance (Permutation AUC drop):")
for _f, _v in sorted(global_importance.items(), key=lambda x: -x[1]):
    print(f"  {_f:<25} {_v:+.4f}")

# ── 4. Score a Sample Applicant ───────────────────────────────────────────────
sample_applicant = {
    'debt_equity_ratio':  3.2,
    'revenue_growth':    -0.05,
    'cashflow_stability': 0.35,
    'litigation_score':   0.25,
    'news_sentiment':    -0.30,
    'sector_risk':        0.65
}

_sample_X = np.array([sample_applicant[f] for f in FEATURES])
shap_explanation, _raw_prob = tree_explain_instance(
    risk_model, _sample_X, FEATURES, _bg_mean
)

# Signed contributions → risk score 0–100
risk_score = round(_raw_prob * 100, 1)

if risk_score < 30:
    loan_approval     = 'APPROVED'
    recommended_limit = 500_000
    interest_rate     = 4.5
elif risk_score < 55:
    loan_approval     = 'CONDITIONAL'
    recommended_limit = 250_000
    interest_rate     = 7.0
elif risk_score < 75:
    loan_approval     = 'REVIEW'
    recommended_limit = 100_000
    interest_rate     = 11.5
else:
    loan_approval     = 'DECLINED'
    recommended_limit = 0
    interest_rate     = None

shap_explanation_sorted = dict(
    sorted(shap_explanation.items(), key=lambda x: abs(x[1]), reverse=True)
)

print("\n── Sample Applicant Risk Assessment ────────────────────────────")
print(f"  Risk Score          : {risk_score}/100")
print(f"  Decision            : {loan_approval}")
print(f"  Recommended Limit   : ${recommended_limit:,.0f}")
if interest_rate:
    print(f"  Interest Rate       : {interest_rate}%")
else:
    print( "  Interest Rate       : N/A (Declined)")
print("\n  SHAP-style Feature Contributions (positive = increases risk vs baseline):")
for feat, val in shap_explanation_sorted.items():
    _bar = '█' * int(abs(val) * 200)
    _dir = '▲' if val > 0 else '▼'
    print(f"  {_dir} {feat:<25} {val:+.4f}  {_bar}")

# ── 5. Visualisations ─────────────────────────────────────────────────────────

# 5a: Per-instance SHAP-style attribution
fig_shap, ax_shap = plt.subplots(figsize=(10, 5))
fig_shap.patch.set_facecolor(_BG); ax_shap.set_facecolor(_BG)

_feats = list(shap_explanation_sorted.keys())
_vals  = [shap_explanation_sorted[f] for f in _feats]
_cols  = [_PAL[0] if v > 0 else _PAL[3] for v in _vals]

ax_shap.barh(_feats, _vals, color=_cols, edgecolor='none', height=0.55)
ax_shap.axvline(0, color=_FG2, linewidth=0.8, linestyle='--')
ax_shap.set_title(f'Feature Risk Contributions — Score: {risk_score}/100 ({loan_approval})',
                  color=_FG, fontsize=13, fontweight='bold', pad=12)
ax_shap.set_xlabel('Risk Attribution  (← reduces risk  |  increases risk →)', color=_FG2, fontsize=10)
ax_shap.tick_params(axis='both', colors=_FG, labelsize=10)
for sp in ax_shap.spines.values(): sp.set_edgecolor(_FG2)

_inc = mpatches.Patch(color=_PAL[0], label='Increases Risk')
_dec = mpatches.Patch(color=_PAL[3], label='Decreases Risk')
ax_shap.legend(handles=[_inc, _dec], facecolor='#2a2a2e', edgecolor=_FG2,
               labelcolor=_FG, fontsize=9)
plt.tight_layout()

# 5b: Global Feature Importance
_fi = pd.Series(global_importance).sort_values()
fig_fi, ax_fi = plt.subplots(figsize=(10, 5))
fig_fi.patch.set_facecolor(_BG); ax_fi.set_facecolor(_BG)
ax_fi.barh(_fi.index, _fi.values, color=_PAL[1], edgecolor='none', height=0.55)
ax_fi.set_title('Global Feature Importance  (Permutation AUC drop on test set)',
                color=_FG, fontsize=13, fontweight='bold', pad=12)
ax_fi.set_xlabel('Mean Permutation Importance (AUC)', color=_FG2, fontsize=10)
ax_fi.tick_params(axis='both', colors=_FG, labelsize=10)
for sp in ax_fi.spines.values(): sp.set_edgecolor(_FG2)
plt.tight_layout()

# 5c: Risk Score Gauge
fig_gauge, ax_gauge = plt.subplots(figsize=(8, 3.5))
fig_gauge.patch.set_facecolor(_BG); ax_gauge.set_facecolor(_BG)
ax_gauge.barh(['Risk Score'], [100], color='#2a2a2e', height=0.5, edgecolor=_FG2, linewidth=0.5)
_score_col = _PAL[2] if risk_score < 30 else _PAL[1] if risk_score < 55 else \
             _PAL[5] if risk_score < 75 else _PAL[3]
ax_gauge.barh(['Risk Score'], [risk_score], color=_score_col, height=0.5, edgecolor='none')
ax_gauge.set_xlim(0, 100)
ax_gauge.set_title(f'Credit Risk Score — {risk_score}/100', color=_FG, fontsize=14,
                   fontweight='bold', pad=12)
ax_gauge.text(min(risk_score + 1.5, 90), 0, f'{risk_score}', color=_FG, fontsize=13,
              va='center', fontweight='bold')
ax_gauge.set_xlabel('Risk Score (0 = No Risk, 100 = Max Risk)', color=_FG2, fontsize=9)
for _thresh, _lbl, _c in [(30, 'Approved', _PAL[2]), (55, 'Conditional', _PAL[1]),
                           (75, 'Review', _PAL[5])]:
    ax_gauge.axvline(_thresh, color=_c, linewidth=1, linestyle=':', alpha=0.8)
    ax_gauge.text(_thresh + 0.6, 0.32, _lbl, color=_c, fontsize=8, alpha=0.9)
ax_gauge.tick_params(axis='both', colors=_FG, labelsize=10)
for sp in ax_gauge.spines.values(): sp.set_edgecolor(_FG2)
plt.tight_layout()

print("\n✅ Risk scoring model complete — all charts rendered.")
