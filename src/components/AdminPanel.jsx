import { useState } from 'react';

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
  const [shiftName, setShiftName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [courseId, setCourseId] = useState('');
  const [shiftId, setShiftId] = useState('');
  const [message, setMessage] = useState('');

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
  async function addShift(event) {
    event.preventDefault();
    try { if (!await actions.addShift(shiftName)) return announce('Esse turno já está cadastrado.'); }
    catch { return announce('Não foi possível salvar o turno. Confira as permissões do Firebase.'); }
    setShiftName(''); announce('Turno adicionado.');
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
        <div className="stats-row"><Stat label="Cursos" value={data.courses.length} detail="cadastrados" /><Stat label="Vínculos de aula" value={data.teachers.length} detail="professor, curso e turno" /><Stat label="Respostas" value={data.responses.length} detail="recebidas" /></div>
        <div className="admin-grid">
          <section className="admin-card">
            <div className="card-title"><div><span className="eyebrow">ESTRUTURA</span><h2>Cursos e turnos</h2></div><span className="card-icon">＋</span></div>
            <form className="compact-form" onSubmit={addCourse}><Field label="Nome do curso"><input value={courseName} onChange={(event) => setCourseName(event.target.value)} required maxLength="100" placeholder="Ex.: Técnico em Desenvolvimento de Sistemas" /></Field><button className="button primary" type="submit">Adicionar curso</button></form>
            <form className="compact-form inline-form" onSubmit={addShift}><Field label="Novo turno"><input value={shiftName} onChange={(event) => setShiftName(event.target.value)} required maxLength="40" placeholder="Ex.: Matutino" /></Field><button className="button secondary" type="submit">Adicionar</button></form>
            <div className="item-list catalog-scroll-list">{data.courses.length ? data.courses.map((course) => <div className="list-item" key={course.id}><div className="item-main">{course.name}</div><button className="icon-button" type="button" onClick={async () => { try { await actions.removeCourse(course.id); announce('Curso e vínculos removidos.'); } catch { announce('Não foi possível remover o curso.'); } }}>Remover ×</button></div>) : <Empty>Nenhum curso cadastrado.</Empty>}</div>
            <div className="chip-list">{data.shifts.map((shift) => <span className="chip" key={shift.id}>{shift.name}<button type="button" onClick={async () => { try { await actions.removeShift(shift.id); announce('Turno e vínculos removidos.'); } catch { announce('Não foi possível remover o turno.'); } }} aria-label={`Remover turno ${shift.name}`}>×</button></span>)}</div>
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
        <section className="admin-card responses-card"><div className="card-title"><div><span className="eyebrow">ESCUTA DOS ALUNOS</span><h2>Respostas recebidas</h2></div><button className="button secondary small-button" type="button" onClick={() => announce(actions.exportCsv() ? 'Arquivo CSV exportado.' : 'Ainda não há respostas para exportar.')}>Exportar CSV ↓</button></div>
          {data.responses.length ? [...data.responses].reverse().map((item) => <article className="response" key={item.id}><div className="response-head"><strong>{item.studentName}</strong><time>{new Date(item.createdAt).toLocaleString('pt-BR')}</time></div><div className="response-meta">{item.courseName} · {item.shiftName} · {item.teacherName} · Aprendizado: {item.learning}</div><div className="response-body">{item.positive && <div><b>Está funcionando bem:</b> {item.positive}</div>}{item.support && <div><b>Precisa de apoio:</b> {item.support}</div>}{item.comment && <div><b>Comentário:</b> {item.comment}</div>}</div></article>) : <Empty>As respostas enviadas pelos alunos aparecerão aqui.</Empty>}
        </section>
        <p className="storage-note"><span>ⓘ</span> Este protótipo salva os dados neste navegador. Para uso por várias pessoas ou em computadores diferentes, será necessário conectar um servidor e banco de dados.</p>
        <div className={`toast ${message ? 'show' : ''}`} role="status" aria-live="polite">{message}</div>
      </div>
    </>
  );
}
