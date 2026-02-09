import { useState } from "react";
import { supabase } from "../../supabaseClient";
import { useUsers } from "../../hooks/useSupabase";
import "../../UIX/ClientiSection.css";
import { Filter } from "lucide-react";

export default function ClientiSection() {
  const [popupOpen, setPopupOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [filters, setFilters] = useState({ nome: "", cognome: "", email: "" });
  const { data: users, refetch: fetchUsers } = useUsers();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const initialUserState = {
    nome: "",
    cognome: "",
    email: "",
    telefono: "",
    indirizzo: "",
    citta: "",
    cap: "",
    partita_iva: "",
    ragione_sociale: "",
    data_nascita: "",
    tipoUtente: "cliente",
  };

  const [newUser, setNewUser] = useState(initialUserState);

  // fetchUsers provided by useUsers hook

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filteredUsers = users.filter(
    (u) =>
      (filters.nome === "" || u.nome?.toLowerCase().includes(filters.nome.toLowerCase())) &&
      (filters.cognome === "" || u.cognome?.toLowerCase().includes(filters.cognome.toLowerCase())) &&
      (filters.email === "" || u.email?.toLowerCase().includes(filters.email.toLowerCase()))
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  const handleRowClick = (user) => {
    setSelectedUser(user);
    setNewUser({ ...user });
    setPopupOpen(true);
    setCurrentStep(1);
  };

  const handleSaveUser = async () => {
    if (selectedUser) {
      const { error } = await supabase.from("Users").update(newUser).eq("id", selectedUser.id);
      if (error) console.log(error);
    } else {
      const { error } = await supabase.from("Users").insert([newUser]);
      if (error) console.log(error);
    }
    fetchUsers();
    setPopupOpen(false);
    setNewUser(initialUserState);
    setSelectedUser(null);
  };

  const handleDeleteUser = async () => {
    if (selectedUser) {
      const { error } = await supabase.from("Users").delete().eq("id", selectedUser.id);
      if (error) console.log(error);
      fetchUsers();
      setPopupOpen(false);
      setNewUser(initialUserState);
      setSelectedUser(null);
    }
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 2));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  return (
    <div className="booking-section-container">
      {/* HEADER */}
      <div className="booking-header">
        <h1>Clienti</h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="btn-add" onClick={() => setShowFilters(!showFilters)} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Filter size={20} /> Filtri
          </button>
          <button className="btn-add" onClick={() => { setPopupOpen(true); setSelectedUser(null); setNewUser(initialUserState); }}>
            Aggiungi Cliente
          </button>
        </div>
      </div>

      {/* FILTRI */}
      {showFilters && (
        <div className="booking-filters">
          <input type="text" name="nome" placeholder="Nome" onChange={handleFilterChange} />
          <input type="text" name="cognome" placeholder="Cognome" onChange={handleFilterChange} />
          <input type="text" name="email" placeholder="Email" onChange={handleFilterChange} />
        </div>
      )}

      {/* TABELLA */}
      <div className="booking-table-container">
        <table className="booking-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Cognome</th>
              <th>Email</th>
              <th>Telefono</th>
              <th>Indirizzo</th>
              <th>Città</th>
              <th>CAP</th>
              <th>Partita IVA</th>
              <th>Ragione Sociale</th>
              <th>Data Nascita</th>
              <th>Tipo Utente</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id} onClick={() => handleRowClick(u)} className={selectedUser?.id === u.id ? "selected" : ""}>
                <td>{u.nome}</td>
                <td>{u.cognome}</td>
                <td>{u.email}</td>
                <td>{u.telefono}</td>
                <td>{u.indirizzo}</td>
                <td>{u.citta}</td>
                <td>{u.cap}</td>
                <td>{u.partita_iva}</td>
                <td>{u.ragione_sociale}</td>
                <td>{u.data_nascita}</td>
                <td>{u.tipoUtente}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* POPUP */}
      {popupOpen && (
        <div className="popup-overlay">
          <div className="popup-content">
            <button className="popup-close" onClick={() => { setPopupOpen(false); setSelectedUser(null); }}>×</button>
            <h2>{selectedUser ? "Modifica Cliente" : "Aggiungi Cliente"}</h2>

            {/* STEP 1 */}
            {currentStep === 1 && (
              <div className="form-step active">
                <div className="form-field">
                  <label>Nome</label>
                  <input type="text" name="nome" value={newUser.nome} onChange={handleInputChange} />
                </div>
                <div className="form-field">
                  <label>Cognome</label>
                  <input type="text" name="cognome" value={newUser.cognome} onChange={handleInputChange} />
                </div>
                <div className="form-field">
                  <label>Email</label>
                  <input type="email" name="email" value={newUser.email} onChange={handleInputChange} />
                </div>
                <div className="form-field">
                  <label>Telefono</label>
                  <input type="text" name="telefono" value={newUser.telefono} onChange={handleInputChange} />
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {currentStep === 2 && (
              <div className="form-step active">
                <div className="form-field">
                  <label>Indirizzo</label>
                  <input type="text" name="indirizzo" value={newUser.indirizzo} onChange={handleInputChange} />
                </div>
                <div className="form-field">
                  <label>Città</label>
                  <input type="text" name="citta" value={newUser.citta} onChange={handleInputChange} />
                </div>
                <div className="form-field">
                  <label>CAP</label>
                  <input type="text" name="cap" value={newUser.cap} onChange={handleInputChange} />
                </div>
                <div className="form-field">
                  <label>Partita IVA</label>
                  <input type="text" name="partita_iva" value={newUser.partita_iva} onChange={handleInputChange} />
                </div>
                <div className="form-field">
                  <label>Ragione Sociale</label>
                  <input type="text" name="ragione_sociale" value={newUser.ragione_sociale} onChange={handleInputChange} />
                </div>
                <div className="form-field">
                  <label>Data Nascita</label>
                  <input type="date" name="data_nascita" value={newUser.data_nascita} onChange={handleInputChange} />
                </div>
                <div className="form-field">
                  <label>Tipo Utente</label>
                  <select name="tipoUtente" value={newUser.tipoUtente} onChange={handleInputChange}>
                    <option value="cliente">Cliente</option>
                    <option value="fornitore">Fornitore</option>
                    <option value="dipendente">Dipendente</option>
                  </select>
                </div>
              </div>
            )}

            {/* NAV */}
            <div className="step-navigation">
              {currentStep > 1 && <button className="popup-btn" onClick={prevStep}>Indietro</button>}
              {currentStep < 2 && <button className="popup-btn" onClick={nextStep}>Avanti</button>}
              {currentStep === 2 && <button className="popup-btn" onClick={handleSaveUser}>Salva</button>}
              {selectedUser && <button className="popup-btn delete" onClick={handleDeleteUser}>Elimina</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
