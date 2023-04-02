import {
  CONFIG_TYPE_INTERVAL,
  CONFIG_TYPE_SCALE,
  CONFIG_TYPE_CHORDS,
  CONFIG_TYPE_NOTES,
} from '@/constants';
import { NoteModule, ScaleModule, IntervalModule } from '@/lib/music';
import { INSTRUMENT_PIANO1 } from '@/constants';

export const getScaleExercises = (lowestNoteName: string, highestNoteName: string) => {
  const RANGE_IDX_TO_DESCRIPTION = {
    0: 'Lower part of your vocal range',
    1: 'Main part of your vocal range',
    2: 'Upper part of your vocal range',
  }
  const SCALE_EXERCISES = NoteModule.names().map(keyTonic => 
    ScaleModule.relevantNames().map(keyType => {
      const scaleNotes = ScaleModule.getScaleNotes(keyTonic, keyType, lowestNoteName, highestNoteName);

      // TODO: extract to music.tsx
      const splitIndices = [
        0,
        ...scaleNotes
          .reduce(function(acc, note, i) {
              // TODO: e[0]
              if (keyTonic.length == 2 && `${note.name[0]}${note.name[1]}` === keyTonic) {
                acc.push(i);
              } else if (note.name[0] == keyTonic) {
                acc.push(i);
              }

              return acc;
          }, [] as number[]),
          scaleNotes.length - 1,
        ];
      const scaleNotesParts = splitIndices
        .map((splitIdx, i) => {
          if (i === splitIndices.length - 1) {
            return [];
          }
  
          const part = scaleNotes.slice(splitIdx, splitIndices[i+1]+1)
          return part.map(n => n.name);
        })
      
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
                instrument: INSTRUMENT_PIANO1,
              },
            })
          }).filter(Boolean);
        })
    ).flat().flat().flat();

    return SCALE_EXERCISES;
}

// TODO: tempo slider instead
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
    .map((e, i) => [
      {
        id: `intervals-${e.intervalNames.join('-')}-fast`,
        title: `${e.title} - Fast`,
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
          instrument: INSTRUMENT_PIANO1,
        },
      },
      {
        id: `intervals-${e.intervalNames.join('-')}-slow`,
        title: `${e.title} - Slow`,
        description: `Intervals: ${e.intervalNames.join('-')}. Exercise range ${lowestNoteName} — ${highestNoteName}`,
        configType: CONFIG_TYPE_INTERVAL,
        config: {
          repeatTimes: 1,
          timePerNote: 1,
          timeBetweenNotes: 0,
          timeBetweenRepeats: 10,
          highestNoteName,
          lowestNoteName,
          intervalNames: e.intervalNames,
          instrument: INSTRUMENT_PIANO1,
        },
      },
    ])
    .flat();

  return INTERVAL_ERXERCISES;
};