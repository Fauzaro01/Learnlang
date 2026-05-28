"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Battery, Zap } from "lucide-react";

const PencilIcon = () => (
  <svg className="w-5 h-5 text-[#0288D1]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 20H21M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function DuolingoGame({ onResult }) {
  const sentence = [
    { text: "She", isError: false },
    { text: "don't", isError: true, correct: "doesn't" },
    { text: "like", isError: false },
    { text: "apples.", isError: false }
  ];

  const [gameState, setGameState] = useState("playing"); // playing, correct, wrong
  const [selectedWord, setSelectedWord] = useState(null);

  const handleWordClick = (wordObj, index) => {
    if (gameState !== "playing") return;
    setSelectedWord(index);
    
    if (wordObj.isError) {
      setGameState("correct");
      onResult("happy");
      new Audio('/correct.mp3').play().catch(e => console.error("Error playing audio", e));
    } else {
      setGameState("wrong");
      onResult("wrong");
      new Audio('/incorrect.mp3').play().catch(e => console.error("Error playing audio", e));
    }
  };

  const resetGame = () => {
    setGameState("playing");
    setSelectedWord(null);
    onResult("neutral");
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white border-4 border-gray-200 rounded-3xl p-6 shadow-[0_8px_0_#E2E8F0] relative">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-1.5">
          <Battery className="w-6 h-6 fill-emerald-500 text-emerald-500" />
          <span className="font-black text-gray-700 text-base">100% Energi</span>
        </div>
        <div className="flex items-center gap-1.5 text-orange-500">
          <Zap className="w-6 h-6 fill-orange-500" />
          <span className="font-black text-base">1 Muatan</span>
        </div>
      </div>

      <div className="bg-[#E0E7FF] border-2 border-[#818CF8] rounded-2xl p-4 mb-8 flex items-start gap-3">
        <PencilIcon />
        <div>
          <h4 className="font-black text-[#4338CA] text-xs tracking-wider uppercase">Detektif AI:</h4>
          <p className="text-[#3730A3] font-black text-base mt-0.5">Temukan & klik 1 kata yang salah!</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 justify-center mb-10 min-h-[60px]">
        {sentence.map((word, i) => {
          const isSelected = selectedWord === i;
          const isCorrectChoice = isSelected && word.isError;
          const isWrongChoice = isSelected && !word.isError;
          
          return (
            <motion.button 
              key={i} 
              onClick={() => handleWordClick(word, i)}
              className={`px-3 sm:px-4 py-2 sm:py-3 rounded-2xl font-black text-base sm:text-lg transition-all duration-200 border-b-4 
                ${gameState === "playing" ? 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:scale-105 active:translate-y-[2px] active:border-b-2 shadow-sm cursor-pointer' : ''}
                ${isCorrectChoice ? 'bg-emerald-100 border-2 border-emerald-500 text-emerald-700 border-b-0 translate-y-[4px]' : ''}
                ${isWrongChoice ? 'bg-red-100 border-2 border-red-500 text-red-700 border-b-0 translate-y-[4px]' : ''}
                ${gameState !== "playing" && !isSelected && word.isError ? 'bg-emerald-100 border-2 border-emerald-500 text-emerald-700 border-b-4' : ''}
                ${gameState !== "playing" && !isSelected && !word.isError ? 'bg-gray-100 border-2 border-gray-200 text-gray-400 opacity-50 cursor-not-allowed border-b-2' : ''}
              `}
              disabled={gameState !== "playing"}
            >
              {isCorrectChoice ? (
                <span className="flex items-center gap-2">
                  <span className="line-through opacity-60 text-sm">{word.text}</span>
                  <span className="text-emerald-600">{word.correct}</span>
                </span>
              ) : (
                word.text
              )}
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        {gameState === "correct" && (
          <motion.div 
            key="correct-banner"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#F1FFF8] border-2 border-[#A8E6CF] rounded-2xl p-4 shadow-sm"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#10B981] flex items-center justify-center text-white font-black text-sm shrink-0">✓</div>
              <div>
                <h5 className="font-black text-[#059669] text-sm">Analisis AI Tepat!</h5>
                <p className="text-[#047857] font-bold text-xs mt-1 leading-relaxed">
                  💡 Karena subjeknya <b>"She"</b> (tunggal), kata kerja bantu yang tepat adalah <b>"doesn't"</b>, bukan "don't".
                </p>
              </div>
            </div>
            <button 
              onClick={resetGame}
              className="w-full py-2.5 bg-[#10B981] border-b-4 border-[#059669] rounded-xl font-black text-white hover:bg-[#34D399] active:translate-y-[2px] active:border-b-0 text-sm"
            >
              Coba Lagi ➔
            </button>
          </motion.div>
        )}

        {gameState === "wrong" && (
          <motion.div 
            key="wrong-banner"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#FFD2D2] border-2 border-[#EA2B2B] rounded-2xl p-4 shadow-sm"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#EA2B2B] flex items-center justify-center text-white font-black text-sm shrink-0">✗</div>
              <div>
                <h5 className="font-black text-[#C62828] text-sm">Bukan yang itu!</h5>
                <p className="text-[#E53935] font-bold text-xs mt-1 leading-relaxed">
                  Kata ini sudah benar secara tata bahasa. Coba temukan kata lain yang salah.
                </p>
              </div>
            </div>
            <button 
              onClick={resetGame}
              className="w-full py-2.5 bg-[#EA2B2B] border-b-4 border-[#B71C1C] rounded-xl font-black text-white hover:bg-[#FF4D4D] active:translate-y-[2px] active:border-b-0 text-sm"
            >
              Ulangi Analisis ➔
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
