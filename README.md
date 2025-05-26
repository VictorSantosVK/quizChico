# 🧠 Quiz Chico - Projeto de Quizzes Interativos
### 📋 Visão Geral
O Quiz Chico é uma plataforma web para criação e realização de quizzes implementador com:

- Frontend em HTML/CSS/JavaScript

- Backend em Node.js com Express

- Banco de dados mysql com Sequelize ORM

## 🚀 Como Executar o Projeto Localmente

### 📋 Pré-requisitos

Antes de iniciar, certifique-se de ter instalado:

- Node.js (versão recomendada: 18 ou superior)
- MySQL

### 📋 Instalação

#### 🔧 Configuração do Banco de Dados

1. Crie um banco de dados no MySQL.

2. Acesse o arquivo de configuração:

```sh
back-quiz/config/config.json
```

3. Altere os dados de conexão (username, password, database) para os dados do seu banco de dados.

#### 🔑 Configuração de Variáveis de Ambiente

1. Crie um arquivo .env dentro da pasta back-quiz/.

2. Adicione as seguintes variáveis:
```sh
PORT=3001
JWT_SECRET=meujwtsecret
JWT_EXPIRES_IN=1d
```
#### 📦 Instalação as dependências do backend
```sh
cd back-quiz
npm install
```
#### ▶️ Executar o Backend
```sh
npm run start
```
#### 🎨 Executar o Frontend
1. Abra o arquivo de login no navegador:
```sh
front-quiz/public/login/login.html
```
💡 Dica: Utilize uma extensão de servidor local (como Live Server no VSCode) ou configure um servidor HTTP simples para rodar localmente.


## 📁 Estrutura do Projeto

```sh
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
│   └── styles/              # Estilização
│
└── README.md                # Este arquivo
```

## 🌟 Funcionalidades 

### Usuário 
🔹 RF01: Cadastrar-se no sistema (nome, e-mail e senha)

🔹 RF02: Fazer login e logout

🔹 RF03: Visualizar a lista de quizzes disponíveis

🔹 RF04: Responder quizzes (múltipla escolha)

🔹 RF05: Ver resultado imediato após concluir o quiz

🔹 RF06: Acessar histórico de quizzes realizados e média de desempenho

### Usuário Administrador
🔸 RF07: Login de administrador

🔸 RF08: Criar, editar e excluir quizzes

🔸 RF09: Criar, editar e excluir questões

🔸 RF10: Associar questões aos quizzes
