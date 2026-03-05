import { useState } from "react";
import { supabase } from "../../supabaseClient";
import { useSecondoGuidatore, usePrenotazioni, useVehicles, useUsers } from "../../hooks/useSupabase";
import { toast } from "sonner";
import { Search, Plus, UserPlus } from "lucide-react";
import "../../UIX/BookingSection.css";

const initialGuidatore = {
  prenotazione_id: "", nome: "", cognome: "", codice_fiscale: "", data_nascita: "",
  numero_patente: "", scadenza_patente: "", categoria_patente: "", telefono: "", email: "",
  costo_extra: 0, approvato: false, note: "",
};

export default function SecondoGuidatoreSection() {
  const { data: guidatori, refetch } = useSecondoGuidatore();
  const { data: prenotazioni } = usePrenotazioni();
  const { data: vehicles } = useVehicles();
  const { data: users } = useUsers();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(initialGuidatore);
  const [showForm, setShowForm] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const openNew = () => { setSelected(null); setForm(initialGuidatore); setShowForm(true); };
  const openEdit = (g) => { setSelected(g); setForm({ ...g }); setShowForm(true); };
  const close = () => { setShowForm(false); setSelected(null); };

  const save = async () => {
    const payload = { ...form, costo_extra: Number(form.costo_extra) || 0 };
    if (!payload.prenotazione_id || !payload.nome || !payload.cognome) { toast.warning("Prenotazione, nome e cognome obbligatori"); return; }
    let error;
    if (selected) {
      ({ error } = await supabase.from("secondo_guidatore").update(payload).eq("id", selected.id));
    } else {
      ({ error } = await supabase.from("secondo_guidatore").insert([payload]));
    }
    if (error) { toast.error("Errore: " + error.message); return; }
    toast.success(selected ? "Guidatore aggiornato" : "Guidatore aggiunto");
    refetch(); close();
  };

  const remove = async () => {
    if (!selected) return;
    await supabase.from("secondo_guidatore").delete().eq("id", selected.id);
    toast.success("Eliminato"); refetch(); close();
  };

  const filtered = guidatori.filter(g => {
    return !search || g.nome?.toLowerCase().includes(search.toLowerCase()) ||
      g.cognome?.toLowerCase().includes(search.toLowerCase()) ||
      g.numero_patente?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="booking-section-container">
      <div className="booking-header">
        <h1><UserPlus size={24} /> Secondo Guidatore</h1>
        <button className="btn-add" onClick={openNew}><Plus size={18} /> Aggiungi Guidatore</button>
      </div>

      <div className="booking-filters">
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
          <Search size={18} />
          <input placeholder="Cerca nome, cognome, patente..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, padding: 8, borderRadius: 8, border: "1px solid #e2e8f0" }} />
        </div>
      </div>

      <div className="booking-table-container">
        <table className="booking-table">
          <thead>
            <tr><th>Nome</th><th>Cognome</th><th>Patente</th><th>Scadenza</th><th>Prenotazione</th><th>Costo Extra</th><th>Approvato</th></tr>
          </thead>
          <tbody>
            {filtered.map(g => {
              const p = prenotazioni.find(pr => pr.id === g.prenotazione_id);
              return (
                <tr key={g.id} onClick={() => openEdit(g)} style={{ cursor: "pointer" }}>
                  <td>{g.nome}</td>
                  <td>{g.cognome}</td>
                  <td>{g.numero_patente || "-"}</td>
                  <td>{g.scadenza_patente ? new Date(g.scadenza_patente).toLocaleDateString() : "-"}</td>
                  <td>{p?.contratto_id?.substring(0, 8) || "-"}</td>
                  <td>€{Number(g.costo_extra || 0).toFixed(2)}</td>
                  <td>{g.approvato ? "✅" : "⏳"}</td>
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", padding: 24 }}>Nessun secondo guidatore</td></tr>}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="sidebar-overlay">
          <div className="sidebar-form">
            <button className="popup-close" onClick={close}>✕</button>
            <h2>{selected ? "Modifica" : "Nuovo"} Secondo Guidatore</h2>

            <div className="form-field"><label>Prenotazione *</label>
              <select name="prenotazione_id" value={form.prenotazione_id} onChange={handleChange}>
                <option value="">Seleziona</option>
                {prenotazioni.map(p => {
                  const v = vehicles.find(vh => vh.id === p.veicolo_id);
                  const u = users.find(us => us.id === p.cliente_id);
                  return <option key={p.id} value={p.id}>{p.contratto_id} - {u?.nome} - {v?.marca} {v?.modello}</option>;
                })}
              </select>
            </div>

            {[["Nome *", "nome", "text"], ["Cognome *", "cognome", "text"], ["Codice Fiscale", "codice_fiscale", "text"],
              ["Data Nascita", "data_nascita", "date"], ["N° Patente", "numero_patente", "text"],
              ["Scadenza Patente", "scadenza_patente", "date"], ["Categoria Patente", "categoria_patente", "text"],
              ["Telefono", "telefono", "tel"], ["Email", "email", "email"], ["Costo Extra €", "costo_extra", "number"],
            ].map(([l, n, t]) => (
              <div className="form-field" key={n}><label>{l}</label><input type={t} name={n} value={form[n] || ""} onChange={handleChange} /></div>
            ))}

            <div className="form-field"><label><input type="checkbox" name="approvato" checked={form.approvato} onChange={handleChange} /> Approvato</label></div>
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
