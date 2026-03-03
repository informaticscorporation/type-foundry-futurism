import { useState } from "react";
import { supabase } from "../../supabaseClient";
import { useVehicles } from "../../hooks/useSupabase";
import "../../UIX/CarSection.css";
import { toast } from "sonner";

export default function CarsSection() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filters, setFilters] = useState({ marca: "", modello: "", categoria: "" });
  const { data: vehicles, refetch: fetchVehicles } = useVehicles();
  const [previewImage, setPreviewImage] = useState(null);
  const [activeTab, setActiveTab] = useState("generale");

  const initialVehicleState = {
    id: "", marca: "", modello: "", targa: "", categoria: "", colore: "",
    alimentazione: "", cambio: "", porte: 0, kmattuali: 0, prezzogiornaliero: 0,
    immaggineauto: "", franchigia: 0, numeroassistenzastradale: 0,
    assicurazionebasic: 0, assicurazioneconfort: 0, assicurazionepremium: 0, assicurazionesupertotal: 0,
    statofreni: "", statooliomotore: "", statoliquidodiraffredamento: "", statoliquidofreni: "",
    statocarrozzeria: "", statovetrispecchietti: "", statointerni: "", statoclimatizzazione: "",
    statoluci: "", statosospenzioni: "",
    ultimamanutenzione: "", prossimamanutenzione: "", inmanutenzione: false,
    fornitoreoleasing: "", dataingressoflotta: "", datadismissioneprevista: "",
    ultimaprenotazione: "", noteinterne: "", valoredacquisto: 0, valoreattualestimato: 0,
    company_name: "", versione: "", cilindrata: 0, n_telaio: "", ex_targa: "",
    data_cambio_targa: "", tipo_carburante: "", serbatoio: 0, livello_carburante: 0,
    stato_veicolo: "", park: "", gruppo: "", sede: "", proprietario: "",
    sistema_localizzazione: "", codice_veicolo: "", uso_veicolo: "", pneumatici: "",
    misura_pneumatici: "", proprieta_pneumatici: "", fleet_network: "",
    gomme_invernali: false, neopatentati: false, printed_note: "", promo_car: false,
    fuori_servizio: false, rent_to_rent: false, Compagnia: "",
  };

  const [newVehicle, setNewVehicle] = useState(initialVehicleState);

  const handleFilterChange = (e) =>
    setFilters({ ...filters, [e.target.name]: e.target.value });

  const filteredData = vehicles.filter(
    (v) =>
      (filters.marca === "" || v.marca?.toLowerCase().includes(filters.marca.toLowerCase())) &&
      (filters.modello === "" || v.modello?.toLowerCase().includes(filters.modello.toLowerCase())) &&
      (filters.categoria === "" || v.categoria?.toLowerCase().includes(filters.categoria.toLowerCase()))
  );

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (files) {
      setNewVehicle({ ...newVehicle, [name]: files[0] });
      setPreviewImage(URL.createObjectURL(files[0]));
    } else {
      setNewVehicle({ ...newVehicle, [name]: type === "checkbox" ? checked : value });
    }
  };

  const generateVehicleId = () =>
    Math.random().toString(36).substring(2, 4).toUpperCase() +
    Math.floor(100 + Math.random() * 900);

  const handleSaveVehicle = async () => {
    let vehicleToInsert = { ...newVehicle };
    if (!vehicleToInsert.id) vehicleToInsert.id = generateVehicleId();

    // Convert numbers
    ["porte","kmattuali","prezzogiornaliero","franchigia","numeroassistenzastradale",
     "assicurazionebasic","assicurazioneconfort","assicurazionepremium","assicurazionesupertotal",
     "valoredacquisto","valoreattualestimato","cilindrata","serbatoio","livello_carburante"
    ].forEach(f => vehicleToInsert[f] = Number(vehicleToInsert[f]) || 0);

    if (vehicleToInsert.immaggineauto instanceof File) {
      const file = vehicleToInsert.immaggineauto;
      const ext = file.name.split(".").pop();
      const filePath = `${vehicleToInsert.id}.${ext}`;
      await supabase.storage.from("Archivio/Auto").upload(filePath, file, { upsert: true });
      vehicleToInsert.immaggineauto = filePath;
    }

    const { error } = vehicles.some((v) => v.id === vehicleToInsert.id)
      ? await supabase.from("Vehicles").update(vehicleToInsert).eq("id", vehicleToInsert.id)
      : await supabase.from("Vehicles").insert([vehicleToInsert]);

    if (!error) {
      toast.success("Veicolo salvato");
      fetchVehicles();
      setSidebarOpen(false);
      setPreviewImage(null);
      setNewVehicle(initialVehicleState);
    } else {
      toast.error("Errore: " + error.message);
    }
  };

  const handleDeleteVehicle = async () => {
    if (!newVehicle.id) return;
    const { error } = await supabase.from("Vehicles").delete().eq("id", newVehicle.id);
    if (!error) {
      toast.success("Veicolo eliminato");
      fetchVehicles();
      setSidebarOpen(false);
    } else {
      toast.error("Errore: " + error.message);
    }
  };

  const Field = ({ label, name, type = "text", value, ...rest }) => {
    if (type === "checkbox") {
      return (
        <label className="checkbox-label">
          <input type="checkbox" name={name} checked={!!value} onChange={handleInputChange} />
          {label}
        </label>
      );
    }
    return (
      <div className="form-field">
        <label>{label}</label>
        <input type={type} name={name} value={type !== "file" ? (value ?? "") : undefined} onChange={handleInputChange} {...rest} />
      </div>
    );
  };

  const tabs = [
    { key: "generale", label: "Generale" },
    { key: "tecnico", label: "Tecnico" },
    { key: "assicurazione", label: "Assicurazioni" },
    { key: "stato", label: "Stato Veicolo" },
    { key: "flotta", label: "Flotta" },
    { key: "altro", label: "Altro" },
  ];

  return (
    <div className="cars-section-container">
      <div className="cars-header">
        <h1>Gestione Veicoli</h1>
        <button className="btn-add" onClick={() => { setNewVehicle(initialVehicleState); setActiveTab("generale"); setSidebarOpen(true); }}>
          Aggiungi Auto
        </button>
      </div>

      <div className="cars-filters">
        <input name="marca" placeholder="Marca" onChange={handleFilterChange} />
        <input name="modello" placeholder="Modello" onChange={handleFilterChange} />
        <input name="categoria" placeholder="Categoria" onChange={handleFilterChange} />
      </div>

      <div className="cars-table-container">
        <table className="cars-table">
          <thead>
            <tr>
              <th>Img</th><th>ID</th><th>Marca</th><th>Modello</th><th>Targa</th>
              <th>€/Giorno</th><th>Km</th><th>Stato</th><th>Manut.</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((v) => (
              <tr key={v.id} onClick={() => { setNewVehicle(v); setActiveTab("generale"); setSidebarOpen(true); }}>
                <td>{v.immaggineauto ? <img src={`https://jurzdzkpkfxsoehfxgeg.supabase.co/storage/v1/object/public/Archivio/Auto/${v.immaggineauto}`} width={50} /> : "-"}</td>
                <td>{v.id}</td>
                <td>{v.marca}</td>
                <td>{v.modello}</td>
                <td>{v.targa}</td>
                <td>€{v.prezzogiornaliero}</td>
                <td>{v.kmattuali}</td>
                <td>{v.stato_veicolo || "-"}</td>
                <td>{v.inmanutenzione ? "Sì" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SIDEBAR */}
      <div className={`car-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="car-sidebar-header">
          <h2>{newVehicle.id ? "Modifica Auto" : "Aggiungi Auto"}</h2>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>×</button>
        </div>

        {/* TABS */}
        <div style={{ display: "flex", gap: 4, padding: "0 16px", flexWrap: "wrap", borderBottom: "1px solid #e2e8f0", marginBottom: 12 }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "8px 14px", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
                background: activeTab === tab.key ? "#16a34a" : "transparent",
                color: activeTab === tab.key ? "#fff" : "#64748b",
                borderRadius: "8px 8px 0 0",
              }}
            >{tab.label}</button>
          ))}
        </div>

        <div className="car-sidebar-body">
          {activeTab === "generale" && (
            <>
              <Field label="Marca" name="marca" value={newVehicle.marca} />
              <Field label="Modello" name="modello" value={newVehicle.modello} />
              <Field label="Versione" name="versione" value={newVehicle.versione} />
              <Field label="Targa" name="targa" value={newVehicle.targa} />
              <Field label="Ex Targa" name="ex_targa" value={newVehicle.ex_targa} />
              <Field label="Data Cambio Targa" name="data_cambio_targa" type="date" value={newVehicle.data_cambio_targa} />
              <Field label="Categoria" name="categoria" value={newVehicle.categoria} />
              <Field label="Colore" name="colore" value={newVehicle.colore} />
              <Field label="N. Telaio" name="n_telaio" value={newVehicle.n_telaio} />
              <Field label="Codice Veicolo" name="codice_veicolo" value={newVehicle.codice_veicolo} />
              <Field label="Prezzo Giornaliero" type="number" name="prezzogiornaliero" value={newVehicle.prezzogiornaliero} />
              <Field label="Valore Acquisto" type="number" name="valoredacquisto" value={newVehicle.valoredacquisto} />
              <Field label="Valore Stimato" type="number" name="valoreattualestimato" value={newVehicle.valoreattualestimato} />
              <Field label="Franchigia" type="number" name="franchigia" value={newVehicle.franchigia} />
              <Field label="Immagine" type="file" name="immaggineauto" accept="image/*" />
              {previewImage && <img src={previewImage} className="preview-img" alt="preview" />}
            </>
          )}

          {activeTab === "tecnico" && (
            <>
              <Field label="Alimentazione" name="alimentazione" value={newVehicle.alimentazione} />
              <Field label="Tipo Carburante" name="tipo_carburante" value={newVehicle.tipo_carburante} />
              <Field label="Cilindrata" type="number" name="cilindrata" value={newVehicle.cilindrata} />
              <Field label="Serbatoio (L)" type="number" name="serbatoio" value={newVehicle.serbatoio} />
              <Field label="Livello Carburante (%)" type="number" name="livello_carburante" value={newVehicle.livello_carburante} />
              <Field label="Cambio" name="cambio" value={newVehicle.cambio} />
              <Field label="Porte" type="number" name="porte" value={newVehicle.porte} />
              <Field label="Km Attuali" type="number" name="kmattuali" value={newVehicle.kmattuali} />
              <Field label="Pneumatici" name="pneumatici" value={newVehicle.pneumatici} />
              <Field label="Misura Pneumatici" name="misura_pneumatici" value={newVehicle.misura_pneumatici} />
              <Field label="Proprietà Pneumatici" name="proprieta_pneumatici" value={newVehicle.proprieta_pneumatici} />
              <Field label="Gomme Invernali" name="gomme_invernali" type="checkbox" value={newVehicle.gomme_invernali} />
              <Field label="Neopatentati" name="neopatentati" type="checkbox" value={newVehicle.neopatentati} />
            </>
          )}

          {activeTab === "assicurazione" && (
            <>
              <Field label="N. Assistenza Stradale" type="number" name="numeroassistenzastradale" value={newVehicle.numeroassistenzastradale} />
              <Field label="Assicurazione Basic" type="number" name="assicurazionebasic" value={newVehicle.assicurazionebasic} />
              <Field label="Assicurazione Confort" type="number" name="assicurazioneconfort" value={newVehicle.assicurazioneconfort} />
              <Field label="Assicurazione Premium" type="number" name="assicurazionepremium" value={newVehicle.assicurazionepremium} />
              <Field label="Assicurazione Super Total" type="number" name="assicurazionesupertotal" value={newVehicle.assicurazionesupertotal} />
              <Field label="Compagnia" name="Compagnia" value={newVehicle.Compagnia} />
            </>
          )}

          {activeTab === "stato" && (
            <>
              <Field label="Stato Veicolo" name="stato_veicolo" value={newVehicle.stato_veicolo} />
              <Field label="Freni" name="statofreni" value={newVehicle.statofreni} />
              <Field label="Olio Motore" name="statooliomotore" value={newVehicle.statooliomotore} />
              <Field label="Liquido Raffredamento" name="statoliquidodiraffredamento" value={newVehicle.statoliquidodiraffredamento} />
              <Field label="Liquido Freni" name="statoliquidofreni" value={newVehicle.statoliquidofreni} />
              <Field label="Carrozzeria" name="statocarrozzeria" value={newVehicle.statocarrozzeria} />
              <Field label="Vetri/Specchietti" name="statovetrispecchietti" value={newVehicle.statovetrispecchietti} />
              <Field label="Interni" name="statointerni" value={newVehicle.statointerni} />
              <Field label="Climatizzazione" name="statoclimatizzazione" value={newVehicle.statoclimatizzazione} />
              <Field label="Luci" name="statoluci" value={newVehicle.statoluci} />
              <Field label="Sospensioni" name="statosospenzioni" value={newVehicle.statosospenzioni} />
              <Field label="Ultima Manutenzione" type="date" name="ultimamanutenzione" value={newVehicle.ultimamanutenzione} />
              <Field label="Prossima Manutenzione" type="date" name="prossimamanutenzione" value={newVehicle.prossimamanutenzione} />
              <Field label="In Manutenzione" name="inmanutenzione" type="checkbox" value={newVehicle.inmanutenzione} />
              <Field label="Fuori Servizio" name="fuori_servizio" type="checkbox" value={newVehicle.fuori_servizio} />
            </>
          )}

          {activeTab === "flotta" && (
            <>
              <Field label="Company Name" name="company_name" value={newVehicle.company_name} />
              <Field label="Fornitore/Leasing" name="fornitoreoleasing" value={newVehicle.fornitoreoleasing} />
              <Field label="Proprietario" name="proprietario" value={newVehicle.proprietario} />
              <Field label="Sede" name="sede" value={newVehicle.sede} />
              <Field label="Park" name="park" value={newVehicle.park} />
              <Field label="Gruppo" name="gruppo" value={newVehicle.gruppo} />
              <Field label="Uso Veicolo" name="uso_veicolo" value={newVehicle.uso_veicolo} />
              <Field label="Fleet Network" name="fleet_network" value={newVehicle.fleet_network} />
              <Field label="Sistema Localizzazione" name="sistema_localizzazione" value={newVehicle.sistema_localizzazione} />
              <Field label="Data Ingresso Flotta" type="date" name="dataingressoflotta" value={newVehicle.dataingressoflotta} />
              <Field label="Data Dismissione Prevista" type="date" name="datadismissioneprevista" value={newVehicle.datadismissioneprevista} />
              <Field label="Ultima Prenotazione" type="date" name="ultimaprenotazione" value={newVehicle.ultimaprenotazione} />
            </>
          )}

          {activeTab === "altro" && (
            <>
              <Field label="Promo Car" name="promo_car" type="checkbox" value={newVehicle.promo_car} />
              <Field label="Rent to Rent" name="rent_to_rent" type="checkbox" value={newVehicle.rent_to_rent} />
              <div className="form-field">
                <label>Note Interne</label>
                <textarea name="noteinterne" value={newVehicle.noteinterne || ""} onChange={handleInputChange} style={{ minHeight: 80 }} />
              </div>
              <div className="form-field">
                <label>Printed Note</label>
                <textarea name="printed_note" value={newVehicle.printed_note || ""} onChange={handleInputChange} style={{ minHeight: 80 }} />
              </div>
            </>
          )}
        </div>

        <div className="car-sidebar-footer">
          <button onClick={() => setSidebarOpen(false)}>Annulla</button>
          <button onClick={handleSaveVehicle}>Salva</button>
          {newVehicle.id && (
            <button className="delete" onClick={handleDeleteVehicle}>Elimina</button>
          )}
        </div>
      </div>

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
}
