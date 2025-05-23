// Adicione isto no início do seu app.js para tornar as funções globais
window.editQuiz = function (quizId) {
  const quiz = quizzes.find((q) => q.id == quizId);
  if (quiz) {
    openQuizModal(quiz);
  }
};

window.deleteQuiz = async function (quizId) {
  if (!confirm("Tem certeza que deseja excluir este quiz?")) return;

  try {
    const response = await fetch(
      `http://localhost:3001/api/quizzes/${quizId}`,
      {
        method: "DELETE",
        headers: {
          // Adicione se usar autenticação:
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erro ao excluir quiz");
    }

    alert("Quiz excluído com sucesso!");
    fetchQuizzes();
  } catch (error) {
    console.error("Erro:", error);
    alert(`Erro ao excluir quiz: ${error.message}`);
  }
};

// Variáveis globais
let quizzes = [];
let currentEditingQuiz = null;
let questionCounter = 0;

// Elementos DOM
const quizModal = document.getElementById("quizModal");
const modalTitle = document.getElementById("modalTitle");
const quizForm = document.getElementById("quizForm");
const quizIdInput = document.getElementById("quizId");
const quizTitleInput = document.getElementById("quizTitle");
const quizCategoryInput = document.getElementById("quizCategory");
const quizDescriptionInput = document.getElementById("quizDescription");
const questionsContainer = document.getElementById("questionsContainer");
const addQuestionBtn = document.getElementById("addQuestionBtn");
const addQuizBtn = document.getElementById("addQuizBtn");
const closeModalBtn = document.getElementById("closeModal");
const cancelQuizBtn = document.getElementById("cancelQuizBtn");

// Event Listeners
document.addEventListener("DOMContentLoaded", fetchQuizzes);
addQuizBtn.addEventListener("click", () => openQuizModal());
closeModalBtn.addEventListener("click", closeQuizModal);
cancelQuizBtn.addEventListener("click", closeQuizModal);
quizForm.addEventListener("submit", handleQuizSubmit);
addQuestionBtn.addEventListener("click", addQuestion);

// Funções
async function fetchQuizzes() {
  try {
    const res = await fetch("http://localhost:3001/api/quizzes");
    const data = await res.json();
    quizzes = data.quizzes || data;
    renderQuizzes();
  } catch (err) {
    console.error("Erro ao buscar quizzes:", err);
    alert("Erro ao carregar quizzes. Consulte o console para detalhes.");
  }
}

function renderQuizzes() {
  const tbody = document.getElementById("quizTableBody");
  tbody.innerHTML = "";

  quizzes.forEach((quiz) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
                    <td>${quiz.title}</td>
                    <td>${quiz.category}</td>
                    <td>
                        <span class="badge ${
                          quiz.isActive ? "bg-success" : "bg-danger"
                        }">
                            ${quiz.isActive ? "Ativo" : "Inativo"}
                        </span>
                    </td>
                    <td>${quiz.questions?.length || 0}</td>
                    <td>
                        <div class="btn-group">
                            <button class="btn btn-sm btn-primary" onclick="editQuiz(${
                              quiz.id
                            })">
                                <i class="fas fa-edit"></i> Editar
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteQuiz(${
                              quiz.id
                            })">
                                <i class="fas fa-trash"></i> Excluir
                            </button>
                        </div>
                    </td>
                `;
    tbody.appendChild(tr);
  });
}

function openQuizModal(quiz = null) {
  currentEditingQuiz = quiz;
  questionsContainer.innerHTML = ""; // Limpa todas as questões antes de carregar

  if (quiz) {
    modalTitle.textContent = "Editar Quiz";
    quizIdInput.value = quiz.id;
    quizTitleInput.value = quiz.title;
    quizCategoryInput.value = quiz.category;
    quizDescriptionInput.value = quiz.description || "";
    
    // Carrega as questões existentes
    if (quiz.questions && quiz.questions.length > 0) {
      quiz.questions.forEach((question, qIndex) => {
        addQuestion(question, qIndex);
      });
    }
  } else {
    modalTitle.textContent = "Adicionar Novo Quiz";
    quizForm.reset();
    quizIdInput.value = "";
  }
  
  quizModal.style.display = "block";
}

function closeQuizModal() {
  quizModal.style.display = "none";
  currentEditingQuiz = null;
}

function addQuestion(question = null, qIndex = null) {
  const questionId = question?.id || `new-${questionCounter++}`;
  const questionDiv = document.createElement("div");
  questionDiv.className = "question-item mb-3";
  questionDiv.dataset.id = questionId;

  // Gera um nome único para cada grupo de opções
  const radioGroupName = `correct-answer-${questionId}`;

  questionDiv.innerHTML = `
    <div class="d-flex justify-content-between mb-2">
      <h5>Questão #${
        qIndex !== null
          ? qIndex + 1
          : document.querySelectorAll(".question-item").length + 1
      }</h5>
      <button type="button" class="btn btn-sm btn-danger" onclick="this.closest('.question-item').remove()">
        <i class="fas fa-trash"></i> Remover
      </button>
    </div>
    <div class="mb-3">
      <label class="form-label">Enunciado da Questão</label>
      <textarea class="form-control question-text" required>${
        question?.text || ""
      }</textarea>
    </div>
    <div class="mb-3">
      <label class="form-label">Opções de Resposta</label>
      <div class="options-container">
        ${renderOptions(
          question?.options,
          question?.correctOption,
          radioGroupName
        )}
      </div>
      <button type="button" class="btn btn-sm btn-secondary mt-2" onclick="addOption(this, '${radioGroupName}')">
        <i class="fas fa-plus"></i> Adicionar Opção
      </button>
    </div>
  `;

  questionsContainer.appendChild(questionDiv);
}

function renderOptions(
  options = ["", "", "", ""],
  correctIndex = 0,
  groupName
) {
  let html = "";
  for (let i = 0; i < 4; i++) {
    html += `
      <div class="option-item d-flex align-items-center mb-2">
        <input type="radio" name="${groupName}" 
               value="${i}" ${i === correctIndex ? "checked" : ""} 
               class="me-2" required>
        <input type="text" class="form-control option-input" 
               value="${options?.[i] || ""}" required>
      </div>
    `;
  }
  return html;
}

function addOption(button) {
  const optionsContainer = button.previousElementSibling;
  const optionDiv = document.createElement("div");
  optionDiv.className = "option-item d-flex align-items-center mb-2";
  optionDiv.innerHTML = `
                <input type="radio" name="correct-answer-${questionCounter}" 
                       value="${optionsContainer.children.length}" class="me-2">
                <input type="text" class="form-control option-input" required>
                <button type="button" class="btn btn-sm btn-danger ms-2" onclick="this.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            `;
  optionsContainer.appendChild(optionDiv);
}

async function handleQuizSubmit(e) {
  e.preventDefault();

  try {
    // 1. Coletar dados básicos do quiz
    const quizData = {
      title: quizTitleInput.value.trim(),
      category: quizCategoryInput.value.trim(),
      description: quizDescriptionInput.value.trim(),
      isActive:
        document.querySelector('input[name="quizStatus"]:checked').value ===
        "true",
      questions: [],
    };

    // 2. Validação dos campos obrigatórios com mensagens específicas
    const validationErrors = [];

    if (!quizData.title) validationErrors.push("O título é obrigatório");
    else if (quizData.title.length < 3)
      validationErrors.push("O título deve ter pelo menos 3 caracteres");

    if (!quizData.category) validationErrors.push("A categoria é obrigatória");
    else if (quizData.category.length < 3)
      validationErrors.push("A categoria deve ter pelo menos 3 caracteres");

    if (!quizData.description)
      validationErrors.push("A descrição é obrigatória");
    else if (quizData.description.length < 10)
      validationErrors.push("A descrição deve ter pelo menos 10 caracteres");

    // 3. Coletar e validar questões e opções
    const questionElements =
      questionsContainer.querySelectorAll(".question-item");

    if (questionElements.length === 0) {
      validationErrors.push("Adicione pelo menos uma questão");
    }

    questionElements.forEach((qElement, index) => {
      const questionText = qElement
        .querySelector(".question-text")
        .value.trim();
      const optionInputs = qElement.querySelectorAll(".option-input");

      // Validar questão
      if (!questionText) {
        validationErrors.push(`A questão #${index + 1} está sem texto`);
      } else if (questionText.length < 10) {
        validationErrors.push(
          `A questão #${index + 1} deve ter pelo menos 10 caracteres`
        );
      }

      // Coletar e validar opções
      const options = [];
      optionInputs.forEach((input, optIndex) => {
        const optionText = input.value.trim();
        if (!optionText) {
          validationErrors.push(
            `A opção #${optIndex + 1} da questão #${index + 1} está vazia`
          );
        } else {
          options.push(optionText);
        }
      });

      // Validar quantidade de opções
      if (options.length < 2) {
        validationErrors.push(
          `A questão #${index + 1} precisa de pelo menos 2 opções`
        );
      }

      // Validar resposta correta
      // Dentro do loop que processa as questões:
      const correctAnswerRadio = qElement.querySelector(
        `input[name^="correct-answer"]:checked`
      );
      if (correctAnswerRadio) {
        const correctAnswerIndex = parseInt(correctAnswerRadio.value);
        const correctOption = optionInputs[correctAnswerIndex]?.value.trim();

        quizData.questions.push({
          text: questionText,
          options: options,
          correctOption: correctOption,
        });
      }
    });

    // Se houver erros de validação, exibir todos de uma vez
    if (validationErrors.length > 0) {
      throw new Error(validationErrors.join("\n"));
    }

    // 4. Configurar a requisição
    const method = currentEditingQuiz ? "PUT" : "POST";
    const url = currentEditingQuiz
      ? `http://localhost:3001/api/quizzes/${currentEditingQuiz.id}`
      : "http://localhost:3001/api/quizzes";

    // Configurar headers
    const headers = {
      "Content-Type": "application/json",
    };

    // Adicionar token de autenticação se existir
    const token = localStorage.getItem("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Para edição, manter campos não alterados
    const requestBody = currentEditingQuiz
      ? { ...currentEditingQuiz, ...quizData, id: currentEditingQuiz.id }
      : quizData;

    console.log("Enviando dados para o servidor:", requestBody);

    // 5. Fazer a requisição
    const response = await fetch(url, {
      method,
      headers,
      body: JSON.stringify(requestBody),
    });

    // 6. Tratar a resposta
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Erro na resposta:", errorData);

      let errorMessage = "Erro ao salvar quiz";
      if (errorData.error) {
        errorMessage += `: ${errorData.error}`;
        if (errorData.details) {
          errorMessage += ` (${errorData.details})`;
        }
      } else if (response.status === 400) {
        errorMessage = "Dados inválidos enviados ao servidor";
      } else if (response.status === 401) {
        errorMessage = "Você precisa estar logado para esta ação";
      } else if (response.status === 403) {
        errorMessage = "Você não tem permissão para esta ação";
      } else if (response.status === 404) {
        errorMessage = "Quiz não encontrado";
      }

      throw new Error(errorMessage);
    }

    // 7. Processar resposta de sucesso
    const result = await response.json();
    console.log("Quiz salvo com sucesso:", result);

    // Mostrar feedback visual
    showToast(
      `Quiz ${currentEditingQuiz ? "atualizado" : "criado"} com sucesso!`,
      "success"
    );

    // Fechar modal e atualizar lista
    closeQuizModal();
    fetchQuizzes();
  } catch (error) {
    console.error("Erro no processamento:", error);

    // Mostrar mensagem de erro detalhada
    showToast(error.message, "error");

    // Destacar campos com problemas
    highlightErrorFields(error.message);
  }
}

// Função auxiliar para mostrar toasts (notificações)
function showToast(message, type = "info") {
  const toastContainer =
    document.getElementById("toastContainer") || createToastContainer();
  const toast = document.createElement("div");
  toast.className = `toast show align-items-center text-white bg-${
    type === "error" ? "danger" : "success"
  } border-0`;
  toast.role = "alert";
  toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
  toastContainer.appendChild(toast);

  // Remover automaticamente após 5 segundos
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 150);
  }, 5000);
}

function createToastContainer() {
  const container = document.createElement("div");
  container.id = "toastContainer";
  container.className = "toast-container position-fixed top-0 end-0 p-3";
  container.style.zIndex = "1100";
  document.body.appendChild(container);
  return container;
}

// Função para destacar campos com erro (atualizada)
function highlightErrorFields(errorMessage) {
  // Resetar todos os estilos de erro primeiro
  document.querySelectorAll(".is-invalid").forEach((el) => {
    el.classList.remove("is-invalid");
    const feedback = el.nextElementSibling;
    if (feedback && feedback.classList.contains("invalid-feedback")) {
      feedback.remove();
    }
  });

  // Helper para adicionar feedback
  const addFeedback = (element, message) => {
    element.classList.add("is-invalid");
    const feedback = document.createElement("div");
    feedback.className = "invalid-feedback";
    feedback.textContent = message;
    element.parentNode.insertBefore(feedback, element.nextSibling);
  };

  // Verificar cada tipo de erro possível
  if (errorMessage.includes("título")) {
    addFeedback(quizTitleInput, "Título inválido (mín. 3 caracteres)");
  }

  if (errorMessage.includes("categoria")) {
    addFeedback(quizCategoryInput, "Categoria inválida (mín. 3 caracteres)");
  }

  if (errorMessage.includes("descrição")) {
    addFeedback(
      quizDescriptionInput,
      "Descrição inválida (mín. 10 caracteres)"
    );
  }

  // Verificar erros em questões específicas
  const questionErrorMatches = errorMessage.match(/questão #(\d+)/g);
  if (questionErrorMatches) {
    questionErrorMatches.forEach((match) => {
      const qNum = parseInt(match.replace("questão #", ""));
      const questionElement =
        questionsContainer.querySelectorAll(".question-item")[qNum - 1];
      if (questionElement) {
        const textarea = questionElement.querySelector(".question-text");
        addFeedback(
          textarea,
          errorMessage.includes("caracteres")
            ? "Questão muito curta (mín. 10 caracteres)"
            : "Questão inválida"
        );
      }
    });
  }

  // Verificar erros em opções específicas
  const optionErrorMatches = errorMessage.match(/opção #(\d+)/g);
  if (optionErrorMatches) {
    optionErrorMatches.forEach((match) => {
      const parts = match.replace("opção #", "").split(" da questão #");
      if (parts.length === 2) {
        const qNum = parseInt(parts[1]);
        const optNum = parseInt(parts[0]);
        const questionElement =
          questionsContainer.querySelectorAll(".question-item")[qNum - 1];
        if (questionElement) {
          const optionInput =
            questionElement.querySelectorAll(".option-input")[optNum - 1];
          if (optionInput) {
            addFeedback(optionInput, "Opção não pode estar vazia");
          }
        }
      }
    });
  }

  // Verificar seleção de resposta correta
  if (errorMessage.includes("resposta correta")) {
    const questionErrorMatches = errorMessage.match(/questão #(\d+)/g);
    if (questionErrorMatches) {
      questionErrorMatches.forEach((match) => {
        const qNum = parseInt(match.replace("questão #", ""));
        const questionElement =
          questionsContainer.querySelectorAll(".question-item")[qNum - 1];
        if (questionElement) {
          const optionsContainer =
            questionElement.querySelector(".options-container");
          addFeedback(optionsContainer, "Selecione a resposta correta");
        }
      });
    }
  }
}

// Função para destacar campos com erro
function highlightErrorFields(errorMessage) {
  // Resetar todos os estilos de erro primeiro
  document.querySelectorAll(".is-invalid").forEach((el) => {
    el.classList.remove("is-invalid");
  });

  // Destacar campos específicos baseado na mensagem de erro
  if (errorMessage.includes("título")) {
    quizTitleInput.classList.add("is-invalid");
  }
  if (errorMessage.includes("categoria")) {
    quizCategoryInput.classList.add("is-invalid");
  }
  if (errorMessage.includes("descrição")) {
    quizDescriptionInput.classList.add("is-invalid");
  }
  if (errorMessage.includes("questão")) {
    document.querySelectorAll(".question-text").forEach((el) => {
      if (!el.value.trim() || el.value.trim().length < 10) {
        el.classList.add("is-invalid");
      }
    });
  }
  if (errorMessage.includes("opção")) {
    document.querySelectorAll(".option-input").forEach((el) => {
      if (!el.value.trim()) {
        el.classList.add("is-invalid");
      }
    });
  }
}

function editQuiz(quizId) {
  const quiz = quizzes.find((q) => q.id == quizId);
  if (quiz) {
    openQuizModal(quiz);
  }
}

async function deleteQuiz(quizId) {
  if (!confirm("Tem certeza que deseja excluir este quiz?")) return;

  try {
    const response = await fetch(
      `http://localhost:3001/api/quizzes/${quizId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) throw new Error("Erro ao excluir quiz");

    alert("Quiz excluído com sucesso!");
    fetchQuizzes();
  } catch (error) {
    console.error("Erro:", error);
    alert(`Erro ao excluir quiz: ${error.message}`);
  }
}

// Funções para gerenciar usuários
const quizzesSection = document.getElementById("quizzesSection");
const usersSection = document.getElementById("usersSection");
const usersMenu = document.getElementById("usersMenu");

usersMenu.addEventListener("click", (e) => {
  e.preventDefault();
  quizzesSection.style.display = "none";
  usersSection.style.display = "block";
  document
    .querySelectorAll(".sidebar-menu a")
    .forEach((a) => a.classList.remove("active"));
  usersMenu.classList.add("active");
  fetchUsers();
});

async function fetchUsers() {
  try {
    const res = await fetch("http://localhost:3001/api/auth/usuarios");
    if (!res.ok) throw new Error("Erro ao buscar usuários");
    const users = await res.json();

    const tbody = document.getElementById("usersTableBody");
    tbody.innerHTML = "";

    users.forEach((user) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
                        <td>${user.id}</td>
                        <td>${user.name}</td>
                        <td>${user.email}</td>
                        <td>${user.role}</td>
                    `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error(error);
    alert("Erro ao carregar usuários.");
  }
}
