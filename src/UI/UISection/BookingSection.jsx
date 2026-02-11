import { useState } from "react";
import { supabase } from "../../supabaseClient";
import { usePrenotazioni, useVehicles, useUsers } from "../../hooks/useSupabase";
import "../../UIX/BookingSection.css";
import { Filter } from "lucide-react";

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
    luogo_ritiro: "",
    luogo_restituzione: "",
    stato: "prenotato",
    km_iniziali: 0,
    km_finali: 0,
    prezzo_giornaliero: 0,
    giorni: 1,
    deposito: 0,
    pagamento_status: "da pagare",
    note_cliente: "",
    note_interna: "",
    OraCheckin: "09:00",
    OraCheckOut: "18:00",
  };

  const [newBooking, setNewBooking] = useState(initialBookingState);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBooking({ ...newBooking, [name]: value });
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

    let error;
    if (selectedBooking) {
      ({ error } = await supabase.from("Prenotazioni").update(bookingToSave).eq("id", selectedBooking.id));
    } else {
      ({ error } = await supabase.from("Prenotazioni").insert([bookingToSave]));
    }

    if (!error) {
      fetchBookings();
      setSidebarOpen(false);
      setSelectedBooking(null);
      setNewBooking(initialBookingState);
    }
  };

  const handleDeleteBooking = async () => {
    if (!selectedBooking) return;
    await supabase.from("Prenotazioni").delete().eq("id", selectedBooking.id);
    fetchBookings();
    setSidebarOpen(false);
    setSelectedBooking(null);
  };

  const filteredBookings = bookings.filter(
    (b) =>
      (filters.cliente === "" ||
        users.find(u => u.id === b.cliente_id)?.nome?.toLowerCase().includes(filters.cliente.toLowerCase())) &&
      (filters.veicolo === "" ||
        vehicles.find(v => v.id === b.veicolo_id)?.modello?.toLowerCase().includes(filters.veicolo.toLowerCase())) &&
      (filters.stato === "" ||
        b.stato.toLowerCase().includes(filters.stato.toLowerCase()))
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
              <th>Stato</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((b) => (
              <tr key={b.id} onClick={() => handleRowClick(b)}>
                <td>{b.contratto_id}</td>
                <td>{users.find(u => u.id === b.cliente_id)?.nome}</td>
                <td>{vehicles.find(v => v.id === b.veicolo_id)?.modello}</td>
                <td>{b.check_in}</td>
                <td>{b.check_out}</td>
                <td>{b.stato}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sidebarOpen && (
        <div className="sidebar-overlay">
          <div className="sidebar-form">
            <button className="popup-close" onClick={() => setSidebarOpen(false)}>×</button>

            <h2>{selectedBooking ? "Modifica Prenotazione" : "Nuova Prenotazione"}</h2>

            <div className="form-field">
              <label>Cliente</label>
              <select name="cliente_id" value={newBooking.cliente_id} onChange={handleInputChange}>
                <option value="">Seleziona</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.nome} {u.cognome}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Veicolo</label>
              <select name="veicolo_id" value={newBooking.veicolo_id} onChange={handleInputChange}>
                <option value="">Seleziona</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.marca} {v.modello}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Check-in</label>
              <input type="date" name="check_in" value={newBooking.check_in} onChange={handleInputChange} />
            </div>

            <div className="form-field">
              <label>Check-out</label>
              <input type="date" name="check_out" value={newBooking.check_out} onChange={handleInputChange} />
            </div>

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
              <label>Note Cliente</label>
              <textarea name="note_cliente" value={newBooking.note_cliente} onChange={handleInputChange} />
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
