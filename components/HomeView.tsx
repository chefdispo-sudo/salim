
import React, { useState } from 'react';
import { FormData, StudentLevel, Language, UserProfile, Course } from '../types';
import { translations } from '../translations';

interface HomeViewProps {
  language: Language;
  onSubmit: (data: FormData) => void;
  error: string | null;
  profile: UserProfile | null;
  onUpdateProfile: (p: UserProfile) => void;
  savedCourses: Course[];
  onSelectCourse: (c: Course) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ 
  language, onSubmit, error, profile, onUpdateProfile, savedCourses, onSelectCourse 
}) => {
  const t = translations[language];
  const [formData, setFormData] = useState<FormData>({
    topic: '',
    level: StudentLevel.PRINCIPIANTE,
    profile: '',
    objective: '',
    time: '',
    format: 'Mixto',
    language: language
  });

  const [userName, setUserName] = useState(profile?.name || '');
  const [userEmail, setUserEmail] = useState(profile?.email || '');

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({ name: userName, email: userEmail, avatarEmoji: '👤' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.topic || !formData.objective) return;
    onSubmit(formData);
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-10 border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in duration-500">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-brand-100 dark:bg-brand-900/30 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6">👋</div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{t.setupProfile}</h2>
            <p className="text-slate-500 dark:text-slate-400">{t.formSubtitle}</p>
          </div>
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">{t.userName}</label>
                <input
                  required
                  type="text"
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-800 dark:text-white outline-none focus:border-brand-500 transition-all font-bold"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Nombre / Nickname"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">{t.userEmail}</label>
                <input
                  required
                  type="email"
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-800 dark:text-white outline-none focus:border-brand-500 transition-all font-bold"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder={t.placeholderEmail}
                />
              </div>
            </div>
            <button className="w-full gradient-bg text-white font-black py-4 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all">
              {t.btnNext}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center pb-32">
      <section className="w-full gradient-bg text-white pt-24 pb-48 px-6 text-center">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6 opacity-80">
            <span className="text-2xl">{profile.avatarEmoji}</span>
            <span className="font-bold tracking-widest uppercase text-xs">{t.welcomeUser}, {profile.name}</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter leading-none">{t.heroTitle}</h1>
          <p className="text-xl md:text-2xl text-brand-100 max-w-3xl mx-auto opacity-90 font-light leading-relaxed">
            {t.heroSubtitle}
          </p>
        </div>
      </section>

      <div className="max-w-6xl w-full px-6 -mt-32 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl p-8 md:p-14 border border-slate-100 dark:border-slate-800">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{t.formTitle}</h2>
              <p className="text-slate-500 dark:text-slate-400">{t.formSubtitle}</p>
            </div>
            <div className="hidden md:block text-4xl">✨</div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-3 ml-1 uppercase tracking-wider">{t.labelTopic}</label>
                <input
                  required
                  type="text"
                  placeholder={t.placeholderTopic}
                  className="w-full px-6 py-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-800 dark:text-white focus:ring-8 focus:ring-brand-500/5 focus:border-brand-500 outline-none transition-all placeholder:text-slate-400 text-lg"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-3 ml-1 uppercase tracking-wider">{t.labelLevel}</label>
                <select
                  className="w-full appearance-none px-6 py-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-800 dark:text-white focus:border-brand-500 outline-none transition-all text-lg"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value as StudentLevel })}
                >
                  <option value={StudentLevel.PRINCIPIANTE}>{t.levels.Principiante}</option>
                  <option value={StudentLevel.INTERMEDIO}>{t.levels.Intermedio}</option>
                  <option value={StudentLevel.AVANZADO}>{t.levels.Avanzado}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-3 ml-1 uppercase tracking-wider">{t.labelProfile}</label>
                <input
                  required
                  type="text"
                  placeholder={t.placeholderProfile}
                  className="w-full px-6 py-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-800 dark:text-white focus:border-brand-500 outline-none transition-all text-lg"
                  value={formData.profile}
                  onChange={(e) => setFormData({ ...formData, profile: e.target.value })}
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-3 ml-1 uppercase tracking-wider">{t.labelObjective}</label>
                <input
                  required
                  type="text"
                  placeholder={t.placeholderObjective}
                  className="w-full px-6 py-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-800 dark:text-white focus:border-brand-500 outline-none transition-all text-lg"
                  value={formData.objective}
                  onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-3 ml-1 uppercase tracking-wider">{t.labelTime}</label>
                <input
                  required
                  type="text"
                  placeholder={t.placeholderTime}
                  className="w-full px-6 py-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-800 dark:text-white focus:border-brand-500 outline-none transition-all text-lg"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-3 ml-1 uppercase tracking-wider">{t.labelFormat}</label>
                <select
                  className="w-full appearance-none px-6 py-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-800 dark:text-white focus:border-brand-500 outline-none transition-all text-lg"
                  value={formData.format}
                  onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                >
                  <option value="Mixto">{t.formats.Mixto}</option>
                  <option value="Lecturas breves">{t.formats["Lecturas breves"]}</option>
                  <option value="Práctico (Ejercicios)">{t.formats["Práctico (Ejercicios)"]}</option>
                  <option value="Teórico (Conceptos)">{t.formats["Teórico (Conceptos)"]}</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full gradient-bg text-white font-black py-6 rounded-3xl shadow-2xl hover:shadow-brand-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all text-xl flex items-center justify-center gap-4"
            >
              <span>{t.btnGenerate}</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            </button>
          </form>
        </div>

        {/* History Column */}
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] p-8 md:p-10 border border-slate-200/50 dark:border-slate-800 flex flex-col h-fit sticky top-6">
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
             <span className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm">📂</span>
             {t.savedCourses}
          </h3>
          <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
            {savedCourses.length === 0 ? (
              <div className="p-8 text-center bg-white/50 dark:bg-white/5 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                <p className="text-slate-400 text-sm font-medium">Aún no has diseñado ningún aula.</p>
              </div>
            ) : (
              savedCourses.map((c, i) => (
                <button
                  key={i}
                  onClick={() => onSelectCourse(c)}
                  className="w-full text-left bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md hover:border-brand-300 dark:hover:border-brand-500 transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase text-brand-600 dark:text-brand-400 tracking-widest">{c.level}</span>
                    <span className="text-slate-300 dark:text-slate-600 group-hover:text-brand-400">→</span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">{c.title}</h4>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeView;
