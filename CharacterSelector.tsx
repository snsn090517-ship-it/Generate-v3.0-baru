import React from 'react';
import { Character, SelectedCharacter, Voice } from '../types';
import { CHARACTERS, VOICES } from '../constants';

interface CharacterSelectorProps {
  selectedCharacters: SelectedCharacter[];
  setSelectedCharacters: React.Dispatch<React.SetStateAction<SelectedCharacter[]>>;
}

const CharacterSelector: React.FC<CharacterSelectorProps> = ({ selectedCharacters, setSelectedCharacters }) => {

  const handleToggleCharacter = (character: Character) => {
    const isSelected = selectedCharacters.some(sc => sc.id === character.id);
    if (isSelected) {
      setSelectedCharacters(selectedCharacters.filter(sc => sc.id !== character.id));
    } else {
      setSelectedCharacters([...selectedCharacters, { 
        ...character, 
        voice: character.defaultVoice,
        pitch: 0,
        speed: 1,
      }]);
    }
  };

  const handleVoiceChange = (characterId: number, voice: Voice) => {
    setSelectedCharacters(selectedCharacters.map(sc => 
      sc.id === characterId ? { ...sc, voice } : sc
    ));
  };

  const handleVoiceModulationChange = (characterId: number, field: 'pitch' | 'speed', value: number) => {
    setSelectedCharacters(selectedCharacters.map(sc => 
      sc.id === characterId ? { ...sc, [field]: value } : sc
    ));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-cyan-300">Pilih Karakter</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {CHARACTERS.map((char) => {
          const selectedChar = selectedCharacters.find(sc => sc.id === char.id);
          const isSelected = !!selectedChar;

          return (
            <div 
              key={char.id} 
              className={`group p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer flex flex-col ${isSelected ? 'border-cyan-400 bg-gray-700' : 'border-gray-600 bg-gray-800 hover:border-cyan-500'}`} 
              onClick={() => handleToggleCharacter(char)}
            >
              <img 
                src={char.image} 
                alt={char.name} 
                className={`w-full h-24 object-cover rounded-md mb-2 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-60 group-hover:opacity-90'}`} 
              />
              <div className="flex items-center mb-1">
                <input
                  type="checkbox"
                  checked={isSelected}
                  readOnly
                  className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-500 rounded focus:ring-cyan-500"
                />
                <label className="ml-2 font-bold text-white">{char.name}</label>
              </div>

              {/* Dynamic Description Area */}
              <div className="h-16 relative mb-1">
                 <p className={`absolute inset-0 text-sm text-gray-300 transition-opacity duration-300 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    {char.description}
                 </p>
              </div>
              
              {isSelected && (
                <div className="mt-auto pt-3 space-y-3 border-t border-gray-600/50">
                  <div>
                    <label className="text-xs font-medium text-gray-300">Suara</label>
                    <select
                      value={selectedChar.voice}
                      onChange={(e) => handleVoiceChange(char.id, e.target.value as Voice)}
                      onClick={(e) => e.stopPropagation()} // Prevent card click when changing voice
                      className="w-full mt-1 bg-gray-900 border border-gray-600 text-white text-xs rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-1.5"
                    >
                      {VOICES.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="flex justify-between text-xs font-medium text-gray-300">
                      <span>Pitch</span>
                      <span>{selectedChar.pitch.toFixed(1)}</span>
                    </label>
                    <input
                      type="range"
                      min="-1"
                      max="1"
                      step="0.1"
                      value={selectedChar.pitch}
                      onChange={(e) => handleVoiceModulationChange(char.id, 'pitch', parseFloat(e.target.value))}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="flex justify-between text-xs font-medium text-gray-300">
                      <span>Speed</span>
                      <span>{selectedChar.speed.toFixed(1)}x</span>
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={selectedChar.speed}
                      onChange={(e) => handleVoiceModulationChange(char.id, 'speed', parseFloat(e.target.value))}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CharacterSelector;
