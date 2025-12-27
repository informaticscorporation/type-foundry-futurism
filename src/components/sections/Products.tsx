import { Button } from "@/components/ui/button";
import { ShoppingCart, Eye } from "lucide-react";

const products = [
  {
    name: "Biglietti da Visita",
    description: "Premium 400g, finiture speciali",
    price: "29,90",
    priceNote: "da 500 pz",
    tag: "Bestseller",
  },
  {
    name: "Flyer & Volantini",
    description: "A5/A6, carta patinata 170g",
    price: "49,90",
    priceNote: "da 1000 pz",
    tag: null,
  },
  {
    name: "Brochure Pieghevoli",
    description: "A4 piega tripla, offset",
    price: "89,90",
    priceNote: "da 500 pz",
    tag: "Nuovo",
  },
  {
    name: "Poster & Manifesti",
    description: "Grande formato, carta blue back",
    price: "19,90",
    priceNote: "da A2",
    tag: null,
  },
  {
    name: "Cataloghi",
    description: "Rilegatura punto metallico",
    price: "149,90",
    priceNote: "da 100 pz",
    tag: "Pro",
  },
  {
    name: "Roll-up & Banner",
    description: "PVC alta qualità, struttura inclusa",
    price: "79,90",
    priceNote: "85x200 cm",
    tag: "Eventi",
  },
];

const Products = () => {
  return (
    <section id="prodotti" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full neu-pressed text-sm text-primary font-medium mb-4">
            Shop Online
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Prodotti
            <span className="text-gradient-primary"> Più Richiesti</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Ordina online e ricevi direttamente in ufficio. 
            Qualità garantita, prezzi competitivi.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <div
              key={index}
              className="group rounded-2xl neu-flat overflow-hidden hover:shadow-neu-lg transition-all duration-500 hover:-translate-y-2"
            >
              {/* Product Image Placeholder */}
              <div className="relative h-48 neu-pressed m-4 rounded-xl flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
                <div className="w-20 h-20 rounded-xl neu-convex flex items-center justify-center">
                  <svg 
                    viewBox="0 0 40 40" 
                    className="w-10 h-10 text-primary"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <rect x="5" y="8" width="30" height="24" rx="2" />
                    <line x1="5" y1="14" x2="35" y2="14" />
                    <line x1="10" y1="20" x2="25" y2="20" strokeOpacity="0.5" />
                    <line x1="10" y1="24" x2="20" y2="24" strokeOpacity="0.5" />
                  </svg>
                </div>
                
                {product.tag && (
                  <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium shadow-glow-primary">
                    {product.tag}
                  </span>
                )}
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Button variant="neu" size="icon" className="mr-2">
                    <Eye className="w-5 h-5" />
                  </Button>
                  <Button variant="neu-primary" size="icon">
                    <ShoppingCart className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6 pt-2">
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {product.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {product.description}
                </p>
                
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-2xl font-bold text-gradient-primary">
                      €{product.price}
                    </span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {product.priceNote}
                    </span>
                  </div>
                  
                  <Button variant="outline" size="sm">
                    Configura
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button variant="secondary" size="xl">
            Vedi Tutti i Prodotti
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Products;
