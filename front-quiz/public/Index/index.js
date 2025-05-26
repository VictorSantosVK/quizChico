document.addEventListener("DOMContentLoaded", async () => {
  // Trocar o texto "Usuário" pelo nome salvo no localStorage
  const userName = localStorage.getItem("userName");
  if (userName) {
    const userDropdownSpan = document.querySelector("#userDropdown span");
    if (userDropdownSpan) {
      userDropdownSpan.textContent = userName;
    }
  }

  // Logout ao clicar em "Sair"
  const logoutLink = document.querySelector(".dropdown-item.text-danger");
  if (logoutLink) {
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("token");
      localStorage.removeItem("userName");
      window.location.href = "../login/login.html";
    });
  }

  // Carregar quizzes disponíveis (apenas ativos)
  try {
    const res = await fetch("http://localhost:3001/api/quizzes?isActive=true");
    const data = await res.json();
    const quizzes = data.quizzes || data;

    const quizzesContainer = document.querySelector(".conteudo-destaques .row");
    quizzesContainer.innerHTML = "";

    if (!quizzes.length) {
      quizzesContainer.innerHTML = 
        `<div class="col-12">
          <p class="text-center">Nenhum quiz disponível no momento.</p>
        </div>`;
      return;
    }

    quizzes.forEach(quiz => {
      const col = document.createElement("div");
      col.className = "col-md-4 mb-4";
      col.innerHTML = `
        <div class="card quiz-card h-100">
          <div class="card-body text-center d-flex flex-column">
            <h5 class="quiz-title">${quiz.title}</h5>
            <p class="flex-grow-1">${quiz.description || 'Quiz sem descrição'}</p>
            <div class="quiz-meta">
              <span class="badge bg-purple">${quiz.category || 'Geral'}</span>
              <span class="badge bg-secondary ms-2">${quiz.questions?.length || 0} perguntas</span>
            </div>
            <a href="../quizes/quiz.html?id=${quiz.id}" class="btn btn-purple mt-3">Iniciar Quiz</a>
          </div>
        </div>
      `;
      quizzesContainer.appendChild(col);
    });
  } catch (err) {
    console.error("Erro ao carregar quizzes:", err);
    document.querySelector(".conteudo-destaques").innerHTML = 
      `<div class="col-12">
        <p class="text-center text-danger">Erro ao carregar quizzes. Tente recarregar a página.</p>
      </div>`;
  }
});


// Configurar o clique no link de perfil
document.getElementById('profileLink')?.addEventListener('click', async (e) => {
  e.preventDefault();
  await loadUserProfile();
  const profileModal = new bootstrap.Modal(document.getElementById('profileModal'));
  profileModal.show();
});

// Adiciona a filtragem
const searchInput = document.getElementById('searchInput');
searchInput?.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase();
  const rows = document.querySelectorAll('.quiz-history-item');
  
  rows.forEach(row => {
    const title = row.querySelector('td')?.textContent?.toLowerCase() || '';
    row.style.display = title.includes(query) ? '' : 'none';
  });
});


// Função para carregar os dados do perfil
async function loadUserProfile() {
  try {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('Usuário não identificado');
    }

    const response = await fetch(`http://localhost:3001/api/users/${userId}/stats`);
    if (!response.ok) {
      throw new Error('Erro ao carregar dados do perfil');
    }

    const profileData = await response.json();

    // Atualiza a UI com os dados recebidos
    document.getElementById('averageScore').textContent = `${profileData.averageScore}%`;
    document.getElementById('quizzesCompleted').textContent = profileData.quizzesCompleted;
    
    const historyTable = document.getElementById('quizHistory');
    historyTable.innerHTML = profileData.recentQuizzes.map(quiz => `
      <tr>
        <td>${quiz.title}</td>
        <td>${new Date(quiz.completedAt).toLocaleDateString()}</td>
        <td>${quiz.score}%</td>
      </tr>
    `).join('') || '<tr><td colspan="3">Nenhum quiz realizado ainda</td></tr>';

  } catch (error) {
    console.error('Erro ao carregar perfil:', error);
    alert('Não foi possível carregar os dados do perfil');
  }
}