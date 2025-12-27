import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Printer } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: "Servizi", href: "#servizi" },
    { name: "Prodotti", href: "#prodotti" },
    { name: "Chi Siamo", href: "#about" },
    { name: "Contatti", href: "#contatti" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 py-4 px-6">
      <nav className="max-w-7xl mx-auto neu-flat rounded-2xl px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-xl neu-convex flex items-center justify-center group-hover:shadow-glow-primary transition-all duration-300">
              <Printer className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Tipo<span className="text-gradient-primary">Grafica</span>
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="px-4 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:neu-pressed transition-all duration-300"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Button variant="neu-primary" size="default">
              Preventivo Gratuito
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden w-12 h-12 rounded-xl neu-convex flex items-center justify-center"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-border">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:neu-pressed transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <Button variant="neu-primary" className="mt-2">
                Preventivo Gratuito
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
