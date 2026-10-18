import type { AppDataState } from '../interfaces';
import { INITIAL_DATA } from '../data/initialData';

const STORAGE_KEY = 'checkself_suite_v1_data';
const THEME_KEY = 'checkself_theme';

export const loadStoredData = (): AppDataState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('checkup_suite_v1_data');
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
      return INITIAL_DATA;
    }
    const parsed = JSON.parse(raw);
    return {
      finance: parsed.finance || INITIAL_DATA.finance,
      studyTasks: parsed.studyTasks || INITIAL_DATA.studyTasks,
      habits: parsed.habits || INITIAL_DATA.habits,
      devProjects: parsed.devProjects || INITIAL_DATA.devProjects,
    };
  } catch (error) {
    console.error('LocalStorage load error, using initial data:', error);
    return INITIAL_DATA;
  }
};

export const saveStoredData = (data: AppDataState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('LocalStorage save error:', error);
  }
};

export const resetStoredData = (): AppDataState => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
  return INITIAL_DATA;
};

export const exportDataAsJSON = (data: AppDataState): void => {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `checkself-yedek-${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

export const getStoredTheme = (): 'dark' | 'light' => {
  const theme = localStorage.getItem(THEME_KEY);
  if (theme === 'light' || theme === 'dark') return theme;
  return 'light'; // Default cute pastel light mode
};

export const setStoredTheme = (theme: 'dark' | 'light'): void => {
  localStorage.setItem(THEME_KEY, theme);
};

export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
};
