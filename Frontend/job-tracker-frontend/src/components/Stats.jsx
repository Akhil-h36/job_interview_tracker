export default function Stats({ title, value, color, gradient, glow, icon }) {
  return (
    <div style={{ ...styles.card, boxShadow: `0 8px 32px ${glow || "rgba(0,0,0,0.3)"}` }}>
      <div style={{ ...styles.iconRing, background: gradient || "#333" }}>
        <span style={styles.iconLabel}>{icon}</span>
      </div>
      <div style={styles.valueRow}>
        <span style={{ ...styles.value, color: color || "#fff" }}>{value ?? 0}</span>
      </div>
      <div style={styles.title}>{title}</div>
      <div style={{ ...styles.bottomBar, background: gradient }} />
    </div>
  );
}

const styles = {
  card: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 20,
    padding: "22px 18px 18px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    position: "relative",
    overflow: "hidden",
    backdropFilter: "blur(10px)",
    transition: "transform 0.2s",
  },
  iconRing: {
    width: 44,
    height: 44,
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  iconLabel: {
    color: "#fff",
    fontWeight: 900,
    fontSize: 12,
    letterSpacing: "-0.04em",
  },
  valueRow: {
    display: "flex",
    alignItems: "baseline",
    gap: 4,
  },
  value: {
    fontSize: 42,
    fontWeight: 900,
    lineHeight: 1,
    fontFamily: "'Georgia', serif",
    letterSpacing: "-2px",
  },
  title: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    borderRadius: "0 0 20px 20px",
    opacity: 0.7,
  },
};