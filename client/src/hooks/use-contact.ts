import { useMutation } from "@tanstack/react-query";
import { api, type ContactInput, type NewsletterInput } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { type Language, useLanguage } from "@/lib/language";

const messages: Record<Language, {
  savedTitle: string; savedBody: string; sentTitle: string; sentBody: string;
  errorTitle: string; contactError: string; subscribedTitle: string; subscribedBody: string;
  alreadySubscribed: string; subscribeError: string;
}> = {
  fr: { savedTitle: "Message enregistré, notification non envoyée", savedBody: "Votre message est conservé, mais l'email n'a pas pu être transmis à notre équipe. Vous pouvez nous écrire à contact@citizarm.fr.", sentTitle: "Message envoyé !", sentBody: "Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais.", errorTitle: "Erreur", contactError: "Une erreur est survenue lors de l'envoi du message.", subscribedTitle: "Inscription confirmée", subscribedBody: "Vous êtes bien inscrit à notre newsletter.", alreadySubscribed: "Cette adresse email est déjà inscrite.", subscribeError: "Impossible de vous inscrire pour le moment." },
  en: { savedTitle: "Message saved, notification not sent", savedBody: "Your message was saved, but we could not email our team. You can contact us at contact@citizarm.fr.", sentTitle: "Message sent!", sentBody: "We received your message and will reply as soon as possible.", errorTitle: "Error", contactError: "We could not send your message. Please try again.", subscribedTitle: "Subscription confirmed", subscribedBody: "You are now subscribed to our newsletter.", alreadySubscribed: "This email address is already subscribed.", subscribeError: "We could not subscribe you right now." },
  it: { savedTitle: "Messaggio salvato, notifica non inviata", savedBody: "Il messaggio è stato salvato, ma non siamo riusciti a inviare l'email al team. Puoi scriverci a contact@citizarm.fr.", sentTitle: "Messaggio inviato!", sentBody: "Abbiamo ricevuto il tuo messaggio e risponderemo al più presto.", errorTitle: "Errore", contactError: "Impossibile inviare il messaggio. Riprova.", subscribedTitle: "Iscrizione confermata", subscribedBody: "Ora sei iscritto alla nostra newsletter.", alreadySubscribed: "Questo indirizzo email è già iscritto.", subscribeError: "Impossibile iscriverti al momento." },
  de: { savedTitle: "Nachricht gespeichert, Benachrichtigung nicht gesendet", savedBody: "Ihre Nachricht wurde gespeichert, aber die E-Mail an unser Team konnte nicht gesendet werden. Sie erreichen uns unter contact@citizarm.fr.", sentTitle: "Nachricht gesendet!", sentBody: "Wir haben Ihre Nachricht erhalten und antworten so bald wie möglich.", errorTitle: "Fehler", contactError: "Ihre Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es erneut.", subscribedTitle: "Anmeldung bestätigt", subscribedBody: "Sie haben unseren Newsletter abonniert.", alreadySubscribed: "Diese E-Mail-Adresse ist bereits angemeldet.", subscribeError: "Eine Anmeldung ist derzeit nicht möglich." },
  es: { savedTitle: "Mensaje guardado, notificación no enviada", savedBody: "Tu mensaje se ha guardado, pero no hemos podido enviar un correo al equipo. Puedes escribirnos a contact@citizarm.fr.", sentTitle: "¡Mensaje enviado!", sentBody: "Hemos recibido tu mensaje y responderemos lo antes posible.", errorTitle: "Error", contactError: "No se ha podido enviar el mensaje. Inténtalo de nuevo.", subscribedTitle: "Suscripción confirmada", subscribedBody: "Ya estás suscrito a nuestro boletín.", alreadySubscribed: "Esta dirección de correo ya está suscrita.", subscribeError: "No podemos suscribirte en este momento." },
};

export function useSubmitContact() {
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = messages[language];

  return useMutation({
    mutationFn: async (data: ContactInput) => {
      const validated = api.contact.create.input.parse(data);
      const res = await fetch(api.contact.create.path, {
        method: api.contact.create.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
      });

      if (!res.ok) throw new Error("CONTACT_ERROR");
      return api.contact.create.responses[201].parse(await res.json());
    },
    onSuccess: ({ notificationSent }) => {
      if (!notificationSent) {
        toast({
          title: t.savedTitle,
          description: t.savedBody,
          variant: "destructive",
        });
        return;
      }
      toast({
        title: t.sentTitle,
        description: t.sentBody,
      });
    },
    onError: () => {
      toast({
        title: t.errorTitle,
        description: t.contactError,
        variant: "destructive",
      });
    }
  });
}

export function useSubscribeNewsletter() {
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = messages[language];

  return useMutation({
    mutationFn: async (data: NewsletterInput) => {
      const validated = api.newsletter.subscribe.input.parse(data);
      const res = await fetch(api.newsletter.subscribe.path, {
        method: api.newsletter.subscribe.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        if (res.status === 409) {
          throw new Error("ALREADY_SUBSCRIBED");
        }
        throw new Error("SUBSCRIBE_ERROR");
      }
      return api.newsletter.subscribe.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      toast({
        title: t.subscribedTitle,
        description: t.subscribedBody,
      });
    },
    onError: (error) => {
      toast({
        title: t.errorTitle,
        description: error.message === "ALREADY_SUBSCRIBED" ? t.alreadySubscribed : t.subscribeError,
        variant: "destructive",
      });
    }
  });
}
