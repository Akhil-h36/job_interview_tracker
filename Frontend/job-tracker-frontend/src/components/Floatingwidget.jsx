import { useState, useEffect, useRef, useCallback } from "react";
import { applyJob, getStats } from "../services/JobServices";

const PLATFORMS = [
  { key: "linkedin", label: "LI", fullLabel: "LinkedIn", color: "#0A66C2", glow: "rgba(10,102,194,0.5)" },
  { key: "indeed",   label: "ID", fullLabel: "Indeed",   color: "#2164f3", glow: "rgba(33,100,243,0.5)" },
  { key: "naukri",   label: "NK", fullLabel: "Naukri",   color: "#FF7555", glow: "rgba(255,117,85,0.5)" },
];

export default function FloatingWidget({ onStatsUpdate }) {
  const [visible, setVisible]     = useState(true);
  const [expanded, setExpanded]   = useState(false);
  const [stats, setStats]         = useState({ linkedin_total: 0, indeed_total: 0, naukri_total: 0, overall_total: 0 });
  const [pulse, setPulse]         = useState(null);   
  const [feedback, setFeedback]   = useState(null);
  const [pos, setPos]             = useState({ x: null, y: null }); 
  const [dragging, setDragging]   = useState(false);
  const [minimised, setMinimised] = useState(false);

  const dragRef   = useRef(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  const widgetRef = useRef(null);

  // ── Fetch stats ──────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      const data = await getStats();
      setStats(data);
    } catch {}
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  // Poll every 30s so it stays in sync when other tabs update
  useEffect(() => {
    const id = setInterval(fetchStats, 30000);
    return () => clearInterval(id);
  }, [fetchStats]);

  // ── Apply handler ─────────────────────────────────────────────────────────
  const handleApply = async (platform) => {
    setPulse(platform);
    setTimeout(() => setPulse(null), 600);
    await applyJob(platform);
    await fetchStats();
    if (onStatsUpdate) onStatsUpdate();
    const p = PLATFORMS.find(p => p.key === platform);
    setFeedback(`+1 ${p.fullLabel}`);
    setTimeout(() => setFeedback(null), 1800);
  };

  // ── Drag logic ───────────────────────────────────────────────────────────
  const onMouseDown = (e) => {
    if (e.target.closest("button")) return;
    e.preventDefault();
    const rect = widgetRef.current.getBoundingClientRect();
    offsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setDragging(true);
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      setPos({
        x: Math.min(Math.max(0, e.clientX - offsetRef.current.x), window.innerWidth - 220),
        y: Math.min(Math.max(0, e.clientY - offsetRef.current.y), window.innerHeight - 300),
      });
    };
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [dragging]);

  if (!visible) return (
    <button style={styles.revealBtn} onClick={() => setVisible(true)} title="Show tracker widget">
      📋
    </button>
  );

  const posStyle = pos.x !== null
    ? { left: pos.x, top: pos.y, right: "auto", bottom: "auto" }
    : { right: 24, bottom: 24 };

  return (
    <div
      ref={widgetRef}
      style={{
        ...styles.widget,
        ...posStyle,
        cursor: dragging ? "grabbing" : "grab",
        width: minimised ? 56 : expanded ? 220 : 200,
      }}
      onMouseDown={onMouseDown}
    >
      {/* ── Top bar ── */}
      <div style={styles.topBar}>
        {!minimised && (
          <span style={styles.widgetTitle}>
            <span style={styles.dotLive} /> tracker
          </span>
        )}
        <div style={styles.topActions}>
          <button style={styles.iconBtn} onClick={() => setMinimised(m => !m)} title={minimised ? "Expand" : "Minimise"}>
            {minimised ? "▢" : "─"}
          </button>
          <button style={styles.iconBtn} onClick={() => setExpanded(e => !e)} title="Toggle detail">
            {expanded ? "◀" : "▶"}
          </button>
          <button style={{ ...styles.iconBtn, color: "rgba(255,80,80,0.6)" }} onClick={() => setVisible(false)} title="Hide">
            ✕
          </button>
        </div>
      </div>

      {!minimised && (
        <>
          {/* ── Total count ── */}
          <div style={styles.totalRow}>
            <span style={styles.totalNum}>{stats.overall_total}</span>
            <span style={styles.totalLabel}>total applied</span>
          </div>

          {/* ── Feedback toast ── */}
          {feedback && (
            <div style={styles.toast}>{feedback}</div>
          )}

          {/* ── Platform buttons ── */}
          <div style={styles.platformList}>
            {PLATFORMS.map((p) => {
              const count = p.key === "naukri" ? stats.naukri_total : stats[`${p.key}_total`];
              const isPulsing = pulse === p.key;
              return (
                <button
                  key={p.key}
                  style={{
                    ...styles.platformBtn,
                    borderColor: isPulsing ? p.color : "rgba(255,255,255,0.08)",
                    boxShadow: isPulsing ? `0 0 14px ${p.glow}` : "none",
                    transform: isPulsing ? "scale(0.96)" : "scale(1)",
                  }}
                  onClick={() => handleApply(p.key)}
                >
                  <span style={{ ...styles.platformDot, background: p.color }} />
                  <span style={styles.platformBtnLabel}>
                    {expanded ? p.fullLabel : p.label}
                  </span>
                  <span style={{ ...styles.platformCount, color: p.color }}>
                    {count ?? 0}
                  </span>
                  <span style={styles.plusHint}>+1</span>
                </button>
              );
            })}
          </div>

          <div style={styles.dragHint}>drag to move</div>
        </>
      )}
    </div>
  );
}

const styles = {
  widget: {
    position: "fixed",
    zIndex: 9999,
    background: "rgba(10,10,20,0.92)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 18,
    padding: "12px 14px 10px",
    boxShadow: "0 24px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    userSelect: "none",
    transition: "width 0.2s ease, box-shadow 0.2s ease",
    fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
  },
  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  widgetTitle: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
  dotLive: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#22c55e",
    boxShadow: "0 0 6px #22c55e",
    animation: "none",
    display: "inline-block",
  },
  topActions: {
    display: "flex",
    gap: 2,
    marginLeft: "auto",
  },
  iconBtn: {
    background: "transparent",
    border: "none",
    color: "rgba(255,255,255,0.3)",
    fontSize: 11,
    cursor: "pointer",
    padding: "2px 5px",
    borderRadius: 5,
    lineHeight: 1,
    transition: "color 0.15s",
  },
  totalRow: {
    display: "flex",
    alignItems: "baseline",
    gap: 7,
    paddingBottom: 6,
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  totalNum: {
    fontSize: 32,
    fontWeight: 900,
    color: "#fff",
    lineHeight: 1,
    fontFamily: "'Georgia', serif",
    letterSpacing: "-1px",
  },
  totalLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.25)",
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  toast: {
    background: "rgba(99,102,241,0.2)",
    border: "1px solid rgba(99,102,241,0.3)",
    color: "#a5b4fc",
    borderRadius: 8,
    fontSize: 11,
    fontWeight: 700,
    padding: "5px 10px",
    textAlign: "center",
    letterSpacing: "0.04em",
  },
  platformList: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  platformBtn: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid",
    borderRadius: 10,
    padding: "8px 10px",
    color: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 8,
    transition: "border-color 0.15s, box-shadow 0.15s, transform 0.1s",
    position: "relative",
    overflow: "hidden",
  },
  platformDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    flexShrink: 0,
  },
  platformBtnLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: "rgba(255,255,255,0.7)",
    flex: 1,
    textAlign: "left",
  },
  platformCount: {
    fontSize: 16,
    fontWeight: 900,
    lineHeight: 1,
  },
  plusHint: {
    fontSize: 10,
    fontWeight: 800,
    color: "rgba(255,255,255,0.2)",
    letterSpacing: "0.04em",
  },
  dragHint: {
    color: "rgba(255,255,255,0.1)",
    fontSize: 9,
    textAlign: "center",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginTop: -4,
  },
  revealBtn: {
    position: "fixed",
    bottom: 24,
    right: 24,
    zIndex: 9999,
    background: "rgba(10,10,20,0.9)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 14,
    width: 48,
    height: 48,
    fontSize: 20,
    cursor: "pointer",
    boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
    backdropFilter: "blur(12px)",
  },
};