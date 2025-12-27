import { Printer, MapPin, Phone, Mail, Clock } from "lucide-react";

const Footer = () => {
  const links = {
    prodotti: ["Biglietti da Visita", "Flyer", "Brochure", "Poster", "Cataloghi", "Packaging"],
    servizi: ["Stampa Offset", "Stampa Digitale", "Grande Formato", "Finiture Speciali"],
    azienda: ["Chi Siamo", "Lavora con Noi", "Blog", "Contatti"],
  };

  return (
    <footer className="py-16 px-6 border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-6">
            <a href="/" className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl neu-convex flex items-center justify-center">
                <Printer className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xl font-bold text-foreground">
                Tipo<span className="text-gradient-primary">Grafica</span>
              </span>
            </a>
            
            <p className="text-muted-foreground max-w-sm">
              Dal 1985 al tuo fianco per trasformare ogni idea in un prodotto 
              stampato di qualità superiore.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="w-5 h-5 text-primary" />
                <span>Via della Stampa, 42 - 20121 Milano</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Phone className="w-5 h-5 text-primary" />
                <span>+39 02 1234 5678</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="w-5 h-5 text-primary" />
                <span>info@tipografica.it</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Clock className="w-5 h-5 text-primary" />
                <span>Lun-Ven: 9:00 - 18:00</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Prodotti</h4>
            <ul className="space-y-2">
              {links.prodotti.map((link) => (
                <li key={link}>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Servizi</h4>
            <ul className="space-y-2">
              {links.servizi.map((link) => (
                <li key={link}>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Azienda</h4>
            <ul className="space-y-2">
              {links.azienda.map((link) => (
                <li key={link}>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 TipoGrafica. Tutti i diritti riservati. P.IVA 12345678901
          </p>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Cookie Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Termini di Servizio</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
