import type { Metadata } from "next";
import ArticuloContent from "./ArticuloContent";

export const metadata: Metadata = {
  title: "¿Cuánto cuesta reemplazar un empleado en gastronomía? | RemuneraLab",
  description:
    "Calcula el costo real de reemplazar a un garzón, ayudante de cocina o bartender en tu restaurante. Desglose de los 6 costos con fuentes: aviso, selección, curva de aprendizaje y más.",
  keywords: [
    "costo rotación personal gastronomía",
    "cuánto cuesta reemplazar empleado restaurante Chile",
    "rotación laboral gastronomía Chile",
    "retención personal restaurante",
    "curva aprendizaje empleados",
  ],
  openGraph: {
    title: "¿Cuánto cuesta reemplazar un empleado en tu restaurante?",
    description:
      "Desglose de los 6 costos reales con calculadora interactiva. Incluye slider de antigüedad y calculadora de ROI para aumentos salariales.",
    type: "article",
    locale: "es_CL",
    siteName: "RemuneraLab",
  },
  alternates: {
    canonical: "https://remuneralab.cl/recursos/cuanto-cuesta-reemplazar-un-empleado-gastronomia",
  },
};

export default function Page() {
  return <ArticuloContent />;
}
