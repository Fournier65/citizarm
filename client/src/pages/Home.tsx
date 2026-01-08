import { useState, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, CheckCircle2, Shield, Users, Vote, ChevronLeft, ChevronRight } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SectionHeading } from "@/components/SectionHeading";
import logo from "@assets/IMG_7582_1767640004029.jpeg";
import aacScreenshot1 from "@assets/image_1767721768477.png";
import aacScreenshot2 from "@assets/image_1767722378330.png";
import aacScreenshot3 from "@assets/image_1767722411166.png";
import aacScreenshot4 from "@assets/image_1767722513225.png";
import aacScreenshot5 from "@assets/image_1767722701881.png";
import aacScreenshot6 from "@assets/image_1767722742410.png";

const screenshots = [
  aacScreenshot1,
  aacScreenshot2,
  aacScreenshot6,
  aacScreenshot3,
  aacScreenshot4,
  aacScreenshot5,
];

function ScreenshotCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  // Preload all carousel images on mount for smoother transitions
  useEffect(() => {
    screenshots.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % screenshots.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const goToPrevious = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + screenshots.length) % screenshots.length);
  };

  const goToNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % screenshots.length);
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x < -threshold) {
      goToNext();
    } else if (info.offset.x > threshold) {
      goToPrevious();
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? "-100%" : "100%",
      opacity: 0,
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative"
    >
      <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-border bg-background">
        {/* Browser Chrome */}
        <div className="bg-secondary border-b border-border p-4 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
          <div className="ml-4 flex-1 bg-background h-8 rounded-md border border-border" />
        </div>
        
        {/* Screenshot with slide transition and swipe support */}
        <div 
          className="relative aspect-[16/10] overflow-hidden touch-pan-y"
        >
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.img
              key={currentIndex}
              src={screenshots[currentIndex]}
              alt={`AuxArmesCitoyens.fr - Capture ${currentIndex + 1}`}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "tween", duration: 0.4, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full object-cover object-left-top cursor-grab active:cursor-grabbing"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
            />
          </AnimatePresence>
        </div>

        {/* Navigation arrows - hidden on mobile */}
        <button
          onClick={goToPrevious}
          className="absolute left-3 top-1/2 translate-y-2 z-20 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border hidden md:flex items-center justify-center text-foreground hover:bg-background transition-colors"
          data-testid="button-carousel-prev"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-3 top-1/2 translate-y-2 z-20 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border hidden md:flex items-center justify-center text-foreground hover:bg-background transition-colors"
          data-testid="button-carousel-next"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center gap-2 mt-4">
        {screenshots.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > currentIndex ? 1 : -1);
              setCurrentIndex(index);
            }}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex 
                ? "bg-primary w-6" 
                : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
            }`}
            data-testid={`button-carousel-dot-${index}`}
          />
        ))}
      </div>
      
      {/* Decor element */}
      <div className="absolute -z-10 top-10 -right-10 w-full h-full bg-primary/10 rounded-3xl" />
    </motion.div>
  );
}

// Use an abstract tech/connection background from Unsplash
// Descriptive comment for image replacement:
// <!-- abstract network connection blue technology background -->
const HERO_BG = "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center pt-20 pb-16 md:pb-0 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={HERO_BG} 
            alt="Background" 
            className="w-full h-full object-cover opacity-10 dark:opacity-5"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background" />
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-8 flex justify-center"
            >
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl shadow-xl overflow-hidden border-4 border-background bg-background">
                <img src={logo} alt="citiZarm Logo" className="w-full h-full object-cover" />
              </div>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display font-extrabold text-5xl md:text-7xl text-foreground mb-6 leading-[1.1]"
            >
              Armer les <span className="text-primary">esprits</span> pour la démocratie
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Chez citiZarm, nous développons des outils numériques innovants pour renforcer 
              la démocratie directe et permettre à chaque citoyen de s'exprimer.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <a href="#product">
                <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold text-lg shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2">
                  Découvrir notre solution <ArrowRight size={20} />
                </button>
              </a>
              <Link href="/contact">
                <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-secondary text-secondary-foreground border border-border font-semibold text-lg hover:bg-muted transition-all duration-300">
                  Nous contacter
                </button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="py-24 bg-secondary">
        <div className="container mx-auto px-4 md:px-6">
          <SectionHeading 
            title="Notre Mission" 
            subtitle="Qui sommes-nous" 
            align="center" 
          />
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Confiance & Transparence",
                description: "Nous créons des espaces numériques sécurisés où la parole citoyenne est protégée et valorisée."
              },
              {
                icon: Vote,
                title: "Démocratie Directe",
                description: "Nos outils visent à raccourcir la distance entre les citoyens et la prise de décision politique."
              },
              {
                icon: Users,
                title: "Engagement Collectif",
                description: "Nous croyons en l'intelligence collective pour résoudre les défis de notre société."
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-background p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                  <feature.icon size={32} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3 font-display">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCT SECTION */}
      <section id="product" className="py-24 bg-background relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">
                Notre Application Phare
              </span>
              <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-6 leading-tight">
                AuxArmesCitoyens.fr
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Une plateforme révolutionnaire conçue pour redonner le pouvoir d'agir aux citoyens.
                Débattez, proposez, et votez sur les sujets qui comptent vraiment pour votre communauté.
              </p>
              
              <ul className="space-y-4 mb-10">
                {[
                  "Débats modérés et constructifs",
                  "Sondages sécurisés et vérifiés",
                  "Propositions citoyennes directes",
                  "Interface intuitive et accessible"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-foreground font-medium">
                    <CheckCircle2 className="text-green-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <a href="https://auxarmescitoyens.fr" target="_blank" rel="noopener noreferrer">
                <button className="px-8 py-4 rounded-xl bg-foreground text-background font-semibold hover:bg-primary hover:text-primary-foreground transition-colors duration-300 flex items-center gap-2">
                  Visiter la plateforme <ArrowRight size={18} />
                </button>
              </a>
            </motion.div>

            <ScreenshotCarousel />
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <h2 className="font-display font-bold text-3xl md:text-5xl !text-white mb-6">
            Prêt à changer les choses ?
          </h2>
          <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Rejoignez le mouvement citiZarm et participez à la construction de la démocratie de demain.
          </p>
          <Link href="/contact">
            <button className="px-10 py-5 rounded-full bg-white text-primary font-bold text-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              Contactez-nous aujourd'hui
            </button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
