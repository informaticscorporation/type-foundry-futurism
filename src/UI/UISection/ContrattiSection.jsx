 import React, { useEffect, useState } from "react";
 import { supabase } from "../../supabaseClient";
 import "../../UIX/ContrattiSection.css";
 import { FileText, Download, Eye, Search, Plus, X, Check } from "lucide-react";
 import SignatureCanvas from "react-signature-canvas";
 import { jsPDF } from "jspdf";
 
 export default function ContrattiSection() {
   const [prenotazioni, setPrenotazioni] = useState([]);
   const [users, setUsers] = useState([]);
   const [vehicles, setVehicles] = useState([]);
   const [searchTerm, setSearchTerm] = useState("");
   const [filterStato, setFilterStato] = useState("");
   const [selectedContratto, setSelectedContratto] = useState(null);
   const [showViewPopup, setShowViewPopup] = useState(false);
   const [showSignPopup, setShowSignPopup] = useState(false);
   const [contractFiles, setContractFiles] = useState([]);
   const [signatureRef, setSignatureRef] = useState(null);
   const [loading, setLoading] = useState(false);
 
   // Fetch dati
   useEffect(() => {
     fetchData();
   }, []);
 
   const fetchData = async () => {
     const { data: prenData } = await supabase.from("Prenotazioni").select("*").order("data_creazione", { ascending: false });
     const { data: usersData } = await supabase.from("Users").select("*");
     const { data: vehData } = await supabase.from("Vehicles").select("*");
     setPrenotazioni(prenData || []);
     setUsers(usersData || []);
     setVehicles(vehData || []);
   };
 
   // Fetch files dal bucket per un contratto_id
   const fetchContractFiles = async (contrattoId) => {
     const folderPath = `Contratti/${contrattoId}`;
     const { data, error } = await supabase.storage.from("Archivio").list(folderPath);
     if (error) {
       console.error("Errore fetch files:", error);
       return [];
     }
     return data || [];
   };
 
   // Download file dal bucket
   const downloadFile = async (contrattoId, fileName) => {
     const filePath = `Contratti/${contrattoId}/${fileName}`;
     const { data, error } = await supabase.storage.from("Archivio").download(filePath);
     if (error) {
       console.error("Errore download:", error);
       return;
     }
     const url = URL.createObjectURL(data);
     const a = document.createElement("a");
     a.href = url;
     a.download = fileName;
     a.click();
     URL.revokeObjectURL(url);
   };
 
   // Visualizza contratto
   const handleViewContract = async (prenotazione) => {
     setSelectedContratto(prenotazione);
     const files = await fetchContractFiles(prenotazione.contratto_id);
     setContractFiles(files);
     setShowViewPopup(true);
   };
 
   // Apri popup firma
   const handleSignContract = (prenotazione) => {
     setSelectedContratto(prenotazione);
     setShowSignPopup(true);
   };
 
   // Salva firma
   const saveSignature = async () => {
     if (!signatureRef || signatureRef.isEmpty()) {
       alert("Per favore, inserisci una firma.");
       return;
     }
     setLoading(true);
     try {
       const signatureData = signatureRef.toDataURL("image/png");
       
       // Genera PDF con firma
       const pdf = new jsPDF();
       const user = users.find(u => u.id === selectedContratto.cliente_id);
       const veicolo = vehicles.find(v => v.id === selectedContratto.veicolo_id);
       
       pdf.setFontSize(18);
       pdf.text("CONTRATTO DI NOLEGGIO", 105, 20, { align: "center" });
       
       pdf.setFontSize(12);
       pdf.text(`ID Contratto: ${selectedContratto.contratto_id}`, 20, 40);
       pdf.text(`Cliente: ${user?.nome || ""} ${user?.cognome || ""}`, 20, 50);
       pdf.text(`Veicolo: ${veicolo?.marca || ""} ${veicolo?.modello || ""}`, 20, 60);
       pdf.text(`Check-in: ${new Date(selectedContratto.check_in).toLocaleDateString()}`, 20, 70);
       pdf.text(`Check-out: ${new Date(selectedContratto.check_out).toLocaleDateString()}`, 20, 80);
       pdf.text(`Totale: €${selectedContratto.totale_pagato}`, 20, 90);
       pdf.text(`Assicurazione: ${selectedContratto.assicurazione_tipo}`, 20, 100);
       
       pdf.text("Firma del cliente:", 20, 130);
       pdf.addImage(signatureData, "PNG", 20, 140, 80, 40);
       pdf.text(`Data: ${new Date().toLocaleDateString()}`, 20, 190);
       
       const pdfBlob = pdf.output("blob");
       const fileName = `contratto_firmato_${Date.now()}.pdf`;
       const filePath = `Contratti/${selectedContratto.contratto_id}/${fileName}`;
       
       const { error: uploadError } = await supabase.storage.from("Archivio").upload(filePath, pdfBlob);
       if (uploadError) throw uploadError;
       
       // Aggiorna stato prenotazione
       await supabase.from("Prenotazioni").update({ stato: "firmato" }).eq("id", selectedContratto.id);
       
       alert("Contratto firmato e salvato con successo!");
       setShowSignPopup(false);
       fetchData();
     } catch (error) {
       console.error("Errore salvataggio firma:", error);
       alert("Errore nel salvataggio della firma.");
     }
     setLoading(false);
   };
 
   // Crea nuovo contratto PDF
   const handleCreateContract = async (prenotazione) => {
     setLoading(true);
     try {
       const user = users.find(u => u.id === prenotazione.cliente_id);
       const veicolo = vehicles.find(v => v.id === prenotazione.veicolo_id);
       
       const pdf = new jsPDF();
       
       pdf.setFontSize(18);
       pdf.text("CONTRATTO DI NOLEGGIO VEICOLO", 105, 20, { align: "center" });
       
       pdf.setFontSize(10);
       pdf.text(`Data creazione: ${new Date().toLocaleDateString()}`, 150, 30);
       
       pdf.setFontSize(12);
       pdf.text("DATI CONTRATTO", 20, 45);
       pdf.setFontSize(10);
       pdf.text(`ID Contratto: ${prenotazione.contratto_id}`, 20, 55);
       pdf.text(`ID Prenotazione: ${prenotazione.id}`, 20, 62);
       
       pdf.setFontSize(12);
       pdf.text("DATI CLIENTE", 20, 80);
       pdf.setFontSize(10);
       pdf.text(`Nome: ${user?.nome || "N/A"} ${user?.cognome || ""}`, 20, 90);
       pdf.text(`Email: ${user?.email || "N/A"}`, 20, 97);
       pdf.text(`Telefono: ${user?.telefono || "N/A"}`, 20, 104);
       
       pdf.setFontSize(12);
       pdf.text("DATI VEICOLO", 20, 122);
       pdf.setFontSize(10);
       pdf.text(`Veicolo: ${veicolo?.marca || ""} ${veicolo?.modello || ""}`, 20, 132);
       pdf.text(`Targa: ${veicolo?.targa || "N/A"}`, 20, 139);
       pdf.text(`Categoria: ${veicolo?.categoria || "N/A"}`, 20, 146);
       
       pdf.setFontSize(12);
       pdf.text("DETTAGLI NOLEGGIO", 20, 164);
       pdf.setFontSize(10);
       pdf.text(`Check-in: ${new Date(prenotazione.check_in).toLocaleDateString()}`, 20, 174);
       pdf.text(`Check-out: ${new Date(prenotazione.check_out).toLocaleDateString()}`, 20, 181);
       pdf.text(`Giorni: ${prenotazione.giorni}`, 20, 188);
       pdf.text(`Prezzo giornaliero: €${prenotazione.prezzo_giornaliero}`, 20, 195);
       pdf.text(`Totale base: €${prenotazione.totale_base}`, 20, 202);
       pdf.text(`Sconto: €${prenotazione.sconto}`, 20, 209);
       pdf.text(`Totale pagato: €${prenotazione.totale_pagato}`, 20, 216);
       
       pdf.text(`Assicurazione: ${prenotazione.assicurazione_tipo}`, 110, 174);
       pdf.text(`Franchigia: €${prenotazione.franchigia}`, 110, 181);
       pdf.text(`Deposito: €${prenotazione.deposito || 0}`, 110, 188);
       
       pdf.setFontSize(12);
       pdf.text("FIRMA CLIENTE", 20, 240);
       pdf.line(20, 260, 90, 260);
       
       pdf.text("DATA", 110, 240);
       pdf.line(110, 260, 180, 260);
       
       const pdfBlob = pdf.output("blob");
       const fileName = `contratto_${Date.now()}.pdf`;
       const filePath = `Contratti/${prenotazione.contratto_id}/${fileName}`;
       
       const { error } = await supabase.storage.from("Archivio").upload(filePath, pdfBlob);
       if (error) throw error;
       
       alert("Contratto creato con successo!");
       fetchData();
     } catch (error) {
       console.error("Errore creazione contratto:", error);
       alert("Errore nella creazione del contratto.");
     }
     setLoading(false);
   };
 
   // Filtra prenotazioni
   const filteredPrenotazioni = prenotazioni.filter(p => {
     const user = users.find(u => u.id === p.cliente_id);
     const veicolo = vehicles.find(v => v.id === p.veicolo_id);
     const searchMatch = 
       (user?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user?.cognome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        veicolo?.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        veicolo?.modello?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.contratto_id?.toLowerCase().includes(searchTerm.toLowerCase()));
     const statoMatch = filterStato === "" || p.stato === filterStato;
     return searchMatch && statoMatch;
   });
 
   const getStatusBadge = (stato) => {
     const colors = {
       firmato: { bg: "#dcfce7", color: "#16a34a" },
       prenotata: { bg: "#fef3c7", color: "#d97706" },
       completata: { bg: "#dbeafe", color: "#2563eb" },
       cancellata: { bg: "#fee2e2", color: "#dc2626" },
     };
     const style = colors[stato] || { bg: "#f3f4f6", color: "#6b7280" };
     return <span className="status-badge" style={{ background: style.bg, color: style.color }}>{stato}</span>;
   };
 
   return (
     <section className="contratti-section">
       <div className="contratti-header">
         <h2>Contratti</h2>
       </div>
 
       {/* Filtri */}
       <div className="contratti-filters">
         <div className="search-box">
           <Search size={18} />
           <input
             type="text"
             placeholder="Cerca cliente, veicolo o ID contratto..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
         </div>
         <select value={filterStato} onChange={(e) => setFilterStato(e.target.value)}>
           <option value="">Tutti gli stati</option>
           <option value="prenotata">Prenotata</option>
           <option value="firmato">Firmato</option>
           <option value="completata">Completata</option>
           <option value="cancellata">Cancellata</option>
         </select>
       </div>
 
       {/* Tabella */}
       <div className="contratti-table-container">
         <table className="contratti-table">
           <thead>
             <tr>
               <th>ID Contratto</th>
               <th>Cliente</th>
               <th>Veicolo</th>
               <th>Check-in</th>
               <th>Check-out</th>
               <th>Totale</th>
               <th>Stato</th>
               <th>Azioni</th>
             </tr>
           </thead>
           <tbody>
             {filteredPrenotazioni.map((p) => {
               const user = users.find(u => u.id === p.cliente_id);
               const veicolo = vehicles.find(v => v.id === p.veicolo_id);
               return (
                 <tr key={p.id}>
                   <td><code>{p.contratto_id?.substring(0, 8)}...</code></td>
                   <td>{user?.nome} {user?.cognome}</td>
                   <td>{veicolo?.marca} {veicolo?.modello}</td>
                   <td>{new Date(p.check_in).toLocaleDateString()}</td>
                   <td>{new Date(p.check_out).toLocaleDateString()}</td>
                   <td>€{p.totale_pagato}</td>
                   <td>{getStatusBadge(p.stato)}</td>
                   <td className="actions-cell">
                     <button className="icon-btn view" title="Visualizza" onClick={() => handleViewContract(p)}>
                       <Eye size={16} />
                     </button>
                     <button className="icon-btn create" title="Crea contratto" onClick={() => handleCreateContract(p)} disabled={loading}>
                       <Plus size={16} />
                     </button>
                     <button className="icon-btn sign" title="Firma" onClick={() => handleSignContract(p)}>
                       <FileText size={16} />
                     </button>
                   </td>
                 </tr>
               );
             })}
           </tbody>
         </table>
       </div>
 
       {/* Popup Visualizza Contratti */}
       {showViewPopup && selectedContratto && (
         <div className="popup-overlay" onClick={() => setShowViewPopup(false)}>
           <div className="popup-content" onClick={(e) => e.stopPropagation()}>
             <button className="popup-close" onClick={() => setShowViewPopup(false)}>×</button>
             <h2>Documenti Contratto</h2>
             <p className="contract-id">ID: {selectedContratto.contratto_id}</p>
             
             {contractFiles.length === 0 ? (
               <p className="no-files">Nessun documento presente per questo contratto.</p>
             ) : (
               <ul className="files-list">
                 {contractFiles.map((file, idx) => (
                   <li key={idx} className="file-item">
                     <FileText size={20} />
                     <span>{file.name}</span>
                     <button className="download-btn" onClick={() => downloadFile(selectedContratto.contratto_id, file.name)}>
                       <Download size={16} /> Scarica
                     </button>
                   </li>
                 ))}
               </ul>
             )}
           </div>
         </div>
       )}
 
       {/* Popup Firma */}
       {showSignPopup && selectedContratto && (
         <div className="popup-overlay" onClick={() => setShowSignPopup(false)}>
           <div className="popup-content signature-popup" onClick={(e) => e.stopPropagation()}>
             <button className="popup-close" onClick={() => setShowSignPopup(false)}>×</button>
             <h2>Firma Contratto</h2>
             <p className="contract-id">ID: {selectedContratto.contratto_id}</p>
             
             <div className="signature-area">
               <p>Inserisci la firma qui sotto:</p>
               <SignatureCanvas
                 ref={(ref) => setSignatureRef(ref)}
                 penColor="#0f172a"
                 canvasProps={{ className: "signature-canvas" }}
               />
               <div className="signature-actions">
                 <button className="btn-clear" onClick={() => signatureRef?.clear()}>
                   <X size={16} /> Pulisci
                 </button>
                 <button className="btn-save" onClick={saveSignature} disabled={loading}>
                   <Check size={16} /> {loading ? "Salvando..." : "Salva Firma"}
                 </button>
               </div>
             </div>
           </div>
         </div>
       )}
     </section>
   );
 }