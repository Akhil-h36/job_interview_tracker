import { useEffect, useState } from "react";
import { getStats } from "../services/JobServices";
import Stats from "../components/Stats";
import ApplyButtons from "../components/ApplyButton";
import Calendar from "../components/Calendar";
import FloatingWidget from "../components/Floatingwidget";

const STAT_CONFIGS = [
  {
    key: "overall_total",
    title: "Total",
    icon: "∑",
    color: "#e2e8f0",
    gradient: "linear-gradient(135deg, #667eea, #764ba2)",
    glow: "rgba(102,126,234,0.3)",
  },
  {
    key: "linkedin_total",
    title: "LinkedIn",
    icon: "in",
    color: "#60a5fa",
    gradient: "linear-gradient(135deg, #0A66C2, #0d8ecf)",
    glow: "rgba(10,102,194,0.3)",
  },
  {
    key: "indeed_total",
    title: "Indeed",
    icon: "id",
    color: "#818cf8",
    gradient: "linear-gradient(135deg, #2164f3, #5b8df7)",
    glow: "rgba(33,100,243,0.3)",
  },
  {
    key: "naukri_total",
    title: "Naukri",
    icon: "nk",
    color: "#fb923c",
    gradient: "linear-gradient(135deg, #FF7555, #ff9a6c)",
    glow: "rgba(255,117,85,0.3)",
  },
];

export default function Home() {
  const [stats, setStats] = useState({
    linkedin_total: 0,
    indeed_total: 0,
    naukri_total: 0,
    overall_total: 0,
  });

  const fetchStats = async () => {
    const data = await getStats();
    setStats(data);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div style={styles.page}>
      {/* Background orbs */}
      <div style={styles.orb1} />
      <div style={styles.orb2} />
      <div style={styles.orb3} />

      <div style={styles.container}>
        {/* Hero header */}
        <div style={styles.hero}>
          <div style={styles.heroPill}>JOB TRACKER</div>
          <h1 style={styles.heroTitle}>
            Your Applications,<br />
            <span style={styles.heroAccent}>Tracked.</span>
          </h1>
          <p style={styles.heroSub}>
            Log every application. See your momentum. Land the job.
          </p>
        </div>

        {/* Stats row */}
        <div style={styles.statsGrid}>
          {STAT_CONFIGS.map((cfg) => (
            <Stats
              key={cfg.key}
              title={cfg.title}
              value={stats[cfg.key]}
              color={cfg.color}
              gradient={cfg.gradient}
              glow={cfg.glow}
              icon={cfg.icon}
            />
          ))}
        </div>

        {/* Apply buttons */}
        <ApplyButtons refreshStats={fetchStats} />

        {/* Calendar */}
        <div style={styles.calSection}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionLabel}>ACTIVITY CALENDAR</span>
            <div style={styles.divider} />
          </div>
          <Calendar />
        </div>
      </div>
      {/* Floating PiP widget — always on top, draggable */}
      <FloatingWidget onStatsUpdate={fetchStats} />
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    background: "#0a0a14",
    fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
    position: "relative",
    overflowX: "hidden",
    color: "#fff",
    boxSizing: "border-box",
  },
  orb1: {
    position: "fixed",
    top: -180,
    right: -100,
    width: 500,
    height: 500,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  orb2: {
    position: "fixed",
    bottom: -200,
    left: -150,
    width: 600,
    height: 600,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(255,117,85,0.1) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  orb3: {
    position: "fixed",
    top: "40%",
    left: "30%",
    width: 400,
    height: 400,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(33,100,243,0.07) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  container: {
    width: "100%",
    padding: "48px 48px 80px",
    position: "relative",
    zIndex: 1,
    boxSizing: "border-box",
  },
  hero: {
    textAlign: "center",
    marginBottom: 48,
  },
  heroPill: {
    display: "inline-block",
    background: "rgba(99,102,241,0.15)",
    border: "1px solid rgba(99,102,241,0.3)",
    color: "#a5b4fc",
    borderRadius: 100,
    padding: "5px 16px",
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: "0.15em",
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: "clamp(36px, 6vw, 60px)",
    fontWeight: 900,
    lineHeight: 1.1,
    margin: "0 0 16px",
    fontFamily: "'Georgia', serif",
    letterSpacing: "-1.5px",
    color: "#fff",
  },
  heroAccent: {
    background: "linear-gradient(90deg, #667eea, #a5b4fc, #FF7555)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  heroSub: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 16,
    margin: 0,
    fontWeight: 400,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 20,
    marginBottom: 8,
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
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
  calSection: {
    marginTop: 40,
  },
};