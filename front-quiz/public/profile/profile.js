document.addEventListener("DOMContentLoaded", async () => {
  // Verifica se o usuário está logado
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '../login/login.html';
    return;
  }

  console.log('Token encontrado:', token); // Verifique se o token está correto

  // Atualiza o nome do usuário no header
  const userName = localStorage.getItem('userName');
  if (userName) {
    document.getElementById('usernameDisplay').textContent = userName;
  }

  // Configura o logout
  document.querySelector('.dropdown-item.text-danger')?.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    window.location.href = '../login/login.html';
  });

  // Elementos da UI
  const averageScoreEl = document.getElementById('averageScore');
  const progressBarEl = document.getElementById('progressBar');
  const quizzesCompletedEl = document.getElementById('quizzesCompleted');
  const correctAnswersEl = document.getElementById('correctAnswers');
  const historyTable = document.getElementById('quizHistory');

  // Carrega os dados do perfil
  try {
    console.log('Iniciando requisição...');
    const response = await fetch('http://localhost:3001/api/users/me/stats', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Status da resposta:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Detalhes do erro:', errorData);
      throw new Error(errorData.message || 'Erro ao carregar dados do perfil');
    }

    const stats = await response.json();
    console.log('Dados recebidos:', stats);

    // Atualiza as estatísticas
    if (averageScoreEl) {
      averageScoreEl.textContent = `${stats.averageScore ?? 0}%`;
    }
    if (progressBarEl) {
      progressBarEl.style.width = `${stats.averageScore ?? 0}%`;
    }
    if (quizzesCompletedEl) {
      quizzesCompletedEl.textContent = stats.quizzesCompleted ?? 0;
    }
    if (correctAnswersEl) {
      const avg = stats.averageScore ?? 0;
      const completed = stats.quizzesCompleted ?? 0;
      correctAnswersEl.textContent = Math.round(avg * completed / 100);
    }

    // Preenche o histórico
    if (historyTable) {
      if (stats.recentQuizzes?.length > 0) {
        historyTable.innerHTML = stats.recentQuizzes.map(quiz => `
          <tr class="quiz-history-item">
            <td><strong>${quiz.title || 'Sem título'}</strong></td>
            <td><span class="badge badge-category text-white">${quiz.category || 'Geral'}</span></td>
            <td>${quiz.completedAt ? new Date(quiz.completedAt).toLocaleDateString('pt-BR') : 'N/D'}</td>
            <td class="text-end">
              <span class="fw-bold ${quiz.score >= 70 ? 'text-success' : quiz.score >= 50 ? 'text-warning' : 'text-danger'}">
                ${quiz.score ?? 0}%
              </span>
            </td>
          </tr>
        `).join('');
      } else {
        historyTable.innerHTML = `
          <tr>
            <td colspan="4" class="text-center py-5 text-muted">
              Nenhum quiz realizado ainda. <a href="../Index/index.html" class="text-purple">Comece agora!</a>
            </td>
          </tr>
        `;
      }
    }

  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    if (historyTable) {
      historyTable.innerHTML = `
        <tr>
          <td colspan="4" class="text-center py-5 text-danger">
            Erro ao carregar histórico: ${error.message}
          </td>
        </tr>
      `;
    }
  }
});