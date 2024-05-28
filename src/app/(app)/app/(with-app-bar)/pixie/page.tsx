"use client";
import {
  useRef,
  useEffect,
  useLayoutEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import * as Tone from "tone";
import { Box, Button, Typography } from "@mui/material";
import Modal from "@/components/atoms/Modal";
import Piano from "@/components/blocks/Piano/Piano";
import ChordsPiano from "@/components/blocks/Piano/ChordsPiano";
import ScalePiano from "@/components/blocks/Piano/ScalePiano";
import Tabs from "@/components/atoms/Tabs";
import SWRResponseHandler, {
  shouldRenderSWRResponseHandler,
} from "@/components/atoms/SwrResponseHandler";
import { useFetchUser } from "@/lib/fetch/hooks";
import { INSTRUMENTS } from "@/constants";
import { CommonPianoSettingsModal } from "@/components/blocks/Piano/CommonPianoSettings";
import PitchDetectionAnimation from "@/lib/animation-v2/PitchDetectionAnimation";

export default function VoiceTunerPage() {
  const [pianoSettings, setPianoSettings] = useState(
    CommonPianoSettingsModal.initialValues
  );
  const [started, setStarted] = useState(false);
  const userQuery = useFetchUser();
  const soundGenerator = useMemo(
    () =>
      new Tone.Sampler(INSTRUMENTS[pianoSettings.instrument]).toDestination(),
    [pianoSettings.instrument]
  );

  // useLayoutEffect(
  //   function render() {
  //     if (!canvasRef.current || !userQuery.data) {
  //       return;
  //     }

  //     if (!started) {
  //       if (animationRef.current) {
  //         animationRef.stop();
  //       }
  //       return;
  //     }

  //     canvasRef.current.width = canvasParentRef.current.clientWidth;
  //     canvasRef.current.height = canvasParentRef.current.clientHeight;
  //     canvasRef.current.style.width = canvasParentRef.current.clientWidth;
  //     canvasRef.current.style.height = canvasParentRef.current.clientHeight;

  //     const lowestNoteName = userQuery.data.lowNote;
  //     const highestNoteName = userQuery.data.highNote;
  //     // animationRef.current = new PitchDetectionAnimation(
  //     //   lowestNoteName,
  //     //   highestNoteName,
  //     //   canvasRef.current as HTMLCanvasElement
  //     // );
  //     animationRef.current?.start();
  //   },
  //   [started, userQuery.data]
  // );

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
      <Typography variant={"h3"}>Pixie</Typography>
      <Button onClick={() => setStarted(true)}>Start</Button>
      {started && <PitchDetectionAnimation />}
    </Box>
  );
}
