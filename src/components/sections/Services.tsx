import { Layers, Palette, Zap, Truck, Shield, Award } from "lucide-react";

const services = [
  {
    icon: Layers,
    title: "Stampa Offset",
    description: "Qualità eccezionale per grandi tirature con colori vividi e precisi.",
  },
  {
    icon: Zap,
    title: "Stampa Digitale",
    description: "Velocità e flessibilità per tirature ridotte e personalizzazioni.",
  },
  {
    icon: Palette,
    title: "Grande Formato",
    description: "Banner, poster e materiali per eventi con impatto visivo.",
  },
  {
    icon: Shield,
    title: "Packaging",
    description: "Scatole e confezioni personalizzate per ogni prodotto.",
  },
  {
    icon: Award,
    title: "Finiture Speciali",
    description: "Nobilitazioni, plastificazioni e trattamenti esclusivi.",
  },
  {
    icon: Truck,
    title: "Consegna Express",
    description: "Spedizioni rapide in tutta Italia entro 24/48 ore.",
  },
];

const Services = () => {
  return (
    <section id="servizi" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full neu-pressed text-sm text-primary font-medium mb-4">
            I Nostri Servizi
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Soluzioni Complete per
            <span className="text-gradient-primary"> Ogni Esigenza</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Dalla progettazione alla consegna, offriamo un servizio completo 
            con tecnologie all'avanguardia e personale esperto.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div
              key={index}
              className="group p-8 rounded-2xl neu-flat hover:shadow-neu-lg transition-all duration-500 hover:-translate-y-2"
              style={{ 
                animationDelay: `${index * 0.1}s`,
              }}
            >
              <div className="w-16 h-16 rounded-xl neu-convex flex items-center justify-center mb-6 group-hover:shadow-glow-primary transition-all duration-300">
                <service.icon className="w-8 h-8 text-primary" />
              </div>
              
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {service.title}
              </h3>
              
              <p className="text-muted-foreground leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
