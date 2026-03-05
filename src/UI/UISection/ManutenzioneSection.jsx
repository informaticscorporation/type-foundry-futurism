import { useState } from "react";
import { supabase } from "../../supabaseClient";
import { useManutenzioneProgrammata, useVehicles } from "../../hooks/useSupabase";
import { toast } from "sonner";
import { Search, Plus, Wrench, AlertCircle } from "lucide-react";
import "../../UIX/BookingSection.css";

const initialManutenzione = {
  veicolo_id: "", tipo: "", descrizione: "", officina: "", costo_preventivo: 0,
  costo_effettivo: 0, data_programmata: "", data_completamento: "", km_al_momento: 0,
  prossimo_intervento_km: 0, stato: "programmata", priorita: "normale", note: "",
};

export default function ManutenzioneSection() {
  const { data: manutenzioni, refetch } = useManutenzioneProgrammata();
  const { data: vehicles } = useVehicles();
  const [search, setSearch] = useState("");
  const [filterStato, setFilterStato] = useState("");
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(initialManutenzione);
  const [showForm, setShowForm] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const openNew = () => { setSelected(null); setForm(initialManutenzione); setShowForm(true); };
  const openEdit = (m) => { setSelected(m); setForm({ ...m }); setShowForm(true); };
  const close = () => { setShowForm(false); setSelected(null); };

  const save = async () => {
    const payload = { ...form };
    ["costo_preventivo", "costo_effettivo", "km_al_momento", "prossimo_intervento_km"].forEach(f => payload[f] = Number(payload[f]) || 0);
    if (!payload.veicolo_id || !payload.data_programmata || !payload.tipo) { toast.warning("Campi obbligatori mancanti"); return; }
    let error;
    if (selected) {
      ({ error } = await supabase.from("manutenzione_programmata").update(payload).eq("id", selected.id));
    } else {
      ({ error } = await supabase.from("manutenzione_programmata").insert([payload]));
    }
    if (error) { toast.error("Errore: " + error.message); return; }
    toast.success(selected ? "Manutenzione aggiornata" : "Manutenzione programmata");
    refetch(); close();
  };

  const remove = async () => {
    if (!selected) return;
    await supabase.from("manutenzione_programmata").delete().eq("id", selected.id);
    toast.success("Eliminata"); refetch(); close();
  };

  const filtered = manutenzioni.filter(m => {
    const v = vehicles.find(vh => vh.id === m.veicolo_id);
    const match = !search || v?.targa?.toLowerCase().includes(search.toLowerCase()) ||
      m.tipo?.toLowerCase().includes(search.toLowerCase()) || m.officina?.toLowerCase().includes(search.toLowerCase());
    return match && (!filterStato || m.stato === filterStato);
  });

  // Scadenze prossime (7 giorni)
  const oggi = new Date();
  const prossime = manutenzioni.filter(m => {
    if (m.stato !== "programmata") return false;
    const d = new Date(m.data_programmata);
    const diff = (d - oggi) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  });

  const getPrioritaBadge = (p) => {
    const c = { bassa: "#6b7280", normale: "#3b82f6", alta: "#f59e0b", urgente: "#ef4444" };
    return <span style={{ background: c[p] || "#6b7280", color: "#fff", padding: "3px 8px", borderRadius: 6, fontSize: "0.7rem", fontWeight: 600 }}>{p}</span>;
  };

  const getStatoBadge = (s) => {
    const c = { programmata: "#3b82f6", in_corso: "#f59e0b", completata: "#16a34a", annullata: "#6b7280" };
    return <span style={{ background: c[s] || "#6b7280", color: "#fff", padding: "4px 10px", borderRadius: 8, fontSize: "0.75rem", fontWeight: 600 }}>{s?.replace(/_/g, " ")}</span>;
  };

  return (
    <div className="booking-section-container">
      <div className="booking-header">
        <h1><Wrench size={24} /> Manutenzione Programmata</h1>
        <button className="btn-add" onClick={openNew}><Plus size={18} /> Nuova Manutenzione</button>
      </div>

      {prossime.length > 0 && (
        <div style={{ background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: 12, padding: 16, marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
          <AlertCircle size={24} color="#d97706" />
          <div>
            <strong>⚠️ {prossime.length} manutenzioni in scadenza nei prossimi 7 giorni!</strong>
            <ul style={{ margin: "4px 0 0", paddingLeft: 20, fontSize: "0.85rem" }}>
              {prossime.map(m => {
                const v = vehicles.find(vh => vh.id === m.veicolo_id);
                return <li key={m.id}>{v?.marca} {v?.modello} ({v?.targa}) - {m.tipo} - {new Date(m.data_programmata).toLocaleDateString()}</li>;
              })}
            </ul>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <div className="stat-card" style={{ flex: 1, minWidth: 150 }}>
          <h3 style={{ fontSize: "0.8rem", color: "#64748b" }}>Totale</h3>
          <p style={{ fontSize: "1.5rem", fontWeight: 700 }}>{manutenzioni.length}</p>
        </div>
        <div className="stat-card" style={{ flex: 1, minWidth: 150 }}>
          <h3 style={{ fontSize: "0.8rem", color: "#64748b" }}>Programmate</h3>
          <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#3b82f6" }}>{manutenzioni.filter(m => m.stato === "programmata").length}</p>
        </div>
        <div className="stat-card" style={{ flex: 1, minWidth: 150 }}>
          <h3 style={{ fontSize: "0.8rem", color: "#64748b" }}>Costi Totali</h3>
          <p style={{ fontSize: "1.5rem", fontWeight: 700 }}>€{manutenzioni.reduce((s, m) => s + Number(m.costo_effettivo || m.costo_preventivo || 0), 0).toFixed(2)}</p>
        </div>
      </div>

      <div className="booking-filters">
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
          <Search size={18} />
          <input placeholder="Cerca targa, tipo, officina..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, padding: 8, borderRadius: 8, border: "1px solid #e2e8f0" }} />
        </div>
        <select value={filterStato} onChange={e => setFilterStato(e.target.value)} style={{ padding: 8, borderRadius: 8, border: "1px solid #e2e8f0" }}>
          <option value="">Tutti gli stati</option>
          <option value="programmata">Programmata</option>
          <option value="in_corso">In corso</option>
          <option value="completata">Completata</option>
          <option value="annullata">Annullata</option>
        </select>
      </div>

      <div className="booking-table-container">
        <table className="booking-table">
          <thead>
            <tr><th>Data</th><th>Veicolo</th><th>Tipo</th><th>Officina</th><th>Costo</th><th>Priorità</th><th>Stato</th></tr>
          </thead>
          <tbody>
            {filtered.map(m => {
              const v = vehicles.find(vh => vh.id === m.veicolo_id);
              return (
                <tr key={m.id} onClick={() => openEdit(m)} style={{ cursor: "pointer" }}>
                  <td>{m.data_programmata ? new Date(m.data_programmata).toLocaleDateString() : "-"}</td>
                  <td>{v ? `${v.marca} ${v.modello} (${v.targa})` : "-"}</td>
                  <td>{m.tipo?.replace(/_/g, " ")}</td>
                  <td>{m.officina || "-"}</td>
                  <td>€{Number(m.costo_effettivo || m.costo_preventivo || 0).toFixed(2)}</td>
                  <td>{getPrioritaBadge(m.priorita)}</td>
                  <td>{getStatoBadge(m.stato)}</td>
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", padding: 24 }}>Nessuna manutenzione</td></tr>}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="sidebar-overlay">
          <div className="sidebar-form">
            <button className="popup-close" onClick={close}>✕</button>
            <h2>{selected ? "Modifica" : "Nuova"} Manutenzione</h2>

            <div className="form-field"><label>Veicolo *</label>
              <select name="veicolo_id" value={form.veicolo_id} onChange={handleChange}>
                <option value="">Seleziona</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.marca} {v.modello} - {v.targa}</option>)}
              </select>
            </div>
            <div className="form-field"><label>Tipo *</label>
              <select name="tipo" value={form.tipo} onChange={handleChange}>
                <option value="">Seleziona</option>
                {["tagliando", "revisione", "cambio_gomme", "riparazione", "carrozzeria", "altro"].map(t => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
              </select>
            </div>

            {[["Descrizione", "descrizione", "text"], ["Officina", "officina", "text"],
              ["Costo Preventivo €", "costo_preventivo", "number"], ["Costo Effettivo €", "costo_effettivo", "number"],
              ["Data Programmata *", "data_programmata", "date"], ["Data Completamento", "data_completamento", "date"],
              ["Km al Momento", "km_al_momento", "number"], ["Prossimo Intervento Km", "prossimo_intervento_km", "number"],
            ].map(([l, n, t]) => (
              <div className="form-field" key={n}><label>{l}</label><input type={t} name={n} value={form[n] || ""} onChange={handleChange} /></div>
            ))}

            <div className="form-field"><label>Stato</label>
              <select name="stato" value={form.stato} onChange={handleChange}>
                {["programmata", "in_corso", "completata", "annullata"].map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
              </select>
            </div>
            <div className="form-field"><label>Priorità</label>
              <select name="priorita" value={form.priorita} onChange={handleChange}>
                {["bassa", "normale", "alta", "urgente"].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-field"><label>Note</label><textarea name="note" value={form.note || ""} onChange={handleChange} /></div>

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
