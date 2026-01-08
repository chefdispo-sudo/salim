
export enum StudentLevel {
  PRINCIPIANTE = 'Principiante',
  INTERMEDIO = 'Intermedio',
  AVANZADO = 'Avanzado'
}

export type Language = 'es' | 'en' | 'fr';

export interface Question {
  text: string;
  options: string[];
  correctAnswer: string;
}

export interface LessonContent {
  keyIdea: string;
  example: string;
  activity: string;
  quiz: Question[];
}

export interface Lesson {
  id: string;
  title: string;
  content: LessonContent;
}

export interface Unit {
  title: string;
  summary: string;
  lessons: Lesson[];
}

export interface Source {
  title: string;
  url: string;
}

export interface Course {
  title: string;
  description: string;
  level: string;
  duration: string;
  profile: string;
  objectives: string[];
  units: Unit[];
  finalEvaluation: Question[];
  finalProjects: string[];
  sources: Source[];
}

export interface FormData {
  topic: string;
  level: StudentLevel;
  profile: string;
  objective: string;
  time: string;
  format: string;
  language: Language;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarEmoji: string;
}
