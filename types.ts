
export interface Chapter {
  id: string;
  name: string;
  currentReps: number;
  targetReps: number;
  lastStudied?: string;
}

export interface Assessment {
  id: string;
  name: string;
  mark: number;
  maxMark: number;
}

export interface Exam {
  id: string;
  name: string;
  date: string;
  goal: string;
}

export interface Subject {
  id: string;
  name: string;
  color: string;
  chapters: Chapter[];
  assessments: Assessment[];
  exams: Exam[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface StudySession {
  timestamp: string;
  subjectId: string;
  subjectName: string;
}

export type ViewState = 'dashboard' | 'subject' | 'exams' | 'achievements';

export interface AppState {
  subjects: Subject[];
  achievements: Achievement[];
  experience: number;
  studyLog: StudySession[];
}
