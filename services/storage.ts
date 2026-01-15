
import { AppState, Subject } from '../types';
import { INITIAL_SUBJECTS, ACHIEVEMENT_TEMPLATES } from '../constants';

const STORAGE_KEY = 'opto_track_data';

export const saveState = (state: AppState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const loadState = (): AppState => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        studyLog: parsed.studyLog || [],
        theme: parsed.theme || 'light'
      };
    } catch (e) {
      console.error('Failed to parse storage', e);
    }
  }

  return {
    subjects: INITIAL_SUBJECTS.map(s => ({
      ...s,
      chapters: [],
      assessments: [],
      exams: []
    })),
    achievements: ACHIEVEMENT_TEMPLATES,
    experience: 0,
    studyLog: [],
    theme: 'light'
  };
};

export const exportData = (state: AppState) => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "opto_track_backup.json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};
