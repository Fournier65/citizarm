import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type Language, useLanguage } from "@/lib/language";

const choices: { code: Language; name: string }[] = [
  { code: "fr", name: "Français" },
  { code: "en", name: "English" },
  { code: "it", name: "Italiano" },
  { code: "de", name: "Deutsch" },
  { code: "es", name: "Español" },
];

function FlagIcon({ language }: { language: Language }) {
  return (
    <svg
      data-flag={language}
      viewBox="0 0 24 16"
      className="h-4 w-6 shrink-0 rounded-[2px] ring-1 ring-black/15"
      aria-hidden="true"
      focusable="false"
    >
      {language === "fr" && (
        <>
          <rect width="8" height="16" fill="#002395" />
          <rect x="8" width="8" height="16" fill="#fff" />
          <rect x="16" width="8" height="16" fill="#ED2939" />
        </>
      )}
      {language === "en" && (
        <>
          <rect width="24" height="16" fill="#012169" />
          <path d="M0 0 24 16 M24 0 0 16" stroke="#fff" strokeWidth="5" />
          <path d="M0 0 24 16 M24 0 0 16" stroke="#C8102E" strokeWidth="2" />
          <path d="M12 0v16 M0 8h24" stroke="#fff" strokeWidth="6" />
          <path d="M12 0v16 M0 8h24" stroke="#C8102E" strokeWidth="3" />
        </>
      )}
      {language === "it" && (
        <>
          <rect width="8" height="16" fill="#009246" />
          <rect x="8" width="8" height="16" fill="#fff" />
          <rect x="16" width="8" height="16" fill="#CE2B37" />
        </>
      )}
      {language === "de" && (
        <>
          <rect width="24" height="16" fill="#000" />
          <rect y="5.33" width="24" height="5.34" fill="#DD0000" />
          <rect y="10.67" width="24" height="5.33" fill="#FFCE00" />
        </>
      )}
      {language === "es" && (
        <>
          <rect width="24" height="16" fill="#AA151B" />
          <rect y="4" width="24" height="8" fill="#F1BF00" />
        </>
      )}
    </svg>
  );
}

const labels: Record<Language, string> = {
  fr: "Changer de langue",
  en: "Change language",
  it: "Cambia lingua",
  de: "Sprache ändern",
  es: "Cambiar idioma",
};

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const current = choices.find(({ code }) => code === language)!;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          data-testid="language-switcher"
          aria-label={`${labels[language]} : ${current.name}`}
          className="inline-flex h-10 items-center gap-1 rounded-full border border-border bg-background px-2.5 text-foreground shadow-sm hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <FlagIcon language={language} />
          <ChevronDown size={14} aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="min-w-40 border-border bg-background text-foreground shadow-xl">
        {choices.filter(({ code }) => code !== language).map(({ code, name }) => (
          <DropdownMenuItem key={code} lang={code} onSelect={() => setLanguage(code)} className="gap-3 py-2.5">
            <FlagIcon language={code} />
            <span>{name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}