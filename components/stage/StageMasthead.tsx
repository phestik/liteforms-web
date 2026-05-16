"use client";

import { useMemo } from "react";

type Props = {
  characterName: string;
  characterPronouns: string;
  endpointLabel: string;
  endpointDetail: string;
  isConnected: boolean;
  vrmName: string;
};

export function StageMasthead({
  characterName,
  characterPronouns,
  endpointLabel,
  endpointDetail,
  isConnected,
  vrmName
}: Props) {
  const pronounLabel = useMemo(() => {
    if (characterPronouns === "SHE") return "SHE/HER";
    if (characterPronouns === "HE") return "HE/HIM";
    return "THEY/THEM";
  }, [characterPronouns]);

  return (
    <header className="stage-masthead" aria-label="Liteforms stage status">
      <div className="masthead-brand">
        <span className="masthead-mark" aria-hidden="true">◤</span>
        <span className="masthead-wordmark">LITEFORMS</span>
        <span className="masthead-sep" aria-hidden="true">::</span>
        <span className="masthead-route">LOOKING GLASS GO</span>
      </div>
      <div className="masthead-meta">
        <div className="masthead-chip" data-tone="character">
          <span className="masthead-chip-label">CHARACTER</span>
          <span className="masthead-chip-value">{characterName.toUpperCase()}</span>
          <span className="masthead-chip-tail">{pronounLabel}</span>
        </div>
        <div className="masthead-chip" data-tone="vessel">
          <span className="masthead-chip-label">VESSEL</span>
          <span className="masthead-chip-value">{vrmName.toUpperCase()}</span>
        </div>
        <div className="masthead-chip" data-tone={isConnected ? "online" : "offline"}>
          <span className="masthead-chip-dot" aria-hidden="true" />
          <span className="masthead-chip-label">{endpointLabel}</span>
          <span className="masthead-chip-value">{endpointDetail}</span>
        </div>
      </div>
    </header>
  );
}
