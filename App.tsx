
import React, { useState, useEffect, useCallback } from 'react';
import { AppState, Subject, ViewState, StudySession } from './types';
import { loadState, saveState, exportData } from './services/storage';
import { Dashboard } from './components/Dashboard';
import { SubjectDetails } from './components/SubjectDetails';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => loadState());
  const [view, setView] = useState<ViewState>('dashboard');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  useEffect(() => {
    saveState(state);
    checkAchievements();
  }, [state]);

  const checkAchievements = () => {
    let unlockedAny = false;
    const newAchievements = state.achievements.map(ach => {
      if (ach.unlockedAt) return ach;

      let conditionMet = false;
      const totalReps = state.subjects.reduce((sum, s) => sum + s.chapters.reduce((cSum, c) => cSum + c.currentReps, 0), 0);
      
      if (ach.id === 'first_step' && totalReps >= 1) conditionMet = true;
      // Adjusted from 10 to 7 as per the new maximum limit
      if (ach.id === 'repetition_king' && state.subjects.some(s => s.chapters.some(c => c.currentReps >= 7))) conditionMet = true;
      if (ach.id === 'subject_master' && state.subjects.some(s => s.chapters.length > 0 && s.chapters.every(c => c.currentReps >= c.targetReps))) conditionMet = true;
      if (ach.id === 'overachiever' && state.subjects.some(s => s.chapters.some(c => c.currentReps > c.targetReps))) conditionMet = true;

      if (conditionMet) {
        unlockedAny = true;
        return { ...ach, unlockedAt: new Date().toISOString() };
      }
      return ach;
    });

    if (unlockedAny) {
      setState(prev => ({ 
        ...prev, 
        achievements: newAchievements,
        experience: prev.experience + 50
      }));
    }
  };

  const handleUpdateSubject = useCallback((updatedSubject: Subject) => {
    setState(prev => {
      const newSubjects = prev.subjects.map(s => s.id === updatedSubject.id ? updatedSubject : s);
      
      const oldSubject = prev.subjects.find(s => s.id === updatedSubject.id);
      const oldReps = oldSubject?.chapters.reduce((sum, c) => sum + c.currentReps, 0) || 0;
      const newReps = updatedSubject.chapters.reduce((sum, c) => sum + c.currentReps, 0);
      
      const xpGained = Math.max(0, (newReps - oldReps) * 10);
      
      // If repetitions increased, log a study session
      const newStudyLog = [...prev.studyLog];
      if (newReps > oldReps) {
        const session: StudySession = {
          timestamp: new Date().toISOString(),
          subjectId: updatedSubject.id,
          subjectName: updatedSubject.name
        };
        newStudyLog.push(session);
      }
      
      return { 
        ...prev, 
        subjects: newSubjects,
        experience: prev.experience + xpGained,
        studyLog: newStudyLog
      };
    });
    setSelectedSubject(updatedSubject);
  }, []);

  const selectSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setView('subject');
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pl-64 flex bg-slate-50">
      {/* Sidebar Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 md:top-0 md:bottom-0 md:w-64 bg-white border-t md:border-t-0 md:border-r border-slate-100 z-50">
        <div className="hidden md:flex flex-col h-full p-8">
          <div className="flex items-center space-x-3 mb-10 px-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-100">O</div>
            <span className="text-xl font-black text-slate-800 tracking-tight">OptoTrack</span>
          </div>
          
          <div className="space-y-2 flex-1">
            <NavBtn label="Dashboard" icon="🏠" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
            <NavBtn label="Exams" icon="🗓️" active={view === 'exams'} onClick={() => setView('exams')} />
            <NavBtn label="Awards" icon="🏆" active={view === 'achievements'} onClick={() => setView('achievements')} />
          </div>

          <div className="pt-6 border-t border-slate-50">
            <button 
              onClick={() => exportData(state)}
              className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-all active:scale-95"
            >
              Backup Data
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden justify-around items-center h-16 bg-white/80 backdrop-blur-md">
          <NavBtnMobile icon="🏠" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
          <NavBtnMobile icon="🗓️" active={view === 'exams'} onClick={() => setView('exams')} />
          <NavBtnMobile icon="🏆" active={view === 'achievements'} onClick={() => setView('achievements')} />
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-10 max-w-7xl mx-auto w-full">
        <div className="animate-in fade-in duration-500">
          {view === 'dashboard' && <Dashboard state={state} onSelectSubject={selectSubject} />}
          
          {view === 'subject' && selectedSubject && (
            <SubjectDetails 
              subject={selectedSubject} 
              onUpdateSubject={handleUpdateSubject} 
              onBack={() => setView('dashboard')} 
            />
          )}

          {view === 'exams' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-black text-slate-900">Exam Roadmap</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {state.subjects.flatMap(s => s.exams.map(e => ({ ...e, subjectName: s.name, color: s.color }))).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(exam => (
                  <div key={exam.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start space-x-4 hover:shadow-md transition-shadow">
                    <div className={`w-14 h-14 rounded-2xl ${exam.color} flex flex-col items-center justify-center text-white shrink-0`}>
                      <span className="text-[10px] font-bold uppercase">{new Date(exam.date).toLocaleString('default', { month: 'short' })}</span>
                      <span className="text-2xl font-black leading-none">{new Date(exam.date).getDate()}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-800">{exam.name}</h3>
                      <p className="text-sm font-bold text-indigo-500">{exam.subjectName}</p>
                      <div className="flex items-center space-x-3 mt-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase bg-slate-50 px-2 py-1 rounded-lg">Target: {exam.goal}</span>
                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">{new Date(exam.date).getFullYear()}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {state.subjects.every(s => s.exams.length === 0) && (
                  <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
                    <p className="text-4xl mb-4">✍️</p>
                    <p className="text-slate-400 font-medium">No exams scheduled yet. Add them in the subject details!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {view === 'achievements' && (
            <div className="space-y-6">
              <header>
                <h1 className="text-3xl font-black text-slate-900">Hall of Fame</h1>
                <p className="text-slate-500 font-medium">Earn XP to level up your optometry career.</p>
              </header>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {state.achievements.map(ach => (
                  <div key={ach.id} className={`p-8 rounded-3xl border transition-all relative overflow-hidden group ${ach.unlockedAt ? 'bg-white border-amber-200 shadow-md' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                    <div className={`text-5xl mb-6 transition-transform group-hover:scale-110 ${!ach.unlockedAt && 'grayscale'}`}>{ach.unlockedAt ? ach.icon : '🔒'}</div>
                    <h3 className={`font-black text-xl mb-1 ${ach.unlockedAt ? 'text-slate-800' : 'text-slate-400'}`}>{ach.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{ach.description}</p>
                    {ach.unlockedAt && (
                      <>
                        <div className="mt-6 inline-flex items-center px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] font-black uppercase tracking-widest">
                          Unlocked {new Date(ach.unlockedAt).toLocaleDateString()}
                        </div>
                        <div className="absolute top-4 right-4 text-xs font-black text-amber-300">#00{ach.id.length}</div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const NavBtn = ({ label, icon, active, onClick }: { label: string, icon: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center space-x-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'}`}
  >
    <span className={`text-xl transition-transform group-hover:scale-110 ${active ? 'scale-110' : ''}`}>{icon}</span>
    <span className="font-bold tracking-tight">{label}</span>
  </button>
);

const NavBtnMobile = ({ icon, active, onClick }: { icon: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`p-4 rounded-2xl transition-all ${active ? 'bg-indigo-600 text-white scale-110 shadow-lg shadow-indigo-100' : 'text-slate-400'}`}
  >
    <span className="text-2xl">{icon}</span>
  </button>
);

export default App;
