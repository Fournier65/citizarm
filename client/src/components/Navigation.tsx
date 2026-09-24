import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@assets/IMG_7582_1767640004029-96.webp";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { type Language, useLanguage } from "@/lib/language";

const copy: Record<Language, {
  slogan: string; home: string; about: string; solutions: string; contact: string; contactUs: string; appointment: string; menu: string; closeMenu: string;
}> = {
  fr: { slogan: "Armer les esprits", home: "Accueil", about: "À propos", solutions: "Nos solutions", contact: "Contact", contactUs: "Nous contacter", appointment: "Prendre rendez-vous", menu: "Ouvrir le menu", closeMenu: "Fermer le menu" },
  en: { slogan: "Empowering minds", home: "Home", about: "About", solutions: "Our solutions", contact: "Contact", contactUs: "Contact us", appointment: "Get in touch", menu: "Open menu", closeMenu: "Close menu" },
  it: { slogan: "Formare le menti", home: "Home", about: "Chi siamo", solutions: "Le nostre soluzioni", contact: "Contatti", contactUs: "Contattaci", appointment: "Contattaci", menu: "Apri il menu", closeMenu: "Chiudi il menu" },
  de: { slogan: "Den Geist stärken", home: "Startseite", about: "Über uns", solutions: "Unsere Lösungen", contact: "Kontakt", contactUs: "Kontaktieren", appointment: "Kontakt aufnehmen", menu: "Menü öffnen", closeMenu: "Menü schließen" },
  es: { slogan: "Preparar las mentes", home: "Inicio", about: "Nosotros", solutions: "Nuestras soluciones", contact: "Contacto", contactUs: "Contáctanos", appointment: "Contáctanos", menu: "Abrir menú", closeMenu: "Cerrar menú" },
};

export function Navigation() {
  const { language } = useLanguage();
  const t = copy[language];
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location, navigate] = useLocation();

  const goToSection = (sectionId: string) => {
    if (location !== "/") {
      navigate("/");
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

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
                 {t.slogan}
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
           <div className="hidden xl:flex items-center gap-5">
            <Link href="/" onClick={() => window.scrollTo(0, 0)} className={cn(
              "text-sm font-medium transition-colors hover:text-primary relative group",
              location === "/" ? "text-primary" : "text-muted-foreground"
            )}>
               {t.home}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
            </Link>
            <button 
              onClick={() => goToSection("about")}
              className="text-sm font-medium transition-colors hover:text-primary relative group text-muted-foreground cursor-pointer bg-transparent border-none"
            >
               {t.about}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
            </button>
            <button 
              onClick={() => goToSection("product")}
              className="text-sm font-medium transition-colors hover:text-primary relative group text-muted-foreground cursor-pointer bg-transparent border-none"
            >
               {t.solutions}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
            </button>
            <Link href="/contact" onClick={() => window.scrollTo(0, 0)} className={cn(
              "text-sm font-medium transition-colors hover:text-primary relative group",
              location === "/contact" ? "text-primary" : "text-muted-foreground"
            )}>
               {t.contact}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
            </Link>
            <ThemeToggle />
            <Link href="/contact" onClick={() => window.scrollTo(0, 0)}>
              <button className="px-5 py-2.5 rounded-full bg-foreground text-background text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors duration-300 shadow-lg">
                 {t.contactUs}
              </button>
            </Link>
            <LanguageSwitcher />
          </div>

          {/* Mobile Menu Button */}
           <div className="xl:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
               type="button"
               aria-label={isOpen ? t.closeMenu : t.menu}
               aria-expanded={isOpen}
              className="p-2 text-muted-foreground hover:text-primary transition-colors"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X /> : <Menu />}
            </button>
             <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
             className="xl:hidden bg-background border-b border-border overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <Link href="/" onClick={() => { setIsOpen(false); window.scrollTo(0, 0); }} className="text-lg font-medium text-muted-foreground py-2 border-b border-border">
                 {t.home}
              </Link>
              <button 
                onClick={() => { setIsOpen(false); setTimeout(() => goToSection("about"), 300); }} 
                className="text-lg font-medium text-muted-foreground py-2 border-b border-border cursor-pointer text-left bg-transparent border-none w-full"
              >
                 {t.about}
              </button>
              <button 
                onClick={() => { setIsOpen(false); setTimeout(() => goToSection("product"), 300); }} 
                className="text-lg font-medium text-muted-foreground py-2 border-b border-border cursor-pointer text-left bg-transparent border-none w-full"
              >
                 {t.solutions}
              </button>
              <Link href="/contact" onClick={() => { setIsOpen(false); window.scrollTo(0, 0); }} className="text-lg font-medium text-muted-foreground py-2 border-b border-border">
                 {t.contact}
              </Link>
              <Link href="/contact" onClick={() => { setIsOpen(false); window.scrollTo(0, 0); }}>
                <button className="w-full mt-2 py-3 rounded-xl bg-primary text-primary-foreground font-medium shadow-lg shadow-primary/20">
                   {t.appointment}
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
