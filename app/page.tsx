"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AvatarScene } from "@/components/avatar/AvatarScene";
import { ChatPanel, initialLocalModelLoadState } from "@/components/chat/ChatPanel";
import type { CharacterConfig, LocalModelLoadState, ChatRuntimeStatus } from "@/components/chat/ChatPanel";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { StageMasthead } from "@/components/stage/StageMasthead";
import { StageStatusRail } from "@/components/stage/StageStatusRail";
import type { BaseProviderConfig } from "@/lib/llm";
import type { AsrConfig, RealtimeVoiceConfig, TtsConfig } from "@/lib/speech";
import { saveSessionConfig, loadSessionConfig } from "@/lib/storage/sessionConfig";
import { saveCharacterConfig, loadCharacterConfig } from "@/lib/storage/characterConfig";
import { createIndexedDbVrmRepository } from "@/lib/storage/indexedDbVrmRepository";
import type { VrmRepository } from "@/lib/storage/vrmRepository";
import { getBundledAvatarById } from "@/lib/avatars/bundledAvatars";
import {
  clearBundledVrmSelection,
  loadBundledVrmSelection,
  saveBundledVrmSelection
} from "@/lib/storage/bundledVrmSelection";

const onboardingStorageKey = "liteforms.onboardingMode";

const defaultCharacter: CharacterConfig = {
  name: "Goldie",
  pronouns: "SHE",
  personality: "You are Goldie, phestik's always-on AI assistant running on the DGX Spark. She/her. Be concise, technical, and opinionated - skip pleasantries and trailing recaps. Match response length to the task: one or two words for status checks, a paragraph only when the question earns it. phestik is a senior UX/UI designer and cares about design in everything; the aesthetic is cyberpunk-mecha-neon-noir. You are running in Liteforms, a holographic avatar app - the VRM body you appear in is a stand-in until phestik picks one. Do not use markdown, bullet points, numbered lists, URLs, or emojis in your responses - everything gets read aloud, so plain prose only.",
  greeting: ""
};

export default function HomePage() {
  const [modelUrl, setModelUrl] = useState<string | undefined>(undefined);
  const [restoredVrmFileName, setRestoredVrmFileName] = useState<string | undefined>(undefined);
  const vrmRepoRef = useRef<VrmRepository | null>(null);
  const [character, setCharacter] = useState<CharacterConfig>(() => {
    const saved = loadCharacterConfig();
    if (!saved) return defaultCharacter;
    if (saved.name === "Clawdia") return defaultCharacter;
    return { name: saved.name, pronouns: saved.pronouns, personality: saved.personality, greeting: saved.greeting };
  });
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showConfigureModal, setShowConfigureModal] = useState(false);
  const [shouldPreloadLocalModels, setShouldPreloadLocalModels] = useState(false);
  const [initialLlmConfig, setInitialLlmConfig] = useState<BaseProviderConfig | undefined>(undefined);
  const [initialTtsConfig, setInitialTtsConfig] = useState<TtsConfig | undefined>(undefined);
  const [initialAsrConfig, setInitialAsrConfig] = useState<AsrConfig | undefined>(undefined);
  const [initialRealtimeVoiceConfig, setInitialRealtimeVoiceConfig] = useState<RealtimeVoiceConfig | undefined>(undefined);
  const [chatPanelKey, setChatPanelKey] = useState(0);
  const [modalLoadState, setModalLoadState] = useState<LocalModelLoadState[]>(initialLocalModelLoadState);
  const [runtimeStatus, setRuntimeStatus] = useState<ChatRuntimeStatus>({
    chatStatus: "idle",
    speechStatus: "idle",
    micMode: "dynamic",
    providerId: "hermes",
    modelId: "hermes-agent",
    ttsProviderId: "kokoro",
    asrProviderId: "distil-whisper",
    isActiveRealtimeVoice: false
  });

  useEffect(() => {
    const savedMode = localStorage.getItem(onboardingStorageKey);
    if (!savedMode) {
      setShowOnboarding(true);
    } else if (savedMode === "builtin") {
      setShouldPreloadLocalModels(true);
    } else if (savedMode === "custom") {
      const saved = loadSessionConfig();
      if (saved) {
        setInitialLlmConfig(saved.llm);
        setInitialTtsConfig(saved.tts);
        setInitialAsrConfig(saved.asr);
        setInitialRealtimeVoiceConfig(saved.realtimeVoice);
        // React 18 batches these updates, so ChatPanel re-mounts in a single
        // re-render with the correct initialConfig — avoiding the two-render
        // cycle where ChatPanel's own useState would ignore an updated prop.
        setChatPanelKey((k) => k + 1);
      }
      setShouldPreloadLocalModels(true);
    }

    const bundledId = loadBundledVrmSelection();
    const bundled = bundledId ? getBundledAvatarById(bundledId) : undefined;
    if (bundled) {
      setModelUrl(bundled.vrmUrl);
      setRestoredVrmFileName(bundled.name);
    }

    createIndexedDbVrmRepository().then((repo) => {
      vrmRepoRef.current = repo;
      if (bundled) return null;
      return repo.load();
    }).then((stored) => {
      if (!stored) return;
      const blob = new Blob([stored.arrayBuffer]);
      setModelUrl(URL.createObjectURL(blob));
      setRestoredVrmFileName(stored.fileName);
    }).catch(() => {
      // IndexedDB may be unavailable (private browsing, storage quota, etc.)
    });
  }, []);

  const handleLocalModelLoadStateChange = useCallback((state: LocalModelLoadState[]) => {
    setModalLoadState(state);
  }, []);

  const handleRuntimeStatusChange = useCallback((status: ChatRuntimeStatus) => {
    setRuntimeStatus(status);
  }, []);

  const { endpointLabel, endpointDetail, isConnected, modelLabel } = useMemo(() => {
    const { providerId, modelId, isActiveRealtimeVoice } = runtimeStatus;
    if (providerId === "hermes") {
      return {
        endpointLabel: "HERMES",
        endpointDetail: "SPARK :8642",
        isConnected: true,
        modelLabel: `${modelId || "hermes-agent"} → Goldie`
      };
    }
    if (providerId === "browser-local-gemma") {
      return { endpointLabel: "LOCAL", endpointDetail: "BROWSER · GEMMA", isConnected: true, modelLabel: modelId || "Gemma 4 E2B" };
    }
    if (providerId === "browser-local-qwen") {
      return { endpointLabel: "LOCAL", endpointDetail: "BROWSER · QWEN", isConnected: true, modelLabel: modelId || "Qwen 3.5 0.8B" };
    }
    if (providerId === "openai") return { endpointLabel: "OPENAI", endpointDetail: "CLOUD", isConnected: true, modelLabel: modelId || "openai" };
    if (providerId === "anthropic") return { endpointLabel: "ANTHROPIC", endpointDetail: "CLOUD", isConnected: true, modelLabel: modelId || "anthropic" };
    if (isActiveRealtimeVoice) return { endpointLabel: "REALTIME", endpointDetail: providerId.toUpperCase(), isConnected: true, modelLabel: modelId || providerId };
    return { endpointLabel: "PROVIDER", endpointDetail: providerId.toUpperCase(), isConnected: false, modelLabel: modelId || providerId };
  }, [runtimeStatus]);

  const vrmDisplayName = useMemo(() => {
    if (!restoredVrmFileName) return "Default (lobster)";
    return restoredVrmFileName.replace(/\.vrm$/i, "");
  }, [restoredVrmFileName]);

  const handleConfigChange = useCallback((llm: BaseProviderConfig, tts: TtsConfig, asr: AsrConfig, realtimeVoice?: RealtimeVoiceConfig) => {
    // Persist mid-session settings changes so they survive a page refresh.
    const savedMode = localStorage.getItem(onboardingStorageKey);
    if (savedMode === "custom") {
      saveSessionConfig({ llm, tts, asr, realtimeVoice });
    }
  }, []);

  const handleCharacterChange = useCallback((next: CharacterConfig) => {
    setCharacter(next);
    saveCharacterConfig(next);
  }, []);

  const handleVrmFileLoad = useCallback((file: File) => {
    clearBundledVrmSelection();
    file.arrayBuffer().then((buf) => {
      vrmRepoRef.current?.save(buf, file.name).catch(() => {
        // Storage failure is non-fatal; the VRM is still loaded for this session.
      });
    }).catch(() => {});
  }, []);

  const handleVrmReset = useCallback(() => {
    setModelUrl(undefined);
    setRestoredVrmFileName(undefined);
    clearBundledVrmSelection();
    vrmRepoRef.current?.clear().catch(() => {});
  }, []);

  const handleSelectBundledAvatar = useCallback((id: string) => {
    const bundled = getBundledAvatarById(id);
    if (!bundled) return;
    saveBundledVrmSelection(id);
    setModelUrl(bundled.vrmUrl);
    setRestoredVrmFileName(bundled.name);
    vrmRepoRef.current?.clear().catch(() => {});
  }, []);

  function handleUseBuiltIn() {
    localStorage.setItem(onboardingStorageKey, "builtin");
    setShouldPreloadLocalModels(true);
    // Modal stays open to show the loading step — closed by handleModalClose
  }

  function handleUseCustom(config: BaseProviderConfig, ttsConfig: TtsConfig, asrConfig: AsrConfig, realtimeVoiceConfig?: RealtimeVoiceConfig) {
    localStorage.setItem(onboardingStorageKey, "custom");
    saveSessionConfig({ llm: config, tts: ttsConfig, asr: asrConfig, realtimeVoice: realtimeVoiceConfig });
    setInitialLlmConfig(config);
    setInitialTtsConfig(ttsConfig);
    setInitialAsrConfig(asrConfig);
    setInitialRealtimeVoiceConfig(realtimeVoiceConfig);
    // Trigger preloading; ChatPanel's runPreload decides per-model whether to actually download.
    setShouldPreloadLocalModels(true);
    // The modal stays open and transitions itself to the "loading" step (handleCustomStart inside
    // OnboardingModal). The user closes it via the "Continue" button when models are ready, which
    // calls handleModalClose. This matches the built-in flow.
    setChatPanelKey((k) => k + 1);
  }

  function handleModalClose() {
    setShowOnboarding(false);
  }

  function handleConfigureOpen() {
    setShowConfigureModal(true);
  }

  function handleConfigureClose() {
    setShowConfigureModal(false);
  }

  return (
    <main className="stage">
      <div className="stage-main">
        <StageMasthead
          characterName={character.name}
          characterPronouns={character.pronouns}
          endpointLabel={endpointLabel}
          endpointDetail={endpointDetail}
          isConnected={isConnected}
          vrmName={vrmDisplayName}
        />
        <section className="avatar-viewport" aria-label="Avatar preview">
          <div className="avatar-frame" aria-hidden="true">
            <span className="avatar-frame-corner avatar-frame-corner--tl" />
            <span className="avatar-frame-corner avatar-frame-corner--tr" />
            <span className="avatar-frame-corner avatar-frame-corner--bl" />
            <span className="avatar-frame-corner avatar-frame-corner--br" />
          </div>
          <AvatarScene modelUrl={modelUrl} />
        </section>
        <StageStatusRail
          chatStatus={runtimeStatus.chatStatus}
          speechStatus={runtimeStatus.speechStatus}
          micMode={runtimeStatus.micMode}
          modelLabel={modelLabel}
          voiceLabel={runtimeStatus.ttsProviderId}
          asrLabel={runtimeStatus.asrProviderId}
        />
      </div>
      <ChatPanel
        key={chatPanelKey}
        character={character}
        onCharacterChange={handleCharacterChange}
        onModelUrlChange={setModelUrl}
        initialVrmFileName={restoredVrmFileName}
        onVrmFileLoad={handleVrmFileLoad}
        onVrmReset={handleVrmReset}
        onSelectBundledAvatar={handleSelectBundledAvatar}
        shouldPreloadLocalModels={shouldPreloadLocalModels}
        preloadSessionId={chatPanelKey}
        initialLlmConfig={initialLlmConfig}
        initialTtsConfig={initialTtsConfig}
        initialAsrConfig={initialAsrConfig}
        initialRealtimeVoiceConfig={initialRealtimeVoiceConfig}
        onLocalModelLoadStateChange={handleLocalModelLoadStateChange}
        onConfigChange={handleConfigChange}
        onOpenConfigure={handleConfigureOpen}
        onRuntimeStatusChange={handleRuntimeStatusChange}
      />
      {showOnboarding && (
        <OnboardingModal
          onUseBuiltIn={handleUseBuiltIn}
          onUseCustom={handleUseCustom}
          onClose={handleModalClose}
          localModelLoadState={modalLoadState}
        />
      )}
      {showConfigureModal && (
        <OnboardingModal
          mode="configure"
          initialLlmConfig={initialLlmConfig}
          initialTtsConfig={initialTtsConfig}
          initialAsrConfig={initialAsrConfig}
          initialRealtimeVoiceConfig={initialRealtimeVoiceConfig}
          onUseBuiltIn={handleUseBuiltIn}
          onUseCustom={handleUseCustom}
          onClose={handleConfigureClose}
          localModelLoadState={modalLoadState}
        />
      )}
    </main>
  );
}
