import React, { useEffect, useState } from 'react';
import { Box } from '@chakra-ui/react';
import styled, { keyframes } from 'styled-components';

const MusicalBackground = ({ isActive = true, density = 20 }) => {
  const [notes, setNotes] = useState([]);
  const [waves, setWaves] = useState([]);

  useEffect(() => {
    const generateNotes = () => {
      const noteSymbols = ['♪', '♫', '♬', '♭', '♯', '𝄞', '𝄢', '𝄡', '𝅘𝅥', '𝅘𝅥𝅮', '𝅘𝅥𝅯', '𝅘𝅥𝅰'];
      const newNotes = [];
      
      for (let i = 0; i < density; i++) {
        newNotes.push({
          id: i,
          symbol: noteSymbols[Math.floor(Math.random() * noteSymbols.length)],
          left: Math.random() * 100,
          animationDelay: Math.random() * 20,
          animationDuration: 15 + Math.random() * 10,
          fontSize: 20 + Math.random() * 40,
          opacity: 0.1 + Math.random() * 0.3,
          color: Math.random() > 0.5 ? '#1db954' : '#e91e63',
          rotationSpeed: 5 + Math.random() * 10,
        });
      }
      
      setNotes(newNotes);
    };

    const generateWaves = () => {
      const newWaves = [];
      for (let i = 0; i < 5; i++) {
        newWaves.push({
          id: i,
          top: 20 + i * 20,
          animationDelay: i * 2,
          opacity: 0.05 + Math.random() * 0.1,
        });
      }
      setWaves(newWaves);
    };

    generateNotes();
    generateWaves();
  }, [density]);

  return (
    <MusicalContainer>
      {/* Sound Waves */}
      {isActive && waves.map((wave) => (
        <SoundWave
          key={`wave-${wave.id}`}
          style={{
            top: `${wave.top}%`,
            animationDelay: `${wave.animationDelay}s`,
            opacity: wave.opacity,
          }}
        />
      ))}
      
      {/* Musical Notes */}
      {isActive && notes.map((note) => (
        <AnimatedNote
          key={note.id}
          style={{
            left: `${note.left}%`,
            animationDelay: `${note.animationDelay}s`,
            animationDuration: `${note.animationDuration}s`,
            fontSize: `${note.fontSize}px`,
            opacity: note.opacity,
            color: note.color,
            '--rotation-speed': `${note.rotationSpeed}s`,
          }}
        >
          {note.symbol}
        </AnimatedNote>
      ))}
      
      {/* Ambient Particles */}
      {isActive && Array.from({ length: 10 }, (_, i) => (
        <ParticleGlow
          key={`particle-${i}`}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 10}s`,
          }}
        />
      ))}
    </MusicalContainer>
  );
};

const float = keyframes`
  0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) rotate(360deg);
    opacity: 0;
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
`;

const wiggle = keyframes`
  0%, 100% {
    transform: rotate(-3deg);
  }
  50% {
    transform: rotate(3deg);
  }
`;

const glow = keyframes`
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.5);
  }
`;

const waveFlow = keyframes`
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateX(100vw);
    opacity: 0;
  }
`;

const MusicalContainer = styled(Box)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  overflow: hidden;
  z-index: 1;
`;

const AnimatedNote = styled.div`
  position: absolute;
  animation: ${float} var(--rotation-speed, 15s) linear infinite;
  font-weight: bold;
  user-select: none;
  transition: all 0.3s ease;
  
  &:hover {
    animation-play-state: paused;
    transform: scale(1.5) !important;
    opacity: 0.8 !important;
  }
  
  &:nth-child(3n) {
    animation-name: ${float}, ${pulse};
    animation-duration: var(--rotation-speed, 15s), 3s;
    animation-iteration-count: infinite, infinite;
  }
  
  &:nth-child(5n) {
    animation-name: ${float}, ${wiggle};
    animation-duration: var(--rotation-speed, 15s), 2s;
    animation-iteration-count: infinite, infinite;
  }
`;

const SoundWave = styled.div`
  position: absolute;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(29, 185, 84, 0.5) 20%, 
    rgba(233, 30, 99, 0.5) 80%, 
    transparent 100%);
  animation: ${waveFlow} 8s linear infinite;
  border-radius: 1px;
  box-shadow: 0 0 10px rgba(29, 185, 84, 0.3);
`;

const ParticleGlow = styled.div`
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: radial-gradient(circle, 
    rgba(29, 185, 84, 0.8) 0%, 
    rgba(233, 30, 99, 0.6) 50%, 
    transparent 100%);
  animation: ${glow} 3s ease-in-out infinite;
  box-shadow: 0 0 8px rgba(29, 185, 84, 0.5);
`;

export default MusicalBackground; 