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
];

export default EXERCISES;