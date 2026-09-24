import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/lib/language";

type Language = "fr" | "en" | "it" | "de" | "es";

const translations: Record<Language, {
  title: string;
  publisher: string;
  publicationDirector: string;
  hosting: string;
  intellectualProperty: string;
  dataProtection: string;
  cookies: string;
  liability: string;
  applicableLaw: string;
  contact: string;
  sitePublishedBy: string;
  legalForm: string;
  registeredOffice: string;
  rcs: string;
  siret: string;
  vatNumber: string;
  pending: string;
  email: string;
  siteHostedBy: string;
  intellectualPropertyText: string;
  dataProtectionText: string;
  dataUseText: string;
  rightsContactText: string;
  cookiesText: string;
  liabilityText: string;
  liabilityDisclaimerText: string;
  applicableLawText: string;
  contactText: string;
  address: string;
}> = {
  fr: {
    title: "Mentions légales",
    publisher: "Éditeur du site",
    publicationDirector: "Directeur de la publication",
    hosting: "Hébergement",
    intellectualProperty: "Propriété intellectuelle",
    dataProtection: "Protection des données personnelles",
    cookies: "Cookies",
    liability: "Limitation de responsabilité",
    applicableLaw: "Droit applicable",
    contact: "Contact",
    sitePublishedBy: "Le site citiZarm.fr est édité par :",
    legalForm: "Forme juridique : Association de fait",
    registeredOffice: "Siège social : 84, avenue de la République, 75011 Paris, France",
    rcs: "RCS :",
    siret: "SIRET :",
    vatNumber: "Numéro de TVA intracommunautaire :",
    pending: "En cours de création",
    email: "Email :",
    siteHostedBy: "Le site est hébergé par :",
    intellectualPropertyText: "L'ensemble des contenus présents sur le site citiZarm.fr (textes, images, graphismes, logo, icônes, etc.) sont protégés par le droit d'auteur et la propriété intellectuelle. Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite sans l'autorisation écrite préalable de citiZarm.",
    dataProtectionText: "Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés du 6 janvier 1978 modifiée, vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition aux données personnelles vous concernant.",
    dataUseText: "Les données collectées via le formulaire de contact et la newsletter sont utilisées uniquement pour répondre à vos demandes et vous tenir informé de nos actualités. Elles ne sont en aucun cas cédées à des tiers.",
    rightsContactText: "Pour exercer vos droits, vous pouvez nous contacter à l'adresse :",
    cookiesText: "Le site citiZarm.fr peut utiliser des cookies pour améliorer l'expérience utilisateur. Ces cookies sont utilisés à des fins statistiques et de personnalisation. Vous pouvez à tout moment désactiver les cookies dans les paramètres de votre navigateur.",
    liabilityText: "citiZarm s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur ce site. Toutefois, citiZarm ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations mises à disposition sur ce site.",
    liabilityDisclaimerText: "citiZarm décline toute responsabilité pour toute imprécision, inexactitude ou omission portant sur des informations disponibles sur ce site, ainsi que pour tous dommages résultant d'une intrusion frauduleuse d'un tiers ayant entraîné une modification des informations mises à disposition sur ce site.",
    applicableLawText: "Les présentes mentions légales sont régies par le droit français. En cas de litige, les tribunaux français seront seuls compétents.",
    contactText: "Pour toute question relative aux présentes mentions légales, vous pouvez nous contacter :",
    address: "Adresse : 84, avenue de la République, 75011 Paris, France",
  },
  en: {
    title: "Legal notice",
    publisher: "Website publisher",
    publicationDirector: "Publication director",
    hosting: "Hosting",
    intellectualProperty: "Intellectual property",
    dataProtection: "Personal data protection",
    cookies: "Cookies",
    liability: "Limitation of liability",
    applicableLaw: "Applicable law",
    contact: "Contact",
    sitePublishedBy: "The citiZarm.fr website is published by:",
    legalForm: "Legal form: Unincorporated association",
    registeredOffice: "Registered office: 84, avenue de la République, 75011 Paris, France",
    rcs: "RCS (French Trade and Companies Register):",
    siret: "SIRET (French business identification number):",
    vatNumber: "EU VAT number:",
    pending: "Registration pending",
    email: "Email:",
    siteHostedBy: "The website is hosted by:",
    intellectualPropertyText: "All content on the citiZarm.fr website (texts, images, graphics, logo, icons, etc.) is protected by copyright and intellectual property laws. Any reproduction, representation, modification, publication or adaptation of all or part of the website's content, by any means or process, is prohibited without the prior written permission of citiZarm.",
    dataProtectionText: "In accordance with the General Data Protection Regulation (GDPR) and the amended French Data Protection Act of 6 January 1978, you have the right to access, rectify and erase your personal data, and to object to its processing.",
    dataUseText: "Data collected through the contact form and newsletter is used solely to respond to your requests and keep you informed about our news. It is never transferred to third parties.",
    rightsContactText: "To exercise your rights, you can contact us at:",
    cookiesText: "The citiZarm.fr website may use cookies to improve the user experience. These cookies are used for statistical and personalisation purposes. You can disable cookies at any time in your browser settings.",
    liabilityText: "citiZarm endeavours to ensure that the information published on this website is accurate and up to date. However, citiZarm cannot guarantee the accuracy, precision or completeness of the information made available on this website.",
    liabilityDisclaimerText: "citiZarm accepts no liability for any imprecision, inaccuracy or omission concerning information available on this website, or for any damage resulting from fraudulent intrusion by a third party that led to a change in the information made available on this website.",
    applicableLawText: "These legal notices are governed by French law. In the event of a dispute, the French courts shall have exclusive jurisdiction.",
    contactText: "For any questions about these legal notices, you can contact us:",
    address: "Address: 84, avenue de la République, 75011 Paris, France",
  },
  it: {
    title: "Note legali",
    publisher: "Editore del sito",
    publicationDirector: "Direttore della pubblicazione",
    hosting: "Hosting",
    intellectualProperty: "Proprietà intellettuale",
    dataProtection: "Protezione dei dati personali",
    cookies: "Cookie",
    liability: "Limitazione di responsabilità",
    applicableLaw: "Legge applicabile",
    contact: "Contatti",
    sitePublishedBy: "Il sito citiZarm.fr è pubblicato da:",
    legalForm: "Forma giuridica: Associazione di fatto",
    registeredOffice: "Sede legale: 84, avenue de la République, 75011 Parigi, Francia",
    rcs: "RCS (Registro del commercio e delle società francese):",
    siret: "SIRET (numero identificativo d'impresa francese):",
    vatNumber: "Numero di partita IVA intracomunitaria:",
    pending: "Registrazione in corso",
    email: "Email:",
    siteHostedBy: "Il sito è ospitato da:",
    intellectualPropertyText: "Tutti i contenuti presenti sul sito citiZarm.fr (testi, immagini, grafica, logo, icone, ecc.) sono protetti dal diritto d'autore e dalla proprietà intellettuale. È vietata qualsiasi riproduzione, rappresentazione, modifica, pubblicazione o adattamento di tutto o parte dei contenuti del sito, con qualsiasi mezzo o procedimento, senza la previa autorizzazione scritta di citiZarm.",
    dataProtectionText: "Ai sensi del Regolamento generale sulla protezione dei dati (RGPD) e della legge francese modificata del 6 gennaio 1978 sull'informatica e le libertà, avete il diritto di accedere, rettificare e cancellare i vostri dati personali e di opporvi al loro trattamento.",
    dataUseText: "I dati raccolti tramite il modulo di contatto e la newsletter sono utilizzati esclusivamente per rispondere alle vostre richieste e tenervi informati sulle nostre novità. Non vengono in alcun caso ceduti a terzi.",
    rightsContactText: "Per esercitare i vostri diritti, potete contattarci all'indirizzo:",
    cookiesText: "Il sito citiZarm.fr può utilizzare cookie per migliorare l'esperienza utente. Questi cookie sono utilizzati a fini statistici e di personalizzazione. Potete disattivare i cookie in qualsiasi momento dalle impostazioni del vostro browser.",
    liabilityText: "citiZarm si impegna a garantire l'accuratezza e l'aggiornamento delle informazioni pubblicate su questo sito. Tuttavia, citiZarm non può garantire l'accuratezza, la precisione o la completezza delle informazioni messe a disposizione su questo sito.",
    liabilityDisclaimerText: "citiZarm declina ogni responsabilità per imprecisioni, inesattezze o omissioni relative alle informazioni disponibili su questo sito, nonché per eventuali danni derivanti da un'intrusione fraudolenta di terzi che abbia comportato una modifica delle informazioni messe a disposizione su questo sito.",
    applicableLawText: "Le presenti note legali sono disciplinate dal diritto francese. In caso di controversia, saranno competenti in via esclusiva i tribunali francesi.",
    contactText: "Per qualsiasi domanda relativa alle presenti note legali, potete contattarci:",
    address: "Indirizzo: 84, avenue de la République, 75011 Parigi, Francia",
  },
  de: {
    title: "Impressum",
    publisher: "Herausgeber der Website",
    publicationDirector: "Verantwortlich für die Veröffentlichung",
    hosting: "Hosting",
    intellectualProperty: "Geistiges Eigentum",
    dataProtection: "Schutz personenbezogener Daten",
    cookies: "Cookies",
    liability: "Haftungsbeschränkung",
    applicableLaw: "Anwendbares Recht",
    contact: "Kontakt",
    sitePublishedBy: "Die Website citiZarm.fr wird herausgegeben von:",
    legalForm: "Rechtsform: Nicht eingetragene Vereinigung",
    registeredOffice: "Sitz: 84, avenue de la République, 75011 Paris, Frankreich",
    rcs: "RCS (französisches Handels- und Gesellschaftsregister):",
    siret: "SIRET (französische Unternehmenskennnummer):",
    vatNumber: "Umsatzsteuer-Identifikationsnummer:",
    pending: "Eintragung steht noch aus",
    email: "E-Mail:",
    siteHostedBy: "Die Website wird gehostet von:",
    intellectualPropertyText: "Sämtliche Inhalte der Website citiZarm.fr (Texte, Bilder, Grafiken, Logo, Symbole usw.) sind urheberrechtlich und durch das Recht des geistigen Eigentums geschützt. Jede Vervielfältigung, Darstellung, Änderung, Veröffentlichung oder Bearbeitung der Website-Inhalte, ganz oder teilweise und unabhängig vom verwendeten Mittel oder Verfahren, ist ohne vorherige schriftliche Genehmigung von citiZarm untersagt.",
    dataProtectionText: "Gemäß der Datenschutz-Grundverordnung (DSGVO) und dem geänderten französischen Datenschutzgesetz vom 6. Januar 1978 haben Sie das Recht auf Auskunft, Berichtigung und Löschung Ihrer personenbezogenen Daten sowie das Recht, deren Verarbeitung zu widersprechen.",
    dataUseText: "Die über das Kontaktformular und den Newsletter erhobenen Daten werden ausschließlich verwendet, um Ihre Anfragen zu beantworten und Sie über Neuigkeiten zu informieren. Sie werden unter keinen Umständen an Dritte weitergegeben.",
    rightsContactText: "Zur Ausübung Ihrer Rechte können Sie uns unter folgender Adresse kontaktieren:",
    cookiesText: "Die Website citiZarm.fr kann Cookies verwenden, um die Nutzererfahrung zu verbessern. Diese Cookies dienen statistischen Zwecken und der Personalisierung. Sie können Cookies jederzeit in den Einstellungen Ihres Browsers deaktivieren.",
    liabilityText: "citiZarm bemüht sich, die Richtigkeit und Aktualität der auf dieser Website veröffentlichten Informationen sicherzustellen. citiZarm kann jedoch die Richtigkeit, Genauigkeit oder Vollständigkeit der auf dieser Website bereitgestellten Informationen nicht garantieren.",
    liabilityDisclaimerText: "citiZarm übernimmt keine Verantwortung für Ungenauigkeiten, Unrichtigkeiten oder Auslassungen in den auf dieser Website verfügbaren Informationen sowie für Schäden, die aus einem betrügerischen Eingriff Dritter resultieren, durch den die bereitgestellten Informationen verändert wurden.",
    applicableLawText: "Dieses Impressum unterliegt französischem Recht. Im Streitfall sind ausschließlich die französischen Gerichte zuständig.",
    contactText: "Bei Fragen zu diesem Impressum können Sie uns kontaktieren:",
    address: "Adresse: 84, avenue de la République, 75011 Paris, Frankreich",
  },
  es: {
    title: "Aviso legal",
    publisher: "Editor del sitio web",
    publicationDirector: "Director de la publicación",
    hosting: "Alojamiento",
    intellectualProperty: "Propiedad intelectual",
    dataProtection: "Protección de datos personales",
    cookies: "Cookies",
    liability: "Limitación de responsabilidad",
    applicableLaw: "Legislación aplicable",
    contact: "Contacto",
    sitePublishedBy: "El sitio citiZarm.fr está publicado por:",
    legalForm: "Forma jurídica: Asociación de hecho",
    registeredOffice: "Domicilio social: 84, avenue de la République, 75011 París, Francia",
    rcs: "RCS (Registro Mercantil y de Sociedades francés):",
    siret: "SIRET (número de identificación empresarial francés):",
    vatNumber: "Número de IVA intracomunitario:",
    pending: "Registro pendiente",
    email: "Correo electrónico:",
    siteHostedBy: "El sitio web está alojado por:",
    intellectualPropertyText: "Todos los contenidos del sitio citiZarm.fr (textos, imágenes, gráficos, logotipo, iconos, etc.) están protegidos por los derechos de autor y la propiedad intelectual. Queda prohibida cualquier reproducción, representación, modificación, publicación o adaptación de todo o parte del contenido del sitio, por cualquier medio o procedimiento, sin la autorización previa por escrito de citiZarm.",
    dataProtectionText: "De conformidad con el Reglamento General de Protección de Datos (RGPD) y la ley francesa de 6 de enero de 1978 sobre informática y libertades, en su versión modificada, usted tiene derecho a acceder, rectificar y suprimir sus datos personales, así como a oponerse a su tratamiento.",
    dataUseText: "Los datos recopilados mediante el formulario de contacto y el boletín informativo se utilizan únicamente para responder a sus solicitudes y mantenerle informado de nuestras novedades. En ningún caso se ceden a terceros.",
    rightsContactText: "Para ejercer sus derechos, puede ponerse en contacto con nosotros en:",
    cookiesText: "El sitio citiZarm.fr puede utilizar cookies para mejorar la experiencia del usuario. Estas cookies se utilizan con fines estadísticos y de personalización. Puede desactivar las cookies en cualquier momento desde la configuración de su navegador.",
    liabilityText: "citiZarm se esfuerza por garantizar que la información publicada en este sitio sea exacta y esté actualizada. Sin embargo, citiZarm no puede garantizar la exactitud, precisión o exhaustividad de la información disponible en este sitio.",
    liabilityDisclaimerText: "citiZarm declina toda responsabilidad por cualquier imprecisión, inexactitud u omisión relativa a la información disponible en este sitio, así como por los daños derivados de una intrusión fraudulenta de un tercero que haya provocado una modificación de la información puesta a disposición en este sitio.",
    applicableLawText: "El presente aviso legal se rige por la legislación francesa. En caso de litigio, los tribunales franceses serán los únicos competentes.",
    contactText: "Para cualquier pregunta relacionada con este aviso legal, puede ponerse en contacto con nosotros:",
    address: "Dirección: 84, avenue de la République, 75011 París, Francia",
  },
};

export default function Legal() {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
            {t.title}
          </h1>
          
          <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                {t.publisher}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t.sitePublishedBy}<br />
                <strong className="text-foreground">CitiZarm</strong><br />
                {t.legalForm}<br />
                {t.registeredOffice}<br />
                {t.rcs} {t.pending}<br />
                {t.siret} {t.pending}<br />
                {t.vatNumber} {t.pending}
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                {t.publicationDirector}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t.email} contact@citizarm.fr
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                {t.hosting}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t.siteHostedBy}<br />
                <strong className="text-foreground">OVH Cloud</strong><br />
                2 rue Kellermann - 59100 Roubaix - France
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                {t.intellectualProperty}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t.intellectualPropertyText}
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                {t.dataProtection}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t.dataProtectionText}
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                {t.dataUseText}
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                {t.rightsContactText} contact@citizarm.fr
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                {t.cookies}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t.cookiesText}
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                {t.liability}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t.liabilityText}
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                {t.liabilityDisclaimerText}
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                {t.applicableLaw}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t.applicableLawText}
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                {t.contact}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t.contactText}<br />
                {t.email} <a href="mailto:contact@citizarm.fr" className="text-primary hover:underline">contact@citizarm.fr</a><br />
                {t.address}
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
