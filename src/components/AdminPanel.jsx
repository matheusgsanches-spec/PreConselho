import { useMemo, useState } from 'react';
import QuestionsManager from './QuestionsManager.jsx';

function Field({ label, children }) {
  return <label className="field">{label}{children}</label>;
}

function Stat({ label, value, detail }) {
  return <article className="stat-card"><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>;
}

function Empty({ children }) {
  return <div className="empty-state">{children}</div>;
}

export default function AdminPanel({ data, actions }) {
  const [courseName, setCourseName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [courseId, setCourseId] = useState('');
  const [shiftId, setShiftId] = useState('');
  const [responseCourseId, setResponseCourseId] = useState('');
  const [responseShiftId, setResponseShiftId] = useState('');
  const [responseTeacherId, setResponseTeacherId] = useState('');
  const [message, setMessage] = useState('');
  const responseShifts = data.shifts.filter((shift) => !responseCourseId || data.teachers.some((teacher) => teacher.courseId === responseCourseId && teacher.shiftId === shift.id));
  const responseTeachers = data.teachers.filter((teacher) => (!responseCourseId || teacher.courseId === responseCourseId) && (!responseShiftId || teacher.shiftId === responseShiftId));
  const selectedTeacher = data.teachers.find((teacher) => teacher.id === responseTeacherId);
  const canViewResponses = Boolean(responseCourseId && responseShiftId);
  const filteredResponses = useMemo(() => data.responses.filter((response) => {
    const course = data.courses.find((item) => item.id === responseCourseId);
    const shift = data.shifts.find((item) => item.id === responseShiftId);
    return (!responseCourseId || response.courseId === responseCourseId || (!response.courseId && response.courseName === course?.name))
      && (!responseShiftId || response.shiftId === responseShiftId || (!response.shiftId && response.shiftName === shift?.name))
      && (!responseTeacherId || response.teacherId === responseTeacherId || (!response.teacherId && response.teacherName === selectedTeacher?.name));
  }), [data.responses, data.courses, data.shifts, data.teachers, responseCourseId, responseShiftId, responseTeacherId]);

  function announce(text) {
    setMessage(text);
    window.setTimeout(() => setMessage(''), 2500);
  }
  async function addCourse(event) {
    event.preventDefault();
    try { if (!await actions.addCourse(courseName)) return announce('Esse curso já está cadastrado.'); }
    catch { return announce('Não foi possível salvar o curso. Confira as permissões do Firebase.'); }
    setCourseName(''); announce('Curso adicionado.');
  }
  async function addTeacher(event) {
    event.preventDefault();
    let result;
    try { result = await actions.addTeacher(teacherName, courseId, shiftId); }
    catch { return announce('Não foi possível salvar o vínculo. Confira as permissões do Firebase.'); }
    if (!result) return announce('Esse vínculo já existe ou os dados são inválidos.');
    setTeacherName(''); announce('Professor vinculado ao curso e turno.');
  }

  return (
    <>
      <div className="admin-hero"><div><span className="eyebrow">PAINEL DE GESTÃO</span><h1>Administração</h1><p>Organize os vínculos da sua unidade e acompanhe as respostas do pré-conselho.</p></div><div className="admin-badge">SENAI <span>•</span> Gestão pedagógica</div></div>
      <div className="admin-wrap">
        <div className="stats-row"><Stat label="Cursos" value={data.courses.length} detail="cadastrados" /><Stat label="Vínculos de aula" value={data.teachers.length} detail="professor, curso e turno" /><Stat label="Respostas" value={filteredResponses.length} detail={`de ${data.responses.length} no total`} /></div>
        <QuestionsManager initialQuestions={data.questions} onSave={actions.saveQuestions} notify={announce} />
        <div className="admin-grid">
          <section className="admin-card">
            <div className="card-title"><div><span className="eyebrow">ESTRUTURA</span><h2>Cursos e turnos</h2></div><span className="card-icon">＋</span></div>
            <form className="compact-form" onSubmit={addCourse}><Field label="Nome do curso"><input value={courseName} onChange={(event) => setCourseName(event.target.value)} required maxLength="100" placeholder="Ex.: Técnico em Desenvolvimento de Sistemas" /></Field><button className="button primary" type="submit">Adicionar curso</button></form>
            <div className="item-list catalog-scroll-list">{data.courses.length ? data.courses.map((course) => <div className="list-item" key={course.id}><div className="item-main">{course.name}</div><button className="icon-button" type="button" onClick={async () => { try { await actions.removeCourse(course.id); announce('Curso e vínculos removidos.'); } catch { announce('Não foi possível remover o curso.'); } }}>Remover ×</button></div>) : <Empty>Nenhum curso cadastrado.</Empty>}</div>
            <div className="chip-list">{data.shifts.map((shift) => <span className="chip" key={shift.id}>{shift.name}</span>)}</div>
          </section>
          <section className="admin-card">
            <div className="card-title"><div><span className="eyebrow">EQUIPE DOCENTE</span><h2>Vincular professor</h2></div><span className="card-icon blue">↗</span></div>
            <p className="card-help">Cada professor fica associado a um curso e a um turno específicos. O aluno verá apenas os professores disponíveis para a turma escolhida.</p>
            <form className="compact-form" onSubmit={addTeacher}>
              <Field label="Nome do professor"><input value={teacherName} onChange={(event) => setTeacherName(event.target.value)} required maxLength="100" placeholder="Nome completo" /></Field>
              <Field label="Curso"><select value={courseId} required disabled={!data.courses.length} onChange={(event) => setCourseId(event.target.value)}><option value="">{data.courses.length ? 'Selecione o curso' : 'Cadastre um curso primeiro'}</option>{data.courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}</select></Field>
              <Field label="Turno"><select value={shiftId} required disabled={!data.shifts.length} onChange={(event) => setShiftId(event.target.value)}><option value="">{data.shifts.length ? 'Selecione o turno' : 'Cadastre um turno primeiro'}</option>{data.shifts.map((shift) => <option key={shift.id} value={shift.id}>{shift.name}</option>)}</select></Field>
              <button className="button primary" type="submit" disabled={!data.courses.length || !data.shifts.length}>Adicionar vínculo</button>
            </form>
            <div className="item-list teacher-scroll-list">{data.teachers.length ? data.teachers.map((teacher) => <div className="list-item" key={teacher.id}><div><div className="item-main">{teacher.name}</div><div className="item-sub">{data.courses.find((item) => item.id === teacher.courseId)?.name ?? 'Curso removido'} · {data.shifts.find((item) => item.id === teacher.shiftId)?.name ?? 'Turno removido'}</div></div><button className="icon-button" type="button" onClick={async () => { try { await actions.removeTeacher(teacher.id); announce('Vínculo removido.'); } catch { announce('Não foi possível remover o vínculo.'); } }}>Remover ×</button></div>) : <Empty>Nenhum professor vinculado.</Empty>}</div>
          </section>
        </div>
        <section className="admin-card responses-card"><div className="card-title"><div><span className="eyebrow">ESCUTA DOS ALUNOS</span><h2>Respostas por turma</h2><p className="section-subtitle">Escolha a turma e o turno para consultar as respostas.</p></div><button className="button secondary small-button" type="button" disabled={!canViewResponses || !filteredResponses.length} onClick={() => announce(actions.exportCsv(filteredResponses) ? 'Respostas filtradas exportadas em CSV.' : 'Não há respostas neste filtro.')}>Exportar CSV ↓</button></div>
          <div className="responses-filter"><label className="field">Turma / curso<select value={responseCourseId} required onChange={(event) => { setResponseCourseId(event.target.value); setResponseShiftId(''); setResponseTeacherId(''); }}><option value="">Selecione uma turma</option>{data.courses.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label className="field">Turno<select value={responseShiftId} required disabled={!responseCourseId} onChange={(event) => { setResponseShiftId(event.target.value); setResponseTeacherId(''); }}><option value="">{responseCourseId ? 'Selecione um turno' : 'Selecione a turma primeiro'}</option>{responseShifts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label className="field">Professor<select value={responseTeacherId} disabled={!responseShiftId} onChange={(event) => setResponseTeacherId(event.target.value)}><option value="">Todos os professores</option>{responseTeachers.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label></div>
          {canViewResponses ? filteredResponses.length ? [...filteredResponses].reverse().map((item) => <article className="response" key={item.id}><div className="response-head"><strong>{item.studentName}</strong><time>{new Date(item.createdAt).toLocaleString('pt-BR')}</time></div><div className="response-meta">{item.courseName} · {item.shiftName} · {item.teacherName}</div><div className="response-body">{item.answers ? Object.values(item.answers).map((answer, index) => answer.value && <div key={`${item.id}-${index}`}><b>{answer.prompt}</b> {answer.type === 'choice' ? '· ' : ': '}{answer.value}</div>) : <>{item.learning && <div><b>Como você avalia seu aprendizado?</b> · {item.learning}</div>}{item.positive && <div><b>O que está funcionando bem no curso?</b>: {item.positive}</div>}{item.support && <div><b>Em que gostaria de receber apoio?</b>: {item.support}</div>}{item.comment && <div><b>Comentário:</b> {item.comment}</div>}</>}</div></article>) : <Empty>{data.responses.length ? 'Nenhuma resposta corresponde à turma e aos filtros selecionados.' : 'Ainda não há respostas nesta turma e turno.'}</Empty> : <Empty>Selecione uma turma e um turno para visualizar as respostas.</Empty>}
        </section>
        <div className={`toast ${message ? 'show' : ''}`} role="status" aria-live="polite">{message}</div>
      </div>
    </>
  );
}
