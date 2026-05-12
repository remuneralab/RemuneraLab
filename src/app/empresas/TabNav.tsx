"use client";

import { motion } from "motion/react";
import { Heart, BarChart3, HardHat, Globe, BookOpen, Code2 } from "lucide-react";

type Tab = "general" | "salud" | "finanzas" | "mineria" | "turismo" | "casos" | "tecnologia";

const TABS = [
  { id: "general",  label: "Vista general", href: "/empresas",          Icon: null,      iconClass: "" },
  { id: "salud",    label: "Salud",          href: "/empresas/salud",    Icon: Heart,     iconClass: "text-red-400" },
  { id: "finanzas", label: "Finanzas",       href: "/empresas/finanzas", Icon: BarChart3, iconClass: "text-emerald-500" },
  { id: "mineria",  label: "Minería",        href: "/empresas/mineria",  Icon: HardHat,   iconClass: "text-amber-500" },
  { id: "turismo",  label: "Turismo",        href: "/empresas/turismo",  Icon: Globe,     iconClass: "text-sky-500" },
  { id: "tecnologia",label: "Tecnología",     href: "/empresas/tecnologia",Icon: Code2,    iconClass: "text-indigo-500" },
  { id: "casos",    label: "Casos reales",   href: "/empresas/casos",    Icon: BookOpen,  iconClass: "text-violet-500" },
] as const;

export default function TabNav({ active }: { active: Tab }) {
  return (
    <div className="hidden sm:flex items-center bg-surface-container rounded-xl p-1 gap-1">
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        return (
          <a
            key={tab.id}
            href={tab.href}
            className="relative px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5"
          >
            {isActive && (
              <motion.span
                layoutId="tab-pill"
                className="absolute inset-0 bg-white shadow-sm rounded-lg"
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              />
            )}
            <span className={`relative z-10 flex items-center gap-1.5 transition-colors ${
              isActive
                ? "font-semibold text-primary"
                : "text-on-surface-variant hover:text-primary"
            }`}>
              {tab.Icon && <tab.Icon size={13} className={tab.iconClass} />}
              {tab.label}
            </span>
          </a>
        );
      })}
    </div>
  );
}
