import React, { useEffect, useState } from "react";
import { getDayReport, getAllRecords } from "../services/JobServices";

const PLATFORMS = [
  { key: "linkedin", label: "LinkedIn", color: "#0A66C2", light: "#e8f1fb" },
  { key: "indeed", label: "Indeed", color: "#2164f3", light: "#e8eeff" },
  { key: "naukri", label: "Naukri", color: "#FF7555", light: "#fff1ee" },
];

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDay = (year, month) => new Date(year, month, 1).getDay();

export default function Calendar() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [records, setRecords] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [dayData, setDayData] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchAllRecords = async () => {
    try {
      const data = await getAllRecords();
      const map = {};
      data.forEach((rec) => {
        map[rec.date] = rec;
      });
      setRecords(map);
    } catch (e) {}
  };

  useEffect(() => {
    fetchAllRecords();
  }, []);

  const handleDateClick = async (dateStr) => {
    setSelectedDate(dateStr);
    setLoading(true);
    setModalOpen(true);
    try {
      const data = await getDayReport(dateStr);
      setDayData(data);
    } catch {
      setDayData(null);
    }
    setLoading(false);
  };

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDay(currentYear, currentMonth);
  const monthName = new Date(currentYear, currentMonth).toLocaleString("default", { month: "long" });

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const toDateStr = (d) =>
    `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const getTotal = (rec) => (rec?.linkedin_count || 0) + (rec?.indeed_count || 0) + (rec?.naukari_count || 0);

  const maxCount = Math.max(1, ...Object.values(records).map(getTotal));

  return (
    <div style={styles.wrapper}>
      {/* Header */}
      <div style={styles.calHeader}>
        <button style={styles.navBtn} onClick={prevMonth}>&#8592;</button>
        <div style={styles.monthTitle}>
          <span style={styles.monthName}>{monthName}</span>
          <span style={styles.yearBadge}>{currentYear}</span>
        </div>
        <button style={styles.navBtn} onClick={nextMonth}>&#8594;</button>
      </div>

      {/* Day labels */}
      <div style={styles.dayLabels}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
          <div key={d} style={styles.dayLabel}>{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div style={styles.grid}>
        {days.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />;
          const dateStr = toDateStr(day);
          const rec = records[dateStr];
          const total = getTotal(rec);
          const isToday = dateStr === todayStr;
          const intensity = total > 0 ? Math.max(0.15, total / maxCount) : 0;

          return (
            <div
              key={dateStr}
              onClick={() => handleDateClick(dateStr)}
              style={{
                ...styles.dayCell,
                background: total > 0
                  ? `rgba(99,102,241,${intensity * 0.7})`
                  : "rgba(255,255,255,0.03)",
                border: isToday
                  ? "2px solid #6366f1"
                  : "1px solid rgba(255,255,255,0.06)",
                boxShadow: isToday ? "0 0 0 3px rgba(99,102,241,0.25)" : "none",
              }}
            >
              <span style={{
                ...styles.dayNum,
                color: isToday ? "#a5b4fc" : total > 0 ? "#fff" : "rgba(255,255,255,0.4)",
                fontWeight: isToday ? 800 : 500,
              }}>{day}</span>

              {total > 0 && (
                <div style={styles.countBadge}>{total}</div>
              )}

              {rec && (
                <div style={styles.platformDots}>
                  {rec.linkedin_count > 0 && <span style={{ ...styles.dot, background: "#0A66C2" }} />}
                  {rec.indeed_count > 0 && <span style={{ ...styles.dot, background: "#2164f3" }} />}
                  {rec.naukari_count > 0 && <span style={{ ...styles.dot, background: "#FF7555" }} />}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={styles.legend}>
        {PLATFORMS.map(p => (
          <div key={p.key} style={styles.legendItem}>
            <span style={{ ...styles.dot, background: p.color }} />
            <span style={styles.legendLabel}>{p.label}</span>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div style={styles.overlay} onClick={() => setModalOpen(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <button style={styles.closeBtn} onClick={() => setModalOpen(false)}>✕</button>
            <div style={styles.modalDate}>
              {selectedDate && new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
                weekday: "long", year: "numeric", month: "long", day: "numeric"
              })}
            </div>
            {loading ? (
              <div style={styles.loadingText}>Loading...</div>
            ) : dayData ? (
              <div style={styles.modalStats}>
                {PLATFORMS.map(p => {
                  const val = p.key === "naukri" ? dayData.naukari_count : dayData[`${p.key}_count`];
                  return (
                    <div key={p.key} style={{ ...styles.modalStatCard, borderLeft: `4px solid ${p.color}` }}>
                      <span style={styles.modalStatLabel}>{p.label}</span>
                      <span style={{ ...styles.modalStatValue, color: p.color }}>{val || 0}</span>
                    </div>
                  );
                })}
                <div style={{ ...styles.modalStatCard, borderLeft: "4px solid #a5b4fc", marginTop: 8 }}>
                  <span style={styles.modalStatLabel}>Total</span>
                  <span style={{ ...styles.modalStatValue, color: "#a5b4fc" }}>
                    {(dayData.linkedin_count || 0) + (dayData.indeed_count || 0) + (dayData.naukari_count || 0)}
                  </span>
                </div>
              </div>
            ) : (
              <div style={styles.noData}>No applications on this date.</div>
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
    background: "rgba(15,15,30,0.6)",
    borderRadius: 24,
    border: "1px solid rgba(255,255,255,0.08)",
    padding: "32px 28px 24px",
    backdropFilter: "blur(20px)",
  },
  calHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  navBtn: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#fff",
    borderRadius: 10,
    width: 40,
    height: 40,
    fontSize: 18,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
  },
  monthTitle: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  monthName: {
    fontSize: 28,
    fontWeight: 800,
    color: "#fff",
    fontFamily: "'Georgia', serif",
    letterSpacing: "-0.5px",
  },
  yearBadge: {
    background: "rgba(99,102,241,0.2)",
    border: "1px solid rgba(99,102,241,0.3)",
    color: "#a5b4fc",
    borderRadius: 8,
    padding: "4px 12px",
    fontSize: 15,
    fontWeight: 700,
  },
  dayLabels: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 6,
    marginBottom: 8,
  },
  dayLabel: {
    textAlign: "center",
    fontSize: 11,
    fontWeight: 700,
    color: "rgba(255,255,255,0.3)",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    padding: "6px 0",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 6,
  },
  dayCell: {
    borderRadius: 12,
    padding: "10px 8px 8px",
    minHeight: 72,
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
    transition: "all 0.18s ease",
  },
  dayNum: {
    fontSize: 15,
    lineHeight: 1,
    marginBottom: 4,
  },
  countBadge: {
    background: "rgba(255,255,255,0.15)",
    color: "#fff",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 800,
    padding: "2px 7px",
    marginTop: 2,
  },
  platformDots: {
    display: "flex",
    gap: 3,
    marginTop: "auto",
    paddingTop: 4,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    display: "inline-block",
  },
  legend: {
    display: "flex",
    gap: 20,
    justifyContent: "center",
    marginTop: 20,
    paddingTop: 16,
    borderTop: "1px solid rgba(255,255,255,0.06)",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  legendLabel: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 12,
    fontWeight: 600,
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    backdropFilter: "blur(8px)",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modal: {
    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 20,
    padding: "32px 28px",
    minWidth: 340,
    maxWidth: 420,
    width: "90%",
    position: "relative",
    boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    background: "rgba(255,255,255,0.08)",
    border: "none",
    color: "rgba(255,255,255,0.5)",
    borderRadius: 8,
    width: 32,
    height: 32,
    cursor: "pointer",
    fontSize: 14,
  },
  modalDate: {
    color: "#fff",
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 24,
    fontFamily: "'Georgia', serif",
  },
  modalStats: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  modalStatCard: {
    background: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    padding: "14px 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalStatLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    fontWeight: 600,
  },
  modalStatValue: {
    fontSize: 26,
    fontWeight: 900,
  },
  loadingText: {
    color: "rgba(255,255,255,0.4)",
    textAlign: "center",
    padding: "20px 0",
  },
  noData: {
    color: "rgba(255,255,255,0.35)",
    textAlign: "center",
    padding: "20px 0",
    fontSize: 15,
  },
};