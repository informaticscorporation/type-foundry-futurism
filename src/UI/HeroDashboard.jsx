import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import "../UIX/Dashboard.css";
import CarsSection from "./UISection/CarsSection";
import BookingSection from "./UISection/BookingSection";
import CalendarBooking from "./UISection/CalendarBooking";
import DashboardSection from "./UISection/DashboardSection";
import CalendarioInterno from "./UISection/CalendarioInterno";
import ClientiSection from "./UISection/ClientiSection";
import PagamentiSection from "./UISection/PagamentiSection";

export default function HeroDashboard({ menuOpen, setMobileMenuOpen }) {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setMobile(window.innerWidth <= 768);
    handleResize(); // inizializza lo stato
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const openMenuButton = mobile ? (
    <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(true)}>
      <Menu size={24} /> Apri Menu
    </button>
  ) : null;

  /* ======== RENDER CONTENUTO DINAMICO ======== */
  const renderContent = () => {
    switch (menuOpen) {
      case "dashboard":
        return <div className="section">{openMenuButton}<DashboardSection /></div>;
      case "cars":
        return <div className="section">{openMenuButton}<CarsSection /></div>;
      case "contracts":
        return <div className="section">{openMenuButton}<h1>Contratti</h1></div>;
      case "bookings":
        return <div className="section">{openMenuButton}<BookingSection /></div>;
      case "calendarRentals":
        return <div className="section">{openMenuButton}<CalendarBooking /></div>;
      case "calendarInternal":
        return <div className="section">{openMenuButton}<CalendarioInterno /></div>;
     
      case "clients":
        return <div className="section">{openMenuButton}<ClientiSection /></div>;
      case "payments":
        return <div className="section">{openMenuButton}<PagamentiSection /></div>;
      case "reports":
        return <div className="section">{openMenuButton}<h1>Report</h1></div>;
      case "settings":
        return <div className="section">{openMenuButton}<h1>Impostazioni</h1></div>;
      default:
        return <div className="section">{openMenuButton}<h1>Dashboard</h1></div>;
    }
  };

  return <div className="hero-dashboard-container">{renderContent()}</div>;
}
