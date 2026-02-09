import { useState } from "react";
import { supabase } from "../../supabaseClient";
import { usePagamenti, useVehicles, useUsers, usePrenotazioni } from "../../hooks/useSupabase";
import "../../UIX/PagamentiSection.css";
import { Filter } from "lucide-react";

export default function PagamentiSection() {
  const [popupOpen, setPopupOpen] = useState(false);
  const [filters, setFilters] = useState({ cliente: "", veicolo: "", prenotazione: "" });
  const { data: pagamenti, refetch: fetchPagamenti } = usePagamenti();
  const { data: vehicles } = useVehicles();
  const { data: users } = useUsers();
  const { data: prenotazioni } = usePrenotazioni();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPagamento, setSelectedPagamento] = useState(null);

  const initialPagamentoState = {
    id: "",
    prenotazione_id: "",
    cliente_id: "",
    veicolo_id: "",
    totale_pagato: 0,
    deposito: 0,
    franchigia: 0,
    franchigia_addebito: 0,
    franchigia_stornata: false,
    pagamento_status: "da pagare",
    pagamento_metodo: "",
    carta_titolare: "",
    carta_numero: "",
    carta_iban: "",
    carta_scadenza: "",
    carta_cvc: "",
    danni_descrizione: "",
    danni_importo: 0,
    danni_addebitato: false,
  };

  const [newPagamento, setNewPagamento] = useState(initialPagamentoState);

  // fetch functions provided by hooks

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filteredPagamenti = pagamenti.filter(
    (p) =>
      (filters.cliente === "" || users.find(u => u.id === p.cliente_id)?.nome?.toLowerCase().includes(filters.cliente.toLowerCase())) &&
      (filters.veicolo === "" || vehicles.find(v => v.id === p.veicolo_id)?.modello?.toLowerCase().includes(filters.veicolo.toLowerCase())) &&
      (filters.prenotazione === "" || prenotazioni.find(pr => pr.id === p.prenotazione_id)?.contratto_id?.toLowerCase().includes(filters.prenotazione.toLowerCase()))
  );

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewPagamento({ ...newPagamento, [name]: type === "checkbox" ? checked : value });
  };

  const handleRowClick = (pagamento) => {
    setSelectedPagamento(pagamento);
    setNewPagamento({ ...pagamento });
    setPopupOpen(true);
  };

  // --- Salvataggio pagamento
  const handleSavePagamento = async () => {
    const pagamentoToSave = { ...newPagamento };

    ["totale_pagato","deposito","franchigia","franchigia_addebito","danni_importo"].forEach(f => pagamentoToSave[f] = Number(pagamentoToSave[f]) || 0);

    let error;
    if(selectedPagamento){
      ({ error } = await supabase.from("pagamenti").update(pagamentoToSave).eq("id", selectedPagamento.id));
    } else {
      ({ error } = await supabase.from("pagamenti").insert([pagamentoToSave]));
    }

    if (error) console.log("Errore salvataggio:", error);
    else {
      fetchPagamenti();
      setPopupOpen(false);
      setNewPagamento(initialPagamentoState);
      setSelectedPagamento(null);
    }
  };

  const handleDeletePagamento = async () => {
    if(selectedPagamento){
      const { error } = await supabase.from("pagamenti").delete().eq("id", selectedPagamento.id);
      if(error) console.log(error);
      else {
        fetchPagamenti();
        setPopupOpen(false);
        setNewPagamento(initialPagamentoState);
        setSelectedPagamento(null);
      }
    }
  };

  return (
    <div className="booking-section-container">
      {/* HEADER */}
      <div className="booking-header">
        <h1>Pagamenti</h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="btn-add" onClick={() => setShowFilters(!showFilters)} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Filter size={20} /> Filtri
          </button>
          <button className="btn-add" onClick={() => { setPopupOpen(true); setSelectedPagamento(null); setNewPagamento(initialPagamentoState); }}>
            Aggiungi Pagamento
          </button>
        </div>
      </div>

      {/* FILTRI */}
      {showFilters && (
        <div className="booking-filters">
          <input type="text" name="cliente" placeholder="Cliente" onChange={handleFilterChange} />
          <input type="text" name="veicolo" placeholder="Veicolo" onChange={handleFilterChange} />
          <input type="text" name="prenotazione" placeholder="Prenotazione" onChange={handleFilterChange} />
        </div>
      )}

      {/* TABELLA */}
      <div className="booking-table-container">
        <table className="booking-table">
          <thead>
            <tr>
              <th>Pagamento ID</th>
              <th>Contratto</th>
              <th>Cliente</th>
              <th>Veicolo</th>
              <th>Totale Pagato</th>
              <th>Deposito</th>
              <th>Franchigia</th>
              <th>Franchigia Addebito</th>
              <th>Pagamento Stato</th>
              <th>Metodo Pagamento</th>
              <th>Danni</th>
              <th>Danni Addebitato</th>
            </tr>
          </thead>
          <tbody>
            {filteredPagamenti.map((p) => (
              <tr key={p.id} onClick={() => handleRowClick(p)} className={selectedPagamento?.id === p.id ? "selected" : ""}>
                <td>{p.id}</td>
                <td>{prenotazioni.find(pr => pr.id === p.prenotazione_id)?.contratto_id || "-"}</td>
                <td>{users.find(u => u.id === p.cliente_id)?.nome || "-"}</td>
                <td>{vehicles.find(v => v.id === p.veicolo_id)?.modello || "-"}</td>
                <td>{p.totale_pagato}</td>
                <td>{p.deposito}</td>
                <td>{p.franchigia}</td>
                <td>{p.franchigia_addebito}</td>
                <td>{p.pagamento_status}</td>
                <td>{p.pagamento_metodo}</td>
                <td>{p.danni_descrizione}</td>
                <td>{p.danni_addebitato ? "Sì" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* POPUP */}
      {popupOpen && (
        <div className="popup-overlay">
          <div className="popup-content">
            <button className="popup-close" onClick={() => { setPopupOpen(false); setSelectedPagamento(null); }}>×</button>
            <h2>{selectedPagamento ? "Modifica Pagamento" : "Aggiungi Pagamento"}</h2>

            <div className="form-step active">
              <div className="form-field">
                <label>Cliente</label>
                <select name="cliente_id" value={newPagamento.cliente_id} onChange={handleInputChange}>
                  <option value="">Seleziona cliente</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.nome} {u.cognome}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Veicolo</label>
                <select name="veicolo_id" value={newPagamento.veicolo_id} onChange={handleInputChange}>
                  <option value="">Seleziona veicolo</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.marca} {v.modello}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Prenotazione</label>
                <select name="prenotazione_id" value={newPagamento.prenotazione_id} onChange={handleInputChange}>
                  <option value="">Seleziona prenotazione</option>
                  {prenotazioni.map(pr => <option key={pr.id} value={pr.id}>{pr.contratto_id}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Totale Pagato</label>
                <input type="number" name="totale_pagato" value={newPagamento.totale_pagato} onChange={handleInputChange} />
              </div>
              <div className="form-field">
                <label>Deposito</label>
                <input type="number" name="deposito" value={newPagamento.deposito} onChange={handleInputChange} />
              </div>
              <div className="form-field">
                <label>Franchigia</label>
                <input type="number" name="franchigia" value={newPagamento.franchigia} onChange={handleInputChange} />
              </div>
              <div className="form-field">
                <label>Franchigia Addebito</label>
                <input type="number" name="franchigia_addebito" value={newPagamento.franchigia_addebito} onChange={handleInputChange} />
              </div>
              <div className="form-field">
                <label>Pagamento Stato</label>
                <select name="pagamento_status" value={newPagamento.pagamento_status} onChange={handleInputChange}>
                  <option value="da pagare">Da pagare</option>
                  <option value="parziale">Parziale</option>
                  <option value="pagato">Pagato</option>
                </select>
              </div>
              <div className="form-field">
                <label>Metodo Pagamento</label>
                <input type="text" name="pagamento_metodo" value={newPagamento.pagamento_metodo} onChange={handleInputChange} />
              </div>
              <div className="form-field">
                <label>Danni Descrizione</label>
                <textarea name="danni_descrizione" value={newPagamento.danni_descrizione} onChange={handleInputChange}></textarea>
              </div>
              <div className="form-field">
                <label>Danni Addebitato</label>
                <input type="checkbox" name="danni_addebitato" checked={newPagamento.danni_addebitato} onChange={handleInputChange} />
              </div>
            </div>

            <div className="step-navigation">
              <button className="popup-btn" onClick={handleSavePagamento}>Salva</button>
              {selectedPagamento && <button className="popup-btn delete" onClick={handleDeletePagamento}>Elimina</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
