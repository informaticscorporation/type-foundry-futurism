import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "../../supabaseClient";
import "../../UIX/CalendarBooking.css";

export default function CalendarBooking() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [users, setUsers] = useState([]);
  const [hoverInfo, setHoverInfo] = useState(null);

  // ---- Helpers ----
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const daysInMonth = lastDay.getDate();

  // ---- Fetch Data ----
  useEffect(() => {
    async function fetchData() {
      const { data: bookingsData } = await supabase.from("Prenotazioni").select("*");
      const { data: vehiclesData } = await supabase.from("Vehicles").select("*");
      const { data: usersData } = await supabase.from("Users").select("*");

      setBookings(bookingsData || []);
      setVehicles(vehiclesData || []);
      setUsers(usersData || []);
    }
    fetchData();
  }, []);

  // ---- Map Users ----
  const usersMap = useMemo(() => {
    const map = {};
    users.forEach((u) => {
      map[u.id] = u;
    });
    return map;
  }, [users]);

  // ---- Utils ----
  const toDateOnly = (d) => {
    if (!d) return null;
    const dt = new Date(d);
    return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
  };

  const formatKey = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  };

  // ---- Bookings → Vehicle → Day ----
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

  // ---- Determine Cell Status ----
  const cellInfoFor = (vehicle, dateKey) => {
    if (vehicle?.inmanutenzione) {
      return { value: "M", className: "cell-maint" };
    }

    const arr = bookingsByVehicleDate[String(vehicle.id)]?.[dateKey] || [];

    if (arr.length === 0) return { value: "0", className: "cell-free" };
    if (arr.length >= 2) return { value: "2", className: "cell-booked-multi" };
    return { value: "1", className: "cell-booked" };
  };

  // ---- Month Day Keys ----
  const monthDayKeys = useMemo(() => {
    const keys = [];
    for (let d = 1; d <= daysInMonth; d++) {
      keys.push(formatKey(new Date(currentDate.getFullYear(), currentDate.getMonth(), d)));
    }
    return keys;
  }, [currentDate, daysInMonth]);

  const prevMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const nextMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const monthNames = [
    "Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno",
    "Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre",
  ];

  // ---- Hover handler with automatic reposition ----
  const handleCellEnter = (e, vehicle, dateKey) => {
    const rect = e.currentTarget.getBoundingClientRect();

    const padding = 10;
    const cardWidth = 310;
    const cardHeight = 280;

    let left = rect.right + 8;
    let top = rect.top;

    // adjust if outside right
    if (left + cardWidth > window.innerWidth - padding) {
      left = rect.left - cardWidth - 8;
    }

    // adjust bottom overflow
    if (top + cardHeight > window.innerHeight - padding) {
      top = window.innerHeight - cardHeight - padding;
    }

    const bookingsList = bookingsByVehicleDate[String(vehicle.id)]?.[dateKey] || [];

    setHoverInfo({
      x: left,
      y: top,
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
        <h3>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
        <button onClick={nextMonth}>▶</button>
      </div>

      <div className="cal-table" style={{ "--days": daysInMonth }}>
        <div className="cal-row cal-row-header">
          <div className="cal-col cal-col-vehicle">Veicolo</div>

          {monthDayKeys.map((k, idx) => (
            <div key={k} className="cal-col cal-col-day">
              <div className="day-number">{idx + 1}</div>
            </div>
          ))}
        </div>

        {vehicles.map((v) => (
          <div key={v.id} className="cal-row">
            <div className="cal-col cal-col-vehicle">
              <div className="veh-label">
                <div className="veh-targa">{v.targa || "-"}</div>
                <div className="veh-model">
                  {v.marca ? `${v.marca} ${v.modello}` : v.modello}
                </div>
              </div>
            </div>

            {monthDayKeys.map((k) => {
              const info = cellInfoFor(v, k);
              return (
                <div
                  key={`${v.id}-${k}`}
                  className={`cal-col cal-col-day-cell ${info.className}`}
                  onMouseEnter={(e) => handleCellEnter(e, v, k)}
                  onMouseLeave={handleCellLeave}
                >
                  <div className="cell-value">{info.value}</div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* ---- Hover Card ---- */}
      {hoverInfo && (
        <div
          className="hover-card"
          style={{ top: hoverInfo.y, left: hoverInfo.x }}
          onMouseLeave={handleCellLeave}
        >
          <div className="hover-card-header">
            <strong>{hoverInfo.vehicle.targa}</strong>
            <div className="hover-date">{hoverInfo.dateKey}</div>
          </div>

          {hoverInfo.bookings.length === 0 && (
            <div className="hover-empty">Nessuna prenotazione</div>
          )}

          {hoverInfo.bookings.map((b) => {
            const user = usersMap[b.cliente_id];

            return (
              <div key={b.id} className="hover-booking">
                <div className="hb-top">
                  <div><strong>ID:</strong> {b.id}</div>
                  <div><strong>Stato:</strong> {b.stato}</div>
                </div>

                <div className="hb-body">
                  <div>
                    <strong>Cliente:</strong>{" "}
                    {user ? `${user.nome} ${user.cognome}` : `ID ${b.cliente_id}`}
                  </div>

                  <div><strong>Check-in:</strong> {b.check_in} {b.OraCheckin || ""}</div>
                  <div><strong>Check-out:</strong> {b.check_out} {b.OraCheckOut || ""}</div>
                  <div><strong>Giorni:</strong> {b.giorni}</div>
                  <div><strong>Prezzo/g:</strong> {b.prezzo_giornaliero}</div>

                  {b.note_cliente && (
                    <div className="note">
                      <strong>Note:</strong> {b.note_cliente}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
