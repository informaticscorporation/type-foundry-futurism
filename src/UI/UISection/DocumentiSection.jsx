import { useState } from "react";
import { supabase } from "../../supabaseClient";
import { useDocumenti } from "../../hooks/useSupabase";
import { toast } from "sonner";
import { Search, Plus, FileText, Download, Trash2, Eye, Upload } from "lucide-react";
import "../../UIX/BookingSection.css";

const initialDoc = {
  tipo: "", riferimento_id: "", riferimento_tipo: "", titolo: "", descrizione: "",
  file_url: "", file_tipo: "", caricato_da: "", data_scadenza: "", firmato: false, note: "",
};

export default function DocumentiSection() {
  const { data: documenti, refetch } = useDocumenti();
  const [search, setSearch] = useState("");
  const [filterTipo, setFilterTipo] = useState("");
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(initialDoc);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const openNew = () => { setSelected(null); setForm(initialDoc); setShowForm(true); };
  const openEdit = (d) => { setSelected(d); setForm({ ...d }); setShowForm(true); };
  const close = () => { setShowForm(false); setSelected(null); };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fileName = `documenti/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from("Archivio").upload(fileName, file);
    if (error) { toast.error("Errore upload: " + error.message); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("Archivio").getPublicUrl(fileName);
    setForm(prev => ({ ...prev, file_url: urlData.publicUrl, file_tipo: file.name.split(".").pop() }));
    toast.success("File caricato");
    setUploading(false);
  };

  const save = async () => {
    if (!form.titolo) { toast.warning("Titolo obbligatorio"); return; }
    let error;
    if (selected) {
      ({ error } = await supabase.from("documenti").update(form).eq("id", selected.id));
    } else {
      ({ error } = await supabase.from("documenti").insert([form]));
    }
    if (error) { toast.error("Errore: " + error.message); return; }
    toast.success(selected ? "Documento aggiornato" : "Documento aggiunto");
    refetch(); close();
  };

  const remove = async () => {
    if (!selected) return;
    await supabase.from("documenti").delete().eq("id", selected.id);
    toast.success("Documento eliminato"); refetch(); close();
  };

  const filtered = documenti.filter(d => {
    const match = !search || d.titolo?.toLowerCase().includes(search.toLowerCase()) ||
      d.descrizione?.toLowerCase().includes(search.toLowerCase());
    return match && (!filterTipo || d.tipo === filterTipo);
  });

  // Scadenze documenti
  const scadenze = documenti.filter(d => {
    if (!d.data_scadenza) return false;
    const diff = (new Date(d.data_scadenza) - new Date()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
  });

  const getTipoBadge = (tipo) => {
    const c = { contratto: "#3b82f6", multa: "#ef4444", sinistro: "#f59e0b", manutenzione: "#8b5cf6", assicurazione: "#16a34a", patente: "#06b6d4", documento_id: "#ec4899", altro: "#6b7280" };
    return <span style={{ background: c[tipo] || "#6b7280", color: "#fff", padding: "3px 8px", borderRadius: 6, fontSize: "0.7rem", fontWeight: 600 }}>{tipo}</span>;
  };

  return (
    <div className="booking-section-container">
      <div className="booking-header">
        <h1><FileText size={24} /> Archivio Documenti</h1>
        <button className="btn-add" onClick={openNew}><Plus size={18} /> Nuovo Documento</button>
      </div>

      {scadenze.length > 0 && (
        <div style={{ background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <strong>⚠️ {scadenze.length} documenti in scadenza nei prossimi 30 giorni</strong>
          <ul style={{ margin: "4px 0 0", paddingLeft: 20, fontSize: "0.85rem" }}>
            {scadenze.map(d => <li key={d.id}>{d.titolo} - Scadenza: {new Date(d.data_scadenza).toLocaleDateString()}</li>)}
          </ul>
        </div>
      )}

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <div className="stat-card" style={{ flex: 1, minWidth: 150 }}>
          <h3 style={{ fontSize: "0.8rem", color: "#64748b" }}>Totale Documenti</h3>
          <p style={{ fontSize: "1.5rem", fontWeight: 700 }}>{documenti.length}</p>
        </div>
        <div className="stat-card" style={{ flex: 1, minWidth: 150 }}>
          <h3 style={{ fontSize: "0.8rem", color: "#64748b" }}>Firmati</h3>
          <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#16a34a" }}>{documenti.filter(d => d.firmato).length}</p>
        </div>
        <div className="stat-card" style={{ flex: 1, minWidth: 150 }}>
          <h3 style={{ fontSize: "0.8rem", color: "#64748b" }}>In Scadenza</h3>
          <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#f59e0b" }}>{scadenze.length}</p>
        </div>
      </div>

      <div className="booking-filters">
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
          <Search size={18} />
          <input placeholder="Cerca titolo o descrizione..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, padding: 8, borderRadius: 8, border: "1px solid #e2e8f0" }} />
        </div>
        <select value={filterTipo} onChange={e => setFilterTipo(e.target.value)} style={{ padding: 8, borderRadius: 8, border: "1px solid #e2e8f0" }}>
          <option value="">Tutti i tipi</option>
          {["contratto", "multa", "sinistro", "manutenzione", "assicurazione", "patente", "documento_id", "altro"].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="booking-table-container">
        <table className="booking-table">
          <thead>
            <tr><th>Titolo</th><th>Tipo</th><th>Riferimento</th><th>Scadenza</th><th>Firmato</th><th>Azioni</th></tr>
          </thead>
          <tbody>
            {filtered.map(d => (
              <tr key={d.id} onClick={() => openEdit(d)} style={{ cursor: "pointer" }}>
                <td style={{ fontWeight: 500 }}>{d.titolo}</td>
                <td>{getTipoBadge(d.tipo)}</td>
                <td>{d.riferimento_tipo ? `${d.riferimento_tipo}: ${d.riferimento_id?.substring(0, 8)}...` : "-"}</td>
                <td>{d.data_scadenza ? new Date(d.data_scadenza).toLocaleDateString() : "-"}</td>
                <td>{d.firmato ? "✅" : "❌"}</td>
                <td>
                  {d.file_url && (
                    <a href={d.file_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ color: "#3b82f6" }}>
                      <Download size={16} />
                    </a>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", padding: 24 }}>Nessun documento</td></tr>}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="sidebar-overlay">
          <div className="sidebar-form">
            <button className="popup-close" onClick={close}>✕</button>
            <h2>{selected ? "Modifica" : "Nuovo"} Documento</h2>

            <div className="form-field"><label>Titolo *</label><input name="titolo" value={form.titolo || ""} onChange={handleChange} /></div>
            <div className="form-field"><label>Tipo</label>
              <select name="tipo" value={form.tipo} onChange={handleChange}>
                <option value="">Seleziona</option>
                {["contratto", "multa", "sinistro", "manutenzione", "assicurazione", "patente", "documento_id", "altro"].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-field"><label>Riferimento Tipo</label>
              <select name="riferimento_tipo" value={form.riferimento_tipo} onChange={handleChange}>
                <option value="">Nessuno</option>
                {["prenotazione", "veicolo", "cliente", "multa", "sinistro"].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-field"><label>Riferimento ID</label><input name="riferimento_id" value={form.riferimento_id || ""} onChange={handleChange} /></div>
            <div className="form-field"><label>Descrizione</label><textarea name="descrizione" value={form.descrizione || ""} onChange={handleChange} /></div>

            <div className="form-field">
              <label>Carica File</label>
              <input type="file" onChange={handleFileUpload} disabled={uploading} />
              {uploading && <span style={{ fontSize: "0.8rem", color: "#f59e0b" }}>Caricamento...</span>}
              {form.file_url && <a href={form.file_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.8rem", color: "#3b82f6" }}>📎 File caricato</a>}
            </div>

            <div className="form-field"><label>Caricato Da</label><input name="caricato_da" value={form.caricato_da || ""} onChange={handleChange} /></div>
            <div className="form-field"><label>Data Scadenza</label><input type="date" name="data_scadenza" value={form.data_scadenza || ""} onChange={handleChange} /></div>
            <div className="form-field"><label><input type="checkbox" name="firmato" checked={form.firmato} onChange={handleChange} /> Firmato</label></div>
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
