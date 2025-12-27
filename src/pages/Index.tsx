import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Hero from "@/components/sections/Hero";
import Services from "@/components/sections/Services";
import Products from "@/components/sections/Products";
import About from "@/components/sections/About";
import CTA from "@/components/sections/CTA";
import Footer from "@/components/layout/Footer";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>TipoGrafica - Stampa Professionale Online | Tipografia Milano</title>
        <meta 
          name="description" 
          content="Tipografia professionale a Milano dal 1985. Stampa offset e digitale, biglietti da visita, flyer, brochure, poster e packaging. Preventivi gratuiti e consegne rapide." 
        />
        <meta name="keywords" content="tipografia milano, stampa online, biglietti da visita, flyer, brochure, stampa professionale" />
        <link rel="canonical" href="https://tipografica.it" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <Hero />
          <Services />
          <Products />
          <About />
          <CTA />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
