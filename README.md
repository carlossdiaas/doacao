🤝 Doação App

Aplicação web funcional para gerenciamento de doações e adoções.
Permite que múltiplos usuários se cadastrem, façam login, registrem doações com foto/descrição/localização e que outras pessoas possam reivindicar essas doações.

⚙️ Stack Tecnológica

Backend: Node.js + Express + SQLite

Frontend: HTML + TailwindCSS + JavaScript (estático, ideal para GitHub Pages)

🖥️ Setup Local (Backend)

Clone o repositório

git clone https://github.com/usuario/doacao-app.git
cd doacao-app


Copie .env.example para .env e configure:

JWT_SECRET=sua_chave_segura
PORT=3000


Instale as dependências

npm install


Rode o servidor em modo dev

npm run dev

🚀 Deploy
Frontend

Publique a pasta public/ no GitHub Pages

via branch main ou gh-pages.

Backend

Faça deploy deste repositório (ou da pasta server/) no Render ou Railway.

Configure as variáveis de ambiente:

JWT_SECRET

PORT

⚠️ Certifique-se de que o diretório uploads/ seja persistente ou altere para usar S3/Cloud Storage.

📡 API Endpoints
Autenticação

POST /register → criar usuário

POST /login → autenticar usuário

Usuário

GET /profile (auth) → obter perfil

PUT /profile (auth) → atualizar perfil

Doações

GET /donations → listar todas doações

POST /donations (auth) → criar nova doação

POST /claim (auth) → reivindicar doação

✅ Observações

Use um JWT_SECRET forte em produção.

Render/Railway já fornecem HTTPS automaticamente.

Para uploads confiáveis em produção, considere Amazon S3, Supabase Storage ou similar.