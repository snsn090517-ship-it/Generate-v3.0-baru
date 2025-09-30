import React, { useState, useEffect, useRef } from 'react';
import { SelectedCharacter, Music, CameraAngle, GenerationParams } from './types';
import { APP_TITLE, APP_DESCRIPTION, MUSIC_OPTIONS, CAMERA_ANGLES, LOADING_MESSAGES } from './constants';
import CharacterSelector from './components/CharacterSelector';
import { generateVideo } from './services/videoService';
import { TTSService } from './services/ttsService';

const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} menit ${remainingSeconds} detik`;
};

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');
  const [selectedCharacters, setSelectedCharacters] = useState<SelectedCharacter[]>([]);
  const [music, setMusic] = useState<Music>(Music.DRAMATIC);
  const [cameraAngle, setCameraAngle] = useState<CameraAngle>(CameraAngle.WIDE);
  const [duration, setDuration] = useState<number>(180); // Default 3 minutes

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>(LOADING_MESSAGES[0]);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const ttsServiceRef = useRef<TTSService | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    let interval: number;
    if (isLoading && !videoUrl) {
      let messageIndex = 0;
      interval = window.setInterval(() => {
        messageIndex = (messageIndex + 1) % LOADING_MESSAGES.length;
        setLoadingMessage(LOADING_MESSAGES[messageIndex]);
      }, 2000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isLoading, videoUrl]);

   // Cleanup TTS on component unmount
  useEffect(() => {
    return () => {
        if (ttsServiceRef.current) {
            ttsServiceRef.current.cancel();
        }
        // General cleanup for safety
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    }
  }, []);

  const handleGenerate = async () => {
    if (isLoading) return;
    
    if (ttsServiceRef.current) {
        ttsServiceRef.current.cancel();
    }
    setError(null);
    setVideoUrl(null);

    if (!apiKey) {
        setError('API Key diperlukan. Silakan masukkan API Key Anda dari RunwayML atau penyedia lain.');
        return;
    }
    if (apiKey.trim().length < 16) {
        setError('Format API Key tidak valid. Pastikan API Key yang Anda masukkan benar dan lengkap.');
        return;
    }
    if (!prompt.trim()) {
        setError('Prompt tidak boleh kosong. Jelaskan cerita yang ingin Anda buat.');
        return;
    }

    // Parse dialogue from prompt
    const dialogueQueue = [];
    const promptLines = prompt.split('\n');

    for (const line of promptLines) {
        // Corrected regex to capture content inside quotes without including the quotes
        const singleMatch = /^([a-zA-Z]+):\s*"([^"]*)"/.exec(line.trim());
        if(singleMatch) {
            const charName = singleMatch[1].trim();
            const text = singleMatch[2].trim();
            const character = selectedCharacters.find(c => c.name.toLowerCase() === charName.toLowerCase());

            if (character && text) {
                dialogueQueue.push({ text, character });
            }
        }
    }

    if (dialogueQueue.length > 0) {
        ttsServiceRef.current = new TTSService(dialogueQueue);
    } else {
        ttsServiceRef.current = null;
    }

    setIsLoading(true);
    setLoadingMessage(LOADING_MESSAGES[0]);
    
    const params: GenerationParams = {
      apiKey,
      prompt,
      characters: selectedCharacters,
      music,
      cameraAngle,
      duration,
    };

    try {
      const url = await generateVideo(params);
      setVideoUrl(url);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(`Gagal membuat video: ${e.message}`);
      } else {
        setError('Terjadi kesalahan yang tidak diketahui.');
      }
      if (ttsServiceRef.current) {
        ttsServiceRef.current.cancel();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoPlay = () => {
    if (ttsServiceRef.current) {
        ttsServiceRef.current.play();
    }
  };
  
  const handleVideoPause = () => {
    if (ttsServiceRef.current) {
        ttsServiceRef.current.pause();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="text-center my-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-500">{APP_TITLE}</h1>
          <p className="mt-4 text-lg text-gray-400 max-w-3xl mx-auto">{APP_DESCRIPTION}</p>
        </header>

        <div className="bg-gray-800/50 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-700 space-y-8">
          
          <div>
            <label htmlFor="api-key" className="block text-xl font-semibold text-cyan-300 mb-2">
              API Key
            </label>
            <div className="relative">
               <input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Masukkan API Key Anda (contoh: dari RunwayML)"
                className="w-full bg-gray-900 border border-gray-600 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.629 5.875M9 10a2 2 0 100-4 2 2 0 000 4zm12 9a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h4M8 11V9a4 4 0 118 0v2M12 15h.01" /></svg>
            </div>
          </div>
          
          <div>
            <label htmlFor="prompt" className="block text-xl font-semibold text-cyan-300 mb-2">
              Prompt Cerita
            </label>
            <textarea
              id="prompt"
              rows={6}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={'Contoh: Scene 1: Iako bermain di tepi hutan.\nIako: "Wah, ada kupu-kupu!"\nIopatua: "Hati-hati, jangan terlalu jauh."'}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
            />
          </div>

          <CharacterSelector selectedCharacters={selectedCharacters} setSelectedCharacters={setSelectedCharacters} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-700/50">
            <div>
              <label htmlFor="music" className="block text-xl font-semibold text-cyan-300 mb-2">Musik Latar</label>
              <select id="music" value={music} onChange={(e) => setMusic(e.target.value as Music)} className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-3">
                {MUSIC_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="camera" className="block text-xl font-semibold text-cyan-300 mb-2">Posisi Kamera</label>
              <select id="camera" value={cameraAngle} onChange={(e) => setCameraAngle(e.target.value as CameraAngle)} className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-3">
                {CAMERA_ANGLES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
               <label htmlFor="duration" className="flex justify-between text-xl font-semibold text-cyan-300 mb-2">
                <span>Durasi Video</span>
                <span className="text-base font-normal text-gray-300">{formatDuration(duration)}</span>
               </label>
               <input
                id="duration"
                type="range"
                min="30"
                max="300"
                step="15"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
               />
            </div>
          </div>

          <div className="pt-4 text-center">
             <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full sm:w-auto inline-flex items-center justify-center px-12 py-4 border border-transparent text-lg font-bold rounded-full shadow-lg text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-transform duration-300 focus:outline-none focus:ring-4 focus:ring-cyan-300"
              >
              {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Membuat Video...
                  </>
              ) : (
                'Generate Video'
              )}
            </button>
          </div>
        </div>

        <div className="mt-12">
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-center" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          {isLoading && !videoUrl && (
            <div className="text-center p-8 bg-gray-800/50 rounded-lg">
                <p className="text-lg font-semibold text-cyan-400">{loadingMessage}</p>
                <p className="mt-2 text-gray-400">Proses ini bisa memakan waktu beberapa menit. Mohon jangan tutup halaman ini.</p>
            </div>
          )}
          {videoUrl && (
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-500">Hasil Video Anda</h2>
              <div className="aspect-w-16 aspect-h-9 bg-gray-900 rounded-lg overflow-hidden shadow-2xl border-2 border-cyan-500">
                <video 
                  ref={videoRef}
                  src={videoUrl} 
                  controls 
                  autoPlay 
                  className="w-full h-full object-contain"
                  onPlay={handleVideoPlay}
                  onPause={handleVideoPause}
                  onEnded={() => {
                    if (ttsServiceRef.current) {
                        ttsServiceRef.current.cancel();
                    }
                  }}
                >
                  Browser Anda tidak mendukung tag video.
                </video>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;