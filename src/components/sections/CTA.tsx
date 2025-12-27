import { Button } from "@/components/ui/button";
import { ArrowRight, Mail } from "lucide-react";

const CTA = () => {
  return (
    <section id="contatti" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="relative rounded-3xl neu-flat p-8 md:p-16 overflow-hidden">
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/20 rounded-full blur-3xl" />
          
          <div className="relative text-center space-y-6">
            <span className="inline-block px-4 py-2 rounded-full neu-pressed text-sm text-primary font-medium">
              Inizia Oggi
            </span>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              Pronto a Dare Vita
              <br />
              <span className="text-gradient-primary">al Tuo Progetto?</span>
            </h2>
            
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              Richiedi un preventivo gratuito e senza impegno. 
              Il nostro team ti risponderà entro 24 ore.
            </p>
            
            {/* Email Input */}
            <div className="max-w-md mx-auto mt-8">
              <div className="flex gap-3 p-2 rounded-2xl neu-pressed">
                <div className="flex-1 flex items-center gap-3 px-4">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="La tua email..."
                    className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <Button variant="neu-primary" className="px-6">
                  Invia
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">
              🔒 I tuoi dati sono al sicuro. Niente spam, promesso.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
