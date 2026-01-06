import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@assets/IMG_7582_1767640004029.jpeg";
import { ThemeToggle } from "./ThemeToggle";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-background/80 backdrop-blur-md shadow-sm py-3" : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative overflow-hidden rounded-lg shadow-sm border border-border w-10 h-10 md:w-12 md:h-12 bg-background flex items-center justify-center">
              <img 
                src={logo} 
                alt="citiZarm Logo" 
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" 
              />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-xl md:text-2xl text-foreground leading-none">
                citiZarm
              </span>
              <span className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Armer les esprits
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" onClick={() => window.scrollTo(0, 0)} className={cn(
              "text-sm font-medium transition-colors hover:text-primary relative group",
              location === "/" ? "text-primary" : "text-muted-foreground"
            )}>
              Accueil
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
            </Link>
            <a href="/#about" className="text-sm font-medium transition-colors hover:text-primary relative group text-muted-foreground">
              À propos
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
            </a>
            <a href="/#product" className="text-sm font-medium transition-colors hover:text-primary relative group text-muted-foreground">
              Notre Solution
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
            </a>
            <Link href="/contact" onClick={() => window.scrollTo(0, 0)} className={cn(
              "text-sm font-medium transition-colors hover:text-primary relative group",
              location === "/contact" ? "text-primary" : "text-muted-foreground"
            )}>
              Contact
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
            </Link>
            <ThemeToggle />
            <Link href="/contact" onClick={() => window.scrollTo(0, 0)}>
              <button className="px-5 py-2.5 rounded-full bg-foreground text-background text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors duration-300 shadow-lg">
                Nous contacter
              </button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-primary transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-border overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <Link href="/" onClick={() => { setIsOpen(false); window.scrollTo(0, 0); }} className="text-lg font-medium text-muted-foreground py-2 border-b border-border">
                Accueil
              </Link>
              <a href="/#about" onClick={() => setIsOpen(false)} className="text-lg font-medium text-muted-foreground py-2 border-b border-border">
                À propos
              </a>
              <a href="/#product" onClick={() => setIsOpen(false)} className="text-lg font-medium text-muted-foreground py-2 border-b border-border">
                Notre Solution
              </a>
              <Link href="/contact" onClick={() => { setIsOpen(false); window.scrollTo(0, 0); }} className="text-lg font-medium text-muted-foreground py-2 border-b border-border">
                Contact
              </Link>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-muted-foreground">Thème</span>
                <ThemeToggle />
              </div>
              <Link href="/contact" onClick={() => { setIsOpen(false); window.scrollTo(0, 0); }}>
                <button className="w-full mt-2 py-3 rounded-xl bg-primary text-primary-foreground font-medium shadow-lg shadow-primary/20">
                  Prendre rendez-vous
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
