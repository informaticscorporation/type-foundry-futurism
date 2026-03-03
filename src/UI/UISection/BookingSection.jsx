import { useState } from "react";
import { supabase } from "../../supabaseClient";
import { usePrenotazioni, useVehicles, useUsers } from "../../hooks/useSupabase";
import "../../UIX/BookingSection.css";
import { Filter } from "lucide-react";
import { toast } from "sonner";

export default function BookingSection() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filters, setFilters] = useState({ cliente: "", veicolo: "", stato: "" });
  const { data: bookings, refetch: fetchBookings } = usePrenotazioni();
  const { data: vehicles } = useVehicles();
  const { data: users } = useUsers();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const initialBookingState = {
    id: "",
    contratto_id: "",
    cliente_id: "",
    veicolo_id: "",
    check_in: "",
    check_out: "",
    OraCheckin: "09:00",
    OraCheckOut: "18:00",
    luogo_ritiro: "",
    luogo_restituzione: "",
    stato: "prenotato",
    km_iniziali: 0,
    km_finali: 0,
    km_previsti: 0,
    km_extra: 0,
    prezzo_giornaliero: 0,
    giorni: 1,
    totale_base: 0,
    sconto: 0,
    totale_pagato: 0,
    deposito: 0,
    franchigia: 0,
    assicurazione_tipo: "",
    pagamento_status: "da pagare",
    pagamento_metodo: "",
    penale_cancellazione: 0,
    veicolo_in_manutenzione: false,
    note_cliente: "",
    note_interna: "",
  };

  const [newBooking, setNewBooking] = useState(initialBookingState);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewBooking({ ...newBooking, [name]: type === "checkbox" ? checked : value });
  };

  const handleRowClick = (booking) => {
    setSelectedBooking(booking);
    setNewBooking(booking);
    setSidebarOpen(true);
  };

  const handleSaveBooking = async () => {
    const bookingToSave = {
      ...newBooking,
      id: selectedBooking?.id || Math.random().toString(36).substring(2, 8),
      contratto_id: selectedBooking?.contratto_id || Math.random().toString(36).substring(2, 8),
    };
    // Convert numbers
    ["km_iniziali","km_finali","km_previsti","km_extra","prezzo_giornaliero","giorni","totale_base","sconto","totale_pagato","deposito","franchigia","penale_cancellazione"].forEach(
      f => bookingToSave[f] = Number(bookingToSave[f]) || 0
    );

    let error;
    if (selectedBooking) {
      ({ error } = await supabase.from("Prenotazioni").update(bookingToSave).eq("id", selectedBooking.id));
    } else {
      ({ error } = await supabase.from("Prenotazioni").insert([bookingToSave]));
    }

    if (!error) {
      toast.success(selectedBooking ? "Prenotazione aggiornata" : "Prenotazione creata");
      fetchBookings();
      setSidebarOpen(false);
      setSelectedBooking(null);
      setNewBooking(initialBookingState);
    } else {
      toast.error("Errore: " + error.message);
    }
  };

  const handleDeleteBooking = async () => {
    if (!selectedBooking) return;
    const { error } = await supabase.from("Prenotazioni").delete().eq("id", selectedBooking.id);
    if (!error) {
      toast.success("Prenotazione eliminata");
      fetchBookings();
      setSidebarOpen(false);
      setSelectedBooking(null);
    } else {
      toast.error("Errore: " + error.message);
    }
  };

  const filteredBookings = bookings.filter(
    (b) =>
      (filters.cliente === "" ||
        users.find(u => u.id === b.cliente_id)?.nome?.toLowerCase().includes(filters.cliente.toLowerCase())) &&
      (filters.veicolo === "" ||
        vehicles.find(v => v.id === b.veicolo_id)?.modello?.toLowerCase().includes(filters.veicolo.toLowerCase())) &&
      (filters.stato === "" ||
        b.stato?.toLowerCase().includes(filters.stato.toLowerCase()))
  );

  return (
    <div className="booking-section-container">
      <div className="booking-header">
        <h1>Prenotazioni</h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="btn-add" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={20} /> Filtri
          </button>
          <button
            className="btn-add"
            onClick={() => {
              setSelectedBooking(null);
              setNewBooking(initialBookingState);
              setSidebarOpen(true);
            }}
          >
            Aggiungi Prenotazione
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="booking-filters">
          <input placeholder="Cliente" onChange={(e) => setFilters({ ...filters, cliente: e.target.value })} />
          <input placeholder="Veicolo" onChange={(e) => setFilters({ ...filters, veicolo: e.target.value })} />
          <input placeholder="Stato" onChange={(e) => setFilters({ ...filters, stato: e.target.value })} />
        </div>
      )}

      <div className="booking-table-container">
        <table className="booking-table">
          <thead>
            <tr>
              <th>Contratto</th>
              <th>Cliente</th>
              <th>Veicolo</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Giorni</th>
              <th>Totale</th>
              <th>Stato</th>
              <th>Pagamento</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((b) => (
              <tr key={b.id} onClick={() => handleRowClick(b)}>
                <td>{b.contratto_id}</td>
                <td>{users.find(u => u.id === b.cliente_id)?.nome} {users.find(u => u.id === b.cliente_id)?.cognome}</td>
                <td>{vehicles.find(v => v.id === b.veicolo_id)?.marca} {vehicles.find(v => v.id === b.veicolo_id)?.modello}</td>
                <td>{b.check_in}</td>
                <td>{b.check_out}</td>
                <td>{b.giorni}</td>
                <td>€{b.totale_pagato}</td>
                <td>{b.stato}</td>
                <td>{b.pagamento_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}>
          <div className="sidebar-form" onClick={e => e.stopPropagation()}>
            <button className="popup-close" onClick={() => setSidebarOpen(false)}>×</button>

            <h2>{selectedBooking ? "Modifica Prenotazione" : "Nuova Prenotazione"}</h2>

            {/* Cliente */}
            <div className="form-field">
              <label>Cliente</label>
              <select name="cliente_id" value={newBooking.cliente_id} onChange={handleInputChange}>
                <option value="">Seleziona</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.nome} {u.cognome}</option>
                ))}
              </select>
            </div>

            {/* Veicolo */}
            <div className="form-field">
              <label>Veicolo</label>
              <select name="veicolo_id" value={newBooking.veicolo_id} onChange={handleInputChange}>
                <option value="">Seleziona</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.marca} {v.modello} ({v.targa})</option>
                ))}
              </select>
            </div>

            {/* Date e orari */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="form-field">
                <label>Check-in</label>
                <input type="date" name="check_in" value={newBooking.check_in} onChange={handleInputChange} />
              </div>
              <div className="form-field">
                <label>Ora Check-in</label>
                <input type="time" name="OraCheckin" value={newBooking.OraCheckin || ""} onChange={handleInputChange} />
              </div>
              <div className="form-field">
                <label>Check-out</label>
                <input type="date" name="check_out" value={newBooking.check_out} onChange={handleInputChange} />
              </div>
              <div className="form-field">
                <label>Ora Check-out</label>
                <input type="time" name="OraCheckOut" value={newBooking.OraCheckOut || ""} onChange={handleInputChange} />
              </div>
            </div>

            {/* Luoghi */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="form-field">
                <label>Luogo Ritiro</label>
                <input type="text" name="luogo_ritiro" value={newBooking.luogo_ritiro || ""} onChange={handleInputChange} />
              </div>
              <div className="form-field">
                <label>Luogo Restituzione</label>
                <input type="text" name="luogo_restituzione" value={newBooking.luogo_restituzione || ""} onChange={handleInputChange} />
              </div>
            </div>

            {/* Stato */}
            <div className="form-field">
              <label>Stato</label>
              <select name="stato" value={newBooking.stato} onChange={handleInputChange}>
                <option value="prenotato">Prenotato</option>
                <option value="confermato">Confermato</option>
                <option value="in corso">In Corso</option>
                <option value="completata">Completata</option>
                <option value="cancellata">Cancellata</option>
                <option value="firmato">Firmato</option>
              </select>
            </div>

            {/* Km */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
              <div className="form-field">
                <label>Km Iniziali</label>
                <input type="number" name="km_iniziali" value={newBooking.km_iniziali || 0} onChange={handleInputChange} />
              </div>
              <div className="form-field">
                <label>Km Finali</label>
                <input type="number" name="km_finali" value={newBooking.km_finali || 0} onChange={handleInputChange} />
              </div>
              <div className="form-field">
                <label>Km Previsti</label>
                <input type="number" name="km_previsti" value={newBooking.km_previsti || 0} onChange={handleInputChange} />
              </div>
              <div className="form-field">
                <label>Km Extra</label>
                <input type="number" name="km_extra" value={newBooking.km_extra || 0} onChange={handleInputChange} />
              </div>
            </div>

            {/* Prezzi */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div className="form-field">
                <label>€/Giorno</label>
                <input type="number" name="prezzo_giornaliero" value={newBooking.prezzo_giornaliero} onChange={handleInputChange} />
              </div>
              <div className="form-field">
                <label>Giorni</label>
                <input type="number" name="giorni" value={newBooking.giorni} onChange={handleInputChange} />
              </div>
              <div className="form-field">
                <label>Totale Base</label>
                <input type="number" name="totale_base" value={newBooking.totale_base || 0} onChange={handleInputChange} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div className="form-field">
                <label>Sconto</label>
                <input type="number" name="sconto" value={newBooking.sconto || 0} onChange={handleInputChange} />
              </div>
              <div className="form-field">
                <label>Totale Pagato</label>
                <input type="number" name="totale_pagato" value={newBooking.totale_pagato || 0} onChange={handleInputChange} />
              </div>
              <div className="form-field">
                <label>Deposito</label>
                <input type="number" name="deposito" value={newBooking.deposito || 0} onChange={handleInputChange} />
              </div>
            </div>

            {/* Assicurazione e Franchigia */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="form-field">
                <label>Franchigia</label>
                <input type="number" name="franchigia" value={newBooking.franchigia || 0} onChange={handleInputChange} />
              </div>
              <div className="form-field">
                <label>Assicurazione</label>
                <select name="assicurazione_tipo" value={newBooking.assicurazione_tipo || ""} onChange={handleInputChange}>
                  <option value="">Nessuna</option>
                  <option value="basic">Basic</option>
                  <option value="confort">Confort</option>
                  <option value="premium">Premium</option>
                  <option value="supertotal">Super Total</option>
                </select>
              </div>
            </div>

            {/* Pagamento */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="form-field">
                <label>Stato Pagamento</label>
                <select name="pagamento_status" value={newBooking.pagamento_status || ""} onChange={handleInputChange}>
                  <option value="da pagare">Da pagare</option>
                  <option value="parziale">Parziale</option>
                  <option value="pagato">Pagato</option>
                </select>
              </div>
              <div className="form-field">
                <label>Metodo Pagamento</label>
                <select name="pagamento_metodo" value={newBooking.pagamento_metodo || ""} onChange={handleInputChange}>
                  <option value="">Seleziona</option>
                  <option value="carta">Carta</option>
                  <option value="contanti">Contanti</option>
                  <option value="bonifico">Bonifico</option>
                  <option value="online">Online</option>
                </select>
              </div>
            </div>

            <div className="form-field">
              <label>Penale Cancellazione</label>
              <input type="number" name="penale_cancellazione" value={newBooking.penale_cancellazione || 0} onChange={handleInputChange} />
            </div>

            <div className="form-field">
              <label>
                <input type="checkbox" name="veicolo_in_manutenzione" checked={newBooking.veicolo_in_manutenzione || false} onChange={handleInputChange} />
                {" "}Veicolo in manutenzione
              </label>
            </div>

            {/* Note */}
            <div className="form-field">
              <label>Note Cliente</label>
              <textarea name="note_cliente" value={newBooking.note_cliente || ""} onChange={handleInputChange} />
            </div>

            <div className="form-field">
              <label>Note Interne</label>
              <textarea name="note_interna" value={newBooking.note_interna || ""} onChange={handleInputChange} />
            </div>

            <div className="popup-actions">
              <button className="green-btn" onClick={handleSaveBooking}>Salva</button>
              {selectedBooking && (
                <button className="red-btn" onClick={handleDeleteBooking}>Elimina</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
