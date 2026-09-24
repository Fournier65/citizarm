import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, CheckCircle2, Shield, Users, Vote, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage, type Language } from "@/lib/language";

type HomeTranslations = {
  hero: {
    titleBefore: string;
    titleHighlight: string;
    titleAfter: string;
    description: string;
    discover: string;
    contact: string;
    backgroundAlt: string;
  };
  about: {
    title: string;
    subtitle: string;
    features: { title: string; description: string }[];
  };
  carousel: {
    slideAlt: string;
    previous: string;
    next: string;
    goToSlide: (slide: number) => string;
  };
  products: {
    aac: { eyebrow: string; description: string; features: string[]; visit: string };
    charte: { eyebrow: string; description: string; features: string[]; visit: string };
    revodemo: { eyebrow: string; description: string; features: string[]; visit: string };
  };
  cta: { title: string; description: string; contact: string };
};

const translations: Record<Language, HomeTranslations> = {
  fr: {
    hero: {
      titleBefore: "Armer les",
      titleHighlight: "esprits",
      titleAfter: "pour la démocratie",
      description: "Chez citiZarm, nous développons des outils numériques innovants pour renforcer la démocratie directe et permettre à chaque citoyen de s'exprimer.",
      discover: "Découvrir notre solution",
      contact: "Nous contacter",
      backgroundAlt: "Arrière-plan",
    },
    about: {
      title: "Notre Mission",
      subtitle: "Qui sommes-nous",
      features: [
        { title: "Confiance & Transparence", description: "Nous créons des espaces numériques sécurisés où la parole citoyenne est protégée et valorisée." },
        { title: "Démocratie Directe", description: "Nos outils visent à raccourcir la distance entre les citoyens et la prise de décision politique." },
        { title: "Engagement Collectif", description: "Nous croyons en l'intelligence collective pour résoudre les défis de notre société." },
      ],
    },
    carousel: {
      slideAlt: "Capture",
      previous: "Capture précédente",
      next: "Capture suivante",
      goToSlide: (slide) => `Aller à la capture ${slide}`,
    },
    products: {
      aac: {
        eyebrow: "Notre Application Phare",
        description: "Une plateforme révolutionnaire conçue pour redonner le pouvoir d'agir aux citoyens. Débattez, proposez et votez sur les sujets qui comptent vraiment pour votre communauté.",
        features: ["Débats modérés et constructifs", "Sondages sécurisés et vérifiés", "Propositions citoyennes directes", "Interface intuitive et accessible"],
        visit: "Visiter la plateforme",
      },
      charte: {
        eyebrow: "Nouveau",
        description: "Une Charte à l'adresse des groupes, associations, collectifs, partis politiques, journaux ou médias engagés dans la défense de la souveraineté nationale et populaire, et de la démocratie directe.",
        features: ["10 articles d'engagements souverains", "Amendements et votes", "Des pages dédiées pour les signataires", "Partage d'information"],
        visit: "Visiter la Charte",
      },
      revodemo: {
        eyebrow: "Projet citoyen",
        description: "Un mouvement pour une démocratie ascendante pyramidale : une plateforme où les citoyens peuvent débattre, amender et proposer au vote les idées du manifeste fondateur.",
        features: ["Un manifeste fondateur en huit parties", "Un compte citoyen pour participer aux débats et aux votes", "Une chaîne de relais pour une délégation révocable", "Une présentation du mouvement et de son initiateur"],
        visit: "Visiter Révodémo",
      },
    },
    cta: {
      title: "Prêt à changer les choses ?",
      description: "Rejoignez le mouvement citiZarm et participez à la construction de la démocratie de demain.",
      contact: "Contactez-nous aujourd'hui",
    },
  },
  en: {
    hero: {
      titleBefore: "Empowering",
      titleHighlight: "minds",
      titleAfter: "for democracy",
      description: "At citiZarm, we develop innovative digital tools to strengthen direct democracy and give every citizen a voice.",
      discover: "Discover our solution",
      contact: "Contact us",
      backgroundAlt: "Background",
    },
    about: {
      title: "Our Mission",
      subtitle: "Who we are",
      features: [
        { title: "Trust & Transparency", description: "We create secure digital spaces where citizens' voices are protected and valued." },
        { title: "Direct Democracy", description: "Our tools aim to shorten the distance between citizens and political decision-making." },
        { title: "Collective Engagement", description: "We believe in collective intelligence to solve the challenges facing our society." },
      ],
    },
    carousel: {
      slideAlt: "Screenshot",
      previous: "Previous screenshot",
      next: "Next screenshot",
      goToSlide: (slide) => `Go to screenshot ${slide}`,
    },
    products: {
      aac: {
        eyebrow: "Our Flagship App",
        description: "A groundbreaking platform designed to give citizens the power to take action. Debate, make proposals, and vote on the issues that truly matter to your community.",
        features: ["Moderated, constructive debates", "Secure, verified polls", "Direct citizen proposals", "Intuitive, accessible interface"],
        visit: "Visit the platform",
      },
      charte: {
        eyebrow: "New",
        description: "A Charter for groups, associations, collectives, political parties, newspapers, and media committed to defending national and popular sovereignty and direct democracy.",
        features: ["10 articles of sovereign commitments", "Amendments and votes", "Dedicated pages for signatories", "Information sharing"],
        visit: "Visit the Charter",
      },
      revodemo: {
        eyebrow: "Citizen-led project",
        description: "A movement for ascending, pyramid-shaped democracy: a platform where citizens can debate, amend, and put the ideas of the founding manifesto to a vote.",
        features: ["A founding manifesto in eight parts", "A citizen account for taking part in debates and votes", "A relay chain for revocable delegation", "An introduction to the movement and its founder"],
        visit: "Visit Révodémo",
      },
    },
    cta: {
      title: "Ready to make a difference?",
      description: "Join the citiZarm movement and help build the democracy of tomorrow.",
      contact: "Contact us today",
    },
  },
  it: {
    hero: {
      titleBefore: "Dare forza alle",
      titleHighlight: "menti",
      titleAfter: "per la democrazia",
      description: "In citiZarm sviluppiamo strumenti digitali innovativi per rafforzare la democrazia diretta e dare voce a ogni cittadino.",
      discover: "Scopri la nostra soluzione",
      contact: "Contattaci",
      backgroundAlt: "Sfondo",
    },
    about: {
      title: "La nostra missione",
      subtitle: "Chi siamo",
      features: [
        { title: "Fiducia e trasparenza", description: "Creiamo spazi digitali sicuri in cui la voce dei cittadini è protetta e valorizzata." },
        { title: "Democrazia diretta", description: "I nostri strumenti mirano ad accorciare la distanza tra i cittadini e le decisioni politiche." },
        { title: "Impegno collettivo", description: "Crediamo nell'intelligenza collettiva per affrontare le sfide della nostra società." },
      ],
    },
    carousel: {
      slideAlt: "Schermata",
      previous: "Schermata precedente",
      next: "Schermata successiva",
      goToSlide: (slide) => `Vai alla schermata ${slide}`,
    },
    products: {
      aac: {
        eyebrow: "La nostra applicazione di punta",
        description: "Una piattaforma rivoluzionaria pensata per restituire ai cittadini il potere di agire. Dibatti, proponi e vota sui temi che contano davvero per la tua comunità.",
        features: ["Dibattiti moderati e costruttivi", "Sondaggi sicuri e verificati", "Proposte dirette dei cittadini", "Interfaccia intuitiva e accessibile"],
        visit: "Visita la piattaforma",
      },
      charte: {
        eyebrow: "Novità",
        description: "Una Carta rivolta a gruppi, associazioni, collettivi, partiti politici, giornali e media impegnati nella difesa della sovranità nazionale e popolare e della democrazia diretta.",
        features: ["10 articoli di impegni sovrani", "Emendamenti e votazioni", "Pagine dedicate ai firmatari", "Condivisione delle informazioni"],
        visit: "Visita la Carta",
      },
      revodemo: {
        eyebrow: "Progetto cittadino",
        description: "Un movimento per una democrazia ascendente e piramidale: una piattaforma in cui i cittadini possono discutere, emendare e sottoporre al voto le idee del manifesto fondativo.",
        features: ["Un manifesto fondativo in otto parti", "Un account cittadino per partecipare a dibattiti e votazioni", "Una catena di deleghe per una delegazione revocabile", "Una presentazione del movimento e del suo fondatore"],
        visit: "Visita Révodémo",
      },
    },
    cta: {
      title: "Pronto a cambiare le cose?",
      description: "Unisciti al movimento citiZarm e contribuisci a costruire la democrazia di domani.",
      contact: "Contattaci oggi",
    },
  },
  de: {
    hero: {
      titleBefore: "Menschen befähigen,",
      titleHighlight: "Demokratie",
      titleAfter: "zu gestalten",
      description: "Bei citiZarm entwickeln wir innovative digitale Werkzeuge, um die direkte Demokratie zu stärken und allen Bürgerinnen und Bürgern eine Stimme zu geben.",
      discover: "Unsere Lösung entdecken",
      contact: "Kontakt",
      backgroundAlt: "Hintergrund",
    },
    about: {
      title: "Unsere Mission",
      subtitle: "Wer wir sind",
      features: [
        { title: "Vertrauen & Transparenz", description: "Wir schaffen sichere digitale Räume, in denen die Stimmen der Bürgerinnen und Bürger geschützt und wertgeschätzt werden." },
        { title: "Direkte Demokratie", description: "Unsere Werkzeuge sollen die Distanz zwischen den Bürgerinnen und Bürgern und politischen Entscheidungen verkürzen." },
        { title: "Gemeinschaftliches Engagement", description: "Wir glauben an kollektive Intelligenz, um die Herausforderungen unserer Gesellschaft zu bewältigen." },
      ],
    },
    carousel: {
      slideAlt: "Bildschirmaufnahme",
      previous: "Vorherige Bildschirmaufnahme",
      next: "Nächste Bildschirmaufnahme",
      goToSlide: (slide) => `Zu Bildschirmaufnahme ${slide}`,
    },
    products: {
      aac: {
        eyebrow: "Unsere Flaggschiff-App",
        description: "Eine wegweisende Plattform, die Bürgerinnen und Bürgern die Möglichkeit zum Handeln zurückgibt. Diskutieren, Vorschläge machen und über die Themen abstimmen, die für Ihre Gemeinschaft wirklich wichtig sind.",
        features: ["Moderierte, konstruktive Debatten", "Sichere, verifizierte Umfragen", "Direkte Bürgervorschläge", "Intuitive, barrierearme Oberfläche"],
        visit: "Plattform besuchen",
      },
      charte: {
        eyebrow: "Neu",
        description: "Eine Charta für Gruppen, Vereine, Kollektive, politische Parteien, Zeitungen und Medien, die sich für die nationale und volksbezogene Souveränität sowie die direkte Demokratie einsetzen.",
        features: ["10 Artikel zu souveränen Verpflichtungen", "Änderungsanträge und Abstimmungen", "Eigene Seiten für Unterzeichnende", "Informationsaustausch"],
        visit: "Charta besuchen",
      },
      revodemo: {
        eyebrow: "Bürgerprojekt",
        description: "Eine Bewegung für eine aufsteigende, pyramidenförmige Demokratie: eine Plattform, auf der Bürgerinnen und Bürger die Ideen des Gründungsmanifests diskutieren, ändern und zur Abstimmung stellen können.",
        features: ["Ein Gründungsmanifest in acht Teilen", "Ein Bürgerkonto zur Teilnahme an Debatten und Abstimmungen", "Eine Vermittlungskette für widerrufliche Delegation", "Eine Vorstellung der Bewegung und ihres Gründers"],
        visit: "Révodémo besuchen",
      },
    },
    cta: {
      title: "Bereit, etwas zu verändern?",
      description: "Werden Sie Teil der citiZarm-Bewegung und gestalten Sie die Demokratie von morgen mit.",
      contact: "Jetzt Kontakt aufnehmen",
    },
  },
  es: {
    hero: {
      titleBefore: "Fortalecer las",
      titleHighlight: "mentes",
      titleAfter: "para la democracia",
      description: "En citiZarm desarrollamos herramientas digitales innovadoras para fortalecer la democracia directa y dar voz a cada ciudadano.",
      discover: "Descubre nuestra solución",
      contact: "Contacta con nosotros",
      backgroundAlt: "Fondo",
    },
    about: {
      title: "Nuestra misión",
      subtitle: "Quiénes somos",
      features: [
        { title: "Confianza y transparencia", description: "Creamos espacios digitales seguros donde la voz ciudadana está protegida y valorada." },
        { title: "Democracia directa", description: "Nuestras herramientas buscan acortar la distancia entre la ciudadanía y la toma de decisiones políticas." },
        { title: "Compromiso colectivo", description: "Creemos en la inteligencia colectiva para resolver los retos de nuestra sociedad." },
      ],
    },
    carousel: {
      slideAlt: "Captura de pantalla",
      previous: "Captura anterior",
      next: "Captura siguiente",
      goToSlide: (slide) => `Ir a la captura ${slide}`,
    },
    products: {
      aac: {
        eyebrow: "Nuestra aplicación estrella",
        description: "Una plataforma revolucionaria diseñada para devolver a la ciudadanía el poder de actuar. Debate, propone y vota sobre los temas que realmente importan a tu comunidad.",
        features: ["Debates moderados y constructivos", "Encuestas seguras y verificadas", "Propuestas ciudadanas directas", "Interfaz intuitiva y accesible"],
        visit: "Visitar la plataforma",
      },
      charte: {
        eyebrow: "Novedad",
        description: "Una Carta dirigida a grupos, asociaciones, colectivos, partidos políticos, periódicos y medios comprometidos con la defensa de la soberanía nacional y popular y de la democracia directa.",
        features: ["10 artículos de compromisos soberanos", "Enmiendas y votaciones", "Páginas dedicadas a las personas firmantes", "Intercambio de información"],
        visit: "Visitar la Carta",
      },
      revodemo: {
        eyebrow: "Proyecto ciudadano",
        description: "Un movimiento por una democracia ascendente y piramidal: una plataforma donde la ciudadanía puede debatir, enmendar y someter a votación las ideas del manifiesto fundacional.",
        features: ["Un manifiesto fundacional en ocho partes", "Una cuenta ciudadana para participar en debates y votaciones", "Una cadena de relevos para una delegación revocable", "Una presentación del movimiento y de su fundador"],
        visit: "Visitar Révodémo",
      },
    },
    cta: {
      title: "¿Listo para cambiar las cosas?",
      description: "Únete al movimiento citiZarm y participa en la construcción de la democracia del mañana.",
      contact: "Contacta con nosotros hoy",
    },
  },
};

function LazySection({ children, className, fallbackHeight = "400px", id }: { children: React.ReactNode; className?: string; fallbackHeight?: string; id?: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} id={id} className={className}>
      {isVisible ? children : <div style={{ minHeight: fallbackHeight }} />}
    </section>
  );
}
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SectionHeading } from "@/components/SectionHeading";
import logo160 from "@assets/IMG_7582_1767640004029-160.webp";
import logo256 from "@assets/IMG_7582_1767640004029-256.webp";
import heroBg from "@assets/hero-background.webp";
import aacScreenshot1 from "@assets/image_1767721768477.webp";
import aacScreenshot1Small from "@assets/image_1767721768477-720.webp";
import aacScreenshot2 from "@assets/image_1767722378330.webp";
import aacScreenshot2Small from "@assets/image_1767722378330-720.webp";
import aacScreenshot3 from "@assets/image_1767722411166.webp";
import aacScreenshot3Small from "@assets/image_1767722411166-720.webp";
import aacScreenshot4 from "@assets/image_1767722513225.webp";
import aacScreenshot4Small from "@assets/image_1767722513225-720.webp";
import aacScreenshot5 from "@assets/image_1767722701881.webp";
import aacScreenshot5Small from "@assets/image_1767722701881-720.webp";
import aacScreenshot6 from "@assets/image_1767722742410.webp";
import aacScreenshot6Small from "@assets/image_1767722742410-720.webp";
import charteScreenshot1 from "@assets/image_1771727306289.webp";
import charteScreenshot1Small from "@assets/image_1771727306289-720.webp";
import charteScreenshot2 from "@assets/image_1771727330619.webp";
import charteScreenshot2Small from "@assets/image_1771727330619-720.webp";
import charteScreenshot3 from "@assets/image_1771727357455.webp";
import charteScreenshot3Small from "@assets/image_1771727357455-720.webp";
import charteScreenshot4 from "@assets/image_1771727402341.webp";
import charteScreenshot4Small from "@assets/image_1771727402341-720.webp";
import revodemoScreenshot1 from "@assets/image_1790199115795.webp";
import revodemoScreenshot1Small from "@assets/image_1790199115795-720.webp";
import revodemoScreenshot2 from "@assets/image_1790199142046.webp";
import revodemoScreenshot2Small from "@assets/image_1790199142046-720.webp";
import revodemoScreenshot3 from "@assets/image_1790199184539.webp";
import revodemoScreenshot3Small from "@assets/image_1790199184539-720.webp";
import revodemoScreenshot4 from "@assets/image_1790199217235.webp";
import revodemoScreenshot4Small from "@assets/image_1790199217235-720.webp";
import revodemoScreenshot5 from "@assets/image_1790199329365.webp";
import revodemoScreenshot5Small from "@assets/image_1790199329365-720.webp";
import revodemoScreenshot6 from "@assets/image_1790198858300.webp";
import revodemoScreenshot6Small from "@assets/image_1790198858300-720.webp";
import revodemoItScreenshot1 from "@assets/image_1790280216448.webp";
import revodemoItScreenshot1Small from "@assets/image_1790280216448-720.webp";
import revodemoItScreenshot2 from "@assets/image_1790280248310.webp";
import revodemoItScreenshot2Small from "@assets/image_1790280248310-720.webp";
import revodemoItScreenshot3 from "@assets/image_1790280378094.webp";
import revodemoItScreenshot3Small from "@assets/image_1790280378094-720.webp";
import revodemoItScreenshot4 from "@assets/image_1790280411066.webp";
import revodemoItScreenshot4Small from "@assets/image_1790280411066-720.webp";
import revodemoItScreenshot5 from "@assets/image_1790280452665.webp";
import revodemoItScreenshot5Small from "@assets/image_1790280452665-720.webp";
import revodemoItScreenshot6 from "@assets/image_1790280499760.webp";
import revodemoItScreenshot6Small from "@assets/image_1790280499760-720.webp";
import revodemoEnScreenshot1 from "@assets/image_1790280579731.webp";
import revodemoEnScreenshot1Small from "@assets/image_1790280579731-720.webp";
import revodemoEnScreenshot2 from "@assets/image_1790280581603.webp";
import revodemoEnScreenshot2Small from "@assets/image_1790280581603-720.webp";
import revodemoEnScreenshot3 from "@assets/image_1790280675822.webp";
import revodemoEnScreenshot3Small from "@assets/image_1790280675822-720.webp";
import revodemoEnScreenshot4 from "@assets/image_1790280706849.webp";
import revodemoEnScreenshot4Small from "@assets/image_1790280706849-720.webp";
import revodemoEnScreenshot5 from "@assets/image_1790280727693.webp";
import revodemoEnScreenshot5Small from "@assets/image_1790280727693-720.webp";
import revodemoEnScreenshot6 from "@assets/image_1790280795773.webp";
import revodemoEnScreenshot6Small from "@assets/image_1790280795773-720.webp";
import revodemoDeScreenshot1 from "@assets/image_1790280916099.webp";
import revodemoDeScreenshot1Small from "@assets/image_1790280916099-720.webp";
import revodemoDeScreenshot2 from "@assets/image_1790280935596.webp";
import revodemoDeScreenshot2Small from "@assets/image_1790280935596-720.webp";
import revodemoDeScreenshot3 from "@assets/image_1790280968784.webp";
import revodemoDeScreenshot3Small from "@assets/image_1790280968784-720.webp";
import revodemoDeScreenshot4 from "@assets/image_1790281151306.webp";
import revodemoDeScreenshot4Small from "@assets/image_1790281151306-720.webp";
import revodemoDeScreenshot5 from "@assets/image_1790281179465.webp";
import revodemoDeScreenshot5Small from "@assets/image_1790281179465-720.webp";
import revodemoDeScreenshot6 from "@assets/image_1790281208761.webp";
import revodemoDeScreenshot6Small from "@assets/image_1790281208761-720.webp";
import revodemoEsScreenshot1 from "@assets/image_1790281251084.webp";
import revodemoEsScreenshot1Small from "@assets/image_1790281251084-720.webp";
import revodemoEsScreenshot2 from "@assets/image_1790281306463.webp";
import revodemoEsScreenshot2Small from "@assets/image_1790281306463-720.webp";
import revodemoEsScreenshot3 from "@assets/image_1790281308170.webp";
import revodemoEsScreenshot3Small from "@assets/image_1790281308170-720.webp";
import revodemoEsScreenshot4 from "@assets/image_1790281346746.webp";
import revodemoEsScreenshot4Small from "@assets/image_1790281346746-720.webp";
import revodemoEsScreenshot5 from "@assets/image_1790281382310.webp";
import revodemoEsScreenshot5Small from "@assets/image_1790281382310-720.webp";
import revodemoEsScreenshot6 from "@assets/image_1790281412767.webp";
import revodemoEsScreenshot6Small from "@assets/image_1790281412767-720.webp";

const screenshots = [
  { src: aacScreenshot1, small: aacScreenshot1Small },
  { src: aacScreenshot2, small: aacScreenshot2Small },
  { src: aacScreenshot6, small: aacScreenshot6Small },
  { src: aacScreenshot3, small: aacScreenshot3Small },
  { src: aacScreenshot4, small: aacScreenshot4Small },
  { src: aacScreenshot5, small: aacScreenshot5Small },
];

const charteScreenshots = [
  { src: charteScreenshot1, small: charteScreenshot1Small },
  { src: charteScreenshot2, small: charteScreenshot2Small },
  { src: charteScreenshot3, small: charteScreenshot3Small },
  { src: charteScreenshot4, small: charteScreenshot4Small },
];

const revodemoScreenshots = [
  { src: revodemoScreenshot1, small: revodemoScreenshot1Small },
  { src: revodemoScreenshot2, small: revodemoScreenshot2Small },
  { src: revodemoScreenshot3, small: revodemoScreenshot3Small },
  { src: revodemoScreenshot4, small: revodemoScreenshot4Small },
  { src: revodemoScreenshot5, small: revodemoScreenshot5Small },
  { src: revodemoScreenshot6, small: revodemoScreenshot6Small },
];

const revodemoItalianScreenshots = [
  { src: revodemoItScreenshot1, small: revodemoItScreenshot1Small },
  { src: revodemoItScreenshot2, small: revodemoItScreenshot2Small },
  { src: revodemoItScreenshot3, small: revodemoItScreenshot3Small },
  { src: revodemoItScreenshot4, small: revodemoItScreenshot4Small },
  { src: revodemoItScreenshot5, small: revodemoItScreenshot5Small },
  { src: revodemoItScreenshot6, small: revodemoItScreenshot6Small },
];

const revodemoEnglishScreenshots = [
  { src: revodemoEnScreenshot1, small: revodemoEnScreenshot1Small },
  { src: revodemoEnScreenshot2, small: revodemoEnScreenshot2Small },
  { src: revodemoEnScreenshot3, small: revodemoEnScreenshot3Small },
  { src: revodemoEnScreenshot4, small: revodemoEnScreenshot4Small },
  { src: revodemoEnScreenshot5, small: revodemoEnScreenshot5Small },
  { src: revodemoEnScreenshot6, small: revodemoEnScreenshot6Small },
];

const revodemoGermanScreenshots = [
  { src: revodemoDeScreenshot1, small: revodemoDeScreenshot1Small },
  { src: revodemoDeScreenshot2, small: revodemoDeScreenshot2Small },
  { src: revodemoDeScreenshot3, small: revodemoDeScreenshot3Small },
  { src: revodemoDeScreenshot4, small: revodemoDeScreenshot4Small },
  { src: revodemoDeScreenshot5, small: revodemoDeScreenshot5Small },
  { src: revodemoDeScreenshot6, small: revodemoDeScreenshot6Small },
];

const revodemoSpanishScreenshots = [
  { src: revodemoEsScreenshot1, small: revodemoEsScreenshot1Small },
  { src: revodemoEsScreenshot2, small: revodemoEsScreenshot2Small },
  { src: revodemoEsScreenshot3, small: revodemoEsScreenshot3Small },
  { src: revodemoEsScreenshot4, small: revodemoEsScreenshot4Small },
  { src: revodemoEsScreenshot5, small: revodemoEsScreenshot5Small },
  { src: revodemoEsScreenshot6, small: revodemoEsScreenshot6Small },
];

const revodemoScreenshotsByLanguage = {
  fr: revodemoScreenshots,
  en: revodemoEnglishScreenshots,
  it: revodemoItalianScreenshots,
  de: revodemoGermanScreenshots,
  es: revodemoSpanishScreenshots,
};

function ScreenshotCarousel({ images, altPrefix, id, labels }: { images: { src: string; small: string }[]; altPrefix: string; id: string; labels: HomeTranslations["carousel"] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const currentImage = images[currentIndex];
  const isCurrentLoaded = loadedImages.has(currentImage.src);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [images.length]);

  const goToPrevious = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const goToNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handleDragEnd = useCallback((_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x < -threshold) {
      goToNext();
    } else if (info.offset.x > threshold) {
      goToPrevious();
    }
  }, [goToNext, goToPrevious]);

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? "-100%" : "100%",
      opacity: 0,
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative"
    >
      <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-border bg-background">
        <div className="bg-secondary border-b border-border p-4 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
          <div className="ml-4 flex-1 bg-background h-8 rounded-md border border-border" />
        </div>
        
        <div className="relative aspect-[16/10] overflow-hidden touch-pan-y">
          {!isCurrentLoaded && (
            <div className="absolute inset-0 z-10">
              <Skeleton className="w-full h-full rounded-none" />
            </div>
          )}
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.img
              key={currentIndex}
              src={currentImage.src}
              srcSet={`${currentImage.small} 720w, ${currentImage.src} 960w`}
              sizes="(min-width: 1024px) 600px, calc(100vw - 32px)"
              alt={`${altPrefix} - ${labels.slideAlt} ${currentIndex + 1}`}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "tween", duration: 0.4, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full object-cover object-left-top cursor-grab active:cursor-grabbing"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              onLoad={() => setLoadedImages((previous) => new Set(previous).add(currentImage.src))}
              loading="lazy"
            />
          </AnimatePresence>
        </div>

        <button
          onClick={goToPrevious}
          aria-label={labels.previous}
          className="absolute left-3 top-1/2 translate-y-2 z-20 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border hidden md:flex items-center justify-center text-foreground hover:bg-background transition-colors"
          data-testid={`button-${id}-carousel-prev`}
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={goToNext}
          aria-label={labels.next}
          className="absolute right-3 top-1/2 translate-y-2 z-20 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border hidden md:flex items-center justify-center text-foreground hover:bg-background transition-colors"
          data-testid={`button-${id}-carousel-next`}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="flex justify-center gap-2 mt-4">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > currentIndex ? 1 : -1);
              setCurrentIndex(index);
            }}
            aria-label={labels.goToSlide(index + 1)}
            aria-current={index === currentIndex ? "true" : undefined}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex 
                ? "bg-primary w-6" 
                : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
            }`}
            data-testid={`button-${id}-carousel-dot-${index}`}
          />
        ))}
      </div>
      
      <div className="absolute -z-10 top-10 -right-10 w-full h-full bg-primary/10 rounded-3xl" />
    </motion.div>
  );
}

// Abstract tech/connection background image, self-hosted (was previously loaded from Unsplash)
const HERO_BG = heroBg;

export default function Home() {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center pt-20 pb-16 md:pb-0 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={HERO_BG} 
            alt={t.hero.backgroundAlt}
            className="w-full h-full object-cover opacity-10 dark:opacity-5"
            loading="eager"
            decoding="async"
            // @ts-ignore -- fetchpriority not yet in React's JSX types
            fetchpriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background" />
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-8 flex justify-center"
            >
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl shadow-xl overflow-hidden border-4 border-background bg-background">
                <img
                  src={logo256}
                  srcSet={`${logo160} 160w, ${logo256} 256w`}
                  sizes="(min-width: 768px) 128px, 96px"
                  alt="citiZarm Logo"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display font-extrabold text-5xl md:text-7xl text-foreground mb-6 leading-[1.1]"
            >
              {t.hero.titleBefore} <span className="text-primary">{t.hero.titleHighlight}</span> {t.hero.titleAfter}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              {t.hero.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <a href="#product">
                <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold text-lg shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2">
                  {t.hero.discover} <ArrowRight size={20} />
                </button>
              </a>
              <Link href="/contact">
                <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-secondary text-secondary-foreground border border-border font-semibold text-lg hover:bg-muted transition-all duration-300">
                  {t.hero.contact}
                </button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="py-24 bg-secondary">
        <div className="container mx-auto px-4 md:px-6">
          <SectionHeading 
            title={t.about.title}
            subtitle={t.about.subtitle}
            align="center" 
          />
          
          <div className="grid md:grid-cols-3 gap-8">
            {t.about.features.map((feature, idx) => {
              const FeatureIcon = [Shield, Vote, Users][idx];
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="bg-background p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                    <FeatureIcon size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3 font-display">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PRODUCT SECTION */}
      <LazySection id="product" className="py-24 bg-background relative overflow-hidden" fallbackHeight="600px">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">
                {t.products.aac.eyebrow}
              </span>
              <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-6 leading-tight">
                AuxArmesCitoyens.fr <span className="text-primary text-2xl md:text-3xl">(Beta)</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                {t.products.aac.description}
              </p>
              
              <ul className="space-y-4 mb-10">
                {t.products.aac.features.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-foreground font-medium">
                    <CheckCircle2 className="text-green-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <a href="https://auxarmescitoyens.fr" target="_blank" rel="noopener noreferrer">
                <button className="px-8 py-4 rounded-xl bg-foreground text-background font-semibold hover:bg-primary hover:text-primary-foreground transition-colors duration-300 flex items-center gap-2">
                  {t.products.aac.visit} <ArrowRight size={18} />
                </button>
              </a>
            </motion.div>

            <ScreenshotCarousel images={screenshots} altPrefix="AuxArmesCitoyens.fr" id="aac" labels={t.carousel} />
          </div>
        </div>
      </LazySection>

      {/* CHARTE SECTION */}
      <LazySection className="py-24 bg-secondary relative overflow-hidden" fallbackHeight="600px">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-blue-500 font-bold tracking-wider uppercase text-sm mb-2 block">
                {t.products.charte.eyebrow}
              </span>
              <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-6 leading-tight">
                La Charte pour la Souveraineté Populaire <span className="text-primary text-2xl md:text-3xl">(Beta)</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                {t.products.charte.description}
              </p>
              
              <ul className="space-y-4 mb-10">
                {t.products.charte.features.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-foreground font-medium">
                    <CheckCircle2 className="text-green-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <a href="https://charte-souverainete-populaire.fr" target="_blank" rel="noopener noreferrer">
                <button className="px-8 py-4 rounded-xl bg-foreground text-background font-semibold hover:bg-primary hover:text-primary-foreground transition-colors duration-300 flex items-center gap-2" data-testid="button-visit-charte">
                  {t.products.charte.visit} <ArrowRight size={18} />
                </button>
              </a>
            </motion.div>

            <div className="lg:order-first">
              <ScreenshotCarousel images={charteScreenshots} altPrefix="Charte pour la Souveraineté Populaire" id="charte" labels={t.carousel} />
            </div>
          </div>
        </div>
      </LazySection>

      {/* RÉVODÉMO SECTION */}
      <LazySection className="py-24 bg-background relative overflow-hidden" fallbackHeight="600px">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">
                {t.products.revodemo.eyebrow}
              </span>
              <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-6 leading-tight">
                Révodémo
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                {t.products.revodemo.description}
              </p>

              <ul className="space-y-4 mb-10">
                {t.products.revodemo.features.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-foreground font-medium">
                    <CheckCircle2 className="text-green-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <a href={`https://revodemo.fr/${language}`} target="_blank" rel="noopener noreferrer">
                <button className="px-8 py-4 rounded-xl bg-foreground text-background font-semibold hover:bg-primary hover:text-primary-foreground transition-colors duration-300 flex items-center gap-2">
                  {t.products.revodemo.visit} <ArrowRight size={18} />
                </button>
              </a>
            </motion.div>

            <ScreenshotCarousel images={revodemoScreenshotsByLanguage[language]} altPrefix="Révodémo" id="revodemo" labels={t.carousel} />
          </div>
        </div>
      </LazySection>

      {/* CTA SECTION */}
      <section className="py-24 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 2px, transparent 2px, transparent 10px), repeating-linear-gradient(-45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 2px, transparent 2px, transparent 10px)' }}></div>
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <h2 className="font-display font-bold text-3xl md:text-5xl !text-white mb-6">
            {t.cta.title}
          </h2>
          <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            {t.cta.description}
          </p>
          <Link href="/contact">
            <button className="px-10 py-5 rounded-full bg-white text-primary font-bold text-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              {t.cta.contact}
            </button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
