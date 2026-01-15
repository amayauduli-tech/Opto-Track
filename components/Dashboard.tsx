
import React, { useMemo } from 'react';
import { AppState, Subject } from '../types';
import { ProgressBar } from './ProgressBar';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

interface DashboardProps {
  state: AppState;
  onSelectSubject: (subject: Subject) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ state, onSelectSubject }) => {
  const stats = useMemo(() => {
    let totalChapters = 0;
    let completedChapters = 0;
    let totalReps = 0;

    state.subjects.forEach(s => {
      s.chapters.forEach(c => {
        totalChapters++;
        totalReps += c.currentReps;
        if (c.currentReps >= c.targetReps) completedChapters++;
      });
    });

    const completionRate = totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0;
    return { totalChapters, completedChapters, completionRate, totalReps };
  }, [state.subjects]);

  // Priority Chapters (Focus Required)
  const focusRequired = useMemo(() => {
    const list: { chapterName: string; subject: Subject; progress: number }[] = [];
    state.subjects.forEach(s => {
      s.chapters.forEach(c => {
        if (c.currentReps < c.targetReps) {
          list.push({
            chapterName: c.name,
            subject: s,
            progress: (c.currentReps / c.targetReps) * 100
          });
        }
      });
    });
    return list.sort((a, b) => a.progress - b.progress).slice(0, 4);
  }, [state.subjects]);

  // Upcoming Exams
  const upcomingExams = useMemo(() => {
    return state.subjects
      .flatMap(s => s.exams.map(e => ({ ...e, subjectColor: s.color, subjectName: s.name })))
      .filter(e => new Date(e.date) >= new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
  }, [state.subjects]);

  // Weekly Study Activity Data
  const weeklyActivityData = useMemo(() => {
    const now = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(now.getDate() - (6 - i));
      return d.toLocaleDateString('default', { weekday: 'short' });
    });

    const counts: Record<string, number> = {};
    last7Days.forEach(day => counts[day] = 0);

    state.studyLog.forEach(log => {
      const logDate = new Date(log.timestamp);
      const diffDays = Math.floor((now.getTime() - logDate.getTime()) / (1000 * 3600 * 24));
      if (diffDays >= 0 && diffDays < 7) {
        const dayLabel = logDate.toLocaleDateString('default', { weekday: 'short' });
        counts[dayLabel] = (counts[dayLabel] || 0) + 1;
      }
    });

    return last7Days.map(day => ({ name: day, reps: counts[day] }));
  }, [state.studyLog]);

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Personal Dashboard</h1>
          <p className="text-gray-500 font-medium">Your optometry journey at a glance.</p>
        </div>
        <div className="flex items-center space-x-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-right">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Level {Math.floor(state.experience / 1000) + 1}</p>
            <p className="text-2xl font-black text-indigo-600">{state.experience} <span className="text-xs text-gray-400">XP</span></p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-2xl text-white shadow-lg shadow-indigo-100">
            🔭
          </div>
        </div>
      </header>

      {/* Hero Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Activity Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800">Study Intensity (Last 7 Days)</h3>
            <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">Weekly Repetitions</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyActivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#94a3b8' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="reps" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Global Progress Circle Placeholder */}
        <div className="bg-indigo-600 p-8 rounded-3xl text-white flex flex-col justify-between shadow-xl shadow-indigo-100 relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-1">Course Mastery</h3>
            <p className="text-indigo-100 text-sm">Overall syllabus progress</p>
          </div>
          <div className="relative z-10 flex items-end justify-between">
            <div>
              <p className="text-5xl font-black">{stats.completionRate.toFixed(0)}%</p>
              <p className="text-xs text-indigo-100 mt-2 font-bold uppercase tracking-widest">{stats.completedChapters}/{stats.totalChapters} Chapters Done</p>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Focus Required */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">🔥</span> Focus Required
          </h3>
          <div className="space-y-4">
            {focusRequired.length > 0 ? focusRequired.map((item, idx) => (
              <div key={idx} className="group p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h5 className="text-sm font-bold text-gray-800 truncate">{item.chapterName}</h5>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">{item.subject.name}</p>
                  </div>
                  <span className="text-[10px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">Lags Target</span>
                </div>
                <ProgressBar progress={item.progress} colorClass={item.subject.color} size="sm" />
              </div>
            )) : (
              <p className="text-sm text-gray-400 text-center py-10">No chapters require urgent attention. Keep it up!</p>
            )}
          </div>
        </div>

        {/* Upcoming Exams */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">📅</span> Next Exams
          </h3>
          <div className="space-y-4">
            {upcomingExams.length > 0 ? upcomingExams.map((exam, idx) => {
              const daysLeft = Math.ceil((new Date(exam.date).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
              return (
                <div key={idx} className="flex items-center space-x-4 p-3 rounded-2xl border border-slate-50">
                  <div className={`w-12 h-12 rounded-xl ${exam.subjectColor} flex flex-col items-center justify-center text-white shrink-0`}>
                    <span className="text-[9px] font-bold uppercase">{new Date(exam.date).toLocaleString('default', { month: 'short' })}</span>
                    <span className="text-lg font-black leading-none">{new Date(exam.date).getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-bold text-gray-800 truncate">{exam.name}</h5>
                    <p className="text-xs text-gray-500">{exam.subjectName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                      {daysLeft === 0 ? 'Today' : `${daysLeft}d left`}
                    </p>
                  </div>
                </div>
              );
            }) : (
              <p className="text-sm text-gray-400 text-center py-10">No upcoming exams scheduled.</p>
            )}
          </div>
        </div>

        {/* Subject Progress Summary List */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Subject Mastery</h3>
          <div className="flex-1 space-y-3 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
            {state.subjects.map(s => {
              const completed = s.chapters.filter(c => c.currentReps >= c.targetReps).length;
              const total = s.chapters.length;
              const perc = total > 0 ? (completed / total) * 100 : 0;
              return (
                <button 
                  key={s.id} 
                  onClick={() => onSelectSubject(s)}
                  className="w-full text-left group"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-gray-700 group-hover:text-indigo-600 transition-colors">{s.name}</span>
                    <span className="text-[10px] font-bold text-gray-400">{perc.toFixed(0)}%</span>
                  </div>
                  <ProgressBar progress={perc} colorClass={s.color} size="sm" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Subjects Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-black text-gray-900">Course Library</h3>
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-sm font-bold text-indigo-600 hover:text-indigo-700">View All Details</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {state.subjects.map(subject => (
            <button
              key={subject.id}
              onClick={() => onSelectSubject(subject)}
              className="group text-left p-5 bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:scale-[1.02] hover:border-indigo-100 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-2xl ${subject.color} flex items-center justify-center text-white font-black text-xl mb-4 shadow-lg shadow-${subject.color.split('-')[1]}-100`}>
                {subject.name.charAt(0)}
              </div>
              <h4 className="font-bold text-gray-900 mb-1 truncate">{subject.name}</h4>
              <p className="text-xs font-medium text-gray-400 mb-4">{subject.chapters.length} Chapters</p>
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                <span>Mastery</span>
                <span>
                  {subject.chapters.length > 0 
                    ? (subject.chapters.filter(c => c.currentReps >= c.targetReps).length / subject.chapters.length * 100).toFixed(0) 
                    : 0}%
                </span>
              </div>
              <ProgressBar 
                progress={subject.chapters.length > 0 
                  ? (subject.chapters.filter(c => c.currentReps >= c.targetReps).length / subject.chapters.length) * 100 
                  : 0
                } 
                colorClass={subject.color} 
                size="sm"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color, textColor }: { title: string, value: string, icon: string, color: string, textColor: string }) => (
  <div className={`${color} p-5 rounded-2xl border border-white/50 shadow-sm`}>
    <div className="flex items-center justify-between mb-2">
      <span className="text-xl">{icon}</span>
    </div>
    <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</h5>
    <p className={`text-2xl font-black ${textColor}`}>{value}</p>
  </div>
);
