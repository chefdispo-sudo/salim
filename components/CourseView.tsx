
import React, { useState, useMemo, useEffect } from 'react';
import { Course, Lesson, Language, UserProfile } from '../types';
import { translations } from '../translations';

interface CourseViewProps {
  language: Language;
  course: Course;
  onExit: () => void;
  profile: UserProfile | null;
}

const CourseView: React.FC<CourseViewProps> = ({ language, course, onExit, profile }) => {
  const t = translations[language];
  const [activeUnitIdx, setActiveUnitIdx] = useState(0);
  const [activeLessonIdx, setActiveLessonIdx] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [showFinal, setShowFinal] = useState(false);

  // Persistence Key for specific course
  const persistenceKey = `progress_${course.title.replace(/\s+/g, '_').toLowerCase()}`;

  useEffect(() => {
    const saved = localStorage.getItem(persistenceKey);
    if (saved) setCompletedLessons(new Set(JSON.parse(saved)));
    
    // Auto-resume last lesson logic if needed could go here
    const lastPos = localStorage.getItem(`${persistenceKey}_last`);
    if (lastPos) {
      const { u, l, f } = JSON.parse(lastPos);
      setActiveUnitIdx(u);
      setActiveLessonIdx(l);
      setShowFinal(f);
    }
  }, [persistenceKey]);

  useEffect(() => {
    localStorage.setItem(persistenceKey, JSON.stringify(Array.from(completedLessons)));
  }, [completedLessons, persistenceKey]);

  useEffect(() => {
    localStorage.setItem(`${persistenceKey}_last`, JSON.stringify({ u: activeUnitIdx, l: activeLessonIdx, f: showFinal }));
  }, [activeUnitIdx, activeLessonIdx, showFinal, persistenceKey]);

  const lessonsList = useMemo(() => {
    return course.units.flatMap((unit, uIdx) => 
      unit.lessons.map((lesson, lIdx) => ({ unitIdx: uIdx, lessonIdx: lIdx, ...lesson }))
    );
  }, [course]);

  const activeUnit = course.units[activeUnitIdx];
  const activeLesson = activeUnit?.lessons[activeLessonIdx];

  const totalLessonsCount = lessonsList.length;
  const progressPercent = Math.round((completedLessons.size / totalLessonsCount) * 100);

  const toggleComplete = (lessonId: string) => {
    setCompletedLessons(prev => {
      const next = new Set(prev);
      if (next.has(lessonId)) next.delete(lessonId);
      else next.add(lessonId);
      return next;
    });
  };

  const nextLesson = () => {
    const currentIndex = lessonsList.findIndex(l => l.id === activeLesson?.id);
    if (currentIndex < lessonsList.length - 1) {
      const next = lessonsList[currentIndex + 1];
      setActiveUnitIdx(next.unitIdx);
      setActiveLessonIdx(next.lessonIdx);
      setShowFinal(false);
    } else {
      setShowFinal(true);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevLesson = () => {
    if (showFinal) {
      setShowFinal(false);
      return;
    }
    const currentIndex = lessonsList.findIndex(l => l.id === activeLesson?.id);
    if (currentIndex > 0) {
      const prev = lessonsList[currentIndex - 1];
      setActiveUnitIdx(prev.unitIdx);
      setActiveLessonIdx(prev.lessonIdx);
    }
  };

  const continueLearning = () => {
    const nextPending = lessonsList.find(l => !completedLessons.has(l.id));
    if (nextPending) {
      setActiveUnitIdx(nextPending.unitIdx);
      setActiveLessonIdx(nextPending.lessonIdx);
      setShowFinal(false);
    } else {
      setShowFinal(true);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* 1. Sidebar (Plan de estudios) - Narrower and cleaner */}
      <aside className="w-64 md:w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col hidden lg:flex shadow-2xl shadow-slate-200/50">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800">
          <button onClick={onExit} className="text-slate-400 hover:text-brand-600 mb-6 flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            {t.backToStart}
          </button>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
              <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest">{t.studyPlan}</span>
            </div>
            <h2 className="font-black text-slate-900 dark:text-white line-clamp-2 leading-tight text-lg">
              {course.title}
            </h2>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-8 py-8">
          {course.units.map((unit, uIdx) => (
            <div key={uIdx}>
              <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] px-3 mb-3 border-l-2 border-slate-100 dark:border-slate-800 ml-2">
                {t.unit} {uIdx + 1}
              </h3>
              <div className="space-y-1">
                {unit.lessons.map((lesson, lIdx) => {
                  const isActive = !showFinal && activeUnitIdx === uIdx && activeLessonIdx === lIdx;
                  const isDone = completedLessons.has(lesson.id);
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => {
                        setActiveUnitIdx(uIdx);
                        setActiveLessonIdx(lIdx);
                        setShowFinal(false);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-2xl text-sm transition-all flex items-center gap-3 group ${
                        isActive
                          ? 'bg-brand-600 text-white shadow-xl shadow-brand-500/30 font-bold scale-[1.02]'
                          : 'text-slate-500 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                        isActive ? 'bg-white/20 border-white/40' : isDone ? 'bg-green-500 border-green-500 shadow-green-500/20' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                      }`}>
                        {isDone ? (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                        ) : (
                          <span className={`text-[9px] font-black ${isActive ? 'text-white' : 'text-slate-400'}`}>{lesson.id}</span>
                        )}
                      </div>
                      <span className="truncate flex-1">{lesson.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="pt-4 px-2">
            <button
              onClick={() => setShowFinal(true)}
              className={`w-full text-left p-4 rounded-3xl text-sm font-black flex items-center gap-3 transition-all ${
                showFinal 
                  ? 'bg-brand-600 text-white shadow-2xl shadow-brand-500/40' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-yellow-400 flex items-center justify-center text-xl shadow-inner shadow-black/10">🎓</div>
              {t.finalEval}
            </button>
          </div>
        </nav>
      </aside>

      {/* 2. Main Content Zone */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header - Fixed & Sticky feel */}
        <header className="px-8 py-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 z-20">
          <div className="flex-1 w-full max-w-4xl">
            <div className="flex items-center gap-4 mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 border border-brand-100 dark:border-brand-800/50">
                {t.progress}
              </span>
              <div className="h-4 w-px bg-slate-200 dark:bg-slate-800"></div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                <span className="text-slate-900 dark:text-white">{completedLessons.size}</span> {t.completedOf} <span className="text-slate-900 dark:text-white">{totalLessonsCount}</span> ({progressPercent}%)
              </span>
            </div>
            <div className="relative w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
              <div 
                className="absolute top-0 left-0 h-full gradient-bg transition-all duration-1000 ease-out rounded-full"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 shrink-0">
             <button 
              onClick={continueLearning}
              className="px-6 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-black shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 group"
            >
              <svg className="w-5 h-5 group-hover:animate-bounce-horizontal" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/></svg>
              {t.btnContinue}
            </button>
            
            {profile && (
               <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-xl shadow-sm border border-slate-200 dark:border-slate-700" title={profile.name}>
                 {profile.avatarEmoji}
               </div>
            )}
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 md:px-12 py-12 scroll-smooth bg-slate-50/50 dark:bg-slate-950/50">
          <div className="max-w-4xl mx-auto space-y-16 pb-40">
            {!showFinal ? (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
                {/* Meta Header */}
                <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 md:p-14 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none flex flex-col md:flex-row gap-10 items-start md:items-center justify-between">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-2">
                       <span className="text-xs font-black text-brand-600 uppercase tracking-[0.2em]">{t.unit} {activeUnitIdx + 1}</span>
                       <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                       <span className="text-xs font-medium text-slate-400 italic">"{activeUnit.summary}"</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                      {activeLesson.title}
                    </h1>
                  </div>
                  <div className="flex gap-4 shrink-0">
                    <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700 text-center shadow-inner">
                      <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">{t.unitsCount}</div>
                      <div className="text-lg font-black text-slate-800 dark:text-white">{course.units.length}</div>
                    </div>
                    <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700 text-center shadow-inner">
                      <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">{t.lessonsCount}</div>
                      <div className="text-lg font-black text-slate-800 dark:text-white">{totalLessonsCount}</div>
                    </div>
                  </div>
                </div>

                {/* Cards Block */}
                <div className="grid grid-cols-1 gap-10">
                  <ContentCard 
                    icon="💡" 
                    title={t.keyIdea} 
                    content={activeLesson.content.keyIdea} 
                    className="border-l-[10px] border-l-brand-500 hover:scale-[1.01]" 
                  />
                  <ContentCard 
                    icon="🌍" 
                    title={t.example} 
                    content={activeLesson.content.example} 
                    className="border-l-[10px] border-l-blue-500 hover:scale-[1.01]" 
                  />
                  <ContentCard 
                    icon="✍️" 
                    title={t.activity} 
                    content={activeLesson.content.activity} 
                    className="border-l-[10px] border-l-purple-500 bg-purple-50/20 dark:bg-purple-900/10 hover:scale-[1.01]" 
                  />
                  
                  {/* Test Rápido Card */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] shadow-xl overflow-hidden border-l-[10px] border-l-emerald-500">
                    <div className="px-10 py-8 border-b border-slate-50 dark:border-slate-800 flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-2xl">✅</div>
                      <div>
                        <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] text-xs mb-1">{t.quickQuiz}</h3>
                        <p className="text-xs text-slate-400 font-bold">Responde correctamente para validar tu conocimiento.</p>
                      </div>
                    </div>
                    <div className="p-10 space-y-12">
                      {activeLesson.content.quiz.map((q, i) => (
                        <QuizQuestion key={i} question={q} index={i} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Lesson Actions */}
                <div className="flex flex-col md:flex-row items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] p-10 md:p-14 gap-8 shadow-2xl shadow-slate-200/50">
                  <div className="text-center md:text-left space-y-2">
                    <h4 className="text-2xl font-black text-slate-900 dark:text-white">{t.lessonMastered}</h4>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">{t.saveProgress}</p>
                  </div>
                  <button 
                    onClick={() => toggleComplete(activeLesson.id)}
                    className={`px-12 py-5 rounded-[2rem] font-black text-xl transition-all shadow-2xl ${
                      completedLessons.has(activeLesson.id)
                        ? 'bg-green-600 text-white shadow-green-500/40 hover:scale-105'
                        : 'bg-brand-600 text-white shadow-brand-500/40 hover:scale-110 active:scale-95'
                    }`}
                  >
                    {completedLessons.has(activeLesson.id) ? t.isDone : t.markComplete}
                  </button>
                </div>
              </div>
            ) : (
              <FinalSection language={language} course={course} />
            )}
          </div>
        </div>

        {/* Global Footer Navigation */}
        <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-8 py-6 flex items-center justify-between z-30 shadow-[0_-15px_60px_-15px_rgba(0,0,0,0.1)]">
          <button 
            onClick={prevLesson}
            disabled={!showFinal && activeUnitIdx === 0 && activeLessonIdx === 0}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl text-slate-500 dark:text-slate-400 font-black hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-20 uppercase text-xs tracking-widest"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"/></svg>
            {t.btnPrev}
          </button>

          <button 
            onClick={nextLesson}
            className="flex items-center gap-3 px-12 py-4 rounded-2xl gradient-bg text-white font-black shadow-2xl shadow-brand-500/40 hover:scale-110 active:scale-90 transition-all uppercase text-xs tracking-[0.2em]"
          >
            <span>{showFinal ? t.btnFinish : t.btnNext}</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"/></svg>
          </button>
        </footer>
      </main>
    </div>
  );
};

const ContentCard: React.FC<{ icon: string, title: string, content: string, className?: string }> = ({ icon, title, content, className }) => (
  <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] shadow-xl overflow-hidden transition-all duration-500 ${className}`}>
    <div className="px-10 py-8 border-b border-slate-50 dark:border-slate-800 flex items-center gap-5">
      <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-2xl shadow-inner">{icon}</div>
      <h3 className="font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-xs">{title}</h3>
    </div>
    <div className="p-10 md:p-14">
      <p className="text-slate-700 dark:text-slate-200 text-xl leading-[1.6] font-medium tracking-tight">
        {content}
      </p>
    </div>
  </div>
);

const QuizQuestion: React.FC<{ question: any, index: number }> = ({ question, index }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const isCorrect = selected === question.correctAnswer;

  return (
    <div className="space-y-8 group/q">
      <h4 className="text-2xl font-black text-slate-900 dark:text-white leading-tight flex items-start gap-4">
        <span className="text-brand-500 font-black opacity-30 mt-1">#0{index + 1}</span>
        {question.text}
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {question.options.map((option: string, i: number) => {
          const letter = String.fromCharCode(65 + i);
          const isSelected = selected === letter;
          const isCorrectAnswer = letter === question.correctAnswer;
          
          let cardStyle = 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800';
          if (selected) {
            if (isSelected) {
              cardStyle = isCorrect ? 'bg-green-500 border-green-500 text-white' : 'bg-red-500 border-red-500 text-white';
            } else if (isCorrectAnswer) {
              cardStyle = 'bg-green-500/20 border-green-500 text-green-700 dark:text-green-400';
            } else {
              cardStyle = 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-20 scale-95';
            }
          }

          return (
            <button
              key={i}
              disabled={!!selected}
              onClick={() => setSelected(letter)}
              className={`text-left px-8 py-6 rounded-3xl border-2 transition-all flex items-center gap-6 group ${cardStyle} ${!selected ? 'hover:border-brand-500 hover:bg-white dark:hover:bg-slate-800 shadow-sm hover:scale-[1.03]' : ''}`}
            >
              <span className={`w-12 h-12 flex items-center justify-center rounded-2xl font-black shrink-0 shadow-sm transition-all text-lg ${
                selected && isSelected ? 'bg-white/20' : 'bg-white dark:bg-slate-700 text-slate-400 group-hover:text-brand-600'
              }`}>
                {letter}
              </span>
              <span className="font-bold text-lg">{option}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const FinalSection: React.FC<{ language: Language, course: Course }> = ({ language, course }) => {
  const t = translations[language];
  return (
    <div className="space-y-20 py-10 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-out">
      <div className="text-center space-y-8 bg-brand-600 rounded-[4rem] p-16 md:p-24 shadow-[0_40px_100px_-20px_rgba(124,58,237,0.5)] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12">
           <svg className="w-96 h-96" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 12h3v9h6v-6h4v6h6v-9h3L12 2z"/></svg>
        </div>
        <div className="text-8xl mb-6 inline-block bg-white/20 rounded-full p-8 backdrop-blur-xl border border-white/30 shadow-2xl">🎓</div>
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter">{t.congratsTitle}</h1>
        <p className="text-brand-100 text-2xl max-w-3xl mx-auto font-light leading-relaxed">
          {t.congratsMsg} <span className="font-black border-b-4 border-white/40">{course.title}</span>.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[4rem] shadow-2xl p-12 md:p-24 border-l-[16px] border-l-brand-600">
        <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-20 flex items-center gap-8">
          <span className="bg-slate-100 dark:bg-slate-800 p-6 rounded-[2rem] shadow-inner text-4xl">📋</span>
          {t.finalExam}
        </h2>
        <div className="space-y-24">
          {course.finalEvaluation.map((q, i) => (
            <QuizQuestion key={i} question={q} index={i} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="bg-slate-900 dark:bg-white rounded-[4rem] p-14 md:p-20 shadow-2xl shadow-slate-900/40 text-white dark:text-slate-900 border-t-8 border-brand-500">
          <h3 className="text-3xl font-black mb-12 flex items-center gap-5">
             <span className="text-brand-400">🚀</span>
             {t.projects}
          </h3>
          <div className="space-y-8">
            {course.finalProjects.map((p, i) => (
              <div key={i} className="bg-white/5 dark:bg-slate-100 p-8 rounded-[2.5rem] border border-white/10 dark:border-slate-200 hover:scale-[1.02] transition-transform">
                <span className="text-brand-400 dark:text-brand-600 font-black uppercase tracking-widest text-xs block mb-3">Project 0{i+1}</span>
                <p className="text-xl font-medium leading-relaxed">{p}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[4rem] p-14 md:p-20 shadow-xl">
          <h3 className="text-3xl font-black text-slate-800 dark:text-slate-200 mb-12 flex items-center gap-5">
             <span className="text-brand-500">📚</span>
             {t.sources}
          </h3>
          <div className="space-y-6">
            {course.sources.map((s, i) => (
              <a 
                key={i}
                href={s.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center gap-6 p-6 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700 shadow-sm"
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-brand-500 transition-colors shadow-inner text-2xl">
                  📄
                </div>
                <div className="flex-1">
                  <span className="font-black text-slate-800 dark:text-slate-200 group-hover:text-brand-600 transition-colors text-lg line-clamp-2 leading-snug">{s.title}</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mt-1 tracking-widest">{new URL(s.url).hostname}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-100 dark:bg-slate-900 rounded-[3rem] p-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">¡Felicidades por tu perseverancia!</h2>
        <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">Has completado tu ruta de aprendizaje personalizada. El conocimiento es el único tesoro que aumenta al repartirse.</p>
      </div>
    </div>
  );
};

export default CourseView;
