
import React, { useState, useEffect } from 'react';
import { Course, FormData, Language, UserProfile } from './types';
import { generateCourse } from './geminiService';
import { syncUserToDatabase } from './dbService';
import HomeView from './components/HomeView';
import CourseView from './components/CourseView';
import LoadingView from './components/LoadingView';
import { translations } from './translations';

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'loading' | 'course'>('home');
  const [course, setCourse] = useState<Course | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState<Language>('es');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [savedCourses, setSavedCourses] = useState<Course[]>([]);

  const t = translations[language];

  // Initialize data from localStorage
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark') setIsDarkMode(true);

    const storedProfile = localStorage.getItem('user_profile');
    if (storedProfile) setProfile(JSON.parse(storedProfile));

    const storedCourses = localStorage.getItem('saved_courses');
    if (storedCourses) setSavedCourses(JSON.parse(storedCourses));

    const storedLang = localStorage.getItem('language') as Language;
    if (storedLang) setLanguage(storedLang);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleCreateCourse = async (formData: FormData) => {
    setView('loading');
    setError(null);
    try {
      const generated = await generateCourse({ ...formData, language });
      setCourse(generated);
      
      // Persist course
      const updatedCourses = [generated, ...savedCourses.filter(c => c.title !== generated.title)].slice(0, 5);
      setSavedCourses(updatedCourses);
      localStorage.setItem('saved_courses', JSON.stringify(updatedCourses));
      
      setView('course');
    } catch (err: any) {
      setError(t.errorMsg);
      setView('home');
    }
  };

  const handleSelectCourse = (selected: Course) => {
    setCourse(selected);
    setView('course');
  };

  const reset = () => {
    setCourse(null);
    setView('home');
    setError(null);
  };

  const updateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem('user_profile', JSON.stringify(newProfile));
    // Sincronizar con Google Sheets
    syncUserToDatabase(newProfile, language);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* Global Controls Overlay */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
        {/* Language Switcher */}
        <div className="flex bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-full shadow-lg border border-slate-200 dark:border-slate-700 p-1 overflow-hidden">
          {(['es', 'en', 'fr'] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                language === lang 
                  ? 'bg-brand-600 text-white' 
                  : 'text-slate-500 hover:text-brand-600'
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-3 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:scale-110 transition-transform"
          aria-label="Toggle theme"
        >
          {isDarkMode ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.95 16.95l.707.707M7.636 7.636l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z"/></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 118.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
          )}
        </button>
      </div>

      {view === 'home' && (
        <HomeView 
          language={language} 
          onSubmit={handleCreateCourse} 
          error={error} 
          profile={profile}
          onUpdateProfile={updateProfile}
          savedCourses={savedCourses}
          onSelectCourse={handleSelectCourse}
        />
      )}
      {view === 'loading' && <LoadingView language={language} />}
      {view === 'course' && course && (
        <CourseView language={language} course={course} onExit={reset} profile={profile} />
      )}
    </div>
  );
};

export default App;
