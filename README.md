🌍 App Doações

Um aplicativo funcional de doações, onde qualquer pessoa pode cadastrar itens para doar e outros usuários podem solicitar/adotar esses itens.
O sistema é multiusuário, possui login seguro e uma interface moderna e responsiva.

✨ Funcionalidades

👤 Cadastro e Login com autenticação JWT e senhas criptografadas (bcrypt).

📝 Perfil do usuário com nome, cidade e foto.

🎁 Cadastro de doações (descrição, imagem, localização).

🔍 Explorar doações disponíveis em tempo real.

🤝 Solicitar/adotar uma doação (registro salvo no banco).

📱 Interface responsiva feita com Tailwind CSS.

🔒 Proteção de rotas (somente usuários logados acessam o dashboard).

🛠️ Tecnologias
Frontend

HTML5

Tailwind CSS

JavaScript (Fetch API)

Backend

Node.js + Express

SQLite3 (banco de dados leve e simples)

JWT (JSON Web Token) para autenticação

Bcrypt para hash de senhas

⚙️ Setup Local

Clone o repositório

git clone https://github.com/seu-usuario/app-doacoes.git
cd app-doacoes


Instale dependências

npm install


Configure variáveis de ambiente
Crie um arquivo .env com:

JWT_SECRET=sua_chave_secreta
PORT=3000


Rode o backend

npm run dev


Acesse o frontend
Abra public/index.html no navegador ou sirva com GitHub Pages.

🚀 Deploy
Backend

Deploy no Render ou Railway.

Configure as variáveis:

JWT_SECRET

PORT

Frontend

Publique a pasta public/ no GitHub Pages.

Ajuste a URL da API no public/app.js.

📡 API Endpoints
Autenticação

POST /register → Criar usuário

POST /login → Login de usuário

Usuário

GET /profile (auth) → Buscar perfil

PUT /profile (auth) → Atualizar perfil

Doações

GET /donations → Listar doações

POST /donations (auth) → Criar doação

POST /claim (auth) → Solicitar doação

🔒 Segurança

Senhas nunca são salvas em texto puro (bcrypt hash).

Autenticação baseada em JWT.

Rotas protegidas para impedir acesso não autorizado.

Recomendado uso de HTTPS em produção.
