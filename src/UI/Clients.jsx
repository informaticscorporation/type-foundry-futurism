import { useState, useRef, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { Filter } from "lucide-react";

export default function Clients({ openMenuButton, clients, setClients }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [previewDocs, setPreviewDocs] = useState({});
  const fileInputRefs = useRef({});
  const [searchTerm, setSearchTerm] = useState("");

  const initialForm = {
    nome: "",
    cognome: "",
    email: "",
    telefono: "",
    indirizzo: "",
    citta: "",
    cap: "",
    codice_fiscale: "",
    ragione_sociale: "",
    partita_iva: "",
    data_nascita: "",
    tipoUtente: "cliente",
    idCARDFrontimg: "",
    idCARDBackimg: "",
    patenteFront: "",
    patenteBack: "",
    taxiCardFront: "",
    taxiCardBack: ""
  };

  const [form, setForm] = useState(initialForm);

  const openEditModal = (client) => {
    if (client) {
      setEditingClient(client);
      setForm(client);
      setPreviewDocs({
        idCARDFrontimg: client.idCARDFrontimg || null,
        idCARDBackimg: client.idCARDBackimg || null,
        patenteFront: client.patenteFront || null,
        patenteBack: client.patenteBack || null,
        taxiCardFront: client.taxiCardFront || null,
        taxiCardBack: client.taxiCardBack || null,
      });
    } else {
      setEditingClient(null);
      setForm(initialForm);
      setPreviewDocs({});
    }
    setIsOpen(true);
  };

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  function handleFileChange(e, docType) {
    const file = e.target.files[0];
    if (!file) return;
    setPreviewDocs(prev => ({ ...prev, [docType]: URL.createObjectURL(file) }));
  }

  async function handleSaveClient() {
    try {
      setLoading(true);
      const userId = editingClient?.id || form.id || null;
      let updatedForm = { ...form };

      // Upload documenti
      for (const docKey of ["idCARDFrontimg","idCARDBackimg","patenteFront","patenteBack","taxiCardFront","taxiCardBack"]) {
        const file = fileInputRefs.current[docKey]?.files?.[0];
        if (file) {
          if (editingClient && editingClient[docKey]) {
            const oldPath = editingClient[docKey].split("/storage/v1/object/public/")[1];
            await supabase.storage.from("Archivio").remove([oldPath]);
          }
          const filePath = `documenti_utente/${userId || Date.now()}/${file.name}`;
          const { error: uploadError } = await supabase.storage.from("Archivio").upload(filePath, file);
          if (uploadError) throw uploadError;
          const { data: publicUrlData } = supabase.storage.from("Archivio").getPublicUrl(filePath);
          updatedForm[docKey] = publicUrlData.publicUrl;
        }
      }

      let res;
      if (editingClient) {
        const { data, error } = await supabase.from("Users").update(updatedForm).eq("id", editingClient.id).select();
        if (error) throw error;
        res = data[0];
        setClients(prev => prev.map(c => c.id === editingClient.id ? res : c));
      } else {
        const { data, error } = await supabase.from("Users").insert([updatedForm]).select();
        if (error) throw error;
        res = data[0];
        setClients(prev => [...prev, res]);
      }

      setIsOpen(false);
      setLoading(false);
      setEditingClient(null);
      setPreviewDocs({});
    } catch (err) {
      console.error(err);
      alert("Errore: " + (err.message || JSON.stringify(err)));
      setLoading(false);
    }
  }

  async function handleDeleteClient() {
    if (!editingClient) return;
    if (!confirm("Sei sicuro di eliminare questo cliente?")) return;
    try {
      setLoading(true);
      for (const docKey of ["idCARDFrontimg","idCARDBackimg","patenteFront","patenteBack","taxiCardFront","taxiCardBack"]) {
        if (editingClient[docKey]) {
          const path = editingClient[docKey].split("/storage/v1/object/public/")[1];
          await supabase.storage.from("Archivio").remove([path]);
        }
      }
      await supabase.from("Users").delete().eq("id", editingClient.id);
      setClients(prev => prev.filter(c => c.id !== editingClient.id));
      setIsOpen(false);
      setLoading(false);
      setEditingClient(null);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  // filtro globale
  const filteredClients = clients.filter(client =>
    Object.values(client).some(val => val?.toString().toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="section">
      {openMenuButton}
      <div className="cars-header">
        <h2>Clienti</h2>
        <button className="green-btn" onClick={() => openEditModal(null)}>+ Aggiungi Cliente</button>
      </div>

      {/* Filtro globale */}
      <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
        <Filter size={18} />
        <input
          type="text"
          placeholder="Cerca in tutte le colonne..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #ccc", flex: 1 }}
        />
      </div>

      {/* Tabella */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Cognome</th>
              <th>Email</th>
              <th>Telefono</th>
              <th>Tipo Utente</th>
              <th>Data Nascita</th>
              <th>Codice Fiscale</th>
              <th>Ragione Sociale</th>
              <th>Partita IVA</th>
              <th>ID Card (Front)</th>
              <th>ID Card (Back)</th>
              <th>Patente (Front)</th>
              <th>Patente (Back)</th>
              <th>Codice Fiscale (Front)</th>
              <th>Codice Fiscale (Back)</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map(client => (
              <tr key={client.id} onClick={() => openEditModal(client)} style={{ cursor: "pointer" }}>
                <td>{client.nome}</td>
                <td>{client.cognome}</td>
                <td>{client.email}</td>
                <td>{client.telefono}</td>
                <td>{client.tipoUtente}</td>
                <td>{client.data_nascita || "-"}</td>
                <td>{client.codice_fiscale || "-"}</td>
                <td>{client.ragione_sociale || "-"}</td>
                <td>{client.partita_iva || "-"}</td>
                {["idCARDFrontimg","idCARDBackimg","patenteFront","patenteBack","taxiCardFront","taxiCardBack"].map(docKey => (
                  <td key={docKey}>
                    {client[docKey] ? (
                      <img
                        src={client[docKey]}
                        alt={docKey}
                        style={{ width: 80, borderRadius: 6 }}
                      />
                    ) : (
                      "-"
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Popup Modifica / Aggiungi */}
      {isOpen && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h3>{editingClient ? "Modifica Cliente" : "Aggiungi Nuovo Cliente"}</h3>
            <div className="popup-form">
              {Object.keys(form).map(key => {
                if (["idCARDFrontimg","idCARDBackimg","patenteFront","patenteBack","taxiCardFront","taxiCardBack"].includes(key)) {
                  return (
                    <label key={key}>{key}
                      <input type="file" ref={el => fileInputRefs.current[key] = el} onChange={e => handleFileChange(e,key)} />
                      {previewDocs[key] && (
                        <img
                          src={previewDocs[key]}
                          alt={key}
                          style={{ width: "100%", maxHeight: 150, objectFit: "contain", marginTop: 6 }}
                        />
                      )}
                    </label>
                  );
                } else {
                  return (
                    <label key={key}>{key}
                      <input type="text" name={key} value={form[key]} onChange={handleChange} />
                    </label>
                  );
                }
              })}
            </div>
            <div className="popup-actions">
              {editingClient && (
                <button className="red-btn" onClick={handleDeleteClient} disabled={loading}>
                  {loading ? "Eliminando..." : "Elimina Cliente"}
                </button>
              )}
              <button className="green-btn" onClick={handleSaveClient} disabled={loading}>
                {loading ? "Salvataggio..." : "Salva Cliente"}
              </button>
              <button onClick={() => setIsOpen(false)}>Chiudi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
