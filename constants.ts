import { Character, Voice, Music, CameraAngle } from './types';

export const APP_TITLE = "Veo 3.0 AI Video Generator";
export const APP_DESCRIPTION = "Transform your ideas into animated films. Define your story, characters, and cinematic style to generate unique 3-minute videos.";

export const CHARACTERS: Character[] = [
  {
    id: 1,
    name: "Iako",
    description: "Anak 4 tahun, gemuk, hanya pakai celana pendek merah.",
    defaultVoice: Voice.CHILD,
    image: "https://loremflickr.com/200/200/indonesian,child,boy/all?lock=1",
  },
  {
    id: 2,
    name: "Iopatua",
    description: "Kakek 60 tahun, botak, pakai sarung dan kaos hijau.",
    defaultVoice: Voice.JAVANESE_MAN,
    image: "https://loremflickr.com/200/200/indonesian,old,man/all?lock=2",
  },
  {
    id: 3,
    name: "Iomatua",
    description: "Nenek 50 tahun, bersanggul, baju kemeja kuning khas jaman dulu.",
    defaultVoice: Voice.JAVANESE_WOMAN,
    image: "https://loremflickr.com/200/200/indonesian,old,woman/all?lock=3",
  },
  {
    id: 4,
    name: "Nike",
    description: "Bibi 29 tahun, cantik, rambut panjang terurai.",
    defaultVoice: Voice.FRIENDLY_WOMAN,
    image: "https://loremflickr.com/200/200/indonesian,woman,beautiful/all?lock=4",
  },
  {
    id: 5,
    name: "Ndege",
    description: "Bapak 40 tahun, humoris, pakai blangkon jawa dan kaos hitam.",
    defaultVoice: Voice.JAVANESE_MAN,
    image: "https://loremflickr.com/200/200/indonesian,man,javanese/all?lock=5",
  },
  {
    id: 6,
    name: "Aslina",
    description: "Ibu 40 tahun, pakai kaos biru dan celana panjang.",
    defaultVoice: Voice.LOW_WOMAN,
    image: "https://loremflickr.com/200/200/indonesian,woman,mother/all?lock=6",
  },
];

export const VOICES: Voice[] = Object.values(Voice);
export const MUSIC_OPTIONS: Music[] = Object.values(Music);
export const CAMERA_ANGLES: CameraAngle[] = Object.values(CameraAngle);

export const LOADING_MESSAGES = [
    "Mempersiapkan studio virtual...",
    "Mengumpulkan para aktor digital...",
    "Menulis skrip adegan pertama...",
    "Menyesuaikan pencahayaan...",
    "Merekam dialog dengan voice actor AI...",
    "Merender frame demi frame...",
    "Menambahkan efek suara dan musik...",
    "Hampir selesai, memoles hasil akhir...",
];