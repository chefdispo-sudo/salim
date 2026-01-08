
import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { translations } from '../translations';

const LoadingView: React.FC<{ language: Language }> = ({ language }) => {
  const t = translations[language];
  const [step, setStep] = useState(0);
  
  const messages_es = [
    "Analizando el tema solicitado...",
    "Consultando fuentes académicas...",
    "Diseñando la ruta personalizada...",
    "Redactando lecciones prácticas...",
    "Generando evaluaciones finales...",
    "Preparando tu aula virtual..."
  ];
  const messages_en = [
    "Analyzing requested topic...",
    "Consulting academic sources...",
    "Designing personalized path...",
    "Writing practical lessons...",
    "Generating final assessments...",
    "Preparing your virtual classroom..."
  ];
  const messages_fr = [
    "Analyse du sujet demandé...",
    "Consultation des sources...",
    "Conception du parcours...",
    "Rédaction des leçons pratiques...",
    "Génération des évaluations...",
    "Préparation de votre classe..."
  ];

  const getMsgs = () => {
    if (language === 'en') return messages_en;
    if (language === 'fr') return messages_fr;
    return messages_es;
  };

  const messages = getMsgs();

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-950 transition-colors duration-500">
      <div className="relative w-32 h-32 mb-12">
        <div className="absolute inset-0 border-8 border-brand-100 dark:border-slate-800 rounded-full"></div>
        <div className="absolute inset-0 border-8 border-brand-600 rounded-full border-t-transparent animate-spin"></div>
        <div className="absolute inset-4 bg-brand-50 dark:bg-slate-900 rounded-full flex items-center justify-center">
            <span className="text-2xl">⚡</span>
        </div>
      </div>
      
      <div className="text-center max-w-lg space-y-4">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{t.loadingTitle}</h2>
        <div className="h-8 relative overflow-hidden">
          {messages.map((msg, i) => (
            <p 
              key={i} 
              className={`absolute inset-0 text-brand-600 dark:text-brand-400 font-bold transition-all duration-700 flex items-center justify-center ${
                step === i ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              {msg}
            </p>
          ))}
        </div>
      </div>

      <div className="mt-20 flex gap-1.5">
        {messages.map((_, i) => (
          <div 
            key={i} 
            className={`h-1.5 rounded-full transition-all duration-500 ${step === i ? 'w-8 bg-brand-600' : 'w-2 bg-slate-200 dark:bg-slate-800'}`}
          ></div>
        ))}
      </div>
      
      <div className="max-w-xs text-center mt-12 text-slate-400 dark:text-slate-500 text-sm font-medium leading-relaxed">
        {t.loadingFooter}
      </div>
    </div>
  );
};

export default LoadingView;
