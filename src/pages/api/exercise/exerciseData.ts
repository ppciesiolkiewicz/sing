import {
  CONFIG_TYPE_INTERVAL,
  CONFIG_TYPE_SCALE,
  CONFIG_TYPE_CHORDS,
  CONFIG_TYPE_NOTES,
} from '@/constants';
import { NoteModule, ScaleModule, IntervalModule, ChordModule } from '@/lib/music';
import { INSTRUMENT_PIANO1 } from '@/constants';
import { TrackNote, TrackLyrics } from '@/lib/Melody'

export const getSongExercises = () => {
  return [
    {
      id: `elvis-presley-cant-help-falling-in-love`,
      title: `Can't help falling in love`,
      description: `Try singing Elvis Presley classic tune`,
      configType: CONFIG_TYPE_NOTES,
      config: {
        singTrack: [
          ['D2', 0, 3],
          ['A2', 3, 3],
          ['D2', 6, 5],
          ['E2', 11, 0.5],
          ['F#2', 11.5, 0.5],
          ['G2', 12, 3],
          ['F#2', 15, 3],
          ['E2', 18, 3],
        ],
        backingTrack: [
          // ['D2', 0, 3],
          // ['A2', 3, 3],
          // ['D2', 6, 5],
          // ['E2', 11, 1],
          // ['F#2', 12, 1],
          // ['G2', 13, 3],
          // ['F#2', 16, 3],
          // ['E2', 19, 3],
          ChordModule.get('D', { octave: 2 }).notes.map(n => [n, 0, 3]),
          ChordModule.get('F#m', { octave: 2 }).notes.map(n => [n, 3, 3]),
          ChordModule.get('Bm', { octave: 2 }).notes.map(n => [n, 6, 3]),
          ChordModule.get('Bm', { octave: 2 }).notes.map(n => [n, 9, 3]),
          ChordModule.get('G', { octave: 2 }).notes.map(n => [n, 12, 3]),
          ChordModule.get('D', { octave: 2 }).notes.map(n => [n, 15, 3]),
          ChordModule.get('A', { octave: 2 }).notes.map(n => [n, 18, 3]),
        ].flat(),
        listenTrack: [],
        lyricsTrack: [
          ['Wise', 0, 3],
          ['man', 3, 3],
          ['say', 6, 5],
          ['Only', 11, 1],
          ['fools', 12, 3],
          ['rush', 15, 3],
          ['in', 18, 3],
        ],
        tempo: 85,
        instrument: INSTRUMENT_PIANO1,
      }
    }
  ];
}

export const getScaleExercises = (lowestNoteName: string, highestNoteName: string) => {
  const RANGE_IDX_TO_DESCRIPTION = {
    0: 'Lower part of your vocal range',
    1: 'Main part of your vocal range',
    2: 'Upper part of your vocal range',
  }
  const SCALE_EXERCISES = NoteModule.names().map(keyTonic => 
    ScaleModule.relevantNames().map(keyType => {
      const scaleNotes = ScaleModule.getScaleNotes(keyTonic, keyType, lowestNoteName, highestNoteName);
      const scaleNotesParts = ScaleModule.splitIntoRangesByTonic(keyTonic, scaleNotes);
      
        return scaleNotesParts.map((part, i) => {
          if (part.length < 3) {
            return null
          }
          const lowestNoteName = part[0];
          const highestNoteName = part[part.length - 1];
          const description_part = RANGE_IDX_TO_DESCRIPTION[i];
          return ({
              id: `scale-${keyTonic}-${keyType}-${lowestNoteName}-${highestNoteName}`,
              title: `${keyTonic} ${keyType} scale - ${description_part}`,
              description: `Enhance your singing precision by practicing the ${keyTonic} ${keyType} scale. ${description_part} - ${lowestNoteName} — ${highestNoteName}`,
              configType: CONFIG_TYPE_SCALE,
              config: {
                keyTonic: keyTonic,
                keyType: keyType,
                lowestNoteName,
                highestNoteName,
                repeatTimes: 1,
                timePerNote: 1,
                timeBetweenNotes: 0,
                timeBetweenRepeats: 3,
                tempo: 60,
                instrument: INSTRUMENT_PIANO1,
              },
            })
          }).filter(Boolean);
        })
    ).flat().flat().flat();

    return SCALE_EXERCISES;
}

export const getIntervalExercises = (lowestNoteName: string, highestNoteName: string) => {
  const INTERVAL_ERXERCISES = [
    {
      title: '5T Scale Exercise',
      intervalNames: ['1P', '2M', '3M', '4P', '5P', '4P', '3M', '2M', '1P'],
    },
    ...IntervalModule.names().map(intervalName => ({
      title: `Interval ${intervalName}`,
      intervalNames: ['1P', '1P', intervalName, '1P'],
    })),
  ]
    .map((e, i) => ({
        id: `intervals-${e.intervalNames.join('-')}`,
        title: `${e.title}`,
        description: `Intervals: ${e.intervalNames.join('-')}. Exercise range ${lowestNoteName} — ${highestNoteName}`,
        configType: CONFIG_TYPE_INTERVAL,
        config: {
          repeatTimes: 1,
          timePerNote: 0.5,
          timeBetweenNotes: 0,
          timeBetweenRepeats: 3,
          highestNoteName,
          lowestNoteName,
          intervalNames: e.intervalNames,
          tempo: 60,
          instrument: INSTRUMENT_PIANO1,
        },
      })
    );

  return INTERVAL_ERXERCISES;
};