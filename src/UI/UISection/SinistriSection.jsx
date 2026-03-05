import { useState } from "react";
import { supabase } from "../../supabaseClient";
import { useSinistri, useVehicles, useUsers, usePrenotazioni } from "../../hooks/useSupabase";
import { toast } from "sonner";
import { Search, Plus, ShieldAlert, Car } from "lucide-react";
import "../../UIX/BookingSection.css";

const initialSinistro = {
  veicolo_id: "", prenotazione_id: "", cliente_id: "", data_sinistro: "", ora_sinistro: "",
  luogo_sinistro: "", tipo_sinistro: "", descrizione: "", danni_veicolo: "", danni_terzi: "",
  costo_riparazione: 0, costo_carrozzeria: 0, franchigia_applicata: 0, coperto_assicurazione: false,
  numero_sinistro_assicurazione: "", stato: "aperto", responsabilita: "da_definire",
  controparte_nome: "", controparte_targa: "", controparte_assicurazione: "", testimoni: "",
  rapporto_polizia: false, numero_rapporto: "", veicolo_guidabile: true, giorni_fermo: 0,
  costo_fermo: 0, note_interne: "",
};

export default function SinistriSection() {
  const { data: sinistri, refetch } = useSinistri();
  const { data: vehicles } = useVehicles();
  const { data: users } = useUsers();
  const { data: prenotazioni } = usePrenotazioni();
  const [search, setSearch] = useState("");
  const [filterStato, setFilterStato] = useState("");
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(initialSinistro);
  const [showForm, setShowForm] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const openNew = () => { setSelected(null); setForm(initialSinistro); setShowForm(true); };
  const openEdit = (s) => { setSelected(s); setForm({ ...s }); setShowForm(true); };
  const close = () => { setShowForm(false); setSelected(null); };

  const save = async () => {
    const payload = { ...form };
    ["costo_riparazione", "costo_carrozzeria", "franchigia_applicata", "giorni_fermo", "costo_fermo"].forEach(f => payload[f] = Number(payload[f]) || 0);
    if (!payload.veicolo_id || !payload.data_sinistro) { toast.warning("Veicolo e data sinistro obbligatori"); return; }
    let error;
    if (selected) {
      ({ error } = await supabase.from("sinistri").update(payload).eq("id", selected.id));
    } else {
      ({ error } = await supabase.from("sinistri").insert([payload]));
    }
    if (error) { toast.error("Errore: " + error.message); return; }
    toast.success(selected ? "Sinistro aggiornato" : "Sinistro registrato");
    refetch(); close();
  };

  const remove = async () => {
    if (!selected) return;
    await supabase.from("sinistri").delete().eq("id", selected.id);
    toast.success("Sinistro eliminato");
    refetch(); close();
  };

  const filtered = sinistri.filter(s => {
    const v = vehicles.find(vh => vh.id === s.veicolo_id);
    const match = !search || v?.targa?.toLowerCase().includes(search.toLowerCase()) ||
      s.tipo_sinistro?.toLowerCase().includes(search.toLowerCase()) ||
      s.descrizione?.toLowerCase().includes(search.toLowerCase());
    return match && (!filterStato || s.stato === filterStato);
  });

  const getStatoBadge = (stato) => {
    const colors = { aperto: "#ef4444", in_lavorazione: "#f59e0b", chiuso: "#16a34a", rifiutato: "#6b7280" };
    return <span style={{ background: colors[stato] || "#6b7280", color: "#fff", padding: "4px 10px", borderRadius: 8, fontSize: "0.75rem", fontWeight: 600 }}>{stato?.replace(/_/g, " ")}</span>;
  };

  const totaleCosti = filtered.reduce((s, x) => s + Number(x.costo_riparazione || 0) + Number(x.costo_carrozzeria || 0), 0);

  return (
    <div className="booking-section-container">
      <div className="booking-header">
        <h1><ShieldAlert size={24} /> Gestione Sinistri</h1>
        <button className="btn-add" onClick={openNew}><Plus size={18} /> Nuovo Sinistro</button>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <div className="stat-card" style={{ flex: 1, minWidth: 150 }}>
          <h3 style={{ fontSize: "0.8rem", color: "#64748b" }}>Totale Sinistri</h3>
          <p style={{ fontSize: "1.5rem", fontWeight: 700 }}>{filtered.length}</p>
        </div>
        <div className="stat-card" style={{ flex: 1, minWidth: 150 }}>
          <h3 style={{ fontSize: "0.8rem", color: "#64748b" }}>Costi Totali</h3>
          <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#ef4444" }}>€{totaleCosti.toFixed(2)}</p>
        </div>
        <div className="stat-card" style={{ flex: 1, minWidth: 150 }}>
          <h3 style={{ fontSize: "0.8rem", color: "#64748b" }}>Aperti</h3>
          <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#f59e0b" }}>{filtered.filter(s => s.stato === "aperto").length}</p>
        </div>
      </div>

      <div className="booking-filters">
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
          <Search size={18} />
          <input placeholder="Cerca targa, tipo, descrizione..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, padding: 8, borderRadius: 8, border: "1px solid #e2e8f0" }} />
        </div>
        <select value={filterStato} onChange={e => setFilterStato(e.target.value)} style={{ padding: 8, borderRadius: 8, border: "1px solid #e2e8f0" }}>
          <option value="">Tutti gli stati</option>
          <option value="aperto">Aperto</option>
          <option value="in_lavorazione">In lavorazione</option>
          <option value="chiuso">Chiuso</option>
          <option value="rifiutato">Rifiutato</option>
        </select>
      </div>

      <div className="booking-table-container">
        <table className="booking-table">
          <thead>
            <tr><th>Data</th><th>Veicolo</th><th>Tipo</th><th>Responsabilità</th><th>Costo Rip.</th><th>Fermo gg</th><th>Guidabile</th><th>Stato</th></tr>
          </thead>
          <tbody>
            {filtered.map(s => {
              const v = vehicles.find(vh => vh.id === s.veicolo_id);
              return (
                <tr key={s.id} onClick={() => openEdit(s)} style={{ cursor: "pointer" }}>
                  <td>{s.data_sinistro ? new Date(s.data_sinistro).toLocaleDateString() : "-"}</td>
                  <td>{v ? `${v.marca} ${v.modello} (${v.targa})` : "-"}</td>
                  <td>{s.tipo_sinistro || "-"}</td>
                  <td>{s.responsabilita?.replace(/_/g, " ") || "-"}</td>
                  <td>€{Number(s.costo_riparazione || 0).toFixed(2)}</td>
                  <td>{s.giorni_fermo || 0}</td>
                  <td>{s.veicolo_guidabile ? "✅" : "❌"}</td>
                  <td>{getStatoBadge(s.stato)}</td>
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={8} style={{ textAlign: "center", padding: 24 }}>Nessun sinistro</td></tr>}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="sidebar-overlay">
          <div className="sidebar-form" style={{ maxHeight: "90vh", overflowY: "auto" }}>
            <button className="popup-close" onClick={close}>✕</button>
            <h2>{selected ? "Modifica Sinistro" : "Nuovo Sinistro"}</h2>

            <div className="form-field"><label>Veicolo *</label>
              <select name="veicolo_id" value={form.veicolo_id} onChange={handleChange}>
                <option value="">Seleziona</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.marca} {v.modello} - {v.targa}</option>)}
              </select>
            </div>
            <div className="form-field"><label>Prenotazione</label>
              <select name="prenotazione_id" value={form.prenotazione_id} onChange={handleChange}>
                <option value="">Nessuna</option>
                {prenotazioni.map(p => <option key={p.id} value={p.id}>{p.contratto_id}</option>)}
              </select>
            </div>
            <div className="form-field"><label>Cliente</label>
              <select name="cliente_id" value={form.cliente_id} onChange={handleChange}>
                <option value="">Nessuno</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.nome} {u.cognome}</option>)}
              </select>
            </div>

            {[["Data Sinistro *", "data_sinistro", "date"], ["Ora", "ora_sinistro", "time"],
              ["Luogo", "luogo_sinistro", "text"],
            ].map(([l, n, t]) => (
              <div className="form-field" key={n}><label>{l}</label><input type={t} name={n} value={form[n] || ""} onChange={handleChange} /></div>
            ))}

            <div className="form-field"><label>Tipo Sinistro</label>
              <select name="tipo_sinistro" value={form.tipo_sinistro} onChange={handleChange}>
                <option value="">Seleziona</option>
                {["tamponamento", "uscita_strada", "furto", "vandalismo", "grandine", "altro"].map(t => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
              </select>
            </div>

            <div className="form-field"><label>Descrizione</label><textarea name="descrizione" value={form.descrizione || ""} onChange={handleChange} /></div>
            <div className="form-field"><label>Danni Veicolo</label><textarea name="danni_veicolo" value={form.danni_veicolo || ""} onChange={handleChange} /></div>
            <div className="form-field"><label>Danni Terzi</label><textarea name="danni_terzi" value={form.danni_terzi || ""} onChange={handleChange} /></div>

            {[["Costo Riparazione €", "costo_riparazione", "number"], ["Costo Carrozzeria €", "costo_carrozzeria", "number"],
              ["Franchigia Applicata €", "franchigia_applicata", "number"], ["N° Sinistro Assicurazione", "numero_sinistro_assicurazione", "text"],
            ].map(([l, n, t]) => (
              <div className="form-field" key={n}><label>{l}</label><input type={t} name={n} value={form[n] || ""} onChange={handleChange} /></div>
            ))}

            <div className="form-field"><label><input type="checkbox" name="coperto_assicurazione" checked={form.coperto_assicurazione} onChange={handleChange} /> Coperto da assicurazione</label></div>

            <div className="form-field"><label>Stato</label>
              <select name="stato" value={form.stato} onChange={handleChange}>
                {["aperto", "in_lavorazione", "chiuso", "rifiutato"].map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
              </select>
            </div>
            <div className="form-field"><label>Responsabilità</label>
              <select name="responsabilita" value={form.responsabilita} onChange={handleChange}>
                {["da_definire", "cliente", "terzi", "mista"].map(r => <option key={r} value={r}>{r.replace(/_/g, " ")}</option>)}
              </select>
            </div>

            {[["Controparte Nome", "controparte_nome", "text"], ["Controparte Targa", "controparte_targa", "text"],
              ["Controparte Assicurazione", "controparte_assicurazione", "text"], ["Testimoni", "testimoni", "text"],
              ["N° Rapporto Polizia", "numero_rapporto", "text"], ["Giorni Fermo", "giorni_fermo", "number"],
              ["Costo Fermo €", "costo_fermo", "number"],
            ].map(([l, n, t]) => (
              <div className="form-field" key={n}><label>{l}</label><input type={t} name={n} value={form[n] || ""} onChange={handleChange} /></div>
            ))}

            <div className="form-field"><label><input type="checkbox" name="rapporto_polizia" checked={form.rapporto_polizia} onChange={handleChange} /> Rapporto Polizia</label></div>
            <div className="form-field"><label><input type="checkbox" name="veicolo_guidabile" checked={form.veicolo_guidabile} onChange={handleChange} /> Veicolo Guidabile</label></div>

            <div className="form-field"><label>Note Interne</label><textarea name="note_interne" value={form.note_interne || ""} onChange={handleChange} /></div>

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
