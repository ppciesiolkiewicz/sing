"use client";
import { Inter } from '@next/font/google'
import { useRef, useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { PitchDetector as PD } from 'pitchy';
import paper, { view, Path, Group, Point, Size, PointText, Rectangle } from 'paper'
import { NoteModule, ScaleModule, ChordModule } from './music';
import * as Tone from 'tone';
import {
  MelodyConfig,
  Melody,
} from './Melody'

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import MuiSelect, { SelectChangeEvent } from '@mui/material/Select';
import MuiButton from '@mui/material/Button';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import MuiTextField from '@mui/material/TextField';
import { MultiSelectField } from '@/components/MultiSelect';

import { Formik, Field, Form, FormikHelpers, FieldProps } from 'formik';


function Select({
  options,
  onChange,
  value,
  label,
  id,
  name,
}: {
  label: string,
  id: string,
  name: string,
  options: {
    label: string,
    value: any,
  }[],
  onChange: any,
  value: any,
}) {
  return (
    <FormControl fullWidth>
      <InputLabel id={`${id}-label`}>{label}</InputLabel>
      <MuiSelect
        labelId={`${id}-label`}
        id={id}
        value={value}
        label={label}
        onChange={onChange}
        name={name}
        variant={'filled'}
      >
        {options.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
      </MuiSelect>
    </FormControl>
  )
}


function SelectField({
  id,
  name,
  options,
  label,
}: Pick<Parameters<typeof Select>[0], "id" | "name" | "options" | "label">) {
  return (
    <Field
      id={id}
      name={name}
      // placeholder="john@acme.com"
      // type="email"
    >
      {(props) => {
        return (
          <Select
            id={props.field.id}
            name={props.field.name}
            label={label}
            options={options}
            onChange={props.form.handleChange}
            value={props.field.value}
          />
        )
      }}
  </Field>
  );
}

function NoteSelectField({
  id,
  name,
  label,
}: Pick<Parameters<typeof Select>[0], "id" | "name" | "label">) {
  const options = NoteModule.getAllNotes('C1', 'C5').map(n => ({
    label: n.name,
    value: n.name,
  }));

  return (
    <SelectField
      id={id}
      name={name}
      label={label}
      options={options}
    />
  )
}


function TextFieldField({
  id,
  name,
  type,
  label,
}: Pick<Parameters<typeof MuiTextField>[0], "id" | "name" | "type" | "label">) {
  return (
    <Field
      id={id}
      name={name}
      // placeholder="john@acme.com"
      // type="email"
    >
      {props => (
        <MuiTextField
          fullWidth
          id={id}
          name={name}
          label={label}
          type={type}
          value={props.field.value}
          onChange={props.form.handleChange}
          variant={'outlined'}
          color={'primary'}
          // error={formik.touched.password && Boolean(formik.errors.password)}
          // helperText={formik.touched.password && formik.errors.password}
        />
      )}
    </Field>
  );
}

const inter = Inter({ subsets: ['latin'] })

const theme = {
  background: '#fff',
  noteLines: {
    line: '#454545',
    text: '#454545',
  },
  noteRects: {
    normal: '#454545',
    active: '#f0f0f0',
    success: '#00aa00',
    fail: '#aa0000',
  },
  pitchCircle: {
    normal: '#454545',
    success: '#00aa00',
    fail: '#aa0000',
  },
};

type Hz = number;
type LogHz = number;
type Pixel = number;
type PixelPerHz = number;

function getPitch(analyserNode: any, detector: any, input: any, audioContext: any): [Hz, number, number] {
  analyserNode.getFloatTimeDomainData(input);

  let sumSquares = 0;
  for (const amplitude of input) {
    sumSquares += amplitude*amplitude;
  }
  const volume = Math.sqrt(sumSquares / input.length);
  const [pitch, clarity] = detector.findPitch(input, audioContext.sampleRate);

  return [pitch, clarity, volume]
}


function ConfigPanelTimesCommon() {
  // repeatTimes: 5,
  // timePerNote: 1,
  // timeBetweenNotes: 0.1,
  // timeBetweenRepeats: 1,
  return (
    <>
      <Grid item xs={12}>
        <TextFieldField
          id="repeatTimes"
          name="repeatTimes"
          label="Repeat"
          type="number"
        />
      </Grid>
      <Grid item xs={12}>
        <TextFieldField
          id="timePerNote"
          name="timePerNote"
          label="Time per note"
          type="number"
        />
      </Grid>
      <Grid item xs={12}>
        <TextFieldField
          id="timeBetweenNotes"
          name="timeBetweenNotes"
          label="Time between notes"
          type="number"
        />
      </Grid>
      <Grid item xs={12}>
        <TextFieldField
          id="timeBetweenRepeats"
          name="timeBetweenRepeats"
          label="Time between repeats"
          type="number"
        />
      </Grid>
    </>
  );
}

function ConfigPanelNoteBoundaries() {
  return (
    <>
      <Grid item xs={12}>
        <NoteSelectField
          id={'lowestNoteName'}
          name={'lowestNoteName'}
          label={'Lowest Note'}
        />
      </Grid>
      <Grid item xs={12}>
        <NoteSelectField
          id={'highestNoteName'}
          name={'highestNoteName'}
          label={'Highest Note'}
        />
      </Grid>
    </>
  );
}

function ConfigPanelInterval() {
  const intervals = ['1P', '2M', '3M', '4P', '5P', '6m', '7m'];
  const options = intervals.map(interval => ({
    value: interval,
    label: interval,
  }))
  return (
    <>
      <Grid item xs={12}>
        <MultiSelectField
          id={'intervalNames'}
          name={'intervalNames'}
          label={'Intervals'}
          options={options}
        />
      </Grid>
      <ConfigPanelNoteBoundaries />
      <ConfigPanelTimesCommon />
    </>
  );
}


function ConfigPanelScale() {
  // scale: ScaleModule.get('C', 'blues'),
  return (
    <>
      <Grid item xs={12}>
        <SelectField
          id={'keyTonic'}
          name={'keyTonic'}
          label={'Key Tonic'}
          // TODO: hack to get keyTonics...
          options={NoteModule.getAllNotes('C1', 'C2').map(n => ({
            label: n.pc,
            value: n.pc,
          }))}
        />
      </Grid>
      <Grid item xs={12}>
        <SelectField
          id={'keyType'}
          name={'keyType'}
          label={'Key Type'}
          options={ScaleModule.names().map(n => ({
            label: n,
            value: n,
          }))}
        />
      </Grid>
      <ConfigPanelNoteBoundaries />
      <ConfigPanelTimesCommon />
    </>
  );
}

function ConfigPanelChords() {
  // chordNames: ['C4maj', 'G4maj', 'D4min']
  return (
    <>
    </>
  );
}


function ConfigPanelNotes() {
  // fromNotes
  return (
    <>
      Not implemented
    </>
  );
}

const CONFIG_TYPE_INTERVAL = 'Interval';
const CONFIG_TYPE_SCALE = 'Scale';
const CONFIG_TYPE_CHORDS = 'Chords';
const CONFIG_TYPE_NOTES = 'Notes';

function ConfigPanelForm({ configType }: { configType: string }) {
  switch(configType) {
    case CONFIG_TYPE_INTERVAL:
      return (
        <ConfigPanelInterval />
      );
    case CONFIG_TYPE_SCALE:
      return (
        <ConfigPanelScale />
      );
    case CONFIG_TYPE_CHORDS:
      return (
        <ConfigPanelChords />
      );
    case CONFIG_TYPE_NOTES:
      return (
        <ConfigPanelNotes />
      );
  }

  return (
    <Box>Invalid config type</Box>
  )
}

type ConfigPanelValues =
    Parameters<typeof MelodyConfig.fromScale>[0] &
    Parameters<typeof MelodyConfig.fromChords>[0] &
    Parameters<typeof MelodyConfig.fromIntervals>[0] &
    {
      configType: string;
    };

function ConfigPanel({
  onStartClick,
  started,
}: {
  onStartClick: (melody: Melody) => void,
  started: boolean,
}) {
  const configTypeOptions = [
    {
      label: 'Interval',
      value: CONFIG_TYPE_INTERVAL,
    },
    {
      label: 'Scale',
      value: CONFIG_TYPE_SCALE,
    },
    {
      label: 'Chords',
      value: CONFIG_TYPE_CHORDS,
    },
    {
      label: 'Notes',
      value: CONFIG_TYPE_NOTES,
    },
  ]

  const getInitialValues = (configType: string) => {
    const timeCommonInitialValues = {
      repeatTimes: 1,
      timePerNote: 1,
      timeBetweenNotes: 0.1,
      timeBetweenRepeats: 1,
    };

    switch(configType) {
      case CONFIG_TYPE_INTERVAL:
        return {
          ...timeCommonInitialValues,
        };
      case CONFIG_TYPE_SCALE:
        return {
          ...timeCommonInitialValues,
        };
      case CONFIG_TYPE_CHORDS:
        return {};
      case CONFIG_TYPE_NOTES:
        return {};
    }
  }

  return (
    <Formik
      initialValues={{
        configType: CONFIG_TYPE_INTERVAL,
        repeatTimes: 3,
        timePerNote: 1,
        timeBetweenNotes: 0.1,
        timeBetweenRepeats: 1,
        highestNoteName: 'G4',
        lowestNoteName: 'A2',
        keyTonic: 'C',
        keyType: 'major',
        chordNames: [],
        intervalNames: [],
      }}
      onSubmit={(
        values: ConfigPanelValues,
        { setSubmitting }: FormikHelpers<ConfigPanelValues>
      ) => {
        console.log('values', values);

        let config = null;
        

        if (values.configType === CONFIG_TYPE_INTERVAL) {
          config = MelodyConfig.fromIntervals({
            intervalNames: values.intervalNames.map(({ value }) => value),
            lowestNoteName: values.lowestNoteName,
            highestNoteName: values.highestNoteName,
            repeatTimes: values.repeatTimes,
            timePerNote: values.timePerNote,
            timeBetweenNotes: values.timeBetweenNotes,
            timeBetweenRepeats: values.timeBetweenRepeats,
          })
        }  else if (values.configType === CONFIG_TYPE_SCALE) {
          config = MelodyConfig.fromScale({
            keyTonic: values.keyTonic,
            keyType: values.keyType,
            lowestNoteName: values.lowestNoteName,
            highestNoteName: values.highestNoteName,
            repeatTimes: values.repeatTimes,
            timePerNote: values.timePerNote,
            timeBetweenNotes: values.timeBetweenNotes,
            timeBetweenRepeats: values.timeBetweenRepeats,
          })
        } else if (values.configType === CONFIG_TYPE_CHORDS) { 
          config = MelodyConfig.fromChords({
            chordNames: ['C4maj', 'G4maj', 'D4min']
          })
        } else {
          throw new Error("Unrecognized config type")
        }
        
        const melody = new Melody(config);
        onStartClick(melody);
      }}
    >
      {formik => {
        // useEffect(() => {
        //   formik.setValues({
        //     configType: formik.values.configType,
        //     ...getInitialValues(formik.values.configType),
        //   })
        // }, [formik.setValues, formik.values.configType])
        return (
          <Form>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <SelectField
                  label="Exercise Type"
                  id="configType"
                  name="configType"
                  options={configTypeOptions}
                />
              </Grid>
              <ConfigPanelForm
                configType={formik.values.configType}
              />
              <Grid item xs={12}>
                <MuiButton
                  fullWidth
                  variant={'contained'}
                  color={'primary'}
                  type={'submit'}
                  >
                  {started ? 'Stop' : 'Start'}
                </MuiButton>
              </Grid>
            </Grid>
          </Form>
        );
      }}
    </Formik>
  );
}

export default function Home() {
  const [started, setStarted] = useState(false);
  const [melody, setMelody] = useState<Melody | null>(null);
  const streamRef = useRef<any>(null);
  const canvasRef = useRef<any>(null);

  useLayoutEffect(() => {
    if (!navigator.getUserMedia) {
      alert('Your browser cannot record audio. Please switch to Chrome or Firefox.');
      return;
    }

    if (!started || streamRef.current) {
      return;
    }

    (async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const analyserMinDecibels = -35
      const analyserMaxDecibels = -10
      const analyserSmoothingTimeConstant = 0.85
      const audioContext = new window.AudioContext();
      const analyserNode = audioContext.createAnalyser();
      analyserNode.minDecibels = analyserMinDecibels;
      analyserNode.maxDecibels = analyserMaxDecibels;
      analyserNode.smoothingTimeConstant = analyserSmoothingTimeConstant;
    
      const sourceNode = audioContext.createMediaStreamSource(stream);
      sourceNode.connect(analyserNode);
      const detector = PD.forFloat32Array(analyserNode.fftSize);
      const input = new Float32Array(detector.inputLength);

      streamRef.current = {
        analyserNode, detector, input, audioContext,
      };
    })();
  }, [started])

  useLayoutEffect(function render() {
    if (!started || !melody) {
      if (view) {
        view.remove()
      }
      return;
    }

    const CHROMATIC_SCALE_NOTES = NoteModule.getAllNotes(
      Math.min(...melody.melodySing.map(e => e.note.freq!)),
      Math.max(...melody.melodySing.map(e => e.note.freq!)),
    );


    const canvas = canvasRef.current;
    paper.setup(canvas)

    if (window.devicePixelRatio > 1) {
      var ctx = canvas.getContext('2d');
      var canvasWidth = canvas.width;
      var canvasHeight = canvas.height;
  
      canvas.width = canvasWidth * window.devicePixelRatio;
      canvas.height = canvasHeight * window.devicePixelRatio;
      // canvas.style.width = canvasWidth + "px";
      // canvas.style.height = canvasHeight + "px";
  
      ctx.scale(window.devicePixelRatio * 2, window.devicePixelRatio * 2);
  }

  // set origin to bottom-left corner
  // ctx.translate(0, canvas.height);
  // ctx.scale(1, -1);
    
    const pitchCircle = new Path.Circle({
      center: view.center,
      radius: 10,
      fillColor: new paper.Color(theme.pitchCircle.normal)
    });

    let isSingPitchQualityAccepted = false;


    const padding: Pixel = 20 * window.devicePixelRatio;
    const heightWithoutPadding: Pixel = view.size.height - padding*2;
    const minNoteLogFreq: LogHz = Math.log2(CHROMATIC_SCALE_NOTES[0].freq!);
    const maxNoteLogFreq: LogHz = Math.log2(CHROMATIC_SCALE_NOTES[CHROMATIC_SCALE_NOTES.length - 1].freq!);
    const diffLogFreq: LogHz = maxNoteLogFreq! - minNoteLogFreq!;
    const pixelsPerLogHertz: PixelPerHz = heightWithoutPadding / diffLogFreq;
    // console.log(minNoteLogFreq, maxNoteLogFreq, diffLogFreq, pixelsPerLogHertz);
    
    const freqToCanvasYPosition = (freq: number) => {
      return Math.log2(freq) * pixelsPerLogHertz - minNoteLogFreq! * pixelsPerLogHertz + padding;
    };

    function movePitchCircle(stream: any, pitchCircle: any) {
      const [pitch, clarity, volume] = getPitch(
        stream.analyserNode,
        stream.detector,
        stream.input,
        stream.audioContext,
      );
    
      if (volume < 0.02 || clarity < 0.5) {
        isSingPitchQualityAccepted = false;
        pitchCircle.fillColor = new paper.Color(theme.pitchCircle.fail)
        return null;
      }

      isSingPitchQualityAccepted = true;
      pitchCircle.fillColor = new paper.Color(theme.pitchCircle.success)
      const dest = new Point(view.size.width/2, freqToCanvasYPosition(pitch));
      pitchCircle.position = dest
    }

    function drawScaleLines() {
      CHROMATIC_SCALE_NOTES.forEach((note) => {
        const noteYPosition = freqToCanvasYPosition(note.freq!);
        const line = new Path.Line(
          new Point(0, noteYPosition),
          new Point(view.size.width, noteYPosition),
        );
        line.strokeWidth = 1;// * window.devicePixelRatio;
        line.strokeColor = new paper.Color(theme.noteLines.line);
        line.strokeCap = 'round';

        const text = new PointText(new Point(15 * window.devicePixelRatio, noteYPosition));
        text.content = note.name;
        text.style = {
            fontFamily: 'Courier New',
            fontWeight: 'bold',
            fontSize: 12 * window.devicePixelRatio,
            fillColor: new paper.Color(theme.noteLines.text),
            justification: 'center'
        };
      });
    }

    // Synth
    const synth = new Tone.PolySynth().toDestination();
    synth.set({
      oscillator: {
        // partialCount: 10,
        // type: 'sine',
      },
      portamento: 10,
      envelope: {
        attack: 0.5,
      }
    });
    // console.log(Tone.PolySynth.getDefaults().voice.getDefaults())
    // console.log('Synth.get', synth.get())
    // draw melody elements
    const melodyPixelsPerSecond = 100;
    const melodyNoteSelectedMaxFreqDiff: Hz = 10;
    const melodyPercentFrameHitToAccept = 0.5;
    const melodySingRects = melody.melodySing.map(m => {
      const startPosX =  m.note.start * melodyPixelsPerSecond;
      const startPosY = freqToCanvasYPosition(m.note.freq!) - 10;
      const endPosX = m.note.end * melodyPixelsPerSecond;
      const endPosY = freqToCanvasYPosition(m.note.freq!) + 10;

      const rect = new Rectangle(
        new Point(view.center.x + startPosX, startPosY),
        new Size(endPosX - startPosX, endPosY - startPosY),
      )
      const path = new Path.Rectangle(rect);
      path.fillColor = new paper.Color(theme.noteRects.normal);
      path.selected = false;

      return [path, rect];
    });


    drawScaleLines();
    view.onFrame = async (ev: { delta: number, time: number, count: number }) => {
      if (!streamRef.current) {
        return
      }

      movePitchCircle(streamRef.current, pitchCircle);


      melody.melodyPlay
        .forEach((m) => {
          if (!m.played && ev.time >= m.start) {
            synth.triggerAttackRelease(m.notes.map(n => n.name), m.duration)
            m.played = true;
          }
        })


      melodySingRects.forEach(([path, rect], idx) => {
        var dest = new Point(path.position.x - ev.delta * melodyPixelsPerSecond, path.position.y);
        path.position = dest;


        if (!melody.melodySing[idx].completed) {
          
          if (path.bounds.left < view.center.x) {

            if (!melody.melodySing[idx].started) {
              melody.melodySing[idx].started = true;
            }

            melody.melodySing[idx].totalFrames += 1;

            if (
              isSingPitchQualityAccepted &&
              pitchCircle.position.y < path.bounds.bottom &&
              pitchCircle.position.y > path.bounds.top
            ) {
              path.selected = true;
              melody.melodySing[idx].framesHit += 1;
            } else {
              path.selected = false;
            }
          }
        }
        

        if (!melody.melodySing[idx].completed && path.bounds.right < view.center.x) {
          melody.melodySing[idx].completed = true;
          melody.melodySing[idx].percentHit = (melody.melodySing[idx].framesHit / melody.melodySing[idx].totalFrames);
          path.selected = false;
        }

        if (melody.melodySing[idx].completed) {
          if (melody.melodySing[idx].percentHit > melodyPercentFrameHitToAccept) {
            path.fillColor = new paper.Color(theme.noteRects.success);
          } else {
            path.fillColor = new paper.Color(theme.noteRects.fail);
          }
        }

        if (melody.melodySing[melody.melodySing.length - 1].completed) {
          // TODO show results - have a function that runs on Stop as well
          view.remove();
          setStarted(false);
        }
      })
    }
  }, [started]);

  return (
    <main
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'row',
      }}
    >
        <Box flex={5}>
          <canvas style={{ width: '100%', height: '100%' }} id="canvas" ref={canvasRef} />
        </Box>
        <Box flex={1} display={'flex'} flexDirection={'column'} p={2} component={Paper}>
          <ConfigPanel
            started={started}
            onStartClick={(melody: Melody) => {
              setMelody(melody)
              setStarted(!started)
            }}
          />
        </Box>
    </main>
  )
}
