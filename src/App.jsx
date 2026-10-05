import { useState } from 'react';
import StudentForm from './components/StudentForm.jsx';
import { useSharedData } from './useSharedData.js';

export default function App() {
  const { data, actions, error } = useSharedData();
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState(false);
  async function submitResponse(response) {
    try {
      await actions.addResponse(response);
      setSendError(false);
      setSent(true);
      window.setTimeout(() => setSent(false), 6000);
    } catch {
      setSent(false);
      setSendError(true);
      window.setTimeout(() => setSendError(false), 6000);
    }
  }

  return (
    <>
      <header className="topbar">
        <a className="brand" href="#inicio" aria-label="SENAI Pré-Conselho"><span className="brand-word">SENAI<span className="brand-mark" /></span><span className="brand-divider" /><span className="brand-caption">PRÉ-CONSELHO</span></a>
      </header>
      <main>
        <section className="view" id="inicio">
          <div className="hero"><div className="hero-copy"><span className="eyebrow">SUA VOZ FAZ A DIFERENÇA</span><h1>Vamos conversar<br />sobre sua turma?</h1><p>Conte como está sendo sua experiência. Suas respostas ajudam a melhorar o curso para todo mundo.</p></div><div className="hero-art" aria-hidden="true"><div className="art-ring" /><div className="art-card"><span>✳</span><strong>Escuta<br />ativa.</strong><small>Construímos juntos.</small></div><div className="art-dot" /></div></div>
          <StudentForm data={data} onSubmit={submitResponse} />
          {(sent || error || sendError) && <div className={`notice ${sent || error || sendError ? 'show' : ''}`} role="status">{error || (sendError ? 'Não foi possível enviar. Confira a conexão com o Firebase e tente novamente.' : 'Obrigado por compartilhar sua experiência. Suas respostas foram enviadas com sucesso.')}</div>}
        </section>
      </main>
    </>
  );
}
