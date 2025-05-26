document.addEventListener("DOMContentLoaded", async () => {
  // Elementos da UI
  const rankingList = document.getElementById("rankingList");
  const userPositionEl = document.getElementById("userPosition");
  const userScoreEl = document.getElementById("userScore");

  // Verificação de autenticação melhorada
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  // Verifica se o usuário está logado
  if (!token) {
    window.location.href = "../login/login.html";
    return;
  }

  console.log("Token encontrado:", token); // Verifique se o token está correto

  // Atualiza o nome do usuário no header
  const userName = localStorage.getItem("userName");
  if (userName) {
    document.getElementById("usernameDisplay").textContent = userName;
  }

  // Configura o logout
  document
    .querySelector(".dropdown-item.text-danger")
    ?.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("token");
      localStorage.removeItem("userName");
      localStorage.removeItem("userId");
      window.location.href = "../login/login.html";
    });

  if (!token || !userId) {
    showErrorMessage("Você precisa estar logado para ver o ranking");
    setTimeout(() => (window.location.href = "../login/login.html"), 2000);
    return;
  }

  try {
    // Mostra loader enquanto carrega
    rankingList.innerHTML = `
            <li class="text-center py-4">
                <div class="spinner-border text-purple" role="status">
                    <span class="visually-hidden">Carregando...</span>
                </div>
                <p class="mt-2">Carregando ranking...</p>
            </li>
        `;

    // Busca os dados do ranking com tratamento de timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch("http://localhost:3001/api/ranking", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Erro ao carregar ranking");
    }

    const rankingData = await response.json();

    if (!Array.isArray(rankingData.data)) {
      throw new Error("Formato de dados inválido");
    }

    renderRanking(rankingData.data, userId);
  } catch (error) {
    console.error("Erro ao carregar ranking:", error);
    handleRankingError(error);
  }
});

function renderRanking(rankingData, currentUserId) {
  const rankingList = document.getElementById("rankingList");
  rankingList.innerHTML = "";

  if (rankingData.length === 0) {
    showEmptyMessage();
    return;
  }

  let userPosition = 0;
  let userScore = 0;

  // Adiciona animação de entrada
  rankingData.forEach((user, index) => {
    if (user.id == currentUserId) {
      userPosition = index + 1;
      userScore = user.averageScore;
    }

    const rankingItem = createRankingItem(user, index + 1, currentUserId);
    rankingList.appendChild(rankingItem);
  });

  updateUserSummary(userPosition, userScore);
}

function createRankingItem(user, position, currentUserId) {
  const isCurrentUser = user.id == currentUserId;
  const medalClass = getMedalClass(position);

  const item = document.createElement("li");
  item.className = `ranking-item ${isCurrentUser ? "user-you" : ""}`;
  item.style.animationDelay = `${position * 0.05}s`;

  item.innerHTML = `
        <div class="position ${medalClass}">
            ${position}
            ${medalClass ? `<i class="bi bi-award-fill"></i>` : ""}
        </div>
        <div class="user-info">
            ${isCurrentUser ? "VOCÊ" : user.name || "Usuário Anônimo"}
            ${
              isCurrentUser
                ? `<span class="badge bg-light text-purple ms-2">Você</span>`
                : ""
            }
        </div>
        <div class="user-score">
            ${Math.round(user.averageScore)}%
        </div>
    `;

  return item;
}

function updateUserSummary(position, score) {
  const positionEl = document.getElementById("userPosition");
  const scoreEl = document.getElementById("userScore");

  positionEl.textContent = `#${position}`;
  positionEl.classList.toggle("text-purple", position <= 3);

  scoreEl.textContent = `${score}%`;
  scoreEl.classList.toggle("text-success", score >= 70);
  scoreEl.classList.toggle("text-warning", score >= 50 && score < 70);
  scoreEl.classList.toggle("text-danger", score < 50);
}

function getMedalClass(position) {
  const medals = {
    1: "medal-gold",
    2: "medal-silver",
    3: "medal-bronze",
  };
  return medals[position] || "";
}

function showEmptyMessage() {
  const rankingList = document.getElementById("rankingList");
  rankingList.innerHTML = `
        <li class="text-center py-5">
            <i class="bi bi-emoji-frown fs-1 text-muted"></i>
            <h5 class="mt-3">Nenhum dado disponível</h5>
            <p class="text-muted">Seja o primeiro a completar um quiz!</p>
            <a href="../Index/index.htmll" class="btn btn-sm btn-purple mt-2">
                Tentar agora
            </a>
        </li>
    `;
}

function handleRankingError(error) {
  const rankingList = document.getElementById("rankingList");

  const errorMessage =
    error.name === "AbortError"
      ? "O servidor demorou muito para responder"
      : error.message || "Erro ao carregar ranking";

  rankingList.innerHTML = `
        <li class="text-center py-5">
            <i class="bi bi-exclamation-triangle-fill fs-1 text-danger"></i>
            <h5 class="mt-3">Ops, algo deu errado!</h5>
            <p class="text-muted">${errorMessage}</p>
            <button class="btn btn-sm btn-outline-purple mt-2" onclick="location.reload()">
                <i class="bi bi-arrow-repeat"></i> Tentar novamente
            </button>
        </li>
    `;
}

function showErrorMessage(message) {
  const rankingList = document.getElementById("rankingList");
  rankingList.innerHTML = `
        <li class="text-center py-5">
            <i class="bi bi-shield-lock fs-1 text-warning"></i>
            <h5 class="mt-3">Acesso não autorizado</h5>
            <p class="text-muted">${message}</p>
        </li>
    `;
}

