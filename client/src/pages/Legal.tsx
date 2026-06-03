import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

export default function Legal() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
            Mentions légales
          </h1>
          
          <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                Éditeur du site
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Le site citiZarm.fr est édité par :<br />
                <strong className="text-foreground">CitiZarm</strong><br />
                Forme juridique : Association de fait<br />
                Siège social : 84, avenue de la République, 75011 Paris, France<br />
                RCS : [en création]<br />
                SIRET : [en création]<br />
                Numéro de TVA intracommunautaire : [en création]
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                Directeur de la publication
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Email : contact@citizarm.fr
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                Hébergement
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Le site est hébergé par :<br />
                <strong className="text-foreground">OVH Cloud</strong><br />
                2 rue Kellermann - 59100 Roubaix - France
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                Propriété intellectuelle
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                L'ensemble des contenus présents sur le site citiZarm.fr (textes, images, graphismes, logo, icônes, etc.) 
                sont protégés par le droit d'auteur et la propriété intellectuelle. Toute reproduction, représentation, 
                modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou 
                le procédé utilisé, est interdite sans l'autorisation écrite préalable de citiZarm.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                Protection des données personnelles
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et 
                Libertés du 6 janvier 1978 modifiée, vous disposez d'un droit d'accès, de rectification, de suppression 
                et d'opposition aux données personnelles vous concernant.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Les données collectées via le formulaire de contact et la newsletter sont utilisées uniquement pour 
                répondre à vos demandes et vous tenir informé de nos actualités. Elles ne sont en aucun cas cédées 
                à des tiers.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Pour exercer vos droits, vous pouvez nous contacter à l'adresse : contact@citizarm.fr
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                Cookies
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Le site citiZarm.fr peut utiliser des cookies pour améliorer l'expérience utilisateur. Ces cookies 
                sont utilisés à des fins statistiques et de personnalisation. Vous pouvez à tout moment désactiver 
                les cookies dans les paramètres de votre navigateur.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                Limitation de responsabilité
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                citiZarm s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur ce site. 
                Toutefois, citiZarm ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations 
                mises à disposition sur ce site.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                citiZarm décline toute responsabilité pour toute imprécision, inexactitude ou omission portant sur 
                des informations disponibles sur ce site, ainsi que pour tous dommages résultant d'une intrusion 
                frauduleuse d'un tiers ayant entraîné une modification des informations mises à disposition sur ce site.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                Droit applicable
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Les présentes mentions légales sont régies par le droit français. En cas de litige, les tribunaux 
                français seront seuls compétents.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                Contact
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Pour toute question relative aux présentes mentions légales, vous pouvez nous contacter :<br />
                Email : <a href="mailto:contact@citizarm.fr" className="text-primary hover:underline">contact@citizarm.fr</a><br />
                Adresse : 84, avenue de la République, 75011 Paris, France
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
