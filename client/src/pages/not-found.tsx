import { Link } from "wouter";
import { AlertTriangle, Home } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { type Language, useLanguage } from "@/lib/language";

const copy: Record<Language, { title: string; description: string; home: string }> = {
  fr: { title: "Page introuvable", description: "Désolé, la page que vous recherchez n'existe pas ou a été déplacée.", home: "Retour à l'accueil" },
  en: { title: "Page not found", description: "Sorry, the page you're looking for doesn't exist or has moved.", home: "Back to home" },
  it: { title: "Pagina non trovata", description: "La pagina che cerchi non esiste o è stata spostata.", home: "Torna alla home" },
  de: { title: "Seite nicht gefunden", description: "Die gesuchte Seite existiert nicht oder wurde verschoben.", home: "Zur Startseite" },
  es: { title: "Página no encontrada", description: "Lo sentimos, la página que buscas no existe o se ha movido.", home: "Volver al inicio" },
};

export default function NotFound() {
  const { language } = useLanguage();
  const t = copy[language];
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navigation />
      
      <main className="flex-grow flex items-center justify-center px-4">
        <div className="text-center max-w-lg mx-auto p-8 bg-white rounded-2xl shadow-lg border border-slate-100">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={40} className="text-amber-500" />
          </div>
          
          <h1 className="font-display font-bold text-4xl text-slate-900 mb-4">
             {t.title}
          </h1>
          
          <p className="text-slate-600 mb-8 text-lg">
             {t.description}
          </p>

          <Link href="/">
            <button className="px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 mx-auto">
              <Home size={18} />
               {t.home}
            </button>
          </Link>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
