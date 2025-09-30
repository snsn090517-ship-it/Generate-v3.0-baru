
import { SelectedCharacter, Voice } from '../types';

// Enhanced mapping with positive/negative keywords and prioritized language codes.
const voiceMap: Record<Voice, { lang: string[], nameKeywords: { positive: string[], negative: string[] } }> = {
    [Voice.CHILD]: { lang: ['id-ID', 'en-US'], nameKeywords: { positive: ['child', 'bocah', 'anak'], negative: ['adult', 'dewasa'] } },
    [Voice.OLD_MAN]: { lang: ['id-ID', 'en-GB'], nameKeywords: { positive: ['male', 'pria', 'kakek', 'senior', 'old'], negative: ['female', 'wanita'] } },
    [Voice.OLD_WOMAN]: { lang: ['id-ID', 'en-GB'], nameKeywords: { positive: ['female', 'wanita', 'nenek', 'senior', 'old'], negative: ['male', 'pria'] } },
    [Voice.FRIENDLY_WOMAN]: { lang: ['id-ID', 'en-US'], nameKeywords: { positive: ['female', 'wanita'], negative: ['male', 'pria'] } },
    [Voice.WISE_MAN]: { lang: ['id-ID', 'en-US'], nameKeywords: { positive: ['male', 'pria'], negative: ['female', 'wanita'] } },
    [Voice.LOW_WOMAN]: { lang: ['id-ID', 'en-GB'], nameKeywords: { positive: ['female', 'wanita'], negative: ['male', 'pria'] } },
    [Voice.JAVANESE_MAN]: { lang: ['jw-ID', 'id-ID'], nameKeywords: { positive: ['male', 'pria', 'jawa', 'javanese'], negative: ['female', 'wanita', 'sunda'] } },
    [Voice.JAVANESE_WOMAN]: { lang: ['jw-ID', 'id-ID'], nameKeywords: { positive: ['female', 'wanita', 'jawa', 'javanese'], negative: ['male', 'pria', 'sunda'] } },
    [Voice.SUNDANESE_MAN]: { lang: ['su-ID', 'id-ID'], nameKeywords: { positive: ['male', 'pria', 'sunda', 'sundanese'], negative: ['female', 'wanita', 'jawa'] } },
    [Voice.SUNDANESE_WOMAN]: { lang: ['su-ID', 'id-ID'], nameKeywords: { positive: ['female', 'wanita', 'sunda', 'sundanese'], negative: ['male', 'pria', 'jawa'] } },
};

let voices: SpeechSynthesisVoice[] = [];
let ttsInitialized = false;

// Safely initializes the TTS engine and populates voices.
const initializeTTS = () => {
    if (ttsInitialized || typeof window === 'undefined' || !window.speechSynthesis) {
        return;
    }

    const populateVoices = () => {
        voices = window.speechSynthesis.getVoices();
    };
    
    populateVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = populateVoices;
    }
    ttsInitialized = true;
};

/**
 * Finds the best available voice using a scoring system.
 * It prioritizes language (regional > general > fallback) and keyword matches.
 * @param characterVoice The desired abstract voice type.
 * @returns The best matching SpeechSynthesisVoice or a fallback.
 */
const findBestVoice = (characterVoice: Voice): SpeechSynthesisVoice | null => {
    initializeTTS();

    if (voices.length === 0) {
        console.warn("Speech synthesis voices not available or not yet loaded.");
        return null;
    }

    const criteria = voiceMap[characterVoice];
    let bestVoice: SpeechSynthesisVoice | null = null;
    let maxScore = -1;

    for (const voice of voices) {
        let score = 0;
        const voiceNameLower = voice.name.toLowerCase();

        // 1. Language scoring (prioritizing regional, then general, then others)
        const langIndex = criteria.lang.indexOf(voice.lang);
        if (langIndex === 0) { // Perfect match (e.g., jw-ID)
            score += 100;
        } else if (langIndex > 0) { // Fallback language (e.g., id-ID)
            score += 50 - (langIndex * 10); // Lower score for further fallbacks
        }

        // 2. Keyword scoring
        for (const keyword of criteria.nameKeywords.positive) {
            if (voiceNameLower.includes(keyword)) {
                score += 10;
            }
        }
        for (const keyword of criteria.nameKeywords.negative) {
            if (voiceNameLower.includes(keyword)) {
                score -= 50; // Heavy penalty for negative keywords
            }
        }

        // Check if this is the best voice so far
        if (score > maxScore) {
            maxScore = score;
            bestVoice = voice;
        }
    }
    
    // If no voice scored positively, fallback to a sensible default.
    if (maxScore <= 0) {
        console.warn(`Could not find a good match for ${characterVoice}. Falling back.`);
        return voices.find(v => v.lang === 'id-ID') || voices.find(v => v.lang.startsWith('en')) || voices[0] || null;
    }
    
    console.log(`Best voice for ${characterVoice}: ${bestVoice?.name} (Score: ${maxScore})`);
    return bestVoice;
};

interface DialogueItem {
    text: string;
    character: SelectedCharacter;
}

export class TTSService {
    private queue: DialogueItem[] = [];
    private currentIndex = 0;
    private hasStarted = false;

    constructor(dialogueQueue: DialogueItem[]) {
        initializeTTS(); // Initialize safely when an instance is created.
        this.queue = dialogueQueue;
    }

    public play() {
        if (this.hasStarted) {
            if (typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.resume();
            }
            return;
        }
        if (this.currentIndex >= this.queue.length) return;
        this.hasStarted = true;
        this.speakNext();
    }

    private speakNext() {
        if (this.currentIndex >= this.queue.length || typeof window === 'undefined' || !window.speechSynthesis) {
            this.hasStarted = false;
            return;
        }

        const currentDialogue = this.queue[this.currentIndex];
        const utterance = new SpeechSynthesisUtterance(currentDialogue.text);
        
        const voice = findBestVoice(currentDialogue.character.voice);
        if (voice) {
            utterance.voice = voice;
        }

        utterance.pitch = this.mapPitch(currentDialogue.character.pitch); // SpeechSynthesis pitch is 0-2
        utterance.rate = currentDialogue.character.speed; // SpeechSynthesis rate is 0.1-10

        utterance.onend = () => {
            this.currentIndex++;
            this.speakNext();
        };
        
        utterance.onerror = (event) => {
            console.error('SpeechSynthesisUtterance.onerror', event);
            this.currentIndex++;
            this.speakNext();
        };

        window.speechSynthesis.speak(utterance);
    }
    
    private mapPitch(pitch: number): number {
        return pitch + 1;
    }

    public pause() {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.pause();
        }
    }

    public cancel() {
        this.hasStarted = false;
        this.currentIndex = 0;
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    }
}