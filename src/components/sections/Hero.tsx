import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const Hero = () => {
  return (
    <section className="min-h-screen flex items-center justify-center pt-24 pb-16 px-6">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full neu-flat text-sm text-muted-foreground animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Stampa Professionale dal 1985</span>
            </div>

            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight animate-slide-up"
              style={{ animationDelay: "0.2s" }}
            >
              Le Tue Idee
              <br />
              <span className="text-gradient-primary">Prendono Forma</span>
            </h1>

            <p 
              className="text-lg text-muted-foreground max-w-lg animate-slide-up"
              style={{ animationDelay: "0.3s", opacity: 0 }}
            >
              Trasformiamo la tua visione in realtà con tecnologie di stampa 
              all'avanguardia. Qualità superiore, consegne rapide, 
              soluzioni personalizzate.
            </p>

            <div 
              className="flex flex-wrap gap-4 animate-slide-up"
              style={{ animationDelay: "0.4s", opacity: 0 }}
            >
              <Button variant="hero" size="xl">
                Scopri i Prodotti
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button variant="hero-outline" size="xl">
                Richiedi Preventivo
              </Button>
            </div>

            {/* Stats */}
            <div 
              className="grid grid-cols-3 gap-6 pt-8 animate-slide-up"
              style={{ animationDelay: "0.5s", opacity: 0 }}
            >
              {[
                { value: "40+", label: "Anni Esperienza" },
                { value: "15k+", label: "Clienti Soddisfatti" },
                { value: "99%", label: "Consegne Puntuali" },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-gradient-primary">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual Element */}
          <div className="relative flex items-center justify-center">
            <div className="absolute w-80 h-80 rounded-full bg-primary/10 blur-3xl animate-pulse-glow" />
            
            {/* Main Card */}
            <div className="relative w-full max-w-md aspect-square neu-flat rounded-3xl p-8 animate-float">
              <div className="absolute inset-4 rounded-2xl neu-pressed flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/20 flex items-center justify-center">
                    <svg 
                      viewBox="0 0 100 100" 
                      className="w-12 h-12 text-primary"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="10" y="20" width="80" height="60" rx="4" />
                      <rect x="25" y="35" width="50" height="30" rx="2" className="fill-primary/30" />
                      <line x1="10" y1="45" x2="25" y2="45" />
                      <line x1="75" y1="45" x2="90" y2="45" />
                      <circle cx="50" cy="12" r="6" className="fill-primary" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">
                    Stampa Premium
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Qualità professionale per ogni progetto
                  </p>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div 
              className="absolute top-0 right-0 w-24 h-24 neu-convex rounded-2xl flex items-center justify-center animate-float"
              style={{ animationDelay: "1s" }}
            >
              <span className="text-3xl">🎨</span>
            </div>
            
            <div 
              className="absolute bottom-10 left-0 w-20 h-20 neu-convex rounded-2xl flex items-center justify-center animate-float"
              style={{ animationDelay: "2s" }}
            >
              <span className="text-2xl">📦</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
