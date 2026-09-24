import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";
import { SiX } from "react-icons/si";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SectionHeading } from "@/components/SectionHeading";
import { useSubmitContact } from "@/hooks/use-contact";
import { useLanguage } from "@/lib/language";
import { insertContactSchema } from "@shared/schema";
import { z } from "zod";

type FormData = z.infer<typeof insertContactSchema> & { email: string; message: string };

export default function Contact() {
  const { language } = useLanguage();
  const translations: Record<"fr" | "en" | "it" | "de" | "es", {
    title: string;
    subtitle: string;
    information: string;
    responseTime: string;
    email: string;
    address: string;
    followUs: string;
    fullName: string;
    namePlaceholder: string;
    emailPlaceholder: string;
    subject: string;
    subjectPlaceholder: string;
    message: string;
    messagePlaceholder: string;
    emailError: string;
    messageError: string;
    nameError: string;
    subjectError: string;
    sending: string;
    sendMessage: string;
  }> = {
    fr: {
      title: "Contactez-nous",
      subtitle: "Une question ?",
      information: "Informations",
      responseTime: "Remplissez le formulaire et notre équipe vous répondra dans les 24 heures.",
      email: "E-mail",
      address: "Adresse",
      followUs: "Suivez-nous",
      fullName: "Nom complet",
      namePlaceholder: "Jean Dupont",
      emailPlaceholder: "jean@exemple.fr",
      subject: "Sujet",
      subjectPlaceholder: "Demande d'information...",
      message: "Message",
      messagePlaceholder: "Comment pouvons-nous vous aider ?",
      emailError: "Veuillez saisir une adresse e-mail valide.",
      messageError: "Le message doit contenir au moins 10 caractères.",
      nameError: "Veuillez saisir votre nom.",
      subjectError: "Veuillez saisir un sujet.",
      sending: "Envoi en cours...",
      sendMessage: "Envoyer le message",
    },
    en: {
      title: "Contact us",
      subtitle: "Have a question?",
      information: "Information",
      responseTime: "Fill out the form and our team will get back to you within 24 hours.",
      email: "Email",
      address: "Address",
      followUs: "Follow us",
      fullName: "Full name",
      namePlaceholder: "John Smith",
      emailPlaceholder: "john@example.com",
      subject: "Subject",
      subjectPlaceholder: "Request for information...",
      message: "Message",
      messagePlaceholder: "How can we help you?",
      emailError: "Please enter a valid email address.",
      messageError: "The message must contain at least 10 characters.",
      nameError: "Please enter your name.",
      subjectError: "Please enter a subject.",
      sending: "Sending...",
      sendMessage: "Send message",
    },
    it: {
      title: "Contattaci",
      subtitle: "Hai una domanda?",
      information: "Informazioni",
      responseTime: "Compila il modulo e il nostro team ti risponderà entro 24 ore.",
      email: "E-mail",
      address: "Indirizzo",
      followUs: "Seguici",
      fullName: "Nome completo",
      namePlaceholder: "Mario Rossi",
      emailPlaceholder: "mario@esempio.it",
      subject: "Oggetto",
      subjectPlaceholder: "Richiesta di informazioni...",
      message: "Messaggio",
      messagePlaceholder: "Come possiamo aiutarti?",
      emailError: "Inserisci un indirizzo e-mail valido.",
      messageError: "Il messaggio deve contenere almeno 10 caratteri.",
      nameError: "Inserisci il tuo nome.",
      subjectError: "Inserisci un oggetto.",
      sending: "Invio in corso...",
      sendMessage: "Invia il messaggio",
    },
    de: {
      title: "Kontakt",
      subtitle: "Haben Sie eine Frage?",
      information: "Informationen",
      responseTime: "Füllen Sie das Formular aus. Unser Team antwortet Ihnen innerhalb von 24 Stunden.",
      email: "E-Mail",
      address: "Adresse",
      followUs: "Folgen Sie uns",
      fullName: "Vollständiger Name",
      namePlaceholder: "Max Mustermann",
      emailPlaceholder: "max@beispiel.de",
      subject: "Betreff",
      subjectPlaceholder: "Anfrage für Informationen...",
      message: "Nachricht",
      messagePlaceholder: "Wie können wir Ihnen helfen?",
      emailError: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
      messageError: "Die Nachricht muss mindestens 10 Zeichen enthalten.",
      nameError: "Bitte geben Sie Ihren Namen ein.",
      subjectError: "Bitte geben Sie einen Betreff ein.",
      sending: "Wird gesendet...",
      sendMessage: "Nachricht senden",
    },
    es: {
      title: "Contáctanos",
      subtitle: "¿Tienes alguna pregunta?",
      information: "Información",
      responseTime: "Rellena el formulario y nuestro equipo te responderá en un plazo de 24 horas.",
      email: "Correo electrónico",
      address: "Dirección",
      followUs: "Síguenos",
      fullName: "Nombre completo",
      namePlaceholder: "Juan García",
      emailPlaceholder: "juan@ejemplo.es",
      subject: "Asunto",
      subjectPlaceholder: "Solicitud de información...",
      message: "Mensaje",
      messagePlaceholder: "¿Cómo podemos ayudarte?",
      emailError: "Introduce una dirección de correo electrónico válida.",
      messageError: "El mensaje debe tener al menos 10 caracteres.",
      nameError: "Introduce tu nombre.",
      subjectError: "Introduce un asunto.",
      sending: "Enviando...",
      sendMessage: "Enviar mensaje",
    },
  };
  const t = translations[language];
  const formSchema = insertContactSchema.extend({
    name: z.string().trim().min(1, t.nameError),
    email: z.string().email(t.emailError),
    subject: z.string().trim().min(1, t.subjectError),
    message: z.string().min(10, t.messageError),
  });
  const submitContact = useSubmitContact();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (data: FormData) => {
    submitContact.mutate(data, {
      onSuccess: () => {
        reset();
      }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-32 pb-24">
        <div className="container mx-auto px-4 md:px-6">
          <SectionHeading 
            title={t.title}
            subtitle={t.subtitle}
            align="center" 
            className="mb-16"
          />

          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto">
            {/* Contact Info Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-1"
            >
              <div className="bg-slate-900 text-white rounded-2xl p-8 h-full shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
                
                <h3 className="text-2xl font-display font-bold mb-6 relative z-10 !text-white">{t.information}</h3>
                <p className="text-slate-300 mb-8 relative z-10">
                  {t.responseTime}
                </p>

                <div className="space-y-6 relative z-10">
                  {/* Téléphone masqué temporairement
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                      <Phone size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-slate-400 uppercase tracking-wide">Téléphone</p>
                      <p className="font-semibold text-lg text-white">+33 0 00 00 00 00</p>
                    </div>
                  </div>
                  */}

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                      <Mail size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-slate-400 uppercase tracking-wide">{t.email}</p>
                      <p className="font-semibold text-lg text-white">contact@citizarm.fr</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                      <MapPin size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-slate-400 uppercase tracking-wide">{t.address}</p>
                      <p className="font-semibold text-lg text-white">84, avenue de la République<br/>75011 Paris, France</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                      <SiX size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-slate-400 uppercase tracking-wide">{t.followUs}</p>
                      <a 
                        href="https://x.com/citiZarm89" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-semibold text-lg text-white hover:text-primary transition-colors"
                        data-testid="link-x-contact"
                      >
                        @citiZarm89
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="bg-secondary rounded-2xl p-8 md:p-10 shadow-sm border border-border">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-semibold text-foreground">
                        {t.fullName}
                      </label>
                      <input
                        id="name"
                        type="text"
                        placeholder={t.namePlaceholder}
                        {...register("name")}
                        className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500">{errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-semibold text-foreground">
                        {t.email}
                      </label>
                      <input
                        id="email"
                        type="email"
                        placeholder={t.emailPlaceholder}
                        {...register("email")}
                        className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                      />
                      {errors.email && (
                        <p className="text-sm text-red-500">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-semibold text-foreground">
                      {t.subject}
                    </label>
                    <input
                      id="subject"
                      type="text"
                      placeholder={t.subjectPlaceholder}
                      {...register("subject")}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                    {errors.subject && (
                      <p className="text-sm text-red-500">{errors.subject.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-semibold text-foreground">
                      {t.message}
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      placeholder={t.messagePlaceholder}
                      {...register("message")}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none"
                    />
                    {errors.message && (
                      <p className="text-sm text-red-500">{errors.message.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={submitContact.isPending}
                    className="w-full md:w-auto px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitContact.isPending ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        {t.sending}
                      </>
                    ) : (
                      <>
                        {t.sendMessage}
                        <Send size={18} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
