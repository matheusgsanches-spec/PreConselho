export const STORAGE_KEY = 'senai-pre-conselho-v1';

export const initialData = {
  courses: [
    { id: 'c1', name: 'Técnico em Desenvolvimento de Sistemas' },
    { id: 'c2', name: 'Técnico em Administração' },
    { id: 'c3', name: 'Técnico em Eletrotécnica' },
  ],
  shifts: [
    { id: 's1', name: 'Manhã' },
    { id: 's2', name: 'Tarde' },
    { id: 's3', name: 'Noite' },
  ],
  teachers: [
    { id: 't1', name: 'Ana Paula Martins', courseId: 'c1', shiftId: 's1' },
    { id: 't2', name: 'Carlos Eduardo Lima', courseId: 'c1', shiftId: 's3' },
    { id: 't3', name: 'Mariana Costa', courseId: 'c2', shiftId: 's2' },
    { id: 't4', name: 'Rafael Souza', courseId: 'c3', shiftId: 's3' },
  ],
  questions: [
    { id: 'learning', order: 0, prompt: 'Como você avalia seu aprendizado até agora?', type: 'choice', required: true, options: ['Muito bom', 'Bom', 'Regular', 'Preciso de ajuda'] },
    { id: 'positive', order: 1, prompt: 'O que está funcionando bem no curso?', type: 'text', required: false, options: [] },
    { id: 'support', order: 2, prompt: 'Em que você gostaria de receber mais apoio?', type: 'text', required: false, options: [] },
    { id: 'comment', order: 3, prompt: 'Quer deixar mais algum comentário?', type: 'text', required: false, options: [] },
  ],
  responses: [],
};

const standardShifts = [
  { id: 's1', name: 'Manhã', aliases: ['manha', 'matutino', 'matutina'] },
  { id: 's2', name: 'Tarde', aliases: ['tarde', 'vespertino', 'vespertina'] },
  { id: 's3', name: 'Noite', aliases: ['noite', 'noturno', 'noturna'] },
];

export function normalizeShifts(shifts = []) {
  const normalize = (value) => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleLowerCase('pt-BR');
  return standardShifts.map((standard) => {
    const existing = shifts.find((shift) => standard.aliases.includes(normalize(shift.name)));
    return { id: existing?.id ?? standard.id, name: standard.name, databaseName: existing?.name ?? standard.name };
  });
}

export function readData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && ['courses', 'shifts', 'teachers', 'responses'].every((key) => Array.isArray(saved[key]))) {
      return { ...structuredClone(initialData), ...saved, shifts: normalizeShifts(saved.shifts), questions: Array.isArray(saved.questions) ? saved.questions : structuredClone(initialData.questions) };
    }
  } catch {
    // Dados ausentes ou inválidos: inicia com os exemplos locais.
  }
  return structuredClone(initialData);
}

export function makeId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function downloadResponses(responses) {
  if (!responses.length) return false;
  const questionMap = new Map(initialData.questions.map((question) => [question.id, question.prompt]));
  responses.forEach((item) => Object.entries(item.answers ?? {}).forEach(([id, answer]) => questionMap.set(id, answer.prompt)));
  const questions = [...questionMap.entries()];
  const questionLabels = questions.map(([, prompt]) => prompt);
  const columns = ['Data', 'Aluno', 'Curso', 'Turno', 'Professor', ...questionLabels];
  const cell = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  const rows = responses.map((item) => [
    new Date(item.createdAt).toLocaleString('pt-BR'), item.studentName, item.courseName,
    item.shiftName, item.teacherName, ...questions.map(([id, label]) => item.answers?.[id]?.value ?? legacyAnswer(item, label)),
  ]);
  const csv = '\ufeff' + [columns, ...rows].map((row) => row.map(cell).join(';')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'respostas-pre-conselho.csv';
  link.click();
  URL.revokeObjectURL(url);
  return true;
}

function legacyAnswer(item, label) {
  const legacy = {
    'Como você avalia seu aprendizado até agora?': item.learning,
    'O que está funcionando bem no curso?': item.positive,
    'Em que você gostaria de receber mais apoio?': item.support,
    'Quer deixar mais algum comentário?': item.comment,
  };
  return legacy[label] ?? '';
}
