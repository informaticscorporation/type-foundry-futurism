import { useState } from "react";
import { supabase } from "../../supabaseClient";
import { useUsers } from "../../hooks/useSupabase";
import "../../UIX/ClientiSection.css";
import { Filter } from "lucide-react";

export default function ClientiSection() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  const handleRowClick = (user) => {
    setSelectedUser(user);
    setNewUser(user);
    setSidebarOpen(true);
  };

  const handleSaveUser = async () => {
    if (selectedUser) {
      await supabase.from("Users").update(newUser).eq("id", selectedUser.id);
    } else {
      await supabase.from("Users").insert([newUser]);
    }

    fetchUsers();
    setSidebarOpen(false);
    setSelectedUser(null);
    setNewUser(initialUserState);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    await supabase.from("Users").delete().eq("id", selectedUser.id);
    fetchUsers();
    setSidebarOpen(false);
    setSelectedUser(null);
  };

  const filteredUsers = users.filter(
    (u) =>
      (filters.nome === "" || u.nome?.toLowerCase().includes(filters.nome.toLowerCase())) &&
      (filters.cognome === "" || u.cognome?.toLowerCase().includes(filters.cognome.toLowerCase())) &&
      (filters.email === "" || u.email?.toLowerCase().includes(filters.email.toLowerCase()))
  );

  return (
    <div className="booking-section-container">
      <div className="booking-header">
        <h1>Clienti</h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="btn-add" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={20} /> Filtri
          </button>
          <button
            className="btn-add"
            onClick={() => {
              setSelectedUser(null);
              setNewUser(initialUserState);
              setSidebarOpen(true);
            }}
          >
            Aggiungi Cliente
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="booking-filters">
          <input placeholder="Nome" onChange={(e) => setFilters({ ...filters, nome: e.target.value })} />
          <input placeholder="Cognome" onChange={(e) => setFilters({ ...filters, cognome: e.target.value })} />
          <input placeholder="Email" onChange={(e) => setFilters({ ...filters, email: e.target.value })} />
        </div>
      )}

      <div className="booking-table-container">
        <table className="booking-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Cognome</th>
              <th>Email</th>
              <th>Telefono</th>
              <th>Città</th>
              <th>Tipo</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id} onClick={() => handleRowClick(u)}>
                <td>{u.nome}</td>
                <td>{u.cognome}</td>
                <td>{u.email}</td>
                <td>{u.telefono}</td>
                <td>{u.citta}</td>
                <td>{u.tipoUtente}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sidebarOpen && (
        <div className="sidebar-overlay">
          <div className="sidebar-form">
            <button className="popup-close" onClick={() => setSidebarOpen(false)}>×</button>

            <h2>{selectedUser ? "Modifica Cliente" : "Nuovo Cliente"}</h2>

            {Object.keys(initialUserState).map((key) => (
              <div className="form-field" key={key}>
                <label>{key.replace("_", " ")}</label>
                {key === "tipoUtente" ? (
                  <select name={key} value={newUser[key]} onChange={handleInputChange}>
                    <option value="cliente">Cliente</option>
                    <option value="fornitore">Fornitore</option>
                    <option value="dipendente">Dipendente</option>
                  </select>
                ) : (
                  <input
                    type={key === "data_nascita" ? "date" : "text"}
                    name={key}
                    value={newUser[key]}
                    onChange={handleInputChange}
                  />
                )}
              </div>
            ))}

            <div className="popup-actions">
              <button className="green-btn" onClick={handleSaveUser}>Salva</button>
              {selectedUser && (
                <button className="red-btn" onClick={handleDeleteUser}>Elimina</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
