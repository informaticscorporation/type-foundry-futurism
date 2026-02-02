import { useState } from "react";
import Sidebar from "../UI/Sidebar";
import HeroDashboard from "../UI/HeroDashboard";
import "../UIX/Dashboard.css";

export default function Dashboard() {
  const [menuOpen, setMenuOpen] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="dashboard-container">
      <Sidebar menuOpen={menuOpen} setMenuOpen={setMenuOpen} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <HeroDashboard menuOpen={menuOpen} setMenuOpen={setMenuOpen} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
    </div>
  );
}
