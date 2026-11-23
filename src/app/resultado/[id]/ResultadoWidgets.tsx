"use client";

import { useEffect } from "react";
import { sendGAEvent } from "@next/third-parties/google";
import { supabase } from "@/lib/supabase";
import FeedbackResultado from "./FeedbackResultado";

interface Props {
  registroId: string;
  cargo: string;
  industria: string;
  region: string;
}

export default function ResultadoWidgets({ registroId, cargo, industria, region }: Props) {
  // Si el usuario ya tiene sesión, vincular el registro a su perfil sin mostrar nada.
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) return;
      fetch("/api/perfil/vincular", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}` },
        body: JSON.stringify({ registroId }),
      }).then(() => sendGAEvent("event", "analisis_guardado"));
    });
  }, [registroId]);

  return <FeedbackResultado cargo={cargo} industria={industria} region={region} />;
}
