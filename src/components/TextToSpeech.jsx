import React, { useState, useCallback, useEffect, useRef } from 'react';
import { IconBtn } from './Button';

const speakers = ["meera", "pavithra", "maitreyi", "arvind", "amol", "amartya", "diya", "neel", "misha", "vian", "arjun", "maya" ]


const TextToSpeech = ({ text, language = 'en-IN' }) => {3
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);
  const cachedAudiosRef = useRef([]);
  const currentChunkIndexRef = useRef(0);
  
  // Text chunking function
  const chunkText = (text, maxLength = 500) => {
    if (!text) return [];
    
    // If text is less than max length, return as is
    if (text.length <= maxLength) {
      return [text];
    }
    
    const chunks = [];
    let currentChunk = "";
    
    // First, split by paragraphs
    const paragraphs = text.split(/\n\n+/);
    
    for (const paragraph of paragraphs) {
      // If paragraph alone exceeds max length, split by sentences
      if (paragraph.length > maxLength) {
        const sentences = paragraph.split(/(?<=[.!?])\s+/);
        
        for (const sentence of sentences) {
          // If sentence alone exceeds max length, split by words
          if (sentence.length > maxLength) {
            const words = sentence.split(/\s+/);
            
            for (const word of words) {
              // Edge case: single word longer than maxLength
              if (word.length > maxLength) {
                // If current chunk has content, push it
                if (currentChunk) {
                  chunks.push(currentChunk.trim());
                  currentChunk = "";
                }
                
                // Split the long word
                for (let i = 0; i < word.length; i += maxLength) {
                  chunks.push(word.substring(i, i + maxLength));
                }
                continue;
              }
              
              // Check if adding this word would exceed max length
              if ((currentChunk + " " + word).length > maxLength) {
                chunks.push(currentChunk.trim());
                currentChunk = word;
              } else {
                currentChunk += (currentChunk ? " " : "") + word;
              }
            }
          } else {
            // Check if adding this sentence would exceed max length
            if ((currentChunk + " " + sentence).length > maxLength) {
              chunks.push(currentChunk.trim());
              currentChunk = sentence;
            } else {
              currentChunk += (currentChunk ? " " : "") + sentence;
            }
          }
        }
      } else {
        // Check if adding this paragraph would exceed max length
        if ((currentChunk + "\n\n" + paragraph).length > maxLength) {
          chunks.push(currentChunk.trim());
          currentChunk = paragraph;
        } else {
          currentChunk += (currentChunk ? "\n\n" : "") + paragraph;
        }
      }
    }
    
    // Add the last chunk if there's anything left
    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  };

  // Helper function to convert base64 to Blob
  const base64ToBlob = (base64, type) => {
    const binaryString = window.atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new Blob([bytes], { type });
  };
  
  // Function to convert text chunks to speech
  const convertChunksToSpeech = useCallback(async () => {
    if (!text || isLoading) return;
    
    // If we already have cached audio, just play it
    if (cachedAudiosRef.current.length > 0) {
      playAudioSequence();
      return;
    }
    
    setIsLoading(true);
    
    try {
      const textChunks = chunkText(text);
      
      // Process chunks in batches of 3 (API limit)
      for (let i = 0; i < textChunks.length; i += 3) {
        const batchChunks = textChunks.slice(i, i + 3);
        
        const response = await fetch('https://api.sarvam.ai/text-to-speech', {
          method: 'POST',
          headers: {
            'api-subscription-key': import.meta.env.VITE_SARVAM_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            inputs: batchChunks,
            target_language_code: language,
            speaker: speakers[Math.random(0,12)], // You can change this to your preferred speaker
            pace: 1.0,
            loudness: 1.2,
            speech_sample_rate: 22050,
            enable_preprocessing: true
          })
        });
        
        const data = await response.json();
        
        if (data.audios && data.audios.length > 0) {
          // Convert base64 to audio URLs
          data.audios.forEach(audioData => {
            const audioBlob = base64ToBlob(audioData, 'audio/wav');
            const audioUrl = URL.createObjectURL(audioBlob);
            cachedAudiosRef.current.push(audioUrl);
          });
          
          // Update progress
          setProgress(Math.min(100, (cachedAudiosRef.current.length / textChunks.length) * 100));
        }
      }
      
      // Play the audio sequence once all chunks are processed
      if (cachedAudiosRef.current.length > 0) {
        playAudioSequence();
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error with text-to-speech:', error);
      setIsLoading(false);
    }
  }, [text, language, isLoading]);
  
  // Function to play audio sequence
  const playAudioSequence = useCallback(() => {
    if (cachedAudiosRef.current.length === 0) return;
    
    setIsPlaying(true);
    
    if (!audioRef.current) {
      audioRef.current = new Audio();
      
      // Set up event handlers
      audioRef.current.onended = () => {
        // Move to next chunk
        currentChunkIndexRef.current++;
        
        if (currentChunkIndexRef.current < cachedAudiosRef.current.length) {
          // Play next chunk
          audioRef.current.src = cachedAudiosRef.current[currentChunkIndexRef.current];
          audioRef.current.play();
        } else {
          // Reset for next play
          currentChunkIndexRef.current = 0;
          setIsPlaying(false);
        }
      };
    }
    
    // Start playing from current chunk
    audioRef.current.src = cachedAudiosRef.current[currentChunkIndexRef.current];
    audioRef.current.play();
  }, []);
  
  // Function to pause audio
  const pauseAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);
  
  // Function to stop audio and reset
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      currentChunkIndexRef.current = 0;
      setIsPlaying(false);
    }
  }, []);
  
  // Handle button click
  const handleButtonClick = useCallback(() => {
    if (isPlaying) {
      pauseAudio();
    } else {
      if (cachedAudiosRef.current.length > 0) {
        playAudioSequence();
      } else {
        convertChunksToSpeech();
      }
    }
  }, [isPlaying, convertChunksToSpeech, playAudioSequence, pauseAudio]);
  
  // Clean up resources on component unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      
      // Clean up all cached audio URLs
      cachedAudiosRef.current.forEach(url => URL.revokeObjectURL(url));
      cachedAudiosRef.current = [];
    };
  }, []);
  
  return (
    <div className="tts-control">
      <IconBtn
        icon={isLoading ? 'progress_activity' : isPlaying ? 'pause' : 'volume_up'}
        title={isLoading ? 'Loading audio...' : isPlaying ? 'Pause' : 'Listen'}
        size="small"
        classes={`${isLoading ? 'animate-spin' : ''}`}
        onClick={handleButtonClick}
        disabled={isLoading}
      />
      {isLoading && progress > 0 && (
        <div className="text-xs text-gray-500 ml-2">{Math.round(progress)}%</div>
      )}
    </div>
  );
};

export default TextToSpeech;