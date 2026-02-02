import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import "../../UIX/CarSection.css";

export default function CarsSection() {
  const [popupOpen, setPopupOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [filters, setFilters] = useState({ marca: "", modello: "", categoria: "" });
  const [vehicles, setVehicles] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);

  const initialVehicleState = {
    id: "",
    immaggineauto: null,
    marca: "",
    modello: "",
    targa: "",
    colore: "",
    alimentazione: "",
    cambio: "",
    porte: "",
    kmattuali: "",
    prezzogiornaliero: "",
    valoreattualestimato: "",
    franchigia: "",
    numeroassistenzastradale: "",
    assicurazionebasic: "",
    assicurazioneconfort: "",
    assicurazionepremium: "",
    assicurazionesupertotal: "",
    ultimamanutenzione: "",
    prossimamanutenzione: "",
    ultimaprenotazione: "",
    inmanutenzione: false,
    dataingressoflotta: "",
    datadismissioneprevista: "",
    valoredacquisto: "",
    noteinterne: "",
    categoria: "",
    statofreni: "",
    statooliomotore: "",
    statoliquidodiraffredamento: "",
    statoliquidofreni: "",
    statocarrozzeria: "",
    statovetrispecchietti: "",
    statointerni: "",
    statoclimatizzazione: "",
    statoluci: "",
    statosospenzioni: "",
    company_name: "",
    versione: "",
    cilindrata: "",
    n_telaio: "",
    ex_targa: "",
    data_cambio_targa: "",
    tipo_carburante: "",
    serbatoio: "",
    livello_carburante: "",
    stato_veicolo: "",
    park: "",
    gruppo: "",
    sede: "",
    proprietario: "",
    sistema_localizzazione: "",
    codice_veicolo: "",
    uso_veicolo: "",
    pneumatici: "",
    misura_pneumatici: "",
    proprieta_pneumatici: "",
    fleet_network: "",
    gomme_invernali: false,
    neopatentati: false,
    printed_note: "",
    promo_car: false,
    fuori_servizio: false,
    rent_to_rent: false
  };

  const [newVehicle, setNewVehicle] = useState(initialVehicleState);

  // ===== COMPONENTE FormField =====
  const FormField = ({ label, type = "text", name, value, onChange, options, accept }) => {
    if (type === "checkbox") {
      return (
        <label className="checkbox-label">
          <input type="checkbox" name={name} checked={value} onChange={onChange} />
          {label}
        </label>
      );
    }

    return (
      <div className="form-field">
        {label && <label htmlFor={name}>{label}</label>}
        {type === "select" ? (
          <select name={name} id={name} value={value} onChange={onChange}>
            {options?.map((opt, idx) => (
              <option key={idx} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            name={name}
            id={name}
            value={type !== "file" ? value : undefined}
            onChange={onChange}
            accept={accept}
          />
        )}
      </div>
    );
  };

  // ===== FETCH VEHICLES =====
  const fetchVehicles = async () => {
    const { data, error } = await supabase
      .from("Vehicles")
      .select("*")
      .order("datacreazione", { ascending: false });
    if (error) console.log(error);
    else setVehicles(data || []);
  };

  useEffect(() => { fetchVehicles(); }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filteredData = vehicles.filter(
    v =>
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

  const generateVehicleId = () => {
    const letters = Math.random().toString(36).substring(2, 4).toUpperCase();
    const numbers = Math.floor(100 + Math.random() * 900);
    return letters + numbers;
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  // ===== SAVE VEHICLE =====
  const handleSaveVehicle = async () => {
    let vehicleToInsert = { ...newVehicle };
    if (!vehicleToInsert.id) vehicleToInsert.id = generateVehicleId();

    const numericFields = [
      "porte","kmattuali","prezzogiornaliero","valoreattualestimato",
      "franchigia","numeroassistenzastradale","assicurazionebasic",
      "assicurazioneconfort","assicurazionepremium","assicurazionesupertotal",
      "valoredacquisto","cilindrata","serbatoio","livello_carburante"
    ];
    numericFields.forEach(f => {
      vehicleToInsert[f] = vehicleToInsert[f] === "" ? null : Number(vehicleToInsert[f]);
    });

    const dateFields = [
      "ultimamanutenzione","prossimamanutenzione","ultimaprenotazione",
      "dataingressoflotta","datadismissioneprevista","data_cambio_targa"
    ];
    dateFields.forEach(f => { if (!vehicleToInsert[f]) vehicleToInsert[f] = null; });

    // Upload immagine
    if (vehicleToInsert.immaggineauto instanceof File) {
      const file = vehicleToInsert.immaggineauto;
      const extension = file.name.split(".").pop();
      const filePath = `${vehicleToInsert.id}.${extension}`;
      const { error: uploadError } = await supabase.storage.from("Archivio/Auto").upload(filePath, file, { upsert: true });
      if (uploadError) console.log(uploadError);
      else vehicleToInsert.immaggineauto = filePath;
    }

    const { error } = vehicleToInsert.id && vehicles.some(v => v.id === vehicleToInsert.id)
      ? await supabase.from("Vehicles").update(vehicleToInsert).eq("id", vehicleToInsert.id)
      : await supabase.from("Vehicles").insert([vehicleToInsert]);

    if (error) console.log(error);
    else {
      fetchVehicles();
      setPopupOpen(false);
      setPreviewImage(null);
      setNewVehicle(initialVehicleState);
      setCurrentStep(1);
    }
  };

  return (
    <div className="cars-section-container">
      {/* HEADER */}
      <div className="cars-header">
        <h1>Gestione Veicoli</h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="btn-add" onClick={() => setPopupOpen(true)}>Aggiungi Auto</button>
        </div>
      </div>

      {/* FILTRI */}
      <div className="cars-filters">
        <input type="text" name="marca" placeholder="Marca" onChange={handleFilterChange} />
        <input type="text" name="modello" placeholder="Modello" onChange={handleFilterChange} />
        <input type="text" name="categoria" placeholder="Categoria" onChange={handleFilterChange} />
      </div>

      {/* TABELLA */}
      <div className="cars-table-container">
        <table className="cars-table">
          <thead>
            <tr>
              <th>Immagine</th>
              <th>ID</th>
              <th>Marca</th>
              <th>Modello</th>
              <th>Targa</th>
              <th>Prezzo</th>
              <th>Valore</th>
              <th>Stato</th>
              <th>In Manut.</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map(v => (
              <tr key={v.id} onClick={() => { setNewVehicle(v); setPopupOpen(true); setCurrentStep(1); }}>
                <td>{v.immaggineauto ? <img src={`https://jurzdzkpkfxsoehfxgeg.supabase.co/storage/v1/object/public/Archivio/Auto/${v.immaggineauto}`} width={50} /> : "-"}</td>
                <td>{v.id}</td>
                <td>{v.marca}</td>
                <td>{v.modello}</td>
                <td>{v.targa}</td>
                <td>{v.prezzogiornaliero}</td>
                <td>{v.valoreattualestimato}</td>
                <td>{v.stato_veicolo}</td>
                <td>{v.inmanutenzione ? "Sì" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* POPUP */}
      {popupOpen && (
        <div className="popup-overlay">
          <div className="popup-content">
            <button className="popup-close" onClick={() => { setPopupOpen(false); setPreviewImage(null); }}>×</button>
            <h2>{newVehicle.id ? "Modifica Auto" : "Aggiungi Auto"}</h2>

            {/* STEP 1: Info Base + Immagine */}
            {currentStep === 1 && (
              <div className="form-step active">
                <FormField label="Marca" name="marca" value={newVehicle.marca} onChange={handleInputChange} />
                <FormField label="Modello" name="modello" value={newVehicle.modello} onChange={handleInputChange} />
                <FormField label="Categoria" name="categoria" value={newVehicle.categoria} onChange={handleInputChange} />
                <FormField label="Targa" name="targa" value={newVehicle.targa} onChange={handleInputChange} />
                <FormField label="Colore" name="colore" value={newVehicle.colore} onChange={handleInputChange} />
                <FormField label="Alimentazione" name="alimentazione" value={newVehicle.alimentazione} onChange={handleInputChange} />
                <FormField label="Cambio" name="cambio" value={newVehicle.cambio} onChange={handleInputChange} />
                <FormField label="Porte" type="number" name="porte" value={newVehicle.porte} onChange={handleInputChange} />
                <FormField label="Immagine Auto" type="file" name="immaggineauto" onChange={handleInputChange} accept="image/*" />
                {previewImage && <img src={previewImage} className="preview-img" />}
              </div>
            )}

            {/* STEP 2: Prezzi, Assicurazioni, Flags */}
            {currentStep === 2 && (
              <div className="form-step active">
                <FormField label="Prezzo Giornaliero" type="number" name="prezzogiornaliero" value={newVehicle.prezzogiornaliero} onChange={handleInputChange} />
                <FormField label="Valore Attuale Stimato" type="number" name="valoreattualestimato" value={newVehicle.valoreattualestimato} onChange={handleInputChange} />
                <FormField label="Franchigia" type="number" name="franchigia" value={newVehicle.franchigia} onChange={handleInputChange} />
                <FormField label="Assicurazione Basic" type="number" name="assicurazionebasic" value={newVehicle.assicurazionebasic} onChange={handleInputChange} />
                <FormField label="Assicurazione Confort" type="number" name="assicurazioneconfort" value={newVehicle.assicurazioneconfort} onChange={handleInputChange} />
                <FormField label="Assicurazione Premium" type="number" name="assicurazionepremium" value={newVehicle.assicurazionepremium} onChange={handleInputChange} />
                <FormField label="Assicurazione Super Total" type="number" name="assicurazionesupertotal" value={newVehicle.assicurazionesupertotal} onChange={handleInputChange} />
                <FormField label="Gomme Invernali" type="checkbox" name="gomme_invernali" value={newVehicle.gomme_invernali} onChange={handleInputChange} />
                <FormField label="Neopatentati" type="checkbox" name="neopatentati" value={newVehicle.neopatentati} onChange={handleInputChange} />
                <FormField label="Promo Car" type="checkbox" name="promo_car" value={newVehicle.promo_car} onChange={handleInputChange} />
                <FormField label="Fuori Servizio" type="checkbox" name="fuori_servizio" value={newVehicle.fuori_servizio} onChange={handleInputChange} />
                <FormField label="Rent to Rent" type="checkbox" name="rent_to_rent" value={newVehicle.rent_to_rent} onChange={handleInputChange} />
              </div>
            )}

            {/* STEP 3: Stato veicolo, manutenzione e dettagli */}
            {currentStep === 3 && (
              <div className="form-step active">
                <FormField label="Stato Veicolo" name="stato_veicolo" value={newVehicle.stato_veicolo} onChange={handleInputChange} />
                <FormField label="In Manutenzione" type="checkbox" name="inmanutenzione" value={newVehicle.inmanutenzione} onChange={handleInputChange} />
                <FormField label="Ultima Manutenzione" type="date" name="ultimamanutenzione" value={newVehicle.ultimamanutenzione} onChange={handleInputChange} />
                <FormField label="Prossima Manutenzione" type="date" name="prossimamanutenzione" value={newVehicle.prossimamanutenzione} onChange={handleInputChange} />
                <FormField label="Ultima Prenotazione" type="date" name="ultimaprenotazione" value={newVehicle.ultimaprenotazione} onChange={handleInputChange} />
                <FormField label="Data Ingresso Flotta" type="date" name="dataingressoflotta" value={newVehicle.dataingressoflotta} onChange={handleInputChange} />
                <FormField label="Data Dismissione Prevista" type="date" name="datadismissioneprevista" value={newVehicle.datadismissioneprevista} onChange={handleInputChange} />
                <FormField label="Note Interne" name="noteinterne" value={newVehicle.noteinterne} onChange={handleInputChange} />
              </div>
            )}

            <div className="step-navigation">
              {currentStep > 1 && <button className="popup-btn" onClick={prevStep}>Indietro</button>}
              {currentStep < 3 && <button className="popup-btn" onClick={nextStep}>Avanti</button>}
              {currentStep === 3 && (
                <>
                  <button className="popup-btn" onClick={handleSaveVehicle}>Salva</button>
                  {newVehicle.id && (
                    <button
                      className="popup-btn delete"
                      onClick={async () => {
                        if (window.confirm("Sei sicuro di voler eliminare questo veicolo?")) {
                          const { error } = await supabase.from("Vehicles").delete().eq("id", newVehicle.id);
                          if (error) console.log(error);
                          else {
                            fetchVehicles();
                            setPopupOpen(false);
                            setNewVehicle(initialVehicleState);
                            setPreviewImage(null);
                          }
                        }
                      }}
                    >Elimina</button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
