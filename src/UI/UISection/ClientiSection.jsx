import { useState } from "react";
import { supabase } from "../../supabaseClient";
import { useUsers } from "../../hooks/useSupabase";
import "../../UIX/ClientiSection.css";
import { Filter } from "lucide-react";
import { toast } from "sonner";

export default function ClientiSection() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filters, setFilters] = useState({ nome: "", cognome: "", email: "" });
  const { data: users, refetch: fetchUsers } = useUsers();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const initialUserState = {
    nome: "",
    cognome: "",
    codice_fiscale: "",
    ragione_sociale: "",
    partita_iva: "",
    email: "",
    telefono: "",
    indirizzo: "",
    citta: "",
    cap: "",
    data_nascita: "",
    tipoUtente: "cliente",
    tokenization: false,
  };

  const [newUser, setNewUser] = useState(initialUserState);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewUser({ ...newUser, [name]: type === "checkbox" ? checked : value });
  };

  const handleRowClick = (user) => {
    setSelectedUser(user);
    setNewUser({
      nome: user.nome || "",
      cognome: user.cognome || "",
      codice_fiscale: user.codice_fiscale || "",
      ragione_sociale: user.ragione_sociale || "",
      partita_iva: user.partita_iva || "",
      email: user.email || "",
      telefono: user.telefono || "",
      indirizzo: user.indirizzo || "",
      citta: user.citta || "",
      cap: user.cap || "",
      data_nascita: user.data_nascita || "",
      tipoUtente: user.tipoUtente || "cliente",
      tokenization: user.tokenization || false,
    });
    setSidebarOpen(true);
  };

  const handleSaveUser = async () => {
    let error;
    if (selectedUser) {
      ({ error } = await supabase.from("Users").update(newUser).eq("id", selectedUser.id));
    } else {
      ({ error } = await supabase.from("Users").insert([newUser]));
    }

    if (!error) {
      toast.success(selectedUser ? "Cliente aggiornato" : "Cliente creato");
      fetchUsers();
      setSidebarOpen(false);
      setSelectedUser(null);
      setNewUser(initialUserState);
    } else {
      toast.error("Errore: " + error.message);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    const { error } = await supabase.from("Users").delete().eq("id", selectedUser.id);
    if (!error) {
      toast.success("Cliente eliminato");
      fetchUsers();
      setSidebarOpen(false);
      setSelectedUser(null);
    } else {
      toast.error("Errore: " + error.message);
    }
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
              <th>C.F.</th>
              <th>P.IVA</th>
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
                <td>{u.codice_fiscale || "-"}</td>
                <td>{u.partita_iva || "-"}</td>
                <td>{u.tipoUtente}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}>
          <div className="sidebar-form" onClick={e => e.stopPropagation()}>
            <button className="popup-close" onClick={() => setSidebarOpen(false)}>×</button>

            <h2>{selectedUser ? "Modifica Cliente" : "Nuovo Cliente"}</h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="form-field">
                <label>Nome</label>
                <input name="nome" value={newUser.nome} onChange={handleInputChange} />
              </div>
              <div className="form-field">
                <label>Cognome</label>
                <input name="cognome" value={newUser.cognome} onChange={handleInputChange} />
              </div>
            </div>

            <div className="form-field">
              <label>Email</label>
              <input type="email" name="email" value={newUser.email} onChange={handleInputChange} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="form-field">
                <label>Telefono</label>
                <input name="telefono" value={newUser.telefono} onChange={handleInputChange} />
              </div>
              <div className="form-field">
                <label>Data Nascita</label>
                <input type="date" name="data_nascita" value={newUser.data_nascita} onChange={handleInputChange} />
              </div>
            </div>

            <div className="form-field">
              <label>Codice Fiscale</label>
              <input name="codice_fiscale" value={newUser.codice_fiscale} onChange={handleInputChange} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="form-field">
                <label>Ragione Sociale</label>
                <input name="ragione_sociale" value={newUser.ragione_sociale} onChange={handleInputChange} />
              </div>
              <div className="form-field">
                <label>Partita IVA</label>
                <input name="partita_iva" value={newUser.partita_iva} onChange={handleInputChange} />
              </div>
            </div>

            <div className="form-field">
              <label>Indirizzo</label>
              <input name="indirizzo" value={newUser.indirizzo} onChange={handleInputChange} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
              <div className="form-field">
                <label>Città</label>
                <input name="citta" value={newUser.citta} onChange={handleInputChange} />
              </div>
              <div className="form-field">
                <label>CAP</label>
                <input name="cap" value={newUser.cap} onChange={handleInputChange} />
              </div>
            </div>

            <div className="form-field">
              <label>Tipo Utente</label>
              <select name="tipoUtente" value={newUser.tipoUtente} onChange={handleInputChange}>
                <option value="cliente">Cliente</option>
                <option value="fornitore">Fornitore</option>
                <option value="dipendente">Dipendente</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <div className="form-field">
              <label>
                <input type="checkbox" name="tokenization" checked={newUser.tokenization || false} onChange={handleInputChange} />
                {" "}Tokenizzazione attiva
              </label>
            </div>

            {/* Documenti (solo visualizzazione se presenti) */}
            {selectedUser && (selectedUser.idCARDFrontimg || selectedUser.patenteFront) && (
              <div style={{ marginTop: 12, padding: 12, background: "#f8fafc", borderRadius: 8 }}>
                <label style={{ fontWeight: 600, fontSize: 13, color: "#475569" }}>Documenti caricati</label>
                <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                  {selectedUser.idCARDFrontimg && <span style={{ fontSize: 12, background: "#e2e8f0", padding: "4px 8px", borderRadius: 6 }}>📄 Carta ID Fronte</span>}
                  {selectedUser.idCARDBackimg && <span style={{ fontSize: 12, background: "#e2e8f0", padding: "4px 8px", borderRadius: 6 }}>📄 Carta ID Retro</span>}
                  {selectedUser.patenteFront && <span style={{ fontSize: 12, background: "#e2e8f0", padding: "4px 8px", borderRadius: 6 }}>📄 Patente Fronte</span>}
                  {selectedUser.patenteBack && <span style={{ fontSize: 12, background: "#e2e8f0", padding: "4px 8px", borderRadius: 6 }}>📄 Patente Retro</span>}
                  {selectedUser.taxiCardFront && <span style={{ fontSize: 12, background: "#e2e8f0", padding: "4px 8px", borderRadius: 6 }}>📄 Taxi Card Fronte</span>}
                  {selectedUser.taxiCardBack && <span style={{ fontSize: 12, background: "#e2e8f0", padding: "4px 8px", borderRadius: 6 }}>📄 Taxi Card Retro</span>}
                </div>
              </div>
            )}

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
