import React, { useState, useMemo } from "react";
import { usePrenotazioni, useVehicles, useUsers } from "../../hooks/useSupabase";
import "../../UIX/CalendarBooking.css";

export default function CalendarBooking() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { data: bookings = [] } = usePrenotazioni();
  const { data: vehicles = [] } = useVehicles();
  const { data: users = [] } = useUsers();
  const [hoverInfo, setHoverInfo] = useState(null);

  // ---- Date helpers ----
  const lastDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );
  const daysInMonth = lastDay.getDate();

  const formatKey = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const toDateOnly = (d) => {
    const dt = new Date(d);
    return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
  };

  // ---- Users map ----
  const usersMap = useMemo(() => {
    const map = {};
    users.forEach((u) => (map[u.id] = u));
    return map;
  }, [users]);

  // ---- Build booking map vehicle -> date -> bookings ----
  const bookingsByVehicleDate = useMemo(() => {
    const map = {};

    bookings.forEach((b) => {
      if (!b.veicolo_id || !b.check_in || !b.check_out) return;

      let start = toDateOnly(b.check_in);
      let end = toDateOnly(b.check_out);
      if (start > end) [start, end] = [end, start];

      const vKey = String(b.veicolo_id);
      if (!map[vKey]) map[vKey] = {};

      const day = new Date(start);
      while (day <= end) {
        const key = formatKey(day);
        if (!map[vKey][key]) map[vKey][key] = [];
        map[vKey][key].push(b);
        day.setDate(day.getDate() + 1);
      }
    });

    return map;
  }, [bookings]);

  // ---- Cell state ----
  const cellInfoFor = (vehicle, dateKey) => {
    if (vehicle?.inmanutenzione) {
      return { value: "M", className: "cell-maint" };
    }

    const arr =
      bookingsByVehicleDate[String(vehicle.id)]?.[dateKey] || [];

    if (arr.length === 0) return { value: "0", className: "cell-free" };
    if (arr.length >= 2) return { value: "2", className: "cell-booked-multi" };
    return { value: "1", className: "cell-booked" };
  };

  // ---- Month keys ----
  const monthDayKeys = useMemo(() => {
    const keys = [];
    for (let d = 1; d <= daysInMonth; d++) {
      keys.push(
        formatKey(
          new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            d
          )
        )
      );
    }
    return keys;
  }, [currentDate, daysInMonth]);

  const prevMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );

  const nextMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );

  const monthNames = [
    "Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno",
    "Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre",
  ];

  // ---- Hover ----
  const handleCellEnter = (e, vehicle, dateKey) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const bookingsList =
      bookingsByVehicleDate[String(vehicle.id)]?.[dateKey] || [];

    setHoverInfo({
      x: rect.right + 8,
      y: rect.top,
      bookings: bookingsList,
      vehicle,
      dateKey,
    });
  };

  const handleCellLeave = () => setHoverInfo(null);

  return (
    <div className="cal-table-container">
      <div className="cal-table-header">
        <button onClick={prevMonth}>◀</button>
        <h3>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <button onClick={nextMonth}>▶</button>
      </div>

      {/* GRID UNICA */}
      <div
        className="cal-table"
        style={{
          gridTemplateColumns: `220px repeat(${daysInMonth}, 48px)`
        }}
      >
        {/* HEADER */}
        <div className="cal-cell cal-header cal-vehicle-header">
          Veicolo
        </div>

        {monthDayKeys.map((k, idx) => (
          <div key={k} className="cal-cell cal-header">
            {idx + 1}
          </div>
        ))}

        {/* ROWS */}
        {vehicles.map((v) => (
          <React.Fragment key={v.id}>
            {/* Vehicle sticky column */}
            <div className="cal-cell cal-vehicle-cell">
              <div className="veh-label">
                <div className="veh-targa">{v.targa || "-"}</div>
                <div className="veh-model">
                  {v.marca ? `${v.marca} ${v.modello}` : v.modello }
                  
                  {v.livello_carburante !== undefined && (
                    <span className="fuel-level">
                      {` - ${v.livello_carburante}%`}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Days */}
            {monthDayKeys.map((k) => {
              const info = cellInfoFor(v, k);
              return (
                <div
                  key={`${v.id}-${k}`}
                  className={`cal-cell cal-day-cell ${info.className}`}
                  onMouseEnter={(e) =>
                    handleCellEnter(e, v, k)
                  }
                  onMouseLeave={handleCellLeave}
                >
                  <div className="cell-value">{info.value}</div>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Hover card */}
      {hoverInfo && (
        <div
          className="hover-card"
          style={{ top: hoverInfo.y, left: hoverInfo.x }}
          onMouseLeave={handleCellLeave}
        >
          <div>
            <strong>{hoverInfo.vehicle.targa}</strong>
          </div>
          <div>{hoverInfo.dateKey}</div>

          {hoverInfo.bookings.map((b) => {
            const user = usersMap[b.cliente_id];
            return (
              <div key={b.id} style={{ marginTop: 6, fontSize: 13 }}>
                {user
                  ? `${user.nome} ${user.cognome}`
                  : `ID ${b.cliente_id}`}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
