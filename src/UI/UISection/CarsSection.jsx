import { useState } from "react";
import { supabase } from "../../supabaseClient";
import { useVehicles } from "../../hooks/useSupabase";
import "../../UIX/CarSection.css";

export default function CarsSection() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filters, setFilters] = useState({ marca: "", modello: "", categoria: "" });
  const { data: vehicles, refetch: fetchVehicles } = useVehicles();
  const [previewImage, setPreviewImage] = useState(null);

  const initialVehicleState = { /* IDENTICO al tuo */ };

  const [newVehicle, setNewVehicle] = useState(initialVehicleState);

  const FormField = ({ label, type = "text", name, value, onChange, accept }) => {
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
        <label>{label}</label>
        <input
          type={type}
          name={name}
          value={type !== "file" ? value : undefined}
          onChange={onChange}
          accept={accept}
        />
      </div>
    );
  };

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
      fetchVehicles();
      setSidebarOpen(false);
      setPreviewImage(null);
      setNewVehicle(initialVehicleState);
    }
  };

  return (
    <div className="cars-section-container">
      <div className="cars-header">
        <h1>Gestione Veicoli</h1>
        <button
          className="btn-add"
          onClick={() => {
            setNewVehicle(initialVehicleState);
            setSidebarOpen(true);
          }}
        >
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
              <th>Immagine</th><th>ID</th><th>Marca</th><th>Modello</th><th>Targa</th>
              <th>Prezzo</th><th>Valore</th><th>Stato</th><th>In Manut.</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((v) => (
              <tr
                key={v.id}
                onClick={() => {
                  setNewVehicle(v);
                  setSidebarOpen(true);
                }}
              >
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

      {/* ===== SIDEBAR ===== */}
      <div className={`car-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="car-sidebar-header">
          <h2>{newVehicle.id ? "Modifica Auto" : "Aggiungi Auto"}</h2>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>×</button>
        </div>

        <div className="car-sidebar-body">
          <FormField label="Marca" name="marca" value={newVehicle.marca} onChange={handleInputChange} />
          <FormField label="Modello" name="modello" value={newVehicle.modello} onChange={handleInputChange} />
          <FormField label="Targa" name="targa" value={newVehicle.targa} onChange={handleInputChange} />
          <FormField label="Prezzo Giornaliero" type="number" name="prezzogiornaliero" value={newVehicle.prezzogiornaliero} onChange={handleInputChange} />
          <FormField label="Valore Stimato" type="number" name="valoreattualestimato" value={newVehicle.valoreattualestimato} onChange={handleInputChange} />
          <FormField label="Immagine" type="file" name="immaggineauto" onChange={handleInputChange} accept="image/*" />
          {previewImage && <img src={previewImage} className="preview-img" />}
        </div>

        <div className="car-sidebar-footer">
          <button onClick={() => setSidebarOpen(false)}>Annulla</button>
          <button onClick={handleSaveVehicle}>Salva</button>
          {newVehicle.id && (
            <button
              className="delete"
              onClick={async () => {
                await supabase.from("Vehicles").delete().eq("id", newVehicle.id);
                fetchVehicles();
                setSidebarOpen(false);
              }}
            >
              Elimina
            </button>
          )}
        </div>
      </div>

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
}
