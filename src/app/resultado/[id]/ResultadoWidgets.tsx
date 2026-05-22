"use client";

import { useState } from "react";
import GuardarSheet from "./GuardarSheet";
import FeedbackResultado from "./FeedbackResultado";

interface Props {
  registroId: string;
  cargo: string;
  industria: string;
  region: string;
}

export default function ResultadoWidgets({ registroId, cargo, industria, region }: Props) {
  const [sheetDismissed, setSheetDismissed] = useState(false);

  return (
    <>
      {!sheetDismissed && (
        <GuardarSheet
          registroId={registroId}
          onDismiss={() => setSheetDismissed(true)}
        />
      )}
      {sheetDismissed && (
        <FeedbackResultado
          cargo={cargo}
          industria={industria}
          region={region}
        />
      )}
    </>
  );
}
