import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import "../../UIX/BookingSection.css";
import { FiFilter } from "react-icons/fi";

export default function BookingSection() {
  const [popupOpen, setPopupOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [filters, setFilters] = useState({ cliente: "", veicolo: "", stato: "" });
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [users, setUsers] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const initialBookingState = {
    id: "",
    contratto_id: "",
    cliente_id: "",
    veicolo_id: "",
    check_in: "",
    check_out: "",
    luogo_ritiro: "",
    luogo_restituzione: "",
    stato: "prenotata",
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
    checklist_ritiro: {},
    checklist_restituzione: {},
    OraCheckin: "09:00",
    OraCheckOut: "18:00",
  };

  const [newBooking, setNewBooking] = useState(initialBookingState);

  const generateBookingId = () => {
    const numbers = Math.floor(Math.random() * 90 + 10);
    const letters = Array.from({ length: 3 }, () =>
      String.fromCharCode(65 + Math.floor(Math.random() * 26))
    ).join("");
    return `${numbers}${letters}`;
  };

  // --- Fetch dati
  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from("Prenotazioni")
      .select("*")
      .order("data_creazione", { ascending: false });
    if (error) console.log(error);
    else setBookings(data);
  };

  const fetchVehicles = async () => {
    const { data } = await supabase.from("Vehicles").select("*");
    setVehicles(data || []);
  };

  const fetchUsers = async () => {
    const { data } = await supabase.from("Users").select("*");
    setUsers(data || []);
  };

  useEffect(() => {
    fetchBookings();
    fetchVehicles();
    fetchUsers();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filteredBookings = bookings.filter(
    (b) =>
      (filters.cliente === "" || users.find(u => u.id === b.cliente_id)?.nome?.toLowerCase().includes(filters.cliente.toLowerCase())) &&
      (filters.veicolo === "" || vehicles.find(v => v.id === b.veicolo_id)?.modello?.toLowerCase().includes(filters.veicolo.toLowerCase())) &&
      (filters.stato === "" || b.stato.toLowerCase().includes(filters.stato.toLowerCase()))
  );

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewBooking({ ...newBooking, [name]: type === "checkbox" ? checked : value });
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleRowClick = (booking) => {
    setSelectedBooking(booking);
    setNewBooking({ ...booking });
    setPopupOpen(true);
    setCurrentStep(1);
  };

  // --- Salvataggio prenotazione
  const handleSaveBooking = async () => {
    const bookingToSave = {
      ...newBooking,
      id: selectedBooking ? selectedBooking.id : generateBookingId(),
      contratto_id: selectedBooking ? selectedBooking.contratto_id : generateBookingId(),
    };

    ["km_iniziali","km_finali","km_previsti","km_extra","prezzo_giornaliero","giorni","totale_base","sconto","totale_pagato","deposito","franchigia","penale_cancellazione"]
      .forEach(f => bookingToSave[f] = Number(bookingToSave[f]) || 0);

    let error;
    if(selectedBooking){
      ({ error } = await supabase.from("Prenotazioni").update(bookingToSave).eq("id", selectedBooking.id));
    } else {
      ({ error } = await supabase.from("Prenotazioni").insert([bookingToSave]));
    }

    if (error) console.log("Errore salvataggio:", error);
    else {
      fetchBookings();
      setPopupOpen(false);
      setNewBooking(initialBookingState);
      setSelectedBooking(null);
      setCurrentStep(1);
    }
  };

  const handleDeleteBooking = async () => {
    if(selectedBooking){
      const { error } = await supabase.from("Prenotazioni").delete().eq("id", selectedBooking.id);
      if(error) console.log(error);
      else {
        fetchBookings();
        setPopupOpen(false);
        setNewBooking(initialBookingState);
        setSelectedBooking(null);
      }
    }
  };

  const statoOptions = ["libero", "checkin", "checkout", "annulato", "prenotato"];

  return (
    <div className="booking-section-container">
      {/* HEADER */}
      <div className="booking-header">
        <h1>Prenotazioni</h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="btn-add" onClick={() => setShowFilters(!showFilters)} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <FiFilter size={20} /> Filtri
          </button>
          <button className="btn-add" onClick={() => { setPopupOpen(true); setSelectedBooking(null); setNewBooking(initialBookingState); }}>
            Aggiungi Prenotazione
          </button>
        </div>
      </div>

      {/* FILTRI */}
      {showFilters && (
        <div className="booking-filters">
          <input type="text" name="cliente" placeholder="Cliente" onChange={handleFilterChange} />
          <input type="text" name="veicolo" placeholder="Veicolo" onChange={handleFilterChange} />
          <input type="text" name="stato" placeholder="Stato" onChange={handleFilterChange} />
        </div>
      )}

      {/* TABELLA */}
      <div className="booking-table-container">
        <table className="booking-table">
          <thead>
            <tr>
              <th>ID Contratto</th>
              <th>Cliente</th>
              <th>Veicolo</th>
              <th>Check-in</th>
              <th>Ora Check-in</th>
              <th>Check-out</th>
              <th>Ora Check-out</th>
              <th>Stato</th>
              <th>Km iniziali</th>
              <th>Km finali</th>
              <th>Prezzo giornaliero</th>
              <th>Giorni</th>
              <th>Totale Base</th>
              <th>Sconto</th>
              <th>Totale Pagato</th>
              <th>Deposito</th>
              <th>Franchigia</th>
              <th>Assicurazione</th>
              <th>Pagamento Status</th>
              <th>Pagamento Metodo</th>
              <th>Note Cliente</th>
              <th>Note Interna</th>
              
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((b) => (
              <tr key={b.id} onClick={() => handleRowClick(b)} className={selectedBooking?.id === b.id ? "selected" : ""}>
                <td>{b.contratto_id}</td>
                <td>{users.find(u => u.id === b.cliente_id)?.nome || "-"}</td>
                <td>{vehicles.find(v => v.id === b.veicolo_id)?.modello || "-"}</td>
                <td>{b.check_in}</td>
                <td>{b.OraCheckin}</td>
                <td>{b.check_out}</td>
                <td>{b.OraCheckOut}</td>
                <td>
                  {b.stato}
                </td>
                <td>{b.km_iniziali}</td>
                <td>{b.km_finali}</td>
                <td>{b.prezzo_giornaliero}</td>
                <td>{b.giorni}</td>
                <td>{b.totale_base}</td>
                <td>{b.sconto}</td>
                <td>{b.totale_pagato}</td>
                <td>{b.deposito}</td>
                <td>{b.franchigia}</td>
                <td>{b.assicurazione_tipo}</td>
                <td>{b.pagamento_status}</td>
                <td>{b.pagamento_metodo}</td>
                <td>{b.note_cliente}</td>
                <td>{b.note_interna}</td>
               
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* POPUP */}
      {popupOpen && (
        <div className="popup-overlay">
          <div className="popup-content">
            <button className="popup-close" onClick={() => { setPopupOpen(false); setSelectedBooking(null); }}>×</button>
            <h2>{selectedBooking ? "Modifica Prenotazione" : "Aggiungi Prenotazione"}</h2>

            {/* STEP 1 */}
            {currentStep === 1 && (
              <div className="form-step active">
                <div className="form-field">
                  <label>Cliente</label>
                  <select name="cliente_id" value={newBooking.cliente_id} onChange={handleInputChange}>
                    <option value="">Seleziona cliente</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.nome} {u.cognome}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label>Veicolo</label>
                  <select name="veicolo_id" value={newBooking.veicolo_id} onChange={handleInputChange}>
                    <option value="">Seleziona veicolo</option>
                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.marca} {v.modello}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {currentStep === 2 && (
  <div className="form-step active">
    <div className="form-field">
      <label>Check-in</label>
      <input
        type="date"
        name="check_in"
        value={newBooking.check_in}
        onChange={handleInputChange}
      />
    </div>
    <div className="form-field">
      <label>Ora Check-in</label>
      <input
        type="time"
        name="OraCheckin"
        value={newBooking.OraCheckin}
        onChange={handleInputChange}
      />
    </div>
    <div className="form-field">
      <label>Check-out</label>
      <input
        type="date"
        name="check_out"
        value={newBooking.check_out}
        onChange={handleInputChange}
      />
    </div>
    <div className="form-field">
      <label>Stato</label>
      <select
        name="stato"
        value={newBooking.stato}
        onChange={handleInputChange}
      >
        <option value="libero">Libero</option>
        <option value="checkin">Check-in</option>
        <option value="checkout">Check-out</option>
        <option value="annulato">Annullato</option>
        <option value="prenotato">Prenotato</option>
      </select>
    </div>
    <div className="form-field">
      <label>Ora Check-out</label>
      <input
        type="time"
        name="OraCheckOut"
        value={newBooking.OraCheckOut}
        onChange={handleInputChange}
      />
    </div>
    <div className="form-field">
      <label>Luogo ritiro</label>
      <input
        type="text"
        name="luogo_ritiro"
        value={newBooking.luogo_ritiro}
        onChange={handleInputChange}
      />
    </div>
    <div className="form-field">
      <label>Luogo restituzione</label>
      <input
        type="text"
        name="luogo_restituzione"
        value={newBooking.luogo_restituzione}
        onChange={handleInputChange}
      />
    </div>
  </div>
)}

            {/* STEP 3 */}
            {currentStep === 3 && (
              <div className="form-step active">
                <div className="form-field">
                  <label>Prezzo giornaliero</label>
                  <input type="number" name="prezzo_giornaliero" value={newBooking.prezzo_giornaliero} onChange={handleInputChange} />
                </div>
                <div className="form-field">
                  <label>Giorni</label>
                  <input type="number" name="giorni" value={newBooking.giorni} onChange={handleInputChange} />
                </div>
                <div className="form-field">
                  <label>Deposito</label>
                  <input type="number" name="deposito" value={newBooking.deposito} onChange={handleInputChange} />
                </div>
                <div className="form-field">
                  <label>Stato pagamento</label>
                  <select name="pagamento_status" value={newBooking.pagamento_status} onChange={handleInputChange}>
                    <option value="da pagare">Da pagare</option>
                    <option value="parziale">Parziale</option>
                    <option value="pagato">Pagato</option>
                  </select>
                </div>
              </div>
            )}

            {/* NAV */}
            <div className="step-navigation">
              {currentStep > 1 && <button className="popup-btn" onClick={prevStep}>Indietro</button>}
              {currentStep < 3 && <button className="popup-btn" onClick={nextStep}>Avanti</button>}
              {currentStep === 3 && <button className="popup-btn" onClick={handleSaveBooking}>Salva</button>}
              {selectedBooking && <button className="popup-btn delete" onClick={handleDeleteBooking}>Elimina</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
