import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { get, ref } from 'firebase/database';
import AdminPanel from './components/AdminPanel.jsx';
import { auth, db, firebaseConfigured } from './firebase.js';
import { useSharedData } from './useSharedData.js';

function AdminWorkspace({ user, onLogout }) {
  const { data, actions, error } = useSharedData(true, true);
  return <>
    <header className="topbar">
      <a className="brand" href="/admin.html" aria-label="SENAI Administração"><span className="brand-word">SENAI<span className="brand-mark" /></span><span className="brand-divider" /><span className="brand-caption">PRÉ-CONSELHO · ADMIN</span></a>
      <div className="admin-user"><span>{user.email}</span><button className="button secondary small-button" onClick={onLogout}>Sair</button></div>
    </header>
    <main><section className="view"><AdminPanel data={data} actions={actions} />{error && <div className="notice show admin-error">{error}</div>}</section></main>
  </>;
}

export default function AdminApp() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!firebaseConfigured) { setChecking(false); return undefined; }
    return onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) { setAuthorized(false); setChecking(false); return; }
      try {
        const adminNode = await get(ref(db, `admins/${currentUser.uid}`));
        setAuthorized(adminNode.val() === true);
        if (adminNode.val() !== true) setMessage('Sua conta autenticou, mas ainda não tem acesso administrativo. Cadastre seu UID no nó admins do Realtime Database.');
      } catch {
        setAuthorized(false);
        setMessage('Não foi possível confirmar a permissão no Realtime Database. Confira as regras de segurança.');
      } finally { setChecking(false); }
    });
  }, []);

  async function login(event) {
    event.preventDefault(); setBusy(true); setMessage('');
    try { await signInWithEmailAndPassword(auth, email.trim(), password); }
    catch { setMessage('Não foi possível entrar. Confira o e-mail e a senha da conta administrativa.'); }
    finally { setBusy(false); }
  }
  async function logout() { await signOut(auth); setUser(null); setAuthorized(false); }

  if (!firebaseConfigured) return <SetupScreen />;
  if (checking) return <div className="auth-screen"><div className="auth-card"><span className="brand-word">SENAI</span><p>Verificando acesso administrativo…</p></div></div>;
  if (user && authorized) return <AdminWorkspace user={user} onLogout={logout} />;
  if (user && !authorized) return <div className="auth-screen"><div className="auth-card"><span className="eyebrow">ACESSO RESTRITO</span><h1>Conta sem permissão</h1><p>{message || 'Este usuário não foi autorizado como administrador.'}</p><button className="button primary" onClick={logout}>Sair</button></div></div>;
  return <div className="auth-screen"><form className="auth-card" onSubmit={login}><a className="brand auth-brand" href="/admin.html"><span className="brand-word">SENAI<span className="brand-mark" /></span><span className="brand-divider" /><span className="brand-caption">ÁREA ADMINISTRATIVA</span></a><span className="eyebrow">ACESSO RESTRITO</span><h1>Entrar no painel</h1><p>Use sua conta autorizada para gerenciar cursos, turmas e respostas.</p><label className="field">E-mail<input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label className="field">Senha<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>{message && <div className="auth-message" role="alert">{message}</div>}<button className="button primary auth-submit" type="submit" disabled={busy}>{busy ? 'Entrando…' : 'Entrar'}</button><div className="auth-footnote">SENAI <span>·</span> Pré-Conselho</div></form></div>;
}

function SetupScreen() {
  return <div className="auth-screen"><section className="auth-card"><a className="brand auth-brand" href="/"><span className="brand-word">SENAI<span className="brand-mark" /></span><span className="brand-divider" /><span className="brand-caption">ÁREA ADMINISTRATIVA</span></a><span className="eyebrow">CONFIGURAÇÃO NECESSÁRIA</span><h1>Conecte o Firebase</h1><p>Cadastre as credenciais do projeto no arquivo <code>.env.local</code>, ative Authentication com e-mail e senha e configure o Realtime Database. O guia está no README.</p><a className="button primary" href="/">Abrir área do aluno →</a></section></div>;
}
