import "../UIX/Home.css";
import { useState } from "react";
import Navbar from "../UI/Navbar";
import Hero from "../UI/Hero";

export default function Home() {
    const [menuOpen, setMenuOpen] = useState(false);
    return (
        <div className="home-container">  
            <Navbar  setMenuOpen={setMenuOpen} menuOpen={menuOpen} />
            <Hero menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
        </ div>
    )
}