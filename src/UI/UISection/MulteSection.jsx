import { useState } from "react";
import { supabase } from "../../supabaseClient";
import { useMulte, useVehicles, useUsers, usePrenotazioni } from "../../hooks/useSupabase";
import { toast } from "sonner";
import { Search, Plus, X, AlertTriangle, DollarSign, Calendar, MapPin } from "lucide-react";
import "../../UIX/BookingSection.css";

const initialMulta = {
  veicolo_id: "", prenotazione_id: "", cliente_id: "", data_multa: "", data_notifica: "",
  data_scadenza_pagamento: "", importo: 0, importo_scontato: 0, tipo_violazione: "",
  numero_verbale: "", ente_emittente: "", luogo_violazione: "", punti_patente: 0,
  stato: "da_pagare", pagata_da: "", data_pagamento: "", metodo_pagamento: "",
  riaddebitata_cliente: false, importo_riaddebitato: 0, note: "", documento_url: "",
};

export default function MulteSection() {
  const { data: multe, refetch } = useMulte();
  const { data: vehicles } = useVehicles();
  const { data: users } = useUsers();
  const { data: prenotazioni } = usePrenotazioni();
  const [search, setSearch] = useState("");
  const [filterStato, setFilterStato] = useState("");
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(initialMulta);
  const [showForm, setShowForm] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const openNew = () => { setSelected(null); setForm(initialMulta); setShowForm(true); };
  const openEdit = (m) => { setSelected(m); setForm({ ...m }); setShowForm(true); };
  const close = () => { setShowForm(false); setSelected(null); setForm(initialMulta); };

  const save = async () => {
    const payload = { ...form };
    ["importo", "importo_scontato", "punti_patente", "importo_riaddebitato"].forEach(f => payload[f] = Number(payload[f]) || 0);
    if (!payload.veicolo_id || !payload.data_multa) { toast.warning("Veicolo e data multa sono obbligatori"); return; }

    let error;
    if (selected) {
      ({ error } = await supabase.from("multe").update(payload).eq("id", selected.id));
    } else {
      ({ error } = await supabase.from("multe").insert([payload]));
    }
    if (error) { toast.error("Errore salvataggio: " + error.message); return; }
    toast.success(selected ? "Multa aggiornata" : "Multa aggiunta");
    refetch(); close();
  };

  const remove = async () => {
    if (!selected) return;
    const { error } = await supabase.from("multe").delete().eq("id", selected.id);
    if (error) { toast.error("Errore eliminazione"); return; }
    toast.success("Multa eliminata");
    refetch(); close();
  };

  const filtered = multe.filter(m => {
    const v = vehicles.find(vh => vh.id === m.veicolo_id);
    const matchSearch = !search || v?.targa?.toLowerCase().includes(search.toLowerCase()) ||
      m.numero_verbale?.toLowerCase().includes(search.toLowerCase()) ||
      m.tipo_violazione?.toLowerCase().includes(search.toLowerCase());
    const matchStato = !filterStato || m.stato === filterStato;
    return matchSearch && matchStato;
  });

  const getStatoBadge = (stato) => {
    const colors = { da_pagare: "#f59e0b", pagata: "#16a34a", contestata: "#3b82f6", annullata: "#6b7280", riaddebita_cliente: "#ef4444" };
    return <span style={{ background: colors[stato] || "#6b7280", color: "#fff", padding: "4px 10px", borderRadius: 8, fontSize: "0.75rem", fontWeight: 600 }}>{stato?.replace(/_/g, " ")}</span>;
  };

  const totaleMulte = filtered.reduce((s, m) => s + Number(m.importo || 0), 0);

  return (
    <div className="booking-section-container">
      <div className="booking-header">
        <h1><AlertTriangle size={24} /> Gestione Multe</h1>
        <button className="btn-add" onClick={openNew}><Plus size={18} /> Nuova Multa</button>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <div className="stat-card" style={{ flex: 1, minWidth: 150 }}>
          <h3 style={{ fontSize: "0.8rem", color: "#64748b" }}>Totale Multe</h3>
          <p style={{ fontSize: "1.5rem", fontWeight: 700 }}>{filtered.length}</p>
        </div>
        <div className="stat-card" style={{ flex: 1, minWidth: 150 }}>
          <h3 style={{ fontSize: "0.8rem", color: "#64748b" }}>Importo Totale</h3>
          <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#ef4444" }}>€{totaleMulte.toFixed(2)}</p>
        </div>
        <div className="stat-card" style={{ flex: 1, minWidth: 150 }}>
          <h3 style={{ fontSize: "0.8rem", color: "#64748b" }}>Da Pagare</h3>
          <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#f59e0b" }}>{filtered.filter(m => m.stato === "da_pagare").length}</p>
        </div>
      </div>

      <div className="booking-filters">
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
          <Search size={18} />
          <input placeholder="Cerca targa, verbale, violazione..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, padding: 8, borderRadius: 8, border: "1px solid #e2e8f0" }} />
        </div>
        <select value={filterStato} onChange={e => setFilterStato(e.target.value)} style={{ padding: 8, borderRadius: 8, border: "1px solid #e2e8f0" }}>
          <option value="">Tutti gli stati</option>
          <option value="da_pagare">Da pagare</option>
          <option value="pagata">Pagata</option>
          <option value="contestata">Contestata</option>
          <option value="annullata">Annullata</option>
          <option value="riaddebita_cliente">Riaddebitata cliente</option>
        </select>
      </div>

      <div className="booking-table-container">
        <table className="booking-table">
          <thead>
            <tr>
              <th>Data</th><th>Veicolo</th><th>Targa</th><th>Violazione</th><th>Verbale</th>
              <th>Importo</th><th>Punti</th><th>Stato</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => {
              const v = vehicles.find(vh => vh.id === m.veicolo_id);
              return (
                <tr key={m.id} onClick={() => openEdit(m)} style={{ cursor: "pointer" }}>
                  <td>{m.data_multa ? new Date(m.data_multa).toLocaleDateString() : "-"}</td>
                  <td>{v ? `${v.marca} ${v.modello}` : "-"}</td>
                  <td>{v?.targa || "-"}</td>
                  <td>{m.tipo_violazione || "-"}</td>
                  <td><code>{m.numero_verbale || "-"}</code></td>
                  <td style={{ fontWeight: 600 }}>€{Number(m.importo || 0).toFixed(2)}</td>
                  <td>{m.punti_patente || 0}</td>
                  <td>{getStatoBadge(m.stato)}</td>
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={8} style={{ textAlign: "center", padding: 24 }}>Nessuna multa trovata</td></tr>}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="sidebar-overlay">
          <div className="sidebar-form">
            <button className="popup-close" onClick={close}>✕</button>
            <h2>{selected ? "Modifica Multa" : "Nuova Multa"}</h2>

            <div className="form-field">
              <label>Veicolo *</label>
              <select name="veicolo_id" value={form.veicolo_id} onChange={handleChange}>
                <option value="">Seleziona veicolo</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.marca} {v.modello} - {v.targa}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Prenotazione</label>
              <select name="prenotazione_id" value={form.prenotazione_id} onChange={handleChange}>
                <option value="">Nessuna</option>
                {prenotazioni.map(p => <option key={p.id} value={p.id}>{p.contratto_id}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Cliente</label>
              <select name="cliente_id" value={form.cliente_id} onChange={handleChange}>
                <option value="">Nessuno</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.nome} {u.cognome}</option>)}
              </select>
            </div>

            {[["Data Multa *", "data_multa", "date"], ["Data Notifica", "data_notifica", "date"],
              ["Scadenza Pagamento", "data_scadenza_pagamento", "date"], ["Importo €", "importo", "number"],
              ["Importo Scontato €", "importo_scontato", "number"], ["Tipo Violazione", "tipo_violazione", "text"],
              ["N° Verbale", "numero_verbale", "text"], ["Ente Emittente", "ente_emittente", "text"],
              ["Luogo Violazione", "luogo_violazione", "text"], ["Punti Patente", "punti_patente", "number"],
            ].map(([label, name, type]) => (
              <div className="form-field" key={name}>
                <label>{label}</label>
                <input type={type} name={name} value={form[name] || ""} onChange={handleChange} />
              </div>
            ))}

            <div className="form-field">
              <label>Stato</label>
              <select name="stato" value={form.stato} onChange={handleChange}>
                <option value="da_pagare">Da pagare</option>
                <option value="pagata">Pagata</option>
                <option value="contestata">Contestata</option>
                <option value="annullata">Annullata</option>
                <option value="riaddebita_cliente">Riaddebitata cliente</option>
              </select>
            </div>
            <div className="form-field">
              <label>Pagata da</label>
              <select name="pagata_da" value={form.pagata_da} onChange={handleChange}>
                <option value="">-</option>
                <option value="azienda">Azienda</option>
                <option value="cliente">Cliente</option>
              </select>
            </div>

            {[["Data Pagamento", "data_pagamento", "date"], ["Metodo Pagamento", "metodo_pagamento", "text"],
              ["Importo Riaddebitato €", "importo_riaddebitato", "number"],
            ].map(([label, name, type]) => (
              <div className="form-field" key={name}>
                <label>{label}</label>
                <input type={type} name={name} value={form[name] || ""} onChange={handleChange} />
              </div>
            ))}

            <div className="form-field">
              <label><input type="checkbox" name="riaddebitata_cliente" checked={form.riaddebitata_cliente} onChange={handleChange} /> Riaddebitata al cliente</label>
            </div>

            <div className="form-field">
              <label>Note</label>
              <textarea name="note" value={form.note || ""} onChange={handleChange} />
            </div>

            <div className="popup-actions">
              <button className="green-btn" onClick={save}>Salva</button>
              {selected && <button className="red-btn" onClick={remove}>Elimina</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
