import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type Language, useLanguage } from "@/lib/language";

const choices: { code: Language; flag: string; name: string }[] = [
  { code: "fr", flag: "🇫🇷", name: "Français" },
  { code: "en", flag: "🇬🇧", name: "English" },
  { code: "it", flag: "🇮🇹", name: "Italiano" },
  { code: "de", flag: "🇩🇪", name: "Deutsch" },
  { code: "es", flag: "🇪🇸", name: "Español" },
];

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
          className="inline-flex h-10 items-center gap-1 rounded-full border border-border bg-background/80 px-2.5 text-foreground shadow-sm hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <span aria-hidden="true" className="text-xl leading-none">{current.flag}</span>
          <ChevronDown size={14} aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="min-w-40">
        {choices.filter(({ code }) => code !== language).map(({ code, flag, name }) => (
          <DropdownMenuItem key={code} lang={code} onSelect={() => setLanguage(code)} className="gap-3 py-2.5">
            <span aria-hidden="true" className="text-xl leading-none">{flag}</span>
            <span>{name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}