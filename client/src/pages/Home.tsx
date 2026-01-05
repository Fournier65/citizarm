import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, CheckCircle2, Shield, Users, Vote, MessageSquare } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SectionHeading } from "@/components/SectionHeading";
import logo from "@assets/IMG_7582_1767640004029.jpeg";

// Use an abstract tech/connection background from Unsplash
// Descriptive comment for image replacement:
// <!-- abstract network connection blue technology background -->
const HERO_BG = "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={HERO_BG} 
            alt="Background" 
            className="w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/50 to-white" />
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-8 flex justify-center"
            >
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl shadow-xl overflow-hidden border-4 border-white bg-white">
                <img src={logo} alt="citiZarm Logo" className="w-full h-full object-cover" />
              </div>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display font-extrabold text-5xl md:text-7xl text-slate-900 mb-6 leading-[1.1]"
            >
              Armer les <span className="text-primary">esprits</span> pour la démocratie
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed"
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
                <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-primary text-white font-semibold text-lg shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2">
                  Découvrir notre solution <ArrowRight size={20} />
                </button>
              </a>
              <Link href="/contact">
                <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-slate-700 border border-slate-200 font-semibold text-lg hover:bg-slate-50 hover:border-slate-300 transition-all duration-300">
                  Nous contacter
                </button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="py-24 bg-slate-50">
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
                className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-14 h-14 rounded-xl bg-blue-50 text-primary flex items-center justify-center mb-6">
                  <feature.icon size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 font-display">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCT SECTION */}
      <section id="product" className="py-24 bg-white relative overflow-hidden">
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
              <h2 className="font-display font-bold text-4xl md:text-5xl text-slate-900 mb-6 leading-tight">
                AuxArmesCitoyens.fr
              </h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
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
                  <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                    <CheckCircle2 className="text-green-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <button className="px-8 py-4 rounded-xl bg-slate-900 text-white font-semibold hover:bg-primary transition-colors duration-300 flex items-center gap-2">
                Visiter la plateforme <ArrowRight size={18} />
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-slate-100 bg-white">
                {/* Product UI Mockup Representation */}
                <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <div className="ml-4 flex-1 bg-white h-8 rounded-md border border-slate-200 text-xs text-slate-400 flex items-center px-3">
                    auxarmescitoyens.fr
                  </div>
                </div>
                <div className="p-8 aspect-[4/3] flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-50" />
                  <MessageSquare size={64} className="text-primary mb-4 relative z-10" />
                  <h3 className="text-2xl font-display font-bold text-slate-900 mb-2 relative z-10">Espace Citoyen</h3>
                  <p className="text-slate-500 text-center max-w-xs relative z-10">
                    Connectez-vous pour participer aux débats en cours
                  </p>
                  
                  {/* Abstract UI elements floating */}
                  <div className="absolute top-10 right-10 w-24 h-24 bg-white rounded-xl shadow-lg opacity-60 transform rotate-12 group-hover:rotate-6 transition-transform duration-500" />
                  <div className="absolute bottom-10 left-10 w-32 h-16 bg-white rounded-xl shadow-lg opacity-60 transform -rotate-6 group-hover:-rotate-3 transition-transform duration-500" />
                </div>
              </div>
              
              {/* Decor element */}
              <div className="absolute -z-10 top-10 -right-10 w-full h-full bg-primary/10 rounded-3xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <h2 className="font-display font-bold text-3xl md:text-5xl text-white mb-6">
            Prêt à changer les choses ?
          </h2>
          <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto mb-10">
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
