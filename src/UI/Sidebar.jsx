import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Car,
  CalendarDays,
  Users,
  Wallet,
  BarChart3,
  Settings,
  ClipboardList,
} from "lucide-react";
import "../UIX/Sidebar.css";

export default function Sidebar({ menuOpen, setMenuOpen, mobileMenuOpen, setMobileMenuOpen }) {
  const [mobile, setMobile] = useState(false);

  const buttons = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { id: "reports", label: "Report", icon: <BarChart3 size={20} /> },
    { id: "cars", label: "Auto", icon: <Car size={20} /> },
    { id: "contracts", label: "Contratti", icon: <ClipboardList size={20} /> },
    { id: "bookings", label: "Prenotazioni", icon: <ClipboardList size={20} /> },
    { id: "calendarRentals", label: "Calendario Noleggi", icon: <CalendarDays size={20} /> },
    { id: "calendarInternal", label: "Calendario Interno", icon: <CalendarDays size={20} /> },
    
    { id: "clients", label: "Clienti", icon: <Users size={20} /> },
    { id: "payments", label: "Pagamenti", icon: <Wallet size={20} /> },
    { id: "settings", label: "Impostazioni", icon: <Settings size={20} /> },
  ];

  useEffect(() => {
    setMobile(window.innerWidth <= 768);
  }, []);

  return (
    <div className={`sidebar-container ${mobileMenuOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <img className="logo" src="/logo.webp" alt="Logo" />
      </div>

      <div className="sidebar-menu">
        {buttons.map((btn) => (
          <button
            key={btn.id}
            className={`sidebar-btn ${menuOpen === btn.id ? "active" : ""}`}
            onClick={() => {
              setMenuOpen(btn.id);
              if (mobile) setMobileMenuOpen(false);
            }}
          >
            {btn.icon}
            <span>{btn.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
