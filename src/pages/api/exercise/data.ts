import {
  CONFIG_TYPE_INTERVAL,
  CONFIG_TYPE_SCALE,
  CONFIG_TYPE_CHORDS,
  CONFIG_TYPE_NOTES,
} from '@/constants';

const EXERCISES = [
  {
    id: 1,
    title: 'C major scale',
    description: '',
    configType: CONFIG_TYPE_SCALE,
    config: {
      keyTonic: 'C',
      keyType: 'major',
      lowestNoteName: 'C3',
      highestNoteName: 'C4',
      repeatTimes: 2,
      timePerNote: 1,
      timeBetweenNotes: 0.1,
      timeBetweenRepeats: 3,
    },
  },
  {
    id: 2,
    title: 'C minor scale',
    description: '',
    configType: CONFIG_TYPE_SCALE,
    config: {
      keyTonic: 'C',
      keyType: 'minor',
      lowestNoteName: 'C3',
      highestNoteName: 'C4',
      repeatTimes: 2,
      timePerNote: 1,
      timeBetweenNotes: 0.1,
      timeBetweenRepeats: 3,
    },
  },
  {
    id: 3,
    title: 'Intervals - 1P 2M 3M 4P 5P 4P 3M 2M 1P',
    description: '',
    configType: CONFIG_TYPE_INTERVAL,
    config: {
      repeatTimes: 3,
      timePerNote: 2,
      timeBetweenNotes: 0.2,
      timeBetweenRepeats: 3,
      highestNoteName: 'C4',
      lowestNoteName: 'C3',
      intervalNames: ['1P', '2M', '3M', '4P', '5P', '4P', '3M', '2M', '1P'],
    },
  },
];

export default EXERCISES;