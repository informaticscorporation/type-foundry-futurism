import { useState, useMemo } from "react";
import "../../UIX/CalendarBooking.css";

export default function CalendarioInterno() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [notesMap, setNotesMap] = useState({}); // key: "YYYY-MM-DD" -> { bollo, assicurazione, contratto, note }
  const [hoverCard, setHoverCard] = useState(null);

  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const daysInMonth = lastDay.getDate();

  const monthNames = [
    "Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno",
    "Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"
  ];

  const formatDateKey = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const prevMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const monthDayKeys = useMemo(() => {
    const keys = [];
    for (let d = 1; d <= daysInMonth; d++) {
      keys.push(formatDateKey(new Date(currentDate.getFullYear(), currentDate.getMonth(), d)));
    }
    return keys;
  }, [currentDate, daysInMonth]);

  // Apre la card per modificare le note/scadenze
  const openNotePanel = (e, dateKey, type) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const padding = 10;
    const panelWidth = 300;
    const panelHeight = 240;

    let left = rect.right + 8;
    let top = rect.top;
    if (left + panelWidth > window.innerWidth - padding) left = rect.left - panelWidth - 8;
    if (top + panelHeight > window.innerHeight - padding) top = window.innerHeight - panelHeight - padding;

    const existing = notesMap[dateKey] || {};
    setHoverCard({
      x: left,
      y: top,
      dateKey,
      type,
      text: existing[type] || "",
    });
  };

  const saveNote = () => {
    if (!hoverCard) return;
    setNotesMap(prev => ({
      ...prev,
      [hoverCard.dateKey]: {
        ...prev[hoverCard.dateKey],
        [hoverCard.type]: hoverCard.text
      }
    }));
    setHoverCard(null);
  };

  const noteTypes = ["bollo", "assicurazione", "contratto", "altre_note"];
  const noteLabels = {
    bollo: "Bollo",
    assicurazione: "Assicurazione",
    contratto: "Contratto",
    altre_note: "Note"
  };

  return (
    <div className="cal-table-container">
      <div className="cal-table-header">
        <button onClick={prevMonth}>◀</button>
        <h3>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
        <button onClick={nextMonth}>▶</button>
      </div>

      <div className="cal-table" style={{ "--days": daysInMonth }}>
        <div className="cal-row cal-row-header">
          <div className="cal-col cal-col-vehicle">Tipo/Scadenza</div>
          {monthDayKeys.map((k, idx) => (
            <div key={k} className="cal-col cal-col-day">
              <div className="day-number">{idx + 1}</div>
            </div>
          ))}
        </div>

        {noteTypes.map(type => (
          <div key={type} className="cal-row">
            <div className="cal-col cal-col-vehicle">
              <div className="veh-label">
                <div className="veh-model">{noteLabels[type]}</div>
              </div>
            </div>

            {monthDayKeys.map(k => {
              const hasNote = notesMap[k]?.[type];
              const className = hasNote ? "cell-booked" : "cell-free";
              return (
                <div
                  key={`${k}-${type}`}
                  className={`cal-col cal-col-day-cell ${className}`}
                  onClick={(e) => openNotePanel(e, k, type)}
                >
                  <div className="cell-value">{hasNote ? "📝" : ""}</div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {hoverCard && (
        <div
          className="hover-card"
          style={{ top: hoverCard.y, left: hoverCard.x }}
        >
          <div className="hover-card-header">
            <strong>{noteLabels[hoverCard.type]}</strong>
            <div className="hover-date">{hoverCard.dateKey}</div>
          </div>

          <textarea
            value={hoverCard.text}
            onChange={e => setHoverCard(prev => ({ ...prev, text: e.target.value }))}
            rows={5}
            style={{ width: "100%", borderRadius: 6, marginTop: 6 }}
          />

          <button className="show-btn" onClick={saveNote} style={{ marginTop: 8 }}>Salva</button>
          <button className="show-btn" onClick={() => setHoverCard(null)} style={{ marginTop: 4, background: "#444" }}>Chiudi</button>
        </div>
      )}
    </div>
  );
}
