import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({ title, subtitle, align = "center", className }: SectionHeadingProps) {
  return (
    <div className={cn("mb-12 md:mb-20", align === "center" ? "text-center" : "text-left", className)}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        {subtitle && (
          <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-sm font-semibold tracking-wide uppercase mb-4 border border-primary/20">
            {subtitle}
          </span>
        )}
        <h2 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-foreground leading-tight">
          {title}
        </h2>
        <div 
          className={cn(
            "h-1.5 w-20 bg-primary mt-6 rounded-full",
            align === "center" ? "mx-auto" : ""
          )} 
        />
      </motion.div>
    </div>
  );
}
