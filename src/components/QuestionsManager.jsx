import { useEffect, useState } from 'react';
import { makeId } from '../data.js';

const defaultOptions = ['Muito bom', 'Bom', 'Regular', 'Preciso de ajuda'];

export default function QuestionsManager({ initialQuestions, onSave, notify }) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [saving, setSaving] = useState(false);
  useEffect(() => setQuestions(initialQuestions), [initialQuestions]);

  const update = (id, changes) => setQuestions((current) => current.map((item) => item.id === id ? { ...item, ...changes } : item));
  const move = (id, offset) => setQuestions((current) => {
    const from = current.findIndex((item) => item.id === id), to = from + offset;
    if (from < 0 || to < 0 || to >= current.length) return current;
    const next = [...current]; [next[from], next[to]] = [next[to], next[from]]; return next;
  });
  const add = (type) => setQuestions((current) => [...current, {
    id: `q-${makeId()}`,
    prompt: '',
    type,
    required: false,
    options: type === 'choice' ? [...defaultOptions] : [],
  }]);
  const remove = (id) => setQuestions((current) => current.filter((item) => item.id !== id));

  async function save(event) {
    event.preventDefault();
    const clean = questions.map((item) => ({
      ...item,
      prompt: item.prompt.trim(),
      options: item.type === 'choice' ? item.options.map((option) => option.trim()).filter(Boolean) : [],
    }));
    if (!clean.length || clean.some((item) => !item.prompt || (item.type === 'choice' && item.options.length < 2))) {
      notify('Preencha cada pergunta e mantenha pelo menos duas opções nas perguntas de escolha.');
      return;
    }
    setSaving(true);
    try {
      await onSave(clean);
      setQuestions(clean);
      notify('Perguntas atualizadas para os alunos.');
    } catch {
      notify('Não foi possível salvar as perguntas no Realtime Database.');
    } finally { setSaving(false); }
  }

  return <section className="admin-card questions-manager">
    <div className="card-title"><div><span className="eyebrow">FORMULÁRIO DO ALUNO</span><h2>Configurar perguntas</h2></div><span className="card-icon blue">✎</span></div>
    <p className="card-help">Edite os enunciados, escolha respostas abertas ou de múltipla escolha e defina quais são obrigatórias.</p>
    <form onSubmit={save}>
      <div className="question-editor-list">{questions.map((question, index) => <article className="question-editor" key={question.id}>
        <div className="question-editor-top"><span className="question-index">PERGUNTA {String(index + 1).padStart(2, '0')}</span><div className="question-tools"><button className="icon-button" type="button" aria-label="Mover para cima" onClick={() => move(question.id, -1)} disabled={index === 0}>↑</button><button className="icon-button" type="button" aria-label="Mover para baixo" onClick={() => move(question.id, 1)} disabled={index === questions.length - 1}>↓</button><button className="icon-button" type="button" onClick={() => remove(question.id)} disabled={questions.length <= 1}>Remover ×</button></div></div>
        <label className="field">Enunciado<input value={question.prompt} onChange={(event) => update(question.id, { prompt: event.target.value })} maxLength="180" placeholder="Escreva a pergunta para o aluno" required /></label>
        <div className="question-editor-controls"><label className="field">Tipo de resposta<select value={question.type} onChange={(event) => update(question.id, { type: event.target.value, options: event.target.value === 'choice' ? (question.options?.length ? question.options : [...defaultOptions]) : [] })}><option value="text">Resposta aberta</option><option value="choice">Múltipla escolha</option></select></label><label className="check-field"><input type="checkbox" checked={question.required} onChange={(event) => update(question.id, { required: event.target.checked })} />Obrigatória</label></div>
        {question.type === 'choice' && <label className="field">Opções separadas por vírgula<input value={(question.options ?? []).join(', ')} onChange={(event) => update(question.id, { options: event.target.value.split(',') })} placeholder="Ex.: Sim, Às vezes, Não" required /></label>}
      </article>)}</div>
      <div className="question-editor-actions"><button className="button secondary" type="button" onClick={() => add('text')}>＋ Pergunta aberta</button><button className="button secondary" type="button" onClick={() => add('choice')}>＋ Múltipla escolha</button><button className="button primary" type="submit" disabled={saving}>{saving ? 'Salvando…' : 'Salvar perguntas'}</button></div>
    </form>
  </section>;
}
