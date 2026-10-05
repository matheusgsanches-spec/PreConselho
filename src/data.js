export const STORAGE_KEY = 'senai-pre-conselho-v1';

export const initialData = {
  courses: [
    { id: 'c1', name: 'Técnico em Desenvolvimento de Sistemas' },
    { id: 'c2', name: 'Técnico em Administração' },
    { id: 'c3', name: 'Técnico em Eletrotécnica' },
  ],
  shifts: [
    { id: 's1', name: 'Matutino' },
    { id: 's2', name: 'Vespertino' },
    { id: 's3', name: 'Noturno' },
  ],
  teachers: [
    { id: 't1', name: 'Ana Paula Martins', courseId: 'c1', shiftId: 's1' },
    { id: 't2', name: 'Carlos Eduardo Lima', courseId: 'c1', shiftId: 's3' },
    { id: 't3', name: 'Mariana Costa', courseId: 'c2', shiftId: 's2' },
    { id: 't4', name: 'Rafael Souza', courseId: 'c3', shiftId: 's3' },
  ],
  responses: [],
};

export function readData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && ['courses', 'shifts', 'teachers', 'responses'].every((key) => Array.isArray(saved[key]))) {
      return saved;
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
  const columns = ['Data', 'Aluno', 'Curso', 'Turno', 'Professor', 'Aprendizado', 'Pontos positivos', 'Apoio necessário', 'Comentário'];
  const cell = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  const rows = responses.map((item) => [
    new Date(item.createdAt).toLocaleString('pt-BR'), item.studentName, item.courseName,
    item.shiftName, item.teacherName, item.learning, item.positive, item.support, item.comment,
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
