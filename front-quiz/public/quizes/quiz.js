const quizContainer = document.getElementById('quiz-container');
const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const nextBtn = document.getElementById('next-btn');
const progressEl = document.getElementById('progress');
const feedbackEl = document.getElementById('feedback');
const feedbackEmoji = document.getElementById('feedback-emoji');
const feedbackText = document.getElementById('feedback-text');
const scoreEl = document.getElementById('score');
const resultsContainer = document.getElementById('results-container');
const finalScoreEl = document.getElementById('final-score');
const finalMessage = document.getElementById('final-message');
const restartBtn = document.getElementById('restart-btn');
const returnBtn = document.getElementById('return-btn');

let quiz = null;
let currentQuestionIndex = 0;
let score = 0;
let selectedAnswer = null;
let timer;
let timeLeft = 60; // 60 segundos por pergunta

// 1. Obter ID do quiz da URL
function getQuizIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

// 2. Carregar quiz do backend
async function fetchQuiz(quizId) {
  try {
    const res = await fetch(`http://localhost:3001/api/quizzes/${quizId}`);
    if (!res.ok) throw new Error('Quiz não encontrado');
    return await res.json();
  } catch (error) {
    console.error('Erro ao buscar quiz:', error);
    throw error;
  }
}

// 3. Iniciar timer para a pergunta atual
function startTimer() {
  timeLeft = 60; // Reset para 60 segundos a cada nova pergunta
  updateTimerDisplay();
  
  clearInterval(timer); // Limpa qualquer timer existente
  timer = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    
    if (timeLeft <= 0) {
      clearInterval(timer);
      handleTimeOut();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  document.getElementById('timer').textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function handleTimeOut() {
  const currentQuestion = quiz.questions[currentQuestionIndex];
  
  // Mostrar a resposta correta
  const options = optionsEl.querySelectorAll('.btn-option');
  options.forEach(btn => {
    if (btn.textContent === currentQuestion.correctOption) {
      btn.classList.add('btn-success');
    }
    btn.disabled = true;
  });
  
  feedbackEmoji.textContent = '⏰';
  feedbackText.textContent = `Tempo esgotado! A resposta correta era: ${currentQuestion.correctOption}`;
  feedbackEl.classList.remove('hidden');
  nextBtn.classList.remove('hidden');
}

// 4. Renderizar questão atual
function renderQuestion() {
  const currentQuestion = quiz.questions[currentQuestionIndex];
  questionEl.textContent = currentQuestion.text;
  optionsEl.innerHTML = '';

  // Embaralhar opções
  const shuffledOptions = [...currentQuestion.options].sort(() => Math.random() - 0.5);

  shuffledOptions.forEach((option, index) => {
    const button = document.createElement('button');
    button.classList.add('btn', 'btn-option');
    button.textContent = option;
    button.addEventListener('click', () => selectOption(button, option));
    optionsEl.appendChild(button);
  });

  progressEl.textContent = `${currentQuestionIndex + 1}/${quiz.questions.length}`;
  feedbackEl.classList.add('hidden');
  nextBtn.classList.add('hidden');
  
  // Iniciar o timer para esta pergunta
  startTimer();
}

// 5. Selecionar opção
function selectOption(button, selectedOption) {
  clearInterval(timer); // Parar o timer quando uma resposta é selecionada
  
  selectedAnswer = selectedOption;
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isCorrect = selectedOption === currentQuestion.correctOption;

  // Destacar resposta selecionada
  button.classList.add(isCorrect ? 'btn-success' : 'btn-danger');
  
  // Destacar resposta correta se o usuário errou
  if (!isCorrect) {
    const options = optionsEl.querySelectorAll('.btn-option');
    options.forEach(btn => {
      if (btn.textContent === currentQuestion.correctOption) {
        btn.classList.add('btn-success');
      }
    });
  }

  // Atualizar pontuação e feedback
  if (isCorrect) {
    score++;
    feedbackEmoji.textContent = '✅';
    feedbackText.textContent = 'Resposta Correta!';
  } else {
    feedbackEmoji.textContent = '❌';
    feedbackText.textContent = `Resposta Incorreta! A correta era: ${currentQuestion.correctOption}`;
  }

  feedbackEl.classList.remove('hidden');
  scoreEl.textContent = `Pontuação: ${score}`;

  // Desativar todas as opções
  const allOptions = optionsEl.querySelectorAll('button');
  allOptions.forEach(btn => btn.disabled = true);

  nextBtn.classList.remove('hidden');
}

// 6. Próxima questão ou mostrar resultados
function nextQuestion() {
  currentQuestionIndex++;
  
  if (currentQuestionIndex < quiz.questions.length) {
    renderQuestion();
  } else {
    showResults();
  }
}

// 7. Mostrar resultados finais
function showResults() {
  clearInterval(timer);
  quizContainer.classList.add('hidden');
  resultsContainer.classList.remove('hidden');

  const percentage = (score / quiz.questions.length) * 100;
  finalScoreEl.textContent = `${score}/${quiz.questions.length}`;
  
  if (percentage >= 80) {
    finalMessage.textContent = 'Excelente! Você dominou este quiz!';
  } else if (percentage >= 50) {
    finalMessage.textContent = 'Bom trabalho! Você pode melhorar ainda mais!';
  } else {
    finalMessage.textContent = 'Continue praticando! Você vai melhorar!';
  }

  // Salva os resultados no banco de dados
  saveQuizResults(quiz.id, score);
}

// 8. Salvar resultados no banco de dados
async function saveQuizResults(quizId, score) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('Usuário não autenticado, resultados não serão salvos');
      return;
    }

    const percentage = (score / quiz.questions.length) * 100;
    
    const response = await fetch('http://localhost:3001/api/user-quiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        quizId,
        score: percentage
      })
    });

    if (!response.ok) {
      throw new Error('Erro ao salvar resultados');
    }

    const result = await response.json();
    console.log('Resultados salvos:', result);
  } catch (error) {
    console.error('Erro ao salvar resultados:', error);
  }
}

// 9. Event Listeners
nextBtn.addEventListener('click', nextQuestion);
restartBtn.addEventListener('click', () => location.reload());
returnBtn.addEventListener('click', () => window.location.href = 'index.html');

// 10. Inicialização do quiz
(async function init() {
  try {
    const quizId = getQuizIdFromUrl();
    if (!quizId) {
      alert('Quiz não especificado. Redirecionando...');
      window.location.href = '../index/index.html';
      return;
    }

    quiz = await fetchQuiz(quizId);
    document.getElementById('language').textContent = quiz.title;
    renderQuestion();
  } catch (error) {
    console.error('Erro ao inicializar quiz:', error);
    alert('Erro ao carregar o quiz. Redirecionando...');
    window.location.href = '../index/index.html';
  }
})();