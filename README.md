# Pré-Conselho SENAI

Aplicação React + Vite com duas entradas independentes: formulário público do aluno e painel administrativo protegido por Firebase Authentication. Os dados ficam no Firebase Realtime Database.

## Desenvolvimento

Requer Node.js e npm.

```bash
npm install
npm run dev
```

O app do aluno roda em `http://localhost:5173`. Em outro terminal, rode:

```bash
npm run dev:admin
```

O painel administrativo roda em `http://localhost:5174/admin.html`. Os servidores aceitam conexões da rede local (`--host 0.0.0.0`); em outro dispositivo, use o endereço IPv4 do computador que está rodando os servidores, com a porta correspondente (`5173` para aluno e `5174` para admin). É a porta que separa as duas aplicações no desenvolvimento; para publicar de verdade, configure endereços/domínios separados no serviço de hospedagem.

## Configurar Firebase

1. Crie um app Web no Firebase Console e ative o Realtime Database.
2. Ative Authentication com o provedor **E-mail/senha** e crie a conta administrativa.
3. As credenciais do app já foram salvas em `.env.local` localmente. Não envie esse arquivo ao Git.
4. Publique `database.rules.json` nas regras do Realtime Database.
5. No Realtime Database, crie manualmente `admins/{UID_DA_CONTA}` com valor booleano `true`. O UID está na área Authentication. Somente contas com esse valor entram no painel.
6. Reinicie os servidores Vite depois de preencher `.env.local`.

O app lê os nós `courses`, `shifts`, `teachers` e `responses` em tempo real. O aluno pode ler os catálogos e enviar respostas; somente contas autorizadas em `admins` podem administrar os catálogos e ler respostas. As regras validam os vínculos de professor, curso e turno.

Para compilar as duas aplicações para produção:

```bash
npm run build
npm run preview
```

O build inclui `index.html` (aluno) e `admin.html` (admin). Configure o serviço de hospedagem para disponibilizar o painel em um endereço próprio e manter a regra de acesso do Firebase ativa.
