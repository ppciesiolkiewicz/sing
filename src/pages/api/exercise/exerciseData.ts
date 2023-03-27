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

      const splitIndices = [
        0,
        ...scaleNotes
          .reduce(function(a, note, i) {
              // TODO: e[0]
              if (keyTonic.length == 2 && `${note.name[0]}${note.name[1]}` === keyTonic) {
                a.push(i);
              } else if (note.name[0] == keyTonic) {
                a.push(i);
              }

              return a;
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
                timeBetweenNotes: 0.1,
                timeBetweenRepeats: 3,
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
      intervalNames: ['1P', intervalName, '1P'],
    })),
  ].map((e, i) => ({
    id: `intervals-${e.intervalNames.join('-')}`,
    title: e.title,
    description: `Intervals: ${e.intervalNames.join('-')}. Exercise range ${lowestNoteName} — ${highestNoteName}`,
    configType: CONFIG_TYPE_INTERVAL,
    config: {
      repeatTimes: 1,
      timePerNote: 1,
      timeBetweenNotes: 0.2,
      timeBetweenRepeats: 3,
      highestNoteName,
      lowestNoteName,
      intervalNames: e.intervalNames,
      instrument: INSTRUMENT_PIANO1,
    },
  }))

  return INTERVAL_ERXERCISES;
};