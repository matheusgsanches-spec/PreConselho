import { useMemo, useState } from 'react';

const ratings = [
  ['Muito bom', '★'], ['Bom', '●'], ['Regular', '◐'], ['Preciso de ajuda', '?'],
];

export default function StudentForm({ data, onSubmit }) {
  const [courseId, setCourseId] = useState('');
  const [shiftId, setShiftId] = useState('');
  const shifts = useMemo(() => data.shifts.filter((shift) =>
    data.teachers.some((teacher) => teacher.courseId === courseId && teacher.shiftId === shift.id),
  ), [data, courseId]);
  const teachers = useMemo(() => data.teachers.filter((teacher) =>
    teacher.courseId === courseId && teacher.shiftId === shiftId,
  ), [data, courseId, shiftId]);

  function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    const validTeacher = teachers.find((teacher) => teacher.id === fields.get('teacherId'));
    if (!validTeacher) return;
    const course = data.courses.find((item) => item.id === courseId);
    const shift = data.shifts.find((item) => item.id === shiftId);
    onSubmit({
      studentName: String(fields.get('studentName')).trim(),
      courseId,
      shiftId,
      teacherId: validTeacher.id,
      courseName: course.name,
      shiftName: shift.name,
      teacherName: validTeacher.name,
      learning: fields.get('learning'),
      positive: String(fields.get('positive') || '').trim(),
      support: String(fields.get('support') || '').trim(),
      comment: String(fields.get('comment') || '').trim(),
    });
    form.reset();
    setCourseId('');
    setShiftId('');
  }

  return (
    <div className="content-wrap">
      <form className="form-card" onSubmit={submit}>
        <div className="section-heading"><div className="step">01</div><div><h2>Identifique sua turma</h2><p>As opções dependem dos vínculos cadastrados pela administração.</p></div></div>
        <div className="form-grid">
          <label className="field span-2">Seu nome<input name="studentName" required maxLength="100" placeholder="Nome completo" /></label>
          <label className="field">Curso<select name="courseId" value={courseId} required onChange={(event) => { setCourseId(event.target.value); setShiftId(''); }}><option value="">{data.courses.length ? 'Selecione o curso' : 'Nenhum curso cadastrado'}</option>{data.courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}</select></label>
          <label className="field">Turno<select name="shiftId" value={shiftId} required disabled={!courseId || !shifts.length} onChange={(event) => setShiftId(event.target.value)}><option value="">{!courseId ? 'Selecione primeiro o curso' : shifts.length ? 'Selecione o turno' : 'Sem turnos disponíveis'}</option>{shifts.map((shift) => <option key={shift.id} value={shift.id}>{shift.name}</option>)}</select></label>
          <label className="field span-2">Professor(a)<select name="teacherId" required disabled={!shiftId || !teachers.length}><option value="">{!shiftId ? 'Selecione primeiro o turno' : 'Selecione o professor'}</option>{teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name}</option>)}</select></label>
        </div>
        <div className="section-heading question-heading"><div className="step">02</div><div><h2>Como você está se sentindo?</h2><p>Não existem respostas certas. Seja sincero.</p></div></div>
        <fieldset className="question"><legend>Como você avalia seu aprendizado até agora?</legend><div className="rating-options">{ratings.map(([label, symbol]) => <label className="rating" key={label}><input type="radio" name="learning" value={label} required /><span className="face">{symbol}</span><span>{label}</span></label>)}</div></fieldset>
        <div className="form-grid text-questions">
          <label className="field span-2">O que está funcionando bem no curso?<textarea name="positive" rows="3" maxLength="1000" placeholder="Pode compartilhar o que tem ajudado você..." /></label>
          <label className="field span-2">Em que você gostaria de receber mais apoio?<textarea name="support" rows="3" maxLength="1000" placeholder="Algum conteúdo, atividade ou situação? Conte para a gente..." /></label>
          <label className="field span-2">Quer deixar mais algum comentário?<textarea name="comment" rows="3" maxLength="1000" placeholder="Este espaço é seu (opcional)" /></label>
        </div>
        <div className="form-footer"><p>Suas respostas serão compartilhadas com a equipe pedagógica.</p><button className="button primary" type="submit">Enviar respostas <span aria-hidden="true">→</span></button></div>
      </form>
    </div>
  );
}
