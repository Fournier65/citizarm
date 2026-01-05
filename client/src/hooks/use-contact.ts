import { useMutation } from "@tanstack/react-query";
import { api, type ContactInput, type NewsletterInput } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useSubmitContact() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: ContactInput) => {
      const validated = api.contact.create.input.parse(data);
      const res = await fetch(api.contact.create.path, {
        method: api.contact.create.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.contact.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error('Une erreur est survenue lors de l\'envoi du message');
      }
      return api.contact.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      toast({
        title: "Message envoyé !",
        description: "Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

export function useSubscribeNewsletter() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: NewsletterInput) => {
      const validated = api.newsletter.subscribe.input.parse(data);
      const res = await fetch(api.newsletter.subscribe.path, {
        method: api.newsletter.subscribe.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.newsletter.subscribe.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        if (res.status === 409) {
          throw new Error('Cette adresse email est déjà inscrite.');
        }
        throw new Error('Impossible de vous inscrire pour le moment');
      }
      return api.newsletter.subscribe.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      toast({
        title: "Inscription confirmée",
        description: "Vous êtes bien inscrit à notre newsletter.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}
