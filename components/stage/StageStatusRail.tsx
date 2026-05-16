"use client";

type Props = {
  chatStatus: "idle" | "streaming" | "error";
  speechStatus: "idle" | "speaking" | "listening" | "transcribing" | "testing" | "error";
  micMode: "hold" | "toggle" | "dynamic";
  modelLabel: string;
  voiceLabel: string;
  asrLabel: string;
};

function chatStateLabel(status: Props["chatStatus"]) {
  if (status === "streaming") return "STREAMING";
  if (status === "error") return "FAULT";
  return "READY";
}

function speechStateLabel(status: Props["speechStatus"]) {
  if (status === "listening") return "LISTEN";
  if (status === "speaking") return "SPEAK";
  if (status === "transcribing") return "TRANSCRIBE";
  if (status === "testing") return "TEST";
  if (status === "error") return "FAULT";
  return "IDLE";
}

function micModeLabel(mode: Props["micMode"]) {
  if (mode === "hold") return "HOLD";
  if (mode === "toggle") return "TAP";
  return "AUTO";
}

export function StageStatusRail({
  chatStatus,
  speechStatus,
  micMode,
  modelLabel,
  voiceLabel,
  asrLabel
}: Props) {
  return (
    <footer className="stage-statusrail" aria-label="Stage status">
      <span className="stage-statusrail-cell" data-tone={chatStatus === "error" ? "fault" : chatStatus === "streaming" ? "active" : "ok"}>
        <span className="stage-statusrail-key">CHAT</span>
        <span className="stage-statusrail-val">{chatStateLabel(chatStatus)}</span>
      </span>
      <span className="stage-statusrail-cell" data-tone={speechStatus === "error" ? "fault" : speechStatus !== "idle" ? "active" : "ok"}>
        <span className="stage-statusrail-key">SPEECH</span>
        <span className="stage-statusrail-val">{speechStateLabel(speechStatus)}</span>
      </span>
      <span className="stage-statusrail-cell" data-tone="ok">
        <span className="stage-statusrail-key">MIC</span>
        <span className="stage-statusrail-val">{micModeLabel(micMode)}</span>
      </span>
      <span className="stage-statusrail-cell stage-statusrail-cell--wide" data-tone="ok" title={modelLabel}>
        <span className="stage-statusrail-key">MODEL</span>
        <span className="stage-statusrail-val">{modelLabel}</span>
      </span>
      <span className="stage-statusrail-cell" data-tone="ok" title={voiceLabel}>
        <span className="stage-statusrail-key">TTS</span>
        <span className="stage-statusrail-val">{voiceLabel}</span>
      </span>
      <span className="stage-statusrail-cell" data-tone="ok" title={asrLabel}>
        <span className="stage-statusrail-key">STT</span>
        <span className="stage-statusrail-val">{asrLabel}</span>
      </span>
    </footer>
  );
}
