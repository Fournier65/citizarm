import { Link } from "wouter";
import { AlertTriangle, Home } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navigation />
      
      <main className="flex-grow flex items-center justify-center px-4">
        <div className="text-center max-w-lg mx-auto p-8 bg-white rounded-2xl shadow-lg border border-slate-100">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={40} className="text-amber-500" />
          </div>
          
          <h1 className="font-display font-bold text-4xl text-slate-900 mb-4">
            Page introuvable
          </h1>
          
          <p className="text-slate-600 mb-8 text-lg">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>

          <Link href="/">
            <button className="px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 mx-auto">
              <Home size={18} />
              Retour à l'accueil
            </button>
          </Link>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
