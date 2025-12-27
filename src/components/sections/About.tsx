import { Button } from "@/components/ui/button";
import { Check, Phone } from "lucide-react";

const features = [
  "Tecnologie di stampa all'avanguardia",
  "Team di grafici e designer esperti",
  "Materiali certificati e sostenibili",
  "Controllo qualità rigoroso",
  "Preventivi gratuiti in 24 ore",
  "Assistenza dedicata pre e post vendita",
];

const About = () => {
  return (
    <section id="about" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Visual */}
          <div className="relative">
            <div className="absolute -inset-4 bg-primary/5 rounded-3xl blur-2xl" />
            
            <div className="relative grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="aspect-square rounded-2xl neu-flat p-6 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gradient-primary">40+</div>
                    <div className="text-sm text-muted-foreground mt-1">Anni di Esperienza</div>
                  </div>
                </div>
                
                <div className="aspect-[4/3] rounded-2xl neu-pressed flex items-center justify-center">
                  <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center">
                    <span className="text-3xl">🏆</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 pt-8">
                <div className="aspect-[4/3] rounded-2xl neu-pressed flex items-center justify-center">
                  <div className="w-16 h-16 rounded-xl bg-accent/20 flex items-center justify-center">
                    <span className="text-3xl">🌿</span>
                  </div>
                </div>
                
                <div className="aspect-square rounded-2xl neu-flat p-6 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gradient-primary">100%</div>
                    <div className="text-sm text-muted-foreground mt-1">Made in Italy</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-8">
            <div>
              <span className="inline-block px-4 py-2 rounded-full neu-pressed text-sm text-primary font-medium mb-4">
                Chi Siamo
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Passione per la
                <span className="text-gradient-primary"> Qualità</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Dal 1985 trasformiamo idee in prodotti stampati di alta qualità. 
                La nostra missione è fornire soluzioni di stampa innovative, 
                sostenibili e su misura per aziende e professionisti.
              </p>
            </div>

            {/* Features List */}
            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg neu-convex flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm text-foreground">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-wrap gap-4 pt-4">
              <Button variant="hero">
                <Phone className="w-5 h-5" />
                Chiamaci Ora
              </Button>
              <Button variant="hero-outline">
                Scopri di Più
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
