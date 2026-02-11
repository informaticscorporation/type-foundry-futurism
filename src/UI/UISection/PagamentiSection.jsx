import { useState } from "react";
import { supabase } from "../../supabaseClient";
import { usePagamenti, useVehicles, useUsers, usePrenotazioni } from "../../hooks/useSupabase";
import { useTranslation } from "../../i18n/useTranslation";
import "../../UIX/PagamentiSection.css";
import { Filter, Download, RotateCcw, XCircle } from "lucide-react";

const SERVER_URL = "https://server-noloe.fly.dev";

export default function PagamentiSection() {
  const { t } = useTranslation();
  const { data: pagamenti, refetch: fetchPagamenti } = usePagamenti();
  const { data: vehicles } = useVehicles();
  const { data: users } = useUsers();
  const { data: prenotazioni } = usePrenotazioni();

  const [filters, setFilters] = useState({ cliente: "", veicolo: "", prenotazione: "" });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPagamento, setSelectedPagamento] = useState(null);

  const initialPagamentoState = {
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
    danni_descrizione: "",
    danni_importo: 0,
    danni_addebitato: false,
  };

  const [newPagamento, setNewPagamento] = useState(initialPagamentoState);

  const handleFilterChange = (e) =>
    setFilters({ ...filters, [e.target.name]: e.target.value });

  const filteredPagamenti = pagamenti.filter(
    (p) =>
      (filters.cliente === "" ||
        users.find((u) => u.id === p.cliente_id)?.nome?.toLowerCase().includes(filters.cliente.toLowerCase())) &&
      (filters.veicolo === "" ||
        vehicles.find((v) => v.id === p.veicolo_id)?.modello?.toLowerCase().includes(filters.veicolo.toLowerCase())) &&
      (filters.prenotazione === "" ||
        prenotazioni.find((pr) => pr.id === p.prenotazione_id)?.contratto_id?.toLowerCase().includes(filters.prenotazione.toLowerCase()))
  );

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewPagamento({ ...newPagamento, [name]: type === "checkbox" ? checked : value });
  };

  const handleRowClick = (p) => {
    setSelectedPagamento(p);
    setNewPagamento({ ...p });
  };

  const closeSidebar = () => {
    setSelectedPagamento(null);
    setNewPagamento(initialPagamentoState);
  };

  const handleSavePagamento = async () => {
    const payload = { ...newPagamento };
    ["totale_pagato","deposito","franchigia","franchigia_addebito","danni_importo"].forEach(
      (f) => (payload[f] = Number(payload[f]) || 0)
    );

    let error;
    if (selectedPagamento) {
      ({ error } = await supabase.from("pagamenti").update(payload).eq("id", selectedPagamento.id));
    } else {
      ({ error } = await supabase.from("pagamenti").insert([payload]));
    }

    if (!error) {
      fetchPagamenti();
      closeSidebar();
    }
  };

  const handleDeletePagamento = async () => {
    if (!selectedPagamento) return;
    await supabase.from("pagamenti").delete().eq("id", selectedPagamento.id);
    fetchPagamenti();
    closeSidebar();
  };

  const handleAdminOp = async (operation) => {
    if (!selectedPagamento) return;
    let endpoint, body;

    if (operation === "capture" || operation === "refund") {
      const amount = prompt(t("paymentFlow.enterAmount"));
      const origTranId = prompt(t("paymentFlow.origTranId"));
      if (!amount || !origTranId) return;
      endpoint = operation === "capture" ? "/payment-capture" : "/payment-refund";
      body = { origTranId, amountValue: Number(amount) };
    } else {
      const origTranId = prompt(t("paymentFlow.origTranId"));
      if (!origTranId) return;
      endpoint = "/payment-reversal";
      body = { origTranId };
    }

    await fetch(`${SERVER_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    fetchPagamenti();
  };

  return (
    <div className="booking-section-container">
      <div className="booking-header">
        <h1>Pagamenti</h1>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn-add" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={18} /> Filtri
          </button>
          <button className="btn-add" onClick={closeSidebar}>
            Aggiungi Pagamento
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="booking-filters">
          <input name="cliente" placeholder="Cliente" onChange={handleFilterChange} />
          <input name="veicolo" placeholder="Veicolo" onChange={handleFilterChange} />
          <input name="prenotazione" placeholder="Prenotazione" onChange={handleFilterChange} />
        </div>
      )}

      <div className="booking-table-container">
        <table className="booking-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Contratto</th>
              <th>Cliente</th>
              <th>Veicolo</th>
              <th>Totale</th>
              <th>Stato</th>
            </tr>
          </thead>
          <tbody>
            {filteredPagamenti.map((p) => (
              <tr key={p.id} onClick={() => handleRowClick(p)}>
                <td>{p.id}</td>
                <td>{prenotazioni.find(pr => pr.id === p.prenotazione_id)?.contratto_id}</td>
                <td>{users.find(u => u.id === p.cliente_id)?.nome}</td>
                <td>{vehicles.find(v => v.id === p.veicolo_id)?.modello}</td>
                <td>{p.totale_pagato}</td>
                <td>{p.pagamento_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedPagamento !== null && (
        <div className="sidebar-overlay">
          <div className="sidebar-form">
            <button className="popup-close" onClick={closeSidebar}>✕</button>

            <h2>Modifica Pagamento</h2>

            {/* FORM FIELDS */}
            {[
              ["Cliente", "cliente_id", users.map(u => ({ id: u.id, label: `${u.nome} ${u.cognome}` }))],
              ["Veicolo", "veicolo_id", vehicles.map(v => ({ id: v.id, label: `${v.marca} ${v.modello}` }))],
              ["Prenotazione", "prenotazione_id", prenotazioni.map(pr => ({ id: pr.id, label: pr.contratto_id }))]
            ].map(([label, name, options]) => (
              <div className="form-field" key={name}>
                <label>{label}</label>
                <select name={name} value={newPagamento[name]} onChange={handleInputChange}>
                  <option value="">Seleziona {label}</option>
                  {options.map(o => (
                    <option key={o.id} value={o.id}>{o.label}</option>
                  ))}
                </select>
              </div>
            ))}

            {[
              ["Totale Pagato","totale_pagato"],
              ["Deposito","deposito"],
              ["Franchigia","franchigia"],
              ["Addebito Franchigia","franchigia_addebito"]
            ].map(([label,name])=>(
              <div className="form-field" key={name}>
                <label>{label}</label>
                <input type="number" name={name} value={newPagamento[name]} onChange={handleInputChange}/>
              </div>
            ))}

            <div className="form-field">
              <label>Stato Pagamento</label>
              <select name="pagamento_status" value={newPagamento.pagamento_status} onChange={handleInputChange}>
                <option value="da pagare">Da pagare</option>
                <option value="parziale">Parziale</option>
                <option value="pagato">Pagato</option>
              </select>
            </div>

            <div className="form-field">
              <label>Danni</label>
              <textarea name="danni_descrizione" value={newPagamento.danni_descrizione} onChange={handleInputChange}/>
            </div>

            <div className="form-field">
              <label>
                <input type="checkbox" name="danni_addebitato" checked={newPagamento.danni_addebitato} onChange={handleInputChange}/>
                Danni addebitati
              </label>
            </div>

            <div className="popup-actions">
              <button className="green-btn" onClick={handleSavePagamento}>{t("common.save")}</button>
              <button className="red-btn" onClick={handleDeletePagamento}>{t("common.delete")}</button>
            </div>
              <div className="admin-panel">
            <button className="admin-btn admin-op-capture" onClick={() => handleAdminOp("capture")}><Download size={14}/> Capture</button>
            <button className="admin-btn admin-op-refund" onClick={() => handleAdminOp("refund")}><RotateCcw size={14}/> Refund</button>
            <button className="admin-btn admin-op-reversal" onClick={() => handleAdminOp("reversal")}><XCircle size={14}/> Reversal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
