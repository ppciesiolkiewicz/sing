import { NoteModule, ScaleModule, ChordModule, IntervalModule } from '@/lib/music';
import {
  CONFIG_TYPE_INTERVAL,
  CONFIG_TYPE_SCALE,
  CONFIG_TYPE_CHORDS,
  CONFIG_TYPE_NOTES,
} from '@/constants';
import {
  NoteFactory,
  Note,
  Lyrics,
  SING_ALL_CHORD_COMPONENTS,
  SING_CHORD_ROOT_ONLY,
  PAUSE_NOTE_NAME,
} from './MelodyNote'
import type { NoteFactoryReturn, NoteConfig, LyricsConfig } from './MelodyNote'


class MelodyConfig implements NoteFactoryReturn {
  notesPlay: Note[];
  notesSing: Note[];
  lyrics: Lyrics[];

  constructor(config: NoteFactoryReturn) {
    this.notesPlay = config.notesPlay;
    this.notesSing = config.notesSing;
    this.lyrics = config.lyrics;
  }

  // Rename to fromJSON
  static fromObject({
    configType,
    config
  }: {
    configType: string,
    config: any,
  }) {
    if (configType === CONFIG_TYPE_CHORDS) {
      return MelodyConfig.fromChords(config);
    } else if (configType === CONFIG_TYPE_INTERVAL) {
      return MelodyConfig.fromIntervals(config);
    } else if (configType === CONFIG_TYPE_SCALE) {
      return MelodyConfig.fromScale(config);
    } else if (configType === CONFIG_TYPE_NOTES) {
      throw new Error('Not implemented');
    }

    throw new Error('Incorrect configType');
  }

  static fromChords({
    chordNames,
    includeAllChordComponents,
    repeatTimes,
    noteValue,
  }: {
    chordNames: string[],
    includeAllChordComponents: boolean,
    repeatTimes: number,
    noteValue: number,
  }) {
    return NoteFactory.fromChords(
      chordNames.map(chordName => ({
        chordName,
        mode: includeAllChordComponents ? SING_ALL_CHORD_COMPONENTS : SING_CHORD_ROOT_ONLY,
        noteValue,
      })),
    );
  }

  static fromScale({
    keyTonic,
    keyType,
    lowestNoteName,
    highestNoteName,
    repeatTimes,
    noteValue,
  }: {
    keyTonic: string,
    keyType: string,
    lowestNoteName: string,
    highestNoteName: string,
    repeatTimes: number,
    noteValue: number,
  }) {
    const scaleNotesNames = ScaleModule
      .getScaleNotes(keyTonic, keyType, lowestNoteName, highestNoteName)
      .map(n => n.name);
    const scaleNotesNamesBase = Array(repeatTimes)
      .fill(
        [...scaleNotesNames, PAUSE_NOTE_NAME, [...scaleNotesNames].reverse(), PAUSE_NOTE_NAME, PAUSE_NOTE_NAME]
        .flat()
      )
      .flat()
      .map(noteName => ({
        noteName,
        noteValue,
      }));

    return new MelodyConfig(
        NoteFactory.fromNotesNotesPlayEqualNotesSing(
          scaleNotesNamesBase,
        )
    );
  }

  static fromIntervals({
    intervalNames,
    lowestNoteName,
    highestNoteName,
    repeatTimes,
    noteValue,
  }: {
    intervalNames: string[],
    lowestNoteName: string,
    highestNoteName: string,
    repeatTimes: number,
    noteValue: number,
  }) {
    const intervals = intervalNames.map(name => IntervalModule.get(name));
    const CHROMATIC_SCALE_NOTES = NoteModule.getNoteRange(lowestNoteName, highestNoteName);

    let intervalNotes = CHROMATIC_SCALE_NOTES
      .map(note => {
        return [
          ...intervals.map(interval => {
            return NoteModule.transpose(note.name, interval);
          }),
          PAUSE_NOTE_NAME,
        ];
      })
      .flat()
    // intervalNotesBase = [...intervalNotesBase, ...intervalNotesBase.slice.()reverse()]
    const intervalNotesBase =  new Array(repeatTimes)
      .fill([...intervalNotes, PAUSE_NOTE_NAME])
      .flat()
      .map(noteName => ({
        noteName,
        noteValue,
      }));

    return new MelodyConfig(
        NoteFactory.fromNotesNotesPlayEqualNotesSing(
          intervalNotesBase,
        )
    );
  }

  static fromNotes(notes: NoteConfig[], lyrics?: LyricsConfig[]) {
    return new MelodyConfig(
      NoteFactory.fromNotesNotesPlayEqualNotesSing(
        notes,
        lyrics,
      )
    );
  }
}

export { MelodyConfig };