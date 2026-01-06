import { useState } from "react";
import { Link } from "wouter";
import { ArrowRight, Twitter, Linkedin, Facebook, Mail, MapPin } from "lucide-react";
import { useSubscribeNewsletter } from "@/hooks/use-contact";
import logo from "@assets/IMG_7582_1767640004029.jpeg";

export function Footer() {
  const [email, setEmail] = useState("");
  const subscribe = useSubscribeNewsletter();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    subscribe.mutate({ email }, {
      onSuccess: () => setEmail("")
    });
  };

  return (
    <footer className="bg-slate-900 text-white pt-20 pb-10 overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-blue-600 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-indigo-600 blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white p-0.5 overflow-hidden">
                <img src={logo} alt="citiZarm" className="w-full h-full object-cover rounded-md" />
              </div>
              <span className="font-display font-bold text-2xl tracking-tight">citiZarm</span>
            </Link>
            <p className="text-slate-400 leading-relaxed max-w-sm">
              Développer la démocratie directe grâce à des outils numériques innovants. 
              Armer les esprits pour une citoyenneté éclairée et active.
            </p>
            <div className="flex gap-4 pt-2">
              {[Twitter, Linkedin, Facebook].map((Icon, i) => (
                <a 
                  key={i} 
                  href="#" 
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 text-slate-400"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-2 space-y-6">
            <h4 className="font-display font-semibold text-lg !text-white">Navigation</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" onClick={() => window.scrollTo(0, 0)} className="text-slate-400 hover:text-primary transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <a href="/#about" className="text-slate-400 hover:text-primary transition-colors">
                  À propos
                </a>
              </li>
              <li>
                <a href="/#product" className="text-slate-400 hover:text-primary transition-colors">
                  Notre Solution
                </a>
              </li>
              <li>
                <Link href="/contact" onClick={() => window.scrollTo(0, 0)} className="text-slate-400 hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <h4 className="font-display font-semibold text-lg !text-white">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-slate-400">
                <MapPin className="shrink-0 mt-1 text-primary" size={18} />
                <span>
                  123 Avenue de la République<br />
                  75011 Paris, France
                </span>
              </li>
              <li className="flex items-center gap-3 text-slate-400">
                <Mail className="shrink-0 text-primary" size={18} />
                <a href="mailto:contact@citizarm.fr" className="hover:text-white transition-colors">
                  contact@citizarm.fr
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="lg:col-span-3 space-y-6">
            <h4 className="font-display font-semibold text-lg !text-white">Newsletter</h4>
            <p className="text-slate-400 text-sm">
              Restez informé de nos dernières innovations démocratiques.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Votre adresse email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
                <button
                  type="submit"
                  disabled={subscribe.isPending}
                  className="absolute right-1 top-1 p-2 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  <ArrowRight size={18} />
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>© {new Date().getFullYear()} citiZarm. Tous droits réservés.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Mentions légales</a>
            <a href="#" className="hover:text-white transition-colors">Politique de confidentialité</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
