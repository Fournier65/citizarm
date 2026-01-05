import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@assets/IMG_7582_1767640004029.jpeg";

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

  const navLinks = [
    { href: "/", label: "Accueil" },
    { href: "/#about", label: "À propos" },
    { href: "/#product", label: "Notre Solution" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-white/80 backdrop-blur-md shadow-sm py-3" : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative overflow-hidden rounded-lg shadow-sm border border-slate-100 w-10 h-10 md:w-12 md:h-12 bg-white flex items-center justify-center">
              <img 
                src={logo} 
                alt="citiZarm Logo" 
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" 
              />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-xl md:text-2xl text-slate-900 leading-none">
                citiZarm
              </span>
              <span className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Armer les esprits
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary relative group",
                  location === link.href ? "text-primary" : "text-slate-600"
                )}
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </a>
            ))}
            <Link href="/contact">
              <button className="px-5 py-2.5 rounded-full bg-slate-900 text-white text-sm font-medium hover:bg-primary transition-colors duration-300 shadow-lg shadow-slate-900/10 hover:shadow-primary/25">
                Nous contacter
              </button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-slate-600 hover:text-primary transition-colors"
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
            className="md:hidden bg-white border-b border-slate-100 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-lg font-medium text-slate-600 py-2 border-b border-slate-50"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <Link href="/contact" onClick={() => setIsOpen(false)}>
                <button className="w-full mt-2 py-3 rounded-xl bg-primary text-white font-medium shadow-lg shadow-primary/20">
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
