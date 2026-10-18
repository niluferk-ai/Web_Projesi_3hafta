export type TabType = 
  | 'overview' 
  | 'finance' 
  | 'study' 
  | 'habitly' 
  | 'devtrack' 
  | 'about';

// 1. Finance Interfaces
export type TransactionType = 'income' | 'expense';

export interface FinanceTransaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string; // YYYY-MM-DD
  description?: string;
}

export interface FinanceBudget {
  monthlyIncomeTarget: number;
  monthlyExpenseBudget: number;
  savingsTarget: number;
}

// 2. StudyFlow Interfaces
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'archived';

export interface StudyTask {
  id: string;
  course: string;
  title: string;
  dueDate: string; // YYYY-MM-DD
  priority: TaskPriority;
  status: TaskStatus;
  estimatedMinutes: number;
  notes?: string;
  completedAt?: string;
}

// 3. Habitly Interfaces
export interface Habit {
  id: string;
  name: string;
  category: string;
  targetCount: number;
  unit: string;
  color: string;
  icon: string;
  completedDates: string[]; // ['2026-10-10', '2026-10-11']
  createdAt: string;
}

// 4. DevTrack Interfaces
export type ProjectStatus = 'backlog' | 'in_progress' | 'completed';

export interface DevProject {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  priority: TaskPriority;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  deadline: string; // YYYY-MM-DD
  progress: number; // 0 to 100
}

// Global App State
export interface AppDataState {
  finance: {
    transactions: FinanceTransaction[];
    budget: FinanceBudget;
  };
  studyTasks: StudyTask[];
  habits: Habit[];
  devProjects: DevProject[];
}
