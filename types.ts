
export interface Character {
  id: number;
  name: string;
  description: string;
  defaultVoice: Voice;
  image: string;
}

export interface SelectedCharacter extends Character {
  voice: Voice;
  pitch: number; // Range: -1 to 1
  speed: number; // Range: 0.5 to 2
}

export enum Voice {
  CHILD = "Suara Anak Kecil",
  OLD_MAN = "Suara Kakek-kakek Tua",
  OLD_WOMAN = "Suara Nenek-nenek",
  FRIENDLY_WOMAN = "Suara Wanita Dewasa Ramah",
  WISE_MAN = "Suara Pria Dewasa Bijak",
  LOW_WOMAN = "Suara Wanita Dewasa Rendah",
  JAVANESE_MAN = "Pria Jawa",
  JAVANESE_WOMAN = "Wanita Jawa",
  SUNDANESE_MAN = "Pria Sunda",
  SUNDANESE_WOMAN = "Wanita Sunda",
}

export enum Music {
  DRAMATIC = "Dramatic",
  HAPPY = "Happy",
  CALM = "Calm",
  EPIC = "Epic",
  NONE = "None",
  CINEMATIC = "Cinematic",
  UPBEAT = "Upbeat",
  RELAXING = "Relaxing",
}

export enum CameraAngle {
  WIDE = "Wide Shot",
  CLOSE_UP = "Close-up",
  MEDIUM = "Medium Shot",
  AERIAL = "Aerial View",
  POV = "Point of View",
}

export interface GenerationParams {
  apiKey: string;
  prompt: string;
  characters: SelectedCharacter[];
  music: Music;
  cameraAngle: CameraAngle;
  duration: number; // in seconds
}