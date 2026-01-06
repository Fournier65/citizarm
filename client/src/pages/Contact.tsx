import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SectionHeading } from "@/components/SectionHeading";
import { useSubmitContact } from "@/hooks/use-contact";
import { insertContactSchema } from "@shared/schema";
import { z } from "zod";

// Create a schema that works with the form (make fields required string for hook-form)
const formSchema = insertContactSchema.extend({
  email: z.string().email("Email invalide"),
  message: z.string().min(10, "Le message doit faire au moins 10 caractères"),
});

type FormData = z.infer<typeof formSchema>;

export default function Contact() {
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
            title="Contactez-nous" 
            subtitle="Une question ?" 
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
              <div className="bg-foreground text-background rounded-2xl p-8 h-full shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
                
                <h3 className="text-2xl font-display font-bold mb-6 relative z-10">Informations</h3>
                <p className="text-muted mb-8 relative z-10 opacity-80">
                  Remplissez le formulaire et notre équipe vous répondra dans les 24 heures.
                </p>

                <div className="space-y-6 relative z-10">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center shrink-0">
                      <Phone size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm opacity-60 uppercase tracking-wide">Téléphone</p>
                      <p className="font-semibold text-lg">+33 1 23 45 67 89</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center shrink-0">
                      <Mail size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm opacity-60 uppercase tracking-wide">Email</p>
                      <p className="font-semibold text-lg">contact@citizarm.fr</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center shrink-0">
                      <MapPin size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm opacity-60 uppercase tracking-wide">Adresse</p>
                      <p className="font-semibold text-lg">123 Avenue de la République<br/>75011 Paris, France</p>
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
                        Nom complet
                      </label>
                      <input
                        id="name"
                        type="text"
                        placeholder="Jean Dupont"
                        {...register("name")}
                        className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500">{errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-semibold text-foreground">
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        placeholder="jean@exemple.fr"
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
                      Sujet
                    </label>
                    <input
                      id="subject"
                      type="text"
                      placeholder="Demande d'information..."
                      {...register("subject")}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                    {errors.subject && (
                      <p className="text-sm text-red-500">{errors.subject.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-semibold text-foreground">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      placeholder="Comment pouvons-nous vous aider ?"
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
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        Envoyer le message
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
