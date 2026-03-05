import { useState } from "react";
import { supabase } from "../../supabaseClient";
import { useCheckoutVeicolo, useVehicles, useUsers, usePrenotazioni } from "../../hooks/useSupabase";
import { toast } from "sonner";
import { Search, Plus, ClipboardCheck, Star, Camera, Clock } from "lucide-react";
import "../../UIX/BookingSection.css";

const initialCheckout = {
  prenotazione_id: "", veicolo_id: "", cliente_id: "", operatore: "",
  km_finali: 0, km_percorsi: 0, km_extra: 0, costo_km_extra: 0,
  livello_carburante_ritiro: 0, livello_carburante_restituzione: 0, differenza_carburante: 0, costo_carburante: 0,
  stato_carrozzeria: "", stato_interni: "", stato_pneumatici: "", stato_pulizia: "", costo_pulizia: 0,
  danni_riscontrati: false, danni_descrizione: "", danni_importo: 0,
  ritardo_minuti: 0, costo_ritardo: 0, accessori_mancanti: "", costo_accessori: 0,
  totale_addebiti_extra: 0, deposito_restituito: 0, deposito_trattenuto: 0,
  note: "", stato: "in_corso",
  puntualita_score: 5, pulizia_score: 5, condizioni_score: 5, score_totale: 5,
};

export default function CheckoutSection() {
  const { data: checkouts, refetch } = useCheckoutVeicolo();
  const { data: vehicles } = useVehicles();
  const { data: users } = useUsers();
  const { data: prenotazioni } = usePrenotazioni();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(initialCheckout);
  const [showForm, setShowForm] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: type === "checkbox" ? checked : value };
      // Auto-calculate totals
      const extras = Number(updated.costo_km_extra || 0) + Number(updated.costo_carburante || 0) +
        Number(updated.costo_pulizia || 0) + Number(updated.danni_importo || 0) +
        Number(updated.costo_ritardo || 0) + Number(updated.costo_accessori || 0);
      updated.totale_addebiti_extra = extras;
      // Auto-calc score
      updated.score_totale = ((Number(updated.puntualita_score || 0) + Number(updated.pulizia_score || 0) + Number(updated.condizioni_score || 0)) / 3).toFixed(1);
      return updated;
    });
  };

  const openNew = () => { setSelected(null); setForm(initialCheckout); setShowForm(true); };
  const openEdit = (c) => { setSelected(c); setForm({ ...c }); setShowForm(true); };
  const close = () => { setShowForm(false); setSelected(null); };

  const fillFromPrenotazione = (prenId) => {
    const pren = prenotazioni.find(p => p.id === prenId);
    if (pren) {
      setForm(prev => ({
        ...prev,
        prenotazione_id: prenId,
        veicolo_id: pren.veicolo_id,
        cliente_id: pren.cliente_id,
        km_finali: pren.km_finali || 0,
        livello_carburante_ritiro: 100,
      }));
    }
  };

  const save = async () => {
    const payload = { ...form };
    const numFields = ["km_finali", "km_percorsi", "km_extra", "costo_km_extra", "livello_carburante_ritiro",
      "livello_carburante_restituzione", "differenza_carburante", "costo_carburante", "costo_pulizia",
      "danni_importo", "ritardo_minuti", "costo_ritardo", "costo_accessori", "totale_addebiti_extra",
      "deposito_restituito", "deposito_trattenuto", "puntualita_score", "pulizia_score", "condizioni_score", "score_totale"];
    numFields.forEach(f => payload[f] = Number(payload[f]) || 0);
    
    if (!payload.prenotazione_id) { toast.warning("Seleziona una prenotazione"); return; }

    let error;
    if (selected) {
      ({ error } = await supabase.from("checkout_veicolo").update(payload).eq("id", selected.id));
    } else {
      ({ error } = await supabase.from("checkout_veicolo").insert([payload]));
    }
    if (error) { toast.error("Errore: " + error.message); return; }
    toast.success(selected ? "Checkout aggiornato" : "Checkout creato");
    refetch(); close();
  };

  const remove = async () => {
    if (!selected) return;
    await supabase.from("checkout_veicolo").delete().eq("id", selected.id);
    toast.success("Checkout eliminato"); refetch(); close();
  };

  const filtered = checkouts.filter(c => {
    const v = vehicles.find(vh => vh.id === c.veicolo_id);
    const u = users.find(us => us.id === c.cliente_id);
    return !search || v?.targa?.toLowerCase().includes(search.toLowerCase()) ||
      u?.nome?.toLowerCase().includes(search.toLowerCase()) ||
      u?.cognome?.toLowerCase().includes(search.toLowerCase());
  });

  const renderStars = (value) => "⭐".repeat(Math.min(Number(value) || 0, 5));

  return (
    <div className="booking-section-container">
      <div className="booking-header">
        <h1><ClipboardCheck size={24} /> Checkout Veicoli</h1>
        <button className="btn-add" onClick={openNew}><Plus size={18} /> Nuovo Checkout</button>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <div className="stat-card" style={{ flex: 1, minWidth: 150 }}>
          <h3 style={{ fontSize: "0.8rem", color: "#64748b" }}>Checkout Totali</h3>
          <p style={{ fontSize: "1.5rem", fontWeight: 700 }}>{checkouts.length}</p>
        </div>
        <div className="stat-card" style={{ flex: 1, minWidth: 150 }}>
          <h3 style={{ fontSize: "0.8rem", color: "#64748b" }}>In Corso</h3>
          <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#f59e0b" }}>{checkouts.filter(c => c.stato === "in_corso").length}</p>
        </div>
        <div className="stat-card" style={{ flex: 1, minWidth: 150 }}>
          <h3 style={{ fontSize: "0.8rem", color: "#64748b" }}>Addebiti Extra Tot.</h3>
          <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#ef4444" }}>€{checkouts.reduce((s, c) => s + Number(c.totale_addebiti_extra || 0), 0).toFixed(2)}</p>
        </div>
      </div>

      <div className="booking-filters">
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
          <Search size={18} />
          <input placeholder="Cerca targa o cliente..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, padding: 8, borderRadius: 8, border: "1px solid #e2e8f0" }} />
        </div>
      </div>

      <div className="booking-table-container">
        <table className="booking-table">
          <thead>
            <tr><th>Data</th><th>Veicolo</th><th>Cliente</th><th>Km Extra</th><th>Danni</th><th>Addebiti Extra</th><th>Score</th><th>Stato</th></tr>
          </thead>
          <tbody>
            {filtered.map(c => {
              const v = vehicles.find(vh => vh.id === c.veicolo_id);
              const u = users.find(us => us.id === c.cliente_id);
              return (
                <tr key={c.id} onClick={() => openEdit(c)} style={{ cursor: "pointer" }}>
                  <td>{c.data_checkout ? new Date(c.data_checkout).toLocaleDateString() : "-"}</td>
                  <td>{v ? `${v.marca} ${v.modello}` : "-"}</td>
                  <td>{u ? `${u.nome} ${u.cognome}` : "-"}</td>
                  <td>{c.km_extra || 0}</td>
                  <td>{c.danni_riscontrati ? "⚠️ Sì" : "✅ No"}</td>
                  <td style={{ fontWeight: 600 }}>€{Number(c.totale_addebiti_extra || 0).toFixed(2)}</td>
                  <td>{renderStars(c.score_totale)}</td>
                  <td><span style={{ background: c.stato === "completato" ? "#16a34a" : c.stato === "contestato" ? "#ef4444" : "#f59e0b", color: "#fff", padding: "4px 10px", borderRadius: 8, fontSize: "0.75rem", fontWeight: 600 }}>{c.stato}</span></td>
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={8} style={{ textAlign: "center", padding: 24 }}>Nessun checkout</td></tr>}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="sidebar-overlay">
          <div className="sidebar-form" style={{ maxHeight: "90vh", overflowY: "auto" }}>
            <button className="popup-close" onClick={close}>✕</button>
            <h2>{selected ? "Modifica Checkout" : "Nuovo Checkout"}</h2>

            <div className="form-field"><label>Prenotazione *</label>
              <select name="prenotazione_id" value={form.prenotazione_id} onChange={e => { handleChange(e); fillFromPrenotazione(e.target.value); }}>
                <option value="">Seleziona</option>
                {prenotazioni.map(p => {
                  const v = vehicles.find(vh => vh.id === p.veicolo_id);
                  const u = users.find(us => us.id === p.cliente_id);
                  return <option key={p.id} value={p.id}>{p.contratto_id} - {v?.marca} {v?.modello} ({u?.nome})</option>;
                })}
              </select>
            </div>
            <div className="form-field"><label>Operatore</label><input name="operatore" value={form.operatore || ""} onChange={handleChange} /></div>

            <h3 style={{ marginTop: 16, fontSize: "1rem", borderBottom: "2px solid #e2e8f0", paddingBottom: 8 }}>🚗 Km e Carburante</h3>
            {[["Km Finali", "km_finali"], ["Km Percorsi", "km_percorsi"], ["Km Extra", "km_extra"],
              ["Costo Km Extra €", "costo_km_extra"], ["Carburante Ritiro %", "livello_carburante_ritiro"],
              ["Carburante Restituzione %", "livello_carburante_restituzione"], ["Diff. Carburante", "differenza_carburante"],
              ["Costo Carburante €", "costo_carburante"],
            ].map(([l, n]) => (
              <div className="form-field" key={n}><label>{l}</label><input type="number" name={n} value={form[n] || 0} onChange={handleChange} /></div>
            ))}

            <h3 style={{ marginTop: 16, fontSize: "1rem", borderBottom: "2px solid #e2e8f0", paddingBottom: 8 }}>🔍 Stato Veicolo</h3>
            {["stato_carrozzeria", "stato_interni", "stato_pneumatici"].map(n => (
              <div className="form-field" key={n}><label>{n.replace(/stato_/g, "").replace(/_/g, " ")}</label>
                <select name={n} value={form[n] || ""} onChange={handleChange}>
                  <option value="">-</option>
                  {["ottimo", "buono", "discreto", "danneggiato"].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <div className="form-field"><label>Pulizia</label>
              <select name="stato_pulizia" value={form.stato_pulizia || ""} onChange={handleChange}>
                <option value="">-</option>
                {["pulito", "sporco", "molto_sporco"].map(o => <option key={o} value={o}>{o.replace(/_/g, " ")}</option>)}
              </select>
            </div>
            <div className="form-field"><label>Costo Pulizia €</label><input type="number" name="costo_pulizia" value={form.costo_pulizia || 0} onChange={handleChange} /></div>

            <h3 style={{ marginTop: 16, fontSize: "1rem", borderBottom: "2px solid #e2e8f0", paddingBottom: 8 }}>⚠️ Danni</h3>
            <div className="form-field"><label><input type="checkbox" name="danni_riscontrati" checked={form.danni_riscontrati} onChange={handleChange} /> Danni riscontrati</label></div>
            {form.danni_riscontrati && <>
              <div className="form-field"><label>Descrizione Danni</label><textarea name="danni_descrizione" value={form.danni_descrizione || ""} onChange={handleChange} /></div>
              <div className="form-field"><label>Importo Danni €</label><input type="number" name="danni_importo" value={form.danni_importo || 0} onChange={handleChange} /></div>
            </>}

            <h3 style={{ marginTop: 16, fontSize: "1rem", borderBottom: "2px solid #e2e8f0", paddingBottom: 8 }}>💰 Addebiti Extra</h3>
            {[["Ritardo (min)", "ritardo_minuti"], ["Costo Ritardo €", "costo_ritardo"],
              ["Costo Accessori €", "costo_accessori"],
            ].map(([l, n]) => (
              <div className="form-field" key={n}><label>{l}</label><input type="number" name={n} value={form[n] || 0} onChange={handleChange} /></div>
            ))}
            <div className="form-field"><label>Accessori Mancanti</label><input name="accessori_mancanti" value={form.accessori_mancanti || ""} onChange={handleChange} /></div>

            <div style={{ background: "#f8fafc", padding: 16, borderRadius: 12, margin: "16px 0" }}>
              <p style={{ fontWeight: 700, fontSize: "1.1rem" }}>Totale Addebiti Extra: <span style={{ color: "#ef4444" }}>€{Number(form.totale_addebiti_extra || 0).toFixed(2)}</span></p>
            </div>

            {[["Deposito Restituito €", "deposito_restituito"], ["Deposito Trattenuto €", "deposito_trattenuto"]].map(([l, n]) => (
              <div className="form-field" key={n}><label>{l}</label><input type="number" name={n} value={form[n] || 0} onChange={handleChange} /></div>
            ))}

            <h3 style={{ marginTop: 16, fontSize: "1rem", borderBottom: "2px solid #e2e8f0", paddingBottom: 8 }}>⭐ Scoring Cliente</h3>
            {[["Puntualità", "puntualita_score"], ["Pulizia", "pulizia_score"], ["Condizioni", "condizioni_score"]].map(([l, n]) => (
              <div className="form-field" key={n}><label>{l} (1-5)</label>
                <input type="number" min={1} max={5} name={n} value={form[n] || 5} onChange={handleChange} />
                <span style={{ marginLeft: 8 }}>{renderStars(form[n])}</span>
              </div>
            ))}
            <p style={{ fontWeight: 600 }}>Score Totale: {form.score_totale}</p>

            <div className="form-field"><label>Stato</label>
              <select name="stato" value={form.stato} onChange={handleChange}>
                {["in_corso", "completato", "contestato"].map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
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
