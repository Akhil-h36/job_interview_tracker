import { useState } from "react";
import { applyJob, setCount, resetAll } from "../services/JobServices";

const PLATFORMS = [
  {
    key: "linkedin",
    label: "LinkedIn",
    icon: "in",
    color: "#0A66C2",
    gradient: "linear-gradient(135deg, #0A66C2, #0d8ecf)",
    glow: "rgba(10,102,194,0.4)",
  },
  {
    key: "indeed",
    label: "Indeed",
    icon: "id",
    color: "#2164f3",
    gradient: "linear-gradient(135deg, #2164f3, #5b8df7)",
    glow: "rgba(33,100,243,0.4)",
  },
  {
    key: "naukri",
    label: "Naukri",
    icon: "nk",
    color: "#FF7555",
    gradient: "linear-gradient(135deg, #FF7555, #ff9a6c)",
    glow: "rgba(255,117,85,0.4)",
  },
];

export default function ApplyButtons({ refreshStats }) {
  const [manualCounts, setManualCounts] = useState({ linkedin: "", indeed: "", naukri: "" });
  const [loading, setLoading] = useState({});
  const [feedback, setFeedback] = useState({});
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const handleReset = async () => {
    setResetting(true);
    await resetAll();
    await refreshStats();
    setResetting(false);
    setResetDone(true);
    setTimeout(() => {
      setResetDone(false);
      setShowResetModal(false);
    }, 1400);
  };

  const showFeedback = (key, msg) => {
    setFeedback(f => ({ ...f, [key]: msg }));
    setTimeout(() => setFeedback(f => ({ ...f, [key]: null })), 2000);
  };

  const handleQuickApply = async (platform) => {
    setLoading(l => ({ ...l, [platform]: true }));
    await applyJob(platform);
    await refreshStats();
    setLoading(l => ({ ...l, [platform]: false }));
    showFeedback(platform, "+1 ✓");
  };

  const handleSetCount = async (platform) => {
    const val = parseInt(manualCounts[platform]);
    if (isNaN(val) || val < 0) return;
    setLoading(l => ({ ...l, [`${platform}_set`]: true }));
    await setCount(platform, val);
    await refreshStats();
    setLoading(l => ({ ...l, [`${platform}_set`]: false }));
    setManualCounts(c => ({ ...c, [platform]: "" }));
    showFeedback(platform, `Set to ${val} ✓`);
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.sectionHeader}>
        <span style={styles.sectionLabel}>LOG APPLICATION</span>
        <div style={styles.divider} />
        <button style={styles.resetTrigger} onClick={() => setShowResetModal(true)}>
          <span style={styles.resetIcon}>↺</span> Reset All
        </button>
      </div>

      <div style={styles.cardsRow}>
        {PLATFORMS.map((p) => (
          <div key={p.key} style={styles.card}>
            {/* Platform header */}
            <div style={styles.cardTop}>
              <div style={{ ...styles.iconBox, background: p.gradient, boxShadow: `0 6px 20px ${p.glow}` }}>
                <span style={styles.iconText}>{p.icon}</span>
              </div>
              <span style={styles.platformName}>{p.label}</span>
              {feedback[p.key] && (
                <span style={{ ...styles.feedbackPill, background: p.color }}>{feedback[p.key]}</span>
              )}
            </div>

            {/* Quick +1 button */}
            <button
              style={{
                ...styles.quickBtn,
                background: p.gradient,
                boxShadow: `0 4px 16px ${p.glow}`,
                opacity: loading[p.key] ? 0.7 : 1,
              }}
              onClick={() => handleQuickApply(p.key)}
              disabled={loading[p.key]}
            >
              <span style={styles.plusSign}>+</span>
              <span>Quick Add</span>
            </button>

            {/* Manual count row */}
            <div style={styles.manualRow}>
              <input
                type="number"
                min="0"
                placeholder="Set count..."
                value={manualCounts[p.key]}
                onChange={(e) =>
                  setManualCounts((c) => ({ ...c, [p.key]: e.target.value }))
                }
                style={styles.countInput}
                onKeyDown={(e) => e.key === "Enter" && handleSetCount(p.key)}
              />
              <button
                style={{
                  ...styles.setBtn,
                  color: p.color,
                  borderColor: p.color,
                  opacity: loading[`${p.key}_set`] ? 0.6 : 1,
                }}
                onClick={() => handleSetCount(p.key)}
                disabled={loading[`${p.key}_set`]}
              >
                SET
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Reset confirmation modal ── */}
      {showResetModal && (
        <div style={styles.overlay} onClick={() => !resetting && setShowResetModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>

            {resetDone ? (
              <div style={styles.successState}>
                <div style={styles.successCircle}>✓</div>
                <p style={styles.successText}>All data cleared.</p>
              </div>
            ) : (
              <>
                {/* Warning icon */}
                <div style={styles.warningCircle}>
                  <span style={styles.warningIcon}>!</span>
                </div>

                <h2 style={styles.modalTitle}>Reset Everything?</h2>
                <p style={styles.modalBody}>
                  This will permanently delete <strong style={{ color: "#fff" }}>all</strong> application
                  records across every platform and date. This cannot be undone.
                </p>

                <div style={styles.modalActions}>
                  <button
                    style={styles.cancelBtn}
                    onClick={() => setShowResetModal(false)}
                    disabled={resetting}
                  >
                    Cancel
                  </button>
                  <button
                    style={{ ...styles.confirmBtn, opacity: resetting ? 0.6 : 1 }}
                    onClick={handleReset}
                    disabled={resetting}
                  >
                    {resetting ? "Deleting…" : "Yes, Reset All"}
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    width: "100%",
    padding: "28px 0 8px",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginBottom: 20,
  },
  sectionLabel: {
    color: "rgba(255,255,255,0.25)",
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: "0.15em",
    whiteSpace: "nowrap",
  },
  divider: {
    flex: 1,
    height: 1,
    background: "rgba(255,255,255,0.07)",
  },
  cardsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 16,
  },
  card: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 18,
    padding: "20px 18px",
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  cardTop: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    position: "relative",
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  iconText: {
    color: "#fff",
    fontWeight: 900,
    fontSize: 11,
    letterSpacing: "-0.03em",
  },
  platformName: {
    color: "#fff",
    fontWeight: 700,
    fontSize: 15,
  },
  feedbackPill: {
    marginLeft: "auto",
    color: "#fff",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 700,
    padding: "3px 10px",
    animation: "fadeIn 0.2s ease",
  },
  quickBtn: {
    border: "none",
    color: "#fff",
    borderRadius: 11,
    padding: "11px 0",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    letterSpacing: "0.02em",
    transition: "opacity 0.15s, transform 0.15s",
  },
  plusSign: {
    fontSize: 18,
    fontWeight: 900,
    lineHeight: 1,
  },
  manualRow: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },
  countInput: {
    flex: 1,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 9,
    color: "#fff",
    padding: "9px 12px",
    fontSize: 13,
    outline: "none",
    fontFamily: "inherit",
  },
  setBtn: {
    background: "transparent",
    border: "1px solid",
    borderRadius: 9,
    padding: "9px 14px",
    fontSize: 11,
    fontWeight: 800,
    cursor: "pointer",
    letterSpacing: "0.08em",
    transition: "all 0.15s",
  },
  resetTrigger: {
    background: "rgba(239,68,68,0.08)",
    border: "1px solid rgba(239,68,68,0.2)",
    color: "rgba(239,68,68,0.7)",
    borderRadius: 8,
    padding: "6px 14px",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.06em",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
    whiteSpace: "nowrap",
    transition: "all 0.2s",
  },
  resetIcon: { fontSize: 15, lineHeight: 1 },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.75)",
    backdropFilter: "blur(10px)",
    zIndex: 2000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modal: {
    background: "linear-gradient(160deg, #1c1c2e 0%, #12121f 100%)",
    border: "1px solid rgba(239,68,68,0.2)",
    borderRadius: 24,
    padding: "40px 36px 32px",
    width: 380,
    maxWidth: "90vw",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
    boxShadow: "0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)",
  },
  warningCircle: {
    width: 64,
    height: 64,
    borderRadius: "50%",
    background: "rgba(239,68,68,0.12)",
    border: "2px solid rgba(239,68,68,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  warningIcon: { color: "#ef4444", fontSize: 28, fontWeight: 900, lineHeight: 1 },
  modalTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: 800,
    margin: 0,
    fontFamily: "'Georgia', serif",
    letterSpacing: "-0.5px",
  },
  modalBody: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 14,
    lineHeight: 1.65,
    textAlign: "center",
    margin: 0,
  },
  modalActions: { display: "flex", gap: 10, width: "100%", marginTop: 8 },
  cancelBtn: {
    flex: 1,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "rgba(255,255,255,0.6)",
    borderRadius: 12,
    padding: "13px 0",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
  },
  confirmBtn: {
    flex: 1,
    background: "linear-gradient(135deg, #ef4444, #dc2626)",
    border: "none",
    color: "#fff",
    borderRadius: 12,
    padding: "13px 0",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 20px rgba(239,68,68,0.4)",
  },
  successState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 14,
    padding: "12px 0",
  },
  successCircle: {
    width: 64,
    height: 64,
    borderRadius: "50%",
    background: "rgba(34,197,94,0.15)",
    border: "2px solid rgba(34,197,94,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#22c55e",
    fontSize: 26,
    fontWeight: 900,
  },
  successText: { color: "rgba(255,255,255,0.5)", fontSize: 15, margin: 0 },
};