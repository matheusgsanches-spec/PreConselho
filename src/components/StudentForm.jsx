import { useMemo, useState } from 'react';

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
    const teacher = teachers.find((item) => item.id === fields.get('teacherId'));
    if (!teacher) return;
    const course = data.courses.find((item) => item.id === courseId);
    const shift = data.shifts.find((item) => item.id === shiftId);
    const answers = Object.fromEntries(data.questions.map((question) => [question.id, {
      prompt: question.prompt,
      type: question.type,
      value: String(fields.get(`answer-${question.id}`) ?? '').trim(),
    }]));
    onSubmit({
      studentName: String(fields.get('studentName')).trim(),
      courseId,
      shiftId,
      teacherId: teacher.id,
      courseName: course.name,
      shiftName: shift.name,
      teacherName: teacher.name,
      answers,
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
          <label className="field span-2">Professor(a)<select name="teacherId" required disabled={!shiftId || !teachers.length}><option value="">{!shiftId ? 'Selecione primeiro o turno' : 'Selecione o professor'}</option>{teachers.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        </div>
        <div className="section-heading question-heading"><div className="step">02</div><div><h2>Como está sua experiência?</h2><p>Responda às perguntas do pré-conselho.</p></div></div>
        {data.questions.length ? <div className="dynamic-questions">{data.questions.map((question) => question.type === 'choice' ? (
          <fieldset className="question" key={question.id}><legend>{question.prompt}{question.required && <span className="required-mark"> *</span>}</legend><div className="rating-options">{question.options.map((option, index) => <label className="rating" key={`${question.id}-${option}`}><input type="radio" name={`answer-${question.id}`} value={option} required={question.required} /><span className="face">{['★', '●', '◐', '?'][index % 4]}</span><span>{option}</span></label>)}</div></fieldset>
        ) : <label className="field dynamic-text" key={question.id}>{question.prompt}{question.required && <span className="required-mark"> *</span>}<textarea name={`answer-${question.id}`} rows="3" maxLength="1000" required={question.required} placeholder="Escreva sua resposta..." /></label>)}</div> : <div className="empty-state">Ainda não há perguntas disponíveis.</div>}
        <div className="form-footer"><button className="button primary" type="submit" disabled={!data.questions.length}>Enviar respostas <span aria-hidden="true">→</span></button></div>
      </form>
    </div>
  );
}
