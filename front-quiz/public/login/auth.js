var btnSignin = document.querySelector("#signin");
var btnSignup = document.querySelector("#signup");
var body = document.querySelector("body");

btnSignin.addEventListener("click", function () {
  body.className = "sign-in-js";
});

btnSignup.addEventListener("click", function () {
  body.className = "sign-up-js";
});

document.addEventListener("DOMContentLoaded", () => {
  const admin = {
    email: "admin@admin.com",
    password: "admin123"
  };

  // LOGIN
   const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginSenha").value;

      if (!email || !password) {
        alert("⚠️ Por favor, preencha todos os campos!");
        return;
      }

      // ✅ Verifica se é o admin
      if (email === admin.email && password === admin.password) {
        alert("✅ Login de administrador realizado com sucesso!");
        localStorage.setItem("userType", "admin");
        localStorage.setItem("userName", "Administrador");
        localStorage.setItem("userId", "admin"); // Adicionado ID para admin
        window.location.href = "../../admin/admin.html";
        return;
      }

      // ✅ Login normal via API
      try {
        const res = await fetch("http://localhost:3001/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          alert("❌ Erro no login: " + (data.error || "Erro desconhecido"));
          return;
        }

        // Armazena todos os dados necessários
        localStorage.setItem("token", data.token);
        localStorage.setItem("userName", data.user.name);
        localStorage.setItem("userId", data.user.id);
        localStorage.setItem("userType", "user");
        
        alert("✅ Login realizado com sucesso!");
        window.location.href = "../Index/index.html";
      } catch (err) {
        console.error("Erro:", err);
        alert("⚠️ Erro ao conectar ao servidor. Tente novamente mais tarde.");
      }
    });
  }

  // REGISTRO
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("nome").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("senha").value;
      const confirmPassword = document.getElementById("confirmarSenha").value;

      if (!name || !email || !password || !confirmPassword) {
        alert("⚠️ Por favor, preencha todos os campos!");
        return;
      }

      if (password !== confirmPassword) {
        alert("⚠️ As senhas não coincidem!");
        return;
      }

      if (password.length < 6) {
        alert("⚠️ A senha deve ter pelo menos 6 caracteres!");
        return;
      }

      try {
        const res = await fetch("http://localhost:3001/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          const errMsg = (data.error || "").toLowerCase();
          if (errMsg.includes("email") || errMsg.includes("invalidation")) {
            alert("❌ Este email já está cadastrado. Tente outro.");
          } else {
            alert("❌ Erro no registro: " + (data.error || "Erro desconhecido"));
          }
          return;
        }

        alert("✅ Registro realizado com sucesso! Você já pode fazer login.");
        registerForm.reset();
      } catch (err) {
        console.error("Erro:", err);
        alert("⚠️ Erro ao conectar ao servidor. Tente novamente mais tarde.");
      }
    });
  }
});
