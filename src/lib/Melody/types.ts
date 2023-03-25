export interface InstrumentConfig {
  baseUrl: string;
  urls?: { [key: string]: string };
  attack?: number;
  release?: number;
}