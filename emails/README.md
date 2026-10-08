# Modèle de newsletter CitiZarm

Le même modèle graphique sert aussi aux emails de prise de contact : notification
à CitiZarm et accusé de réception au visiteur. Voir la section « Prise de contact »
ci-dessous. Ces emails transactionnels n'inscrivent pas le visiteur à la newsletter.

## Fichiers

- `server/email/template.ts` : modèle responsive à tables de présentation,
  styles intégrés, logo CitiZarm, pré-en-tête et pied de page en français.
  Génère le HTML et une version texte. Le contenu est échappé, pas interprété
  comme du HTML libre.
- `emails/citizarm-template.html` : export HTML avec variables `{{...}}` pour
  un outil d'emailing. Cet export ne fournit pas les en-têtes SMTP :
  ils doivent être configurés dans l'outil d'envoi.
- `downloads/citizarm-email-apercu.html` : aperçu autonome avec logo intégré,
  pas un email à envoyer tel quel. Son lien de désinscription est illustratif.
- `client/public/email-logo.png` : logo PNG public, pour les messageries qui
  ne prennent pas en charge WebP ou les images base64.

Régénérer les exports après une modification du modèle :

```bash
npx tsx script/export-email-preview.ts
```

En développement, voir aussi `/api/newsletter/template-preview`. Cet aperçu
n'est pas exposé en production. Le rendu navigateur ne garantit pas le rendu
exact dans Outlook, Gmail ou Apple Mail ; effectuer un envoi de test avant
une campagne réelle.

## Configuration avant tout envoi sur OVH

1. Déployer le modèle, le logo et les routes de désinscription avant l'envoi.
   Vérifier que `https://citizarm.fr/email-logo.png` est accessible publiquement.
2. Dans le `.env` privé de `/home/ubuntu/citizarm`, définir `SESSION_SECRET`
   avec un secret aléatoire stable d'au moins 32 caractères. Le Compose le
   transmet à l'application. Ne jamais publier sa valeur dans Git ou le chat.
   Les secrets Replit ne sont pas copiés sur OVH : cette configuration est
   distincte. Si le secret est absent ou trop court, l'envoi de newsletter
   échoue explicitement.
3. Conserver ce secret : le changer invalide les liens des emails déjà envoyés.
   Le conserver aussi dans une sauvegarde privée de configuration.
4. Configurer `RESEND_API_KEY` et vérifier le domaine expéditeur `citizarm.fr`
   avec SPF/DKIM chez Resend. Le bouton de désinscription du logiciel de
   messagerie dépend de ses règles, de l'authentification et de la réputation
   de l'expéditeur ; les en-têtes ne garantissent pas son affichage.

La table existante utilise déjà `is_active` : **aucune migration SQL n'est
nécessaire**. La désinscription conserve l'abonné et positionne ce champ à
`false`. Une inscription volontaire via le formulaire permet de le réactiver.

## Utilisation côté serveur avec Resend

La fonction `sendNewsletterEmail` de `server/newsletter/send.ts` envoie à un
seul abonné identifié par son ID. Elle relit son statut en base et refuse
un abonné désinscrit. Il n'y a pas de route publique d'envoi, de campagne
automatique, ni d'interface d'envoi ajoutée par ce modèle.

```typescript
import { sendNewsletterEmail } from "./server/newsletter/send";

await sendNewsletterEmail(subscriberId, {
  subject: "Les actualités de CitiZarm",
  title: "La démocratie se construit ensemble",
  preheader: "Les nouvelles de la participation citoyenne.",
  paragraphs: ["Bonjour,", "Votre contenu éditorial ici."],
  ctaLabel: "Découvrir CitiZarm",
  ctaUrl: "https://citizarm.fr",
  siteUrl: "https://citizarm.fr",
});
```

L'appel doit être effectué depuis un outil serveur autorisé, pas depuis le
navigateur. Choisir l'origine HTTPS réelle où sont déployées les routes, jamais
l'adresse d'aperçu Replit pour un envoi de production. Tout autre outil d'envoi
doit également exclure les abonnés dont `is_active` n'est pas `true`.

## En-têtes de désinscription et lien de bas de page

L'envoi Resend ajoute ces en-têtes au message délivré :

```text
List-Unsubscribe: <https://citizarm.fr/api/newsletter/unsubscribe?token=JETON_SIGNE>
List-Unsubscribe-Post: List-Unsubscribe=One-Click
```

Le même lien individuel signé figure dans le HTML et la version texte.
Il ne contient pas l'adresse email en clair. Ne pas partager ni journaliser
les jetons ou les URL individuelles ; ils autorisent la désinscription.

- **Lien de bas de page / GET** : affiche une confirmation. Il ne désinscrit
  pas automatiquement, afin de ne pas déclencher la désinscription lors d'un
  passage de scanner de liens. Le bouton de confirmation envoie un POST.
- **En-tête « un clic » / POST** : le logiciel de messagerie envoie
  `List-Unsubscribe=One-Click` au même URL, sans connexion ni confirmation.
  La réponse est un statut 200 avec un corps vide après la mise à jour en base.
- Les demandes répétées restent valides et sans effet supplémentaire. Un
  jeton falsifié ne permet pas de désinscrire quelqu'un. Une erreur de base
  retourne une erreur de service, jamais une fausse confirmation.

Pour importer `citizarm-template.html` dans un autre outil, remplacer les
variables textuelles en les échappant et configurer les **deux en-têtes**
ci-dessus avec le même lien signé propre à chaque destinataire. Le simple
import du HTML ne rend pas la désinscription fonctionnelle. Si l'outil gère
sa propre liste, prévoir aussi la synchronisation des désinscriptions :
CitiZarm ne met pas à jour une liste externe automatiquement.

Référence : [Resend — List-Unsubscribe et RFC 8058](https://resend.com/docs/dashboard/emails/add-unsubscribe-to-transactional-emails).

## Prise de contact : notification et accusé de réception

Après enregistrement du formulaire en base, deux emails indépendants sont envoyés
avec le même logo et la même mise en page responsive :

- **À `contact@citizarm.fr`** : nom et adresse du visiteur, sujet et message
  complet. Le texte est échappé, les sauts de ligne sont conservés. Le bouton
  « Répondre au visiteur » et `Reply-To` ciblent son adresse.
- **Au visiteur** : confirmation que le message est enregistré et que l'équipe
  pourra lui répondre. `Reply-To` cible `contact@citizarm.fr`. Le contenu saisi
  par le visiteur n'est pas recopié dans cet email automatique, pour ne pas
  permettre l'envoi de liens trompeurs à une adresse non vérifiée.

Ces messages utilisent `server/email/contact.ts` et `renderEmailTemplate` dans
`server/email/template.ts`. La notification interne reste sans lien de
désinscription. L'accusé de réception du visiteur contient **« Se désinscrire
et supprimer mon message »**, ainsi que les en-têtes `List-Unsubscribe` et
`List-Unsubscribe-Post`. Ils ciblent `/api/contact/unsubscribe` avec un jeton
signé lié à l'ID et à la date de création du message enregistré.

Cette désinscription **supprime physiquement uniquement l'enregistrement
correspondant dans `contact_messages`**. Elle ne modifie ni les autres messages
du même visiteur, ni `newsletter_subscribers`. Le GET affiche une confirmation
sans supprimer ; le POST de confirmation ou le POST « un clic » effectue la
suppression. Les demandes répétées restent sans effet supplémentaire et
renvoient un succès. Un jeton modifié ou réutilisé pour un autre message est
refusé. Les emails déjà délivrés et les sauvegardes ne sont pas effacés par
la suppression de cet enregistrement.

L'API `/api/contact` retourne séparément `notificationSent` et
`acknowledgementSent`. Un refus de Resend ou une erreur d'envoi ne supprime
pas le message enregistré et ne bloque pas l'autre email. Le formulaire
indique au visiteur si l'accusé de réception n'a pas pu être envoyé.
Un statut d'envoi positif signifie que Resend a accepté le message, pas une
garantie de livraison dans la boîte de réception.

Ces envois utilisent la clé Resend du serveur et le domaine expéditeur vérifié.
L'accusé de réception nécessite aussi le **`SESSION_SECRET` stable** décrit
plus haut pour signer son lien de suppression. Sans ce secret, la notification
interne reste indépendante, mais l'accusé de réception échoue explicitement.
Aucune migration SQL n'est nécessaire. Ne pas soumettre de formulaire
réel pour un essai sans accord : cela envoie désormais aussi un email au visiteur.
Les tests automatiques simulent Resend et la base.

Aperçus sans envoi, en développement uniquement :

- `/api/contact/email-preview?type=notification`
- `/api/contact/email-preview?type=acknowledgement`
