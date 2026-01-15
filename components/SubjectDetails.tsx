
import React, { useState } from 'react';
import { Subject, Chapter, Assessment, Exam } from '../types';
import { ProgressBar } from './ProgressBar';

interface SubjectDetailsProps {
  subject: Subject;
  onUpdateSubject: (subject: Subject) => void;
  onBack: () => void;
}

export const SubjectDetails: React.FC<SubjectDetailsProps> = ({ subject, onUpdateSubject, onBack }) => {
  const [activeTab, setActiveTab] = useState<'chapters' | 'assessments' | 'exams'>('chapters');
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTarget, setNewTarget] = useState(5);

  const addChapter = () => {
    if (!newName.trim()) return;
    const newChapter: Chapter = {
      id: Date.now().toString(),
      name: newName,
      currentReps: 0,
      targetReps: newTarget,
    };
    onUpdateSubject({
      ...subject,
      chapters: [...subject.chapters, newChapter]
    });
    setNewName('');
    setIsAdding(false);
  };

  const updateRep = (chapterId: string, delta: number) => {
    onUpdateSubject({
      ...subject,
      chapters: subject.chapters.map(c => 
        c.id === chapterId ? { ...c, currentReps: Math.max(0, c.currentReps + delta), lastStudied: new Date().toISOString() } : c
      )
    });
  };

  const addAssessment = () => {
    const markStr = prompt("Enter Mark (e.g. 15):");
    const maxStr = prompt("Enter Max Possible Mark (e.g. 20):");
    const nameStr = prompt("Assessment Name:");
    if (markStr && maxStr && nameStr) {
      const newAs: Assessment = {
        id: Date.now().toString(),
        name: nameStr,
        mark: parseFloat(markStr),
        maxMark: parseFloat(maxStr)
      };
      onUpdateSubject({ ...subject, assessments: [...subject.assessments, newAs] });
    }
  };

  const addExam = () => {
    const name = prompt("Exam Title:");
    const date = prompt("Date (YYYY-MM-DD):");
    const goal = prompt("Grade Goal:");
    if (name && date) {
      const newEx: Exam = { id: Date.now().toString(), name, date, goal: goal || 'A' };
      onUpdateSubject({ ...subject, exams: [...subject.exams, newEx] });
    }
  };

  const deleteChapter = (id: string) => {
    onUpdateSubject({ ...subject, chapters: subject.chapters.filter(c => c.id !== id) });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <button onClick={onBack} className="text-gray-500 hover:text-indigo-600 flex items-center transition-colors mb-4">
        <span className="mr-2">←</span> Back to Dashboard
      </button>

      <div className={`${subject.color} p-8 rounded-3xl text-white shadow-lg`}>
        <h1 className="text-3xl font-bold mb-2">{subject.name}</h1>
        <div className="flex flex-wrap gap-4 mt-4">
          <div className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm">
            <p className="text-xs uppercase font-bold text-white/70">Chapters</p>
            <p className="text-xl font-bold">{subject.chapters.length}</p>
          </div>
          <div className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm">
            <p className="text-xs uppercase font-bold text-white/70">Completion</p>
            <p className="text-xl font-bold">
              {subject.chapters.length > 0 
                ? ((subject.chapters.filter(c => c.currentReps >= c.targetReps).length / subject.chapters.length) * 100).toFixed(0) 
                : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-2xl w-fit">
        {(['chapters', 'assessments', 'exams'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all ${
              activeTab === tab ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
        {activeTab === 'chapters' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Chapter Repetitions</h3>
              <button 
                onClick={() => setIsAdding(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors"
              >
                + Add Chapter
              </button>
            </div>

            {isAdding && (
              <div className="mb-8 p-6 bg-indigo-50 rounded-2xl border border-indigo-100 animate-in slide-in-from-top duration-300">
                <h4 className="font-bold mb-4">New Chapter Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Chapter Name (e.g., Geometrical Optics)"
                    className="p-3 rounded-xl border border-indigo-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                  <div className="flex items-center space-x-3">
                    <label className="text-sm font-medium text-gray-600">Target Reps:</label>
                    <input
                      type="number"
                      min="1"
                      className="w-20 p-3 rounded-xl border border-indigo-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={newTarget}
                      onChange={(e) => setNewTarget(parseInt(e.target.value) || 5)}
                    />
                  </div>
                </div>
                <div className="mt-4 flex space-x-3">
                  <button onClick={addChapter} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold">Save</button>
                  <button onClick={() => setIsAdding(false)} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-xl font-bold">Cancel</button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {subject.chapters.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <p className="text-4xl mb-2">🔭</p>
                  <p>Start your study plan by adding your first chapter.</p>
                </div>
              ) : (
                subject.chapters.map(chapter => {
                  const isDone = chapter.currentReps >= chapter.targetReps;
                  return (
                    <div key={chapter.id} className={`p-5 rounded-2xl border transition-all ${isDone ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-gray-100'}`}>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className={`font-bold text-lg ${isDone ? 'text-emerald-800 line-through' : 'text-gray-800'}`}>{chapter.name}</h4>
                            {isDone && <span className="bg-emerald-100 text-emerald-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Mastered</span>}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Current: <span className="font-bold text-gray-700">{chapter.currentReps}</span> / Target: <span className="font-bold text-gray-700">{chapter.targetReps}</span>
                            {chapter.lastStudied && ` • Last studied: ${new Date(chapter.lastStudied).toLocaleDateString()}`}
                          </p>
                          <div className="mt-3">
                            <ProgressBar progress={(chapter.currentReps / chapter.targetReps) * 100} colorClass={isDone ? 'bg-emerald-500' : subject.color} size="sm" />
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button onClick={() => updateRep(chapter.id, -1)} className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold">-</button>
                          <button onClick={() => updateRep(chapter.id, 1)} className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center font-bold">+</button>
                          <button onClick={() => deleteChapter(chapter.id)} className="w-10 h-10 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-500 flex items-center justify-center text-sm">🗑️</button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'assessments' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Continuous Assessments</h3>
              <button onClick={addAssessment} className="text-indigo-600 font-bold hover:underline">+ Add Mark</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {subject.assessments.map(as => (
                <div key={as.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800">{as.name}</p>
                    <p className="text-xs text-slate-500">Recorded Score</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-indigo-600">{as.mark} / {as.maxMark}</p>
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{((as.mark/as.maxMark)*100).toFixed(1)}%</p>
                  </div>
                </div>
              ))}
              {subject.assessments.length === 0 && <p className="col-span-full text-center py-10 text-gray-400">No marks recorded yet.</p>}
            </div>
          </div>
        )}

        {activeTab === 'exams' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Scheduled Exams</h3>
              <button onClick={addExam} className="text-indigo-600 font-bold hover:underline">+ Schedule Exam</button>
            </div>
            <div className="space-y-4">
              {subject.exams.map(ex => (
                <div key={ex.id} className="p-5 rounded-2xl border border-indigo-100 bg-indigo-50/30 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-white border border-indigo-100 flex flex-col items-center justify-center leading-none">
                      <span className="text-[10px] uppercase font-bold text-indigo-400">{new Date(ex.date).toLocaleString('default', { month: 'short' })}</span>
                      <span className="text-xl font-black text-indigo-700">{new Date(ex.date).getDate()}</span>
                    </div>
                    <div>
                      <h5 className="font-bold text-gray-900">{ex.name}</h5>
                      <p className="text-xs text-gray-500">Goal: <span className="font-bold text-indigo-600">{ex.goal}</span></p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">Coming Up</span>
                  </div>
                </div>
              ))}
              {subject.exams.length === 0 && <p className="text-center py-10 text-gray-400">No exams scheduled.</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
