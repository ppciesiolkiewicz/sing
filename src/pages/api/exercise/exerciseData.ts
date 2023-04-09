import {
  CONFIG_TYPE_INTERVAL,
  CONFIG_TYPE_SCALE,
  CONFIG_TYPE_CHORDS,
  CONFIG_TYPE_NOTES,
} from '@/constants';
import { NoteModule, ScaleModule, IntervalModule, ChordModule } from '@/lib/music';
import { INSTRUMENT_PIANO1 } from '@/constants';
import mxlExercises from './mxlExercises';

export const getSongExercises = () => {
  return mxlExercises;
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