import { create } from 'zustand';
import { UserProfile, Course, Language, UserLevel } from '../types';

interface StoreState {
  user: UserProfile | null;
  courses: Course[];
  activeCourseId: string | null;
  setUser: (user: UserProfile) => void;
  setCourses: (courses: Course[]) => void;
  setActiveCourse: (id: string) => void;
  updateProgress: (courseId: string, moduleId: string, score: number) => void;
}

export const useStore = create<StoreState>((set) => ({
  user: null,
  courses: [],
  activeCourseId: null,
  setUser: (user) => set({ user }),
  setCourses: (courses) => set({ courses }),
  setActiveCourse: (id) => set({ activeCourseId: id }),
  updateProgress: (courseId, moduleId, score) =>
    set((state) => {
      const updatedCourses = state.courses.map((c) => {
        if (c.id === courseId) {
          const updatedModules = c.modules.map((m) =>
            m.id === moduleId ? { ...m, completed: true, score } : m
          );
          const completedCount = updatedModules.filter((m) => m.completed).length;
          const progress = (completedCount / updatedModules.length) * 100;
          return { ...c, modules: updatedModules, progress };
        }
        return c;
      });
      return { courses: updatedCourses };
    }),
}));
