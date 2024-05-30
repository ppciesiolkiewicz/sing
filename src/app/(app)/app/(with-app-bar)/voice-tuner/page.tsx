"use client";
import { useState, useMemo } from "react";
import * as Tone from "tone";
import { Box } from "@mui/material";
import Piano from "@/components/blocks/Piano/Piano";
import ChordsPiano from "@/components/blocks/Piano/ChordsPiano";
import ScalePiano from "@/components/blocks/Piano/ScalePiano";
import Tabs from "@/components/atoms/Tabs";
import PitchDetectionAnimation from "@/lib/animation-v2/PitchDetectionAnimation";
import SWRResponseHandler, {
  shouldRenderSWRResponseHandler,
} from "@/components/atoms/SwrResponseHandler";
import { useFetchUser } from "@/lib/fetch/hooks";
import { INSTRUMENTS } from "@/constants";
import { CommonPianoSettingsModal } from "@/components/blocks/Piano/CommonPianoSettings";

export default function VoiceTunerPage() {
  const [pianoSettings, setPianoSettings] = useState(
    CommonPianoSettingsModal.initialValues
  );
  const [highlightedNotes, setHighlightedNotes] = useState<string[]>([]);
  const userQuery = useFetchUser();
  const soundGenerator = useMemo(() => {
    document.soundGenerator = new Tone.Sampler(
      INSTRUMENTS[pianoSettings.instrument]
    ).toDestination();
    return document.soundGenerator;
  }, [pianoSettings.instrument]);

  if (shouldRenderSWRResponseHandler(userQuery)) {
    return (
      <SWRResponseHandler
        errorMessage={userQuery.error?.error}
        query={userQuery}
      />
    );
  }

  const lowestNoteName = userQuery.data.lowNote;
  const highestNoteName = userQuery.data.highNote;

  return (
    <>
      <Box
        // TODO fix that canvas height...
        sx={(theme) => ({
          height: `calc(100vh - 65.5px - ${theme.spacing(16)})`,
          mt: 4,
          width: "100%",
          display: "flex",
          flexDirection: "column",
        })}
      >
        <PitchDetectionAnimation highlightedNotes={highlightedNotes} />
        <Box height={["70px", "100px", "200px"]} width={"100%"}>
          <Tabs
            options={[
              {
                title: "Piano",
                children: (
                  <Piano
                    key="Piano"
                    lowestNoteName={lowestNoteName}
                    highestNoteName={highestNoteName}
                    onKeyPressed={(noteName) => {
                      soundGenerator.triggerAttack(noteName);
                    }}
                    onKeyReleased={(noteName) => {
                      soundGenerator.triggerRelease(noteName);
                    }}
                    onPressedKeysChanged={(noteNames) => {
                      setHighlightedNotes(noteNames);
                    }}
                  />
                ),
              },
              {
                title: "Chords Piano",
                children: (
                  <ChordsPiano
                    key="ChordsPiano"
                    keyTonic={pianoSettings.keyTonic}
                    keyType={pianoSettings.keyType}
                    lowestNoteName={lowestNoteName}
                    highestNoteName={highestNoteName}
                    modeConfig={{
                      mode: pianoSettings.chordsPianoMode,
                      tempo: pianoSettings.tempo,
                    }}
                    onKeyPressed={(noteNames: string[]) => {
                      soundGenerator.triggerAttack(noteNames);
                    }}
                    onKeyReleased={(noteNames: string[]) => {
                      soundGenerator.triggerRelease(noteNames);
                    }}
                    onPressedKeysChanged={(noteNames: string[]) => {
                      setHighlightedNotes(noteNames);
                    }}
                  />
                ),
              },
              {
                title: "Scale Piano",
                children: (
                  <ScalePiano
                    key="ScalePiano"
                    keyTonic={pianoSettings.keyTonic}
                    keyType={pianoSettings.keyType}
                    lowestNoteName={lowestNoteName}
                    highestNoteName={highestNoteName}
                    onKeyPressed={(noteName) => {
                      soundGenerator.triggerAttack(noteName);
                    }}
                    onKeyReleased={(noteName) => {
                      soundGenerator.triggerRelease(noteName);
                    }}
                    onPressedKeysChanged={(noteNames: string[]) => {
                      setHighlightedNotes(noteNames);
                    }}
                  />
                ),
              },
            ]}
          />
        </Box>
      </Box>
      <CommonPianoSettingsModal
        onSubmit={(values) => setPianoSettings(values)}
      />
    </>
  );
}
