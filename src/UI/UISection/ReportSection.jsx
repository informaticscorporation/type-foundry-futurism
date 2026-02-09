import React, { useState, useMemo } from "react";
import { usePrenotazioni, useVehicles, useUsers } from "../../hooks/useSupabase";
import "../../UIX/ReportSection.css";
import {
  BarChart3, Download, FileSpreadsheet, FileText, TrendingUp,
  Car, Users, CalendarDays, Wallet, Filter
} from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  LineChart, Line
} from "recharts";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";

export default function ReportSection() {
  const { data: vehicles } = useVehicles();
  const { data: prenotazioni, loading } = usePrenotazioni();
  const { data: users } = useUsers();
  const [periodoFilter, setPeriodoFilter] = useState("tutti");
  const [annoFilter, setAnnoFilter] = useState(new Date().getFullYear());

  // Filtro periodo
  const filteredPren = useMemo(() => {
    return prenotazioni.filter((p) => {
      const d = new Date(p.data_creazione);
      if (periodoFilter === "tutti") return true;
      if (periodoFilter === "anno") return d.getFullYear() === annoFilter;
      if (periodoFilter === "mese") {
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      if (periodoFilter === "settimana") {
        const now = new Date();
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return d >= weekAgo;
      }
      return true;
    });
  }, [prenotazioni, periodoFilter, annoFilter]);

  // === STATISTICHE ===
  const stats = useMemo(() => {
    const totaleIncassi = filteredPren.reduce((sum, p) => sum + parseFloat(p.totale_pagato || 0), 0);
    const totaleSconti = filteredPren.reduce((sum, p) => sum + parseFloat(p.sconto || 0), 0);
    const totaleDepositi = filteredPren.reduce((sum, p) => sum + parseFloat(p.deposito || 0), 0);
    const mediaGiornaliera = filteredPren.length > 0
      ? filteredPren.reduce((sum, p) => sum + parseFloat(p.prezzo_giornaliero || 0), 0) / filteredPren.length
      : 0;
    const giorniTotali = filteredPren.reduce((sum, p) => sum + parseInt(p.giorni || 0), 0);

    const statiCount = {};
    filteredPren.forEach((p) => {
      statiCount[p.stato] = (statiCount[p.stato] || 0) + 1;
    });

    const pagamentoCount = {};
    filteredPren.forEach((p) => {
      pagamentoCount[p.pagamento_status] = (pagamentoCount[p.pagamento_status] || 0) + 1;
    });

    const assicurazioneCount = {};
    filteredPren.forEach((p) => {
      if (p.assicurazione_tipo) {
        assicurazioneCount[p.assicurazione_tipo] = (assicurazioneCount[p.assicurazione_tipo] || 0) + 1;
      }
    });

    // Incassi per mese
    const incassiMensili = {};
    filteredPren.forEach((p) => {
      const d = new Date(p.data_creazione);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      incassiMensili[key] = (incassiMensili[key] || 0) + parseFloat(p.totale_pagato || 0);
    });

    // Veicoli più noleggiati
    const veicoliCount = {};
    filteredPren.forEach((p) => {
      veicoliCount[p.veicolo_id] = (veicoliCount[p.veicolo_id] || 0) + 1;
    });

    // Clienti più attivi
    const clientiCount = {};
    filteredPren.forEach((p) => {
      clientiCount[p.cliente_id] = (clientiCount[p.cliente_id] || 0) + 1;
    });

    return {
      totalePrenotazioni: filteredPren.length,
      totaleIncassi,
      totaleSconti,
      totaleDepositi,
      mediaGiornaliera,
      giorniTotali,
      statiCount,
      pagamentoCount,
      assicurazioneCount,
      incassiMensili,
      veicoliCount,
      clientiCount,
      totaleVeicoli: vehicles.length,
      totaleClienti: users.length,
      veicoliManutenzione: vehicles.filter((v) => v.inmanutenzione).length,
    };
  }, [filteredPren, vehicles, users]);

  // Chart data
  const statiData = Object.entries(stats.statiCount).map(([name, value]) => ({ name, value }));
  const pagamentoData = Object.entries(stats.pagamentoCount).map(([name, value]) => ({ name, value }));
  const assicurazioneData = Object.entries(stats.assicurazioneCount).map(([name, value]) => ({ name, value }));

  const incassiMensiliData = Object.entries(stats.incassiMensili)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mese, totale]) => ({ mese, totale }));

  const topVeicoli = Object.entries(stats.veicoliCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([id, count]) => {
      const v = vehicles.find((vh) => vh.id === id);
      return { nome: v ? `${v.marca} ${v.modello}` : id, noleggi: count };
    });

  const topClienti = Object.entries(stats.clientiCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([id, count]) => {
      const u = users.find((us) => us.id === id);
      return { nome: u ? `${u.nome} ${u.cognome}` : id, noleggi: count };
    });

  const COLORS = ["#16a34a", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

  // === EXPORT PDF ===
  const exportPDF = () => {
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(18);
    doc.text("Report Riepilogativo", 14, y);
    y += 10;
    doc.setFontSize(10);
    doc.text(`Generato il: ${new Date().toLocaleDateString("it-IT")} - Filtro: ${periodoFilter}`, 14, y);
    y += 15;

    doc.setFontSize(12);
    doc.text("Riepilogo Generale", 14, y);
    y += 8;
    doc.setFontSize(10);

    const righe = [
      `Totale Prenotazioni: ${stats.totalePrenotazioni}`,
      `Totale Incassi: €${stats.totaleIncassi.toFixed(2)}`,
      `Totale Sconti: €${stats.totaleSconti.toFixed(2)}`,
      `Totale Depositi: €${stats.totaleDepositi.toFixed(2)}`,
      `Media Prezzo Giornaliero: €${stats.mediaGiornaliera.toFixed(2)}`,
      `Giorni Noleggio Totali: ${stats.giorniTotali}`,
      `Totale Veicoli: ${stats.totaleVeicoli}`,
      `Veicoli in Manutenzione: ${stats.veicoliManutenzione}`,
      `Totale Clienti: ${stats.totaleClienti}`,
    ];
    righe.forEach((r) => {
      doc.text(r, 14, y);
      y += 6;
    });

    y += 8;
    doc.setFontSize(12);
    doc.text("Stato Prenotazioni", 14, y);
    y += 8;
    doc.setFontSize(10);
    Object.entries(stats.statiCount).forEach(([stato, count]) => {
      doc.text(`${stato}: ${count}`, 14, y);
      y += 6;
    });

    y += 8;
    doc.setFontSize(12);
    doc.text("Stato Pagamenti", 14, y);
    y += 8;
    doc.setFontSize(10);
    Object.entries(stats.pagamentoCount).forEach(([stato, count]) => {
      doc.text(`${stato}: ${count}`, 14, y);
      y += 6;
    });

    if (y > 240) { doc.addPage(); y = 20; }

    y += 8;
    doc.setFontSize(12);
    doc.text("Top 5 Veicoli Più Noleggiati", 14, y);
    y += 8;
    doc.setFontSize(10);
    topVeicoli.forEach((v) => {
      doc.text(`${v.nome}: ${v.noleggi} noleggi`, 14, y);
      y += 6;
    });

    y += 8;
    doc.setFontSize(12);
    doc.text("Top 5 Clienti Più Attivi", 14, y);
    y += 8;
    doc.setFontSize(10);
    topClienti.forEach((c) => {
      doc.text(`${c.nome}: ${c.noleggi} noleggi`, 14, y);
      y += 6;
    });

    if (y > 240) { doc.addPage(); y = 20; }

    y += 8;
    doc.setFontSize(12);
    doc.text("Incassi Mensili", 14, y);
    y += 8;
    doc.setFontSize(10);
    incassiMensiliData.forEach((m) => {
      doc.text(`${m.mese}: €${m.totale.toFixed(2)}`, 14, y);
      y += 6;
    });

    doc.save(`report_${periodoFilter}_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  // === EXPORT EXCEL ===
  const exportExcel = () => {
    // Foglio riepilogo
    const riepilogo = [
      { Dato: "Totale Prenotazioni", Valore: stats.totalePrenotazioni },
      { Dato: "Totale Incassi", Valore: `€${stats.totaleIncassi.toFixed(2)}` },
      { Dato: "Totale Sconti", Valore: `€${stats.totaleSconti.toFixed(2)}` },
      { Dato: "Totale Depositi", Valore: `€${stats.totaleDepositi.toFixed(2)}` },
      { Dato: "Media Prezzo Giornaliero", Valore: `€${stats.mediaGiornaliera.toFixed(2)}` },
      { Dato: "Giorni Noleggio Totali", Valore: stats.giorniTotali },
      { Dato: "Totale Veicoli", Valore: stats.totaleVeicoli },
      { Dato: "Veicoli in Manutenzione", Valore: stats.veicoliManutenzione },
      { Dato: "Totale Clienti", Valore: stats.totaleClienti },
    ];

    // Foglio prenotazioni dettaglio
    const dettaglio = filteredPren.map((p) => {
      const u = users.find((us) => us.id === p.cliente_id);
      const v = vehicles.find((vh) => vh.id === p.veicolo_id);
      return {
        "ID Contratto": p.contratto_id,
        Cliente: u ? `${u.nome} ${u.cognome}` : p.cliente_id,
        Veicolo: v ? `${v.marca} ${v.modello}` : p.veicolo_id,
        "Check-in": p.check_in,
        "Check-out": p.check_out,
        Giorni: p.giorni,
        "Prezzo/Giorno": p.prezzo_giornaliero,
        "Totale Base": p.totale_base,
        Sconto: p.sconto,
        "Totale Pagato": p.totale_pagato,
        Stato: p.stato,
        Pagamento: p.pagamento_status,
        Assicurazione: p.assicurazione_tipo,
        Franchigia: p.franchigia,
        Deposito: p.deposito,
        "Data Creazione": p.data_creazione,
      };
    });

    // Foglio incassi mensili
    const mensili = incassiMensiliData.map((m) => ({
      Mese: m.mese,
      "Totale Incassi": `€${m.totale.toFixed(2)}`,
    }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(riepilogo), "Riepilogo");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dettaglio), "Prenotazioni");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(mensili), "Incassi Mensili");

    XLSX.writeFile(wb, `report_${periodoFilter}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  if (loading) {
    return <div className="report-section"><p>Caricamento dati...</p></div>;
  }

  return (
    <section className="report-section">
      {/* HEADER */}
      <div className="report-header">
        <h2><BarChart3 size={28} /> Report & Statistiche</h2>
        <div className="report-actions">
          <div className="report-filters">
            <Filter size={18} />
            <select value={periodoFilter} onChange={(e) => setPeriodoFilter(e.target.value)}>
              <option value="tutti">Tutti i periodi</option>
              <option value="settimana">Ultima settimana</option>
              <option value="mese">Mese corrente</option>
              <option value="anno">Anno</option>
            </select>
            {periodoFilter === "anno" && (
              <input
                type="number"
                value={annoFilter}
                onChange={(e) => setAnnoFilter(parseInt(e.target.value))}
                min={2020}
                max={2030}
                className="anno-input"
              />
            )}
          </div>
          <button className="btn-export btn-pdf" onClick={exportPDF}>
            <FileText size={16} /> PDF
          </button>
          <button className="btn-export btn-excel" onClick={exportExcel}>
            <FileSpreadsheet size={16} /> Excel
          </button>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="report-stats">
        <div className="report-stat-card">
          <div className="stat-icon" style={{ background: "#dcfce7" }}><CalendarDays size={22} color="#16a34a" /></div>
          <div><span className="stat-label">Prenotazioni</span><span className="stat-value">{stats.totalePrenotazioni}</span></div>
        </div>
        <div className="report-stat-card">
          <div className="stat-icon" style={{ background: "#dbeafe" }}><Wallet size={22} color="#3b82f6" /></div>
          <div><span className="stat-label">Incassi Totali</span><span className="stat-value">€{stats.totaleIncassi.toFixed(2)}</span></div>
        </div>
        <div className="report-stat-card">
          <div className="stat-icon" style={{ background: "#fef3c7" }}><TrendingUp size={22} color="#f59e0b" /></div>
          <div><span className="stat-label">Media €/giorno</span><span className="stat-value">€{stats.mediaGiornaliera.toFixed(2)}</span></div>
        </div>
        <div className="report-stat-card">
          <div className="stat-icon" style={{ background: "#f3e8ff" }}><Car size={22} color="#8b5cf6" /></div>
          <div><span className="stat-label">Veicoli</span><span className="stat-value">{stats.totaleVeicoli}</span></div>
        </div>
        <div className="report-stat-card">
          <div className="stat-icon" style={{ background: "#ecfeff" }}><Users size={22} color="#06b6d4" /></div>
          <div><span className="stat-label">Clienti</span><span className="stat-value">{stats.totaleClienti}</span></div>
        </div>
        <div className="report-stat-card">
          <div className="stat-icon" style={{ background: "#dcfce7" }}><CalendarDays size={22} color="#16a34a" /></div>
          <div><span className="stat-label">Giorni Noleggio</span><span className="stat-value">{stats.giorniTotali}</span></div>
        </div>
      </div>

      {/* GRAFICI ROW 1 */}
      <div className="report-charts-row">
        <div className="report-chart-card">
          <h3>Incassi Mensili</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={incassiMensiliData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mese" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip formatter={(v) => `€${v.toFixed(2)}`} />
              <Bar dataKey="totale" fill="#16a34a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="report-chart-card">
          <h3>Stato Prenotazioni</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statiData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {statiData.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* GRAFICI ROW 2 */}
      <div className="report-charts-row">
        <div className="report-chart-card">
          <h3>Stato Pagamenti</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pagamentoData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {pagamentoData.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="report-chart-card">
          <h3>Tipi Assicurazione</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={assicurazioneData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {assicurazioneData.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TOP TABLES */}
      <div className="report-charts-row">
        <div className="report-chart-card">
          <h3>🚗 Top 5 Veicoli Più Noleggiati</h3>
          <table className="report-table">
            <thead><tr><th>Veicolo</th><th>Noleggi</th></tr></thead>
            <tbody>
              {topVeicoli.map((v, i) => (
                <tr key={i}><td>{v.nome}</td><td><strong>{v.noleggi}</strong></td></tr>
              ))}
              {topVeicoli.length === 0 && <tr><td colSpan={2}>Nessun dato</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="report-chart-card">
          <h3>👤 Top 5 Clienti Più Attivi</h3>
          <table className="report-table">
            <thead><tr><th>Cliente</th><th>Noleggi</th></tr></thead>
            <tbody>
              {topClienti.map((c, i) => (
                <tr key={i}><td>{c.nome}</td><td><strong>{c.noleggi}</strong></td></tr>
              ))}
              {topClienti.length === 0 && <tr><td colSpan={2}>Nessun dato</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETTAGLIO SCONTI / DEPOSITI */}
      <div className="report-charts-row">
        <div className="report-chart-card summary-card">
          <h3>💰 Riepilogo Finanziario</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <span>Totale Incassi</span>
              <strong className="text-green">€{stats.totaleIncassi.toFixed(2)}</strong>
            </div>
            <div className="summary-item">
              <span>Totale Sconti</span>
              <strong className="text-amber">€{stats.totaleSconti.toFixed(2)}</strong>
            </div>
            <div className="summary-item">
              <span>Totale Depositi</span>
              <strong className="text-blue">€{stats.totaleDepositi.toFixed(2)}</strong>
            </div>
            <div className="summary-item">
              <span>Incasso Netto</span>
              <strong className="text-green">€{(stats.totaleIncassi - stats.totaleSconti).toFixed(2)}</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
