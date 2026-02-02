import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import "../../UIX/DashboardSection.css";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export default function DashboardSection() {
  const [vehicles, setVehicles] = useState([]);
  const [prenotazioni, setPrenotazioni] = useState([]);
  const [users, setUsers] = useState([]);

  // Fetch dati
  useEffect(() => {
    const fetchData = async () => {
      const { data: vehData } = await supabase.from("Vehicles").select("*");
      const { data: prenData } = await supabase.from("Prenotazioni").select("*");
      const { data: usersData } = await supabase.from("Users").select("*");
      setVehicles(vehData || []);
      setPrenotazioni(prenData || []);
      setUsers(usersData || []);
    };
    fetchData();
  }, []);

  // Statistiche
  const totalVehicles = vehicles.length;
  const totalPrenotazioni = prenotazioni.length;
  const totalUsers = users.length;
  const vehiclesInMaintenance = vehicles.filter(v => v.inmanutenzione).length;
  const vehiclesOccupied = vehicles.filter(v => prenotazioni.some(p => p.veicolo_id === v.id)).length;

  // Grafico veicoli
  const pieData = [
    { name: "Libero", value: totalVehicles - vehiclesOccupied - vehiclesInMaintenance },
    { name: "Occupato", value: vehiclesOccupied },
    { name: "Manutenzione", value: vehiclesInMaintenance },
  ];
  const COLORS = ["#16a34a", "#3b82f6", "#f59e0b"];

  return (
    <section className="dashboard-section">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <div className="dashboard-actions">
          <button className="btn-primary">Aggiungi veicolo</button>
          <button className="btn-secondary">Nuova prenotazione</button>
        </div>
      </div>

      {/* ---------------- STATISTICHE ---------------- */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Veicoli Totali</h3>
          <p>{totalVehicles}</p>
        </div>
        <div className="stat-card">
          <h3>Veicoli Occupati</h3>
          <p>{vehiclesOccupied}</p>
        </div>
        <div className="stat-card">
          <h3>Veicoli in Manutenzione</h3>
          <p>{vehiclesInMaintenance}</p>
        </div>
        <div className="stat-card">
          <h3>Clienti</h3>
          <p>{totalUsers}</p>
        </div>
        <div className="stat-card">
          <h3>Prenotazioni</h3>
          <p>{totalPrenotazioni}</p>
        </div>
      </div>

      {/* ---------------- GRAFICO VEICOLI ---------------- */}
      <div className="dashboard-graph">
        <h3>Stato Veicoli</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* ---------------- ULTIME PRENOTAZIONI ---------------- */}
      <div className="dashboard-recent">
        <h3>Ultime prenotazioni</h3>
        <ul>
          {prenotazioni.slice(0, 5).map(p => {
            const user = users.find(u => u.id === p.cliente_id);
            const veicolo = vehicles.find(v => v.id === p.veicolo_id);
            let statusColor = "#16a34a"; // default attiva
            if (p.stato === "cancellata") statusColor = "#ef4444";
            if (p.stato === "completata") statusColor = "#3b82f6";

            return (
              <li key={p.id} style={{ borderLeft: `4px solid ${statusColor}`, paddingLeft: "8px" }}>
                Veicolo: {veicolo?.marca} {veicolo?.modello} - Cliente: {user?.nome} {user?.cognome} - Check-in:{" "}
                {new Date(p.check_in).toLocaleDateString()} - Stato: {p.stato}
              </li>
            );
          })}
        </ul>
      </div>

      {/* ---------------- SCADENZE VEICOLI ---------------- */}
      <div className="dashboard-expirations">
        <h3>Scadenze prossime (30 giorni)</h3>
        <ul>
          {vehicles.map(v => {
            const today = new Date();
            const thirtyDays = new Date(today.setDate(today.getDate() + 30));
            const bolloExp = v.bollo_scadenza ? new Date(v.bollo_scadenza) : null;
            const assicurazioneExp = v.assicurazione_scadenza ? new Date(v.assicurazione_scadenza) : null;

            const rows = [];

            if (bolloExp && bolloExp <= thirtyDays) {
              rows.push(
                <li key={`${v.id}-bollo`} style={{ color: "#f59e0b" }}>
                  {v.marca} {v.modello} - Bollo: {bolloExp.toLocaleDateString()}
                </li>
              );
            }

            if (assicurazioneExp && assicurazioneExp <= thirtyDays) {
              rows.push(
                <li key={`${v.id}-assicurazione`} style={{ color: "#ef4444" }}>
                  {v.marca} {v.modello} - Assicurazione: {assicurazioneExp.toLocaleDateString()}
                </li>
              );
            }

            return rows;
          })}
        </ul>
      </div>
    </section>
  );
}
