import React from "react";
import { usePrenotazioni, useVehicles, useUsers } from "../../hooks/useSupabase";
import { useTranslation } from "../../i18n/useTranslation";
import "../../UIX/DashboardSection.css";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export default function DashboardSection() {
  const { t } = useTranslation();
  const { data: vehicles } = useVehicles();
  const { data: prenotazioni } = usePrenotazioni();
  const { data: users } = useUsers();

  const totalVehicles = vehicles.length;
  const totalPrenotazioni = prenotazioni.length;
  const totalUsers = users.length;
  const vehiclesInMaintenance = vehicles.filter(v => v.inmanutenzione).length;
  const vehiclesOccupied = vehicles.filter(v => prenotazioni.some(p => p.veicolo_id === v.id)).length;

  const pieData = [
    { name: t("dashboard.free"), value: totalVehicles - vehiclesOccupied - vehiclesInMaintenance },
    { name: t("dashboard.occupied"), value: vehiclesOccupied },
    { name: t("dashboard.maintenance"), value: vehiclesInMaintenance },
  ];
  const COLORS = ["#16a34a", "#3b82f6", "#f59e0b"];

  return (
    <section className="dashboard-section">
      <div className="dashboard-header">
        <h2>{t("dashboard.title")}</h2>
        <div className="dashboard-actions">
          <button className="btn-primary">{t("dashboard.addVehicle")}</button>
          <button className="btn-secondary">{t("dashboard.newBooking")}</button>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card"><h3>{t("dashboard.totalVehicles")}</h3><p>{totalVehicles}</p></div>
        <div className="stat-card"><h3>{t("dashboard.occupiedVehicles")}</h3><p>{vehiclesOccupied}</p></div>
        <div className="stat-card"><h3>{t("dashboard.maintenanceVehicles")}</h3><p>{vehiclesInMaintenance}</p></div>
        <div className="stat-card"><h3>{t("dashboard.clients")}</h3><p>{totalUsers}</p></div>
        <div className="stat-card"><h3>{t("dashboard.bookings")}</h3><p>{totalPrenotazioni}</p></div>
      </div>

      <div className="dashboard-graph">
        <h3>{t("dashboard.vehicleStatus")}</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
              {pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="dashboard-recent">
        <h3>{t("dashboard.recentBookings")}</h3>
        <ul>
          {prenotazioni.slice(0, 5).map(p => {
            const user = users.find(u => u.id === p.cliente_id);
            const veicolo = vehicles.find(v => v.id === p.veicolo_id);
            let statusColor = "#16a34a";
            if (p.stato === "cancellata") statusColor = "#ef4444";
            if (p.stato === "completata") statusColor = "#3b82f6";
            return (
              <li key={p.id} style={{ borderLeft: `4px solid ${statusColor}`, paddingLeft: "8px" }}>
                {t("dashboard.vehicleLabel")}: {veicolo?.marca} {veicolo?.modello} - {t("dashboard.clientLabel")}: {user?.nome} {user?.cognome} - {t("dashboard.checkInLabel")}: {new Date(p.check_in).toLocaleDateString()} - {t("dashboard.statusLabel")}: {p.stato}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="dashboard-expirations">
        <h3>{t("dashboard.expirations")}</h3>
        <ul>
          {vehicles.map(v => {
            const today = new Date();
            const thirtyDays = new Date(today.setDate(today.getDate() + 30));
            const bolloExp = v.bollo_scadenza ? new Date(v.bollo_scadenza) : null;
            const assicurazioneExp = v.assicurazione_scadenza ? new Date(v.assicurazione_scadenza) : null;
            const rows = [];
            if (bolloExp && bolloExp <= thirtyDays) {
              rows.push(<li key={`${v.id}-bollo`} style={{ color: "#f59e0b" }}>{v.marca} {v.modello} - {t("dashboard.tax")}: {bolloExp.toLocaleDateString()}</li>);
            }
            if (assicurazioneExp && assicurazioneExp <= thirtyDays) {
              rows.push(<li key={`${v.id}-assicurazione`} style={{ color: "#ef4444" }}>{v.marca} {v.modello} - {t("dashboard.insuranceLabel")}: {assicurazioneExp.toLocaleDateString()}</li>);
            }
            return rows;
          })}
        </ul>
      </div>
    </section>
  );
}
