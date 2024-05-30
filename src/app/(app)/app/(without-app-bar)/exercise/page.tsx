"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Formik, Form, FormikHelpers } from "formik";
import { Box, Button, Fab, SwipeableDrawer } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { Melody, MelodyBuilder } from "@/lib/Melody";
import MelodyExercise, {
  useMelodyExerciseStateManagement,
} from "@/components/blocks/MelodyExercise";
import SWRResponseHandler, {
  shouldRenderSWRResponseHandler,
} from "@/components/atoms/SwrResponseHandler";
import { useFetchExercise } from "@/lib/fetch/hooks";
import Modal from "@/components/atoms/Modal";
import { TempoSliderField } from "@/components/blocks/MusicFields";
import Loader from "@/components/atoms/Loader";
import PitchDetectionAnimation from "@/lib/animation-v2/PitchDetectionAnimation";

export default function ExercisePage() {
  const params = useSearchParams();
  const id = params?.get("id") as string;
  const exerciseQuery = useFetchExercise({ id });
  const [melody, setMelody] = useState<null | Melody>(null);
  const [isSettingsDrawerOpened, setIsSettingsDrawerOpened] = useState(false);
  const [settings, setSettings] = useState({
    tempo: 60,
  });
  const stateManagement = useMelodyExerciseStateManagement();

  const toggleDrawer = () => {
    const newValue = !isSettingsDrawerOpened;
    if (newValue) {
      stateManagement.pause();
    } else {
      stateManagement.start();
    }
    setIsSettingsDrawerOpened(newValue);
  };

  useEffect(() => {
    if (exerciseQuery.isLoading) {
      return;
    }

    const builder = new MelodyBuilder(exerciseQuery.data);
    const melody = builder.build();
    setSettings({
      tempo: melody.tempo,
    });
    setMelody(melody);
  }, [exerciseQuery.isLoading]);

  if (shouldRenderSWRResponseHandler(exerciseQuery)) {
    return (
      <Box
        width={"100vw"}
        height={"100vh"}
        display={"flex"}
        alignItems={"center"}
        justifyContent={"center"}
      >
        <SWRResponseHandler
          query={exerciseQuery}
          errorMessage={exerciseQuery.error?.error}
        />
      </Box>
    );
  }

  if (!melody) {
    return <Loader />;
  }

  return (
    <>
      <Box width={"100%"} height={"100%"}>
        <MelodyExercise
          melody={melody}
          onStopped={() => {
            setIsSettingsDrawerOpened(true);
          }}
          onPaused={() => {
            setIsSettingsDrawerOpened(true);
          }}
          tempoOverwrite={settings.tempo}
          stateManagement={stateManagement}
        />
      </Box>
      <SwipeableDrawer
        anchor={"right"}
        open={isSettingsDrawerOpened}
        onClose={toggleDrawer}
        onOpen={toggleDrawer}
      >
        <Box sx={{ width: "50vw", p: 4 }}>
          <Formik
            initialValues={settings}
            // validationSchema={FormValidationSchema}
            onSubmit={(values) => {
              setSettings(values);
              toggleDrawer();
            }}
          >
            <Form style={{ width: "100%" }}>
              <TempoSliderField />
              <Box display={"flex"} mt={2}>
                <Button type={"submit"} variant={"contained"} sx={{ mr: 2 }}>
                  Ok
                </Button>
                <Button
                  onClick={toggleDrawer}
                  variant={"contained"}
                  color={"secondary"}
                >
                  Cancel
                </Button>
              </Box>
            </Form>
          </Formik>
        </Box>
      </SwipeableDrawer>
      <Fab
        color="secondary"
        aria-label="settings"
        onClick={toggleDrawer}
        sx={{ position: "absolute", right: "10px", bottom: "10px" }}
      >
        <EditIcon />
      </Fab>
    </>
  );
}
