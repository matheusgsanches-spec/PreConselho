import { useEffect, useMemo, useState } from 'react';
import { onValue, push, ref, remove, set } from 'firebase/database';
import { db, firebaseConfigured } from './firebase.js';
import { initialData, makeId, normalizeShifts, readData, STORAGE_KEY, downloadResponses } from './data.js';

function normalizeCollection(snapshot) {
  const value = snapshot.val() ?? {};
  return Object.entries(value).map(([id, item]) => ({ id, ...item }));
}

export function useSharedData(enabled = true) {
  const [data, setData] = useState(() => firebaseConfigured
    ? { ...structuredClone(initialData), courses: [], shifts: [], teachers: [], responses: [] }
    : readData());
  const [error, setError] = useState('');

  useEffect(() => {
    if (!firebaseConfigured) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* Armazenamento local opcional. */ }
      return undefined;
    }
    if (!enabled) return undefined;
    const names = ['courses', 'shifts', 'teachers', 'responses', 'questions'];
    const unsubscribers = names.map((name) => onValue(
      ref(db, name),
      (snapshot) => setData((current) => {
        const value = name === 'questions' && !snapshot.exists()
          ? initialData.questions
          : name === 'shifts'
            ? normalizeShifts(normalizeCollection(snapshot))
            : normalizeCollection(snapshot);
        if (name === 'questions') value.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        return { ...current, [name]: value };
      }),
      () => setError('Não foi possível carregar os dados. Confira a conexão Firebase e as regras do Realtime Database.'),
    ));
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [enabled]);

  const actions = useMemo(() => {
    const persistAdd = async (name, item) => {
      if (firebaseConfigured) {
        const itemRef = push(ref(db, name));
        await set(itemRef, item);
      } else {
        setData((current) => ({ ...current, [name]: [...current[name], { id: makeId(), ...item }] }));
      }
    };
    const persistDelete = async (name, id) => {
      if (firebaseConfigured) await remove(ref(db, `${name}/${id}`));
      else setData((current) => ({ ...current, [name]: current[name].filter((item) => item.id !== id) }));
    };
    return {
      addCourse: async (name) => {
        const clean = name.trim();
        if (!clean || data.courses.some((item) => item.name.toLocaleLowerCase('pt-BR') === clean.toLocaleLowerCase('pt-BR'))) return false;
        await persistAdd('courses', { name: clean }); return true;
      },
      addTeacher: async (name, courseId, shiftId) => {
        const clean = name.trim();
        if (!clean || !data.courses.some((item) => item.id === courseId) || !data.shifts.some((item) => item.id === shiftId)) return false;
        if (data.teachers.some((item) => item.name.toLocaleLowerCase('pt-BR') === clean.toLocaleLowerCase('pt-BR') && item.courseId === courseId && item.shiftId === shiftId)) return false;
        await persistAdd('teachers', { name: clean, courseId, shiftId }); return true;
      },
      saveQuestions: async (questions) => {
        if (!questions.length) return false;
        const ordered = questions.map((question, order) => ({ ...question, order }));
        if (firebaseConfigured) {
          const byId = Object.fromEntries(ordered.map(({ id, ...question }) => [id, question]));
          await set(ref(db, 'questions'), byId);
        } else setData((current) => ({ ...current, questions: ordered }));
        return true;
      },
      removeCourse: async (id) => {
        const linked = data.teachers.filter((teacher) => teacher.courseId === id);
        await Promise.all(linked.map((teacher) => persistDelete('teachers', teacher.id)));
        await persistDelete('courses', id);
      },
      removeTeacher: (id) => persistDelete('teachers', id),
      addResponse: async (response) => {
        const record = { ...response, createdAt: new Date().toISOString() };
        if (firebaseConfigured) {
          const responseRef = push(ref(db, 'responses'));
          await set(responseRef, record);
        } else setData((current) => ({ ...current, responses: [...current.responses, { ...record, id: makeId() }] }));
      },
      exportCsv: (responses = data.responses) => downloadResponses(responses),
    };
  }, [data]);

  return { data, actions, error };
}
