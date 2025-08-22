// Core functions and properties
export function version(): string;
export function isSupportedCPU(): boolean;
export function initialize(): void;
export function destroy(): void;

// Color format constants
export const COLOR_FORMAT_BGRX_BGRA: 0;
export const COLOR_FORMAT_UYVY_BGRA: 1;
export const COLOR_FORMAT_RGBX_RGBA: 2;
export const COLOR_FORMAT_UYVY_RGBA: 3;
export const COLOR_FORMAT_BGRX_BGRA_FLIPPED: 200;
export const COLOR_FORMAT_FASTEST: 100;

// FourCC constants
export const FOURCC_UYVY: number;
export const FOURCC_UYVA: number;
export const FOURCC_P216: number;
export const FOURCC_PA16: number;
export const FOURCC_YV12: number;
export const FOURCC_I420: number;
export const FOURCC_NV12: number;
export const FOURCC_BGRA: number;
export const FOURCC_BGRX: number;
export const FOURCC_RGBA: number;
export const FOURCC_RGBX: number;
export const FOURCC_FLTp: number;

// Bandwidth constants
export const BANDWIDTH_METADATA_ONLY: -10;
export const BANDWIDTH_AUDIO_ONLY: 10;
export const BANDWIDTH_LOWEST: 0;
export const BANDWIDTH_HIGHEST: 100;

// Format type constants
export const FORMAT_TYPE_PROGRESSIVE: 1;
export const FORMAT_TYPE_INTERLACED: 0;
export const FORMAT_TYPE_FIELD_0: 2;
export const FORMAT_TYPE_FIELD_1: 3;

// Audio format constants
export const AUDIO_FORMAT_FLOAT_32_SEPARATE: 0;
export const AUDIO_FORMAT_FLOAT_32_INTERLEAVED: 1;
export const AUDIO_FORMAT_INT_16_INTERLEAVED: 2;

// Type aliases for constants (for backwards compatibility and better typing)
export type ColorFormat = 
  | typeof COLOR_FORMAT_BGRX_BGRA
  | typeof COLOR_FORMAT_UYVY_BGRA
  | typeof COLOR_FORMAT_RGBX_RGBA
  | typeof COLOR_FORMAT_UYVY_RGBA
  | typeof COLOR_FORMAT_BGRX_BGRA_FLIPPED
  | typeof COLOR_FORMAT_FASTEST;

export type FourCC = 
  | typeof FOURCC_UYVY
  | typeof FOURCC_UYVA
  | typeof FOURCC_P216
  | typeof FOURCC_PA16
  | typeof FOURCC_YV12
  | typeof FOURCC_I420
  | typeof FOURCC_NV12
  | typeof FOURCC_BGRA
  | typeof FOURCC_BGRX
  | typeof FOURCC_RGBA
  | typeof FOURCC_RGBX
  | typeof FOURCC_FLTp;

export type FrameType =
  | typeof FORMAT_TYPE_PROGRESSIVE
  | typeof FORMAT_TYPE_INTERLACED
  | typeof FORMAT_TYPE_FIELD_0
  | typeof FORMAT_TYPE_FIELD_1;

export type AudioFormat =
  | typeof AUDIO_FORMAT_FLOAT_32_SEPARATE
  | typeof AUDIO_FORMAT_FLOAT_32_INTERLEAVED
  | typeof AUDIO_FORMAT_INT_16_INTERLEAVED;

export type Bandwidth =
  | typeof BANDWIDTH_METADATA_ONLY
  | typeof BANDWIDTH_AUDIO_ONLY
  | typeof BANDWIDTH_LOWEST
  | typeof BANDWIDTH_HIGHEST;

// Interfaces
export interface AudioFrame {
  type: 'audio'
  audioFormat: AudioFormat
  referenceLevel: number
  sampleRate: number // Hz
  channels: number
  samples: number
  channelStrideInBytes: number
  timestamp: [number, number] // PTP timestamp
  timecode: [number, number] // timecode as PTP value
  data: Buffer
}

export interface VideoFrame {
  type: 'video'
  xres: number
  yres: number
  frameRateN: number
  frameRateD: number
  fourCC: FourCC
  pictureAspectRatio: number
  timestamp: [ number, number ] // PTP timestamp
  frameFormatType: FrameType
  timecode: [ number, number ] // Measured in nanoseconds
  lineStrideBytes: number
  data: Buffer
}

export interface Source {
  name: string
  urlAddress?: string
}

export interface Receiver {
  embedded: unknown
  video: (timeout?: number) => Promise<VideoFrame>
  audio: (params: {
    audioFormat: AudioFormat
    referenceLevel: number
  }, timeout?: number) => Promise<AudioFrame>
  metadata: any
  data: any
  source: Source
  colorFormat: ColorFormat
  bandwidth: Bandwidth
  allowVideoFields: boolean
}

export interface Sender {
  embedded: unknown
  destroy: () => Promise<void>
  video: (frame: VideoFrame) => Promise<void>
  audio: (frame: AudioFrame) => Promise<void>
  name: string
  groups?: string | string[]
  clockVideo: boolean
  clockAudio: boolean
}

export interface Routing {
  name: string
  groups?: string
  embedded: unknown
  destroy: () => Promise<void>
  change: (source: Source) => number
  clear: () => boolean
  connections: () => number
  sourcename: () => string
}

// Main functions
export function find(params?: {
  showLocalSources?: boolean
  groups?: string | string[]
  extraIPs?: string | string[]
}): Promise<Source[]>

export function receive(params: {
  source: Source
  colorFormat?: ColorFormat
  bandwidth?: Bandwidth
  allowVideoFields?: boolean
  name?: string
}): Receiver

export function send(params: {
  name: string
  groups?: string | string[]
  clockVideo?: boolean
  clockAudio?: boolean
}): Sender

export function routing(params: {
  name: string
  groups?: string | string[]
}): Routing