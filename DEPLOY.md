# Publicar o Pré-Conselho na Vercel

## 1. Enviar o código para o GitHub

O repositório já tem o remoto `origin` configurado. Salve e envie as alterações:

```bash
git add .
git commit -m "Prepare Vercel deployment"
git push origin main
```

`.env.local` está no `.gitignore` e não deve ser enviado ao GitHub.

## 2. Importar o projeto na Vercel

1. Na Vercel, escolha **Add New → Project** e importe `matheusgsanches-spec/Pr--Conselho`.
2. Use a raiz do repositório como **Root Directory**.
3. Se os campos de build não forem detectados automaticamente, informe:
   - Framework: **Vite**
   - Install Command: `npm install`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Antes ou depois do primeiro deploy, abra **Settings → Environment Variables** e cadastre as variáveis listadas abaixo para **Production** e **Preview**.
5. Clique em **Deploy**. O site público ficará na raiz e a administração em `/admin`.

## 3. Variáveis do Firebase

Cadastre cada nome como variável separada na Vercel e copie o valor correspondente de `.env.local`:

```text
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_DATABASE_URL
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

Depois de adicionar ou alterar variáveis, faça um novo deploy. Variáveis Vite são incorporadas ao código público no build; a segurança dos dados depende das regras do Realtime Database e da autorização no Firebase Authentication.

## 4. Autorizar o domínio no Firebase

Depois do primeiro deploy, copie o domínio `*.vercel.app` gerado. No Firebase Console, abra **Authentication → Settings → Authorized domains** e adicione o domínio sem `https://` e sem caminho, por exemplo `meu-projeto.vercel.app`.

Publique também a versão atual de `database.rules.json` na aba **Regras** do Realtime Database. Confirme que `admins/{UID}` existe com o valor booleano `true` para a conta administrativa.

## Endereços

- Aluno: `https://SEU-PROJETO.vercel.app/`
- Administração: `https://SEU-PROJETO.vercel.app/admin`

O endereço `/admin` é uma rota protegida por login. Para usar um domínio próprio, adicione-o em **Project → Settings → Domains**. A Vercel hospeda as duas telas; o Realtime Database mantém os dados compartilhados.
