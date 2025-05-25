Quiz Chico - Projeto de Quizzes Interativos
📋 Visão Geral
O Quiz Chico é uma plataforma web para criação e realização de quizzes educacionais com:

Frontend em HTML/CSS/JavaScript

Backend em Node.js com Express

Banco de dados mysql com Sequelize ORM

🚀 Como Executar o Projeto Localmente
Pré-requisitos
Node.js (v16 ou superior)

MYSQL

Git

1. Clone o Repositório
bash
git clone https://github.com/VictorSantosVK/quizChico/tree/master
cd quiz-chico
2. Instale as Dependências
bash
# Instale as dependências do backend
cd back-quiz
npm install

# Instale as dependências do frontend (se necessário)
cd ../front-quiz
npm install  # Se usar algum bundler como Webpack
3. Configure o Banco de Dados
Crie um banco de dados MYSQL chamado quiz_chico

Configure o arquivo .env na pasta back-quiz:

env
DB_HOST=localhost
DB_USER=seu_usuario
DB_PASS=sua_senha
DB_NAME=quiz_chico
JWT_SECRET=sua_chave_secreta_jwt
PORT=3001
4. Execute as Migrações
bash
cd back-quiz
npx sequelize-cli db:migrate
5. Inicie os Servidores
Backend:

bash
cd back-quiz
npm start
Frontend:
Abra o arquivo front-quiz/index.html no navegador ou use um servidor local:



quiz-chico/
├── back-quiz/               # Backend Node.js
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── .env                 # Arquivo de configuração
│   └── server.js            # Ponto de entrada
│
├── front-quiz/              # Frontend
│   ├── admin/               # Painel administrativo
│   ├── Index/               # Página inicial
│   ├── login/               # Páginas de autenticação
│   ├── quizes/              # Páginas de quizzes
│   ├── scripts/             # JavaScript do frontend
│   └── styles/              # Folhas de estilo
│
└── README.md                # Este arquivo
🌟 Funcionalidades Principais
✅ Autenticação de usuários

✅ Criação e edição de quizzes

✅ Realização de quizzes com temporizador

✅ Histórico de desempenho

✅ Painel administrativo

🔧 Dependências Principais
Backend:

Express

Sequelize

MYSQL

JWT

Bcrypt

Frontend:

Bootstrap

Font Awesome
