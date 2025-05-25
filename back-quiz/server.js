const express = require("express");
const cors = require("cors");
const { sequelize } = require("./models");
const path = require("path");
const app = express();
require("dotenv").config();

// Servir public normalmente
app.use(express.static(path.join(__dirname, "front-quiz/public")));
// Servir a pasta 'admin' separadamente
app.use("/admin", express.static(path.join(__dirname, "front-quiz/admin")));
class AppServer {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3001;

    this.initializeDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
    this.startServer();
  }

  initializeMiddlewares() {
    // Configuração básica de CORS
    this.app.use(
      cors({
        origin: process.env.CORS_ORIGIN || "*",
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
      })
    );

    // Parsers de requisição
    this.app.use(express.json({ limit: "10kb" }));
    this.app.use(express.urlencoded({ extended: true }));

    // Logging aprimorado
    this.app.use((req, res, next) => {
      const start = Date.now();
      res.on("finish", () => {
        console.log(
          `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${
            res.statusCode
          } [${Date.now() - start}ms]`
        );
      });
      next();
    });

    // Servir arquivos estáticos
    this.app.use("/public", express.static(path.join(__dirname, "public")));
  }

  initializeRoutes() {
    // Rotas de autenticação, quizzes e questões
    const authRoutes = require("./routes/authRoutes");
    const quizRoutes = require("./routes/quizRoutes");
    const questionRoutes = require("./routes/questionRoutes");
    const userStatsRoutes = require("./routes/userStatsRoutes");
    const userQuizRoutes = require("./routes/userQuizroutes");
    const rankingRoutes = require("./routes/rankingRoutes");
    this.app.use("/api/auth", authRoutes);
    this.app.use("/api/quizzes", quizRoutes);
    this.app.use("/api/questions", questionRoutes);
    this.app.use("/api/users", userStatsRoutes);
    this.app.use("/api/user-quiz", userQuizRoutes);
    this.app.use("/api/ranking", rankingRoutes);

    // Rota de health check
    this.app.get("/api/health", (req, res) => {
      res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
      });
    });
  }

  initializeErrorHandling() {
    // Tratamento de erros não capturados
    process.on("unhandledRejection", (err) => {
      console.error("Unhandled Rejection:", err);
    });

    process.on("uncaughtException", (err) => {
      console.error("Uncaught Exception:", err);
      process.exit(1);
    });

    // Middleware de erro centralizado
    this.app.use((err, req, res, next) => {
      console.error(`[ERROR] ${err.stack}`);

      const status = err.status || 500;
      const response = {
        error: {
          message: err.message || "Internal Server Error",
          ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
        },
      };

      res.status(status).json(response);
    });

    // Rota não encontrada
    this.app.use((req, res) => {
      res.status(404).json({
        error: {
          message: "Endpoint not found",
          path: req.originalUrl,
        },
      });
    });
  }

  async initializeDatabase() {
    try {
      await sequelize.authenticate();
      console.log("Database connection established");

      // Sincronização segura
      await sequelize.sync({ alter: false });
      console.log("Database models synchronized");
    } catch (error) {
      console.error("Database connection failed:", error);
      process.exit(1);
    }
  }

  startServer() {
    this.server = this.app.listen(this.port, () => {
      console.log(
        `Server running in ${process.env.NODE_ENV || "development"} mode`
      );
      console.log(`Listening on port ${this.port}`);
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      console.log("SIGTERM received. Shutting down gracefully...");
      this.server.close(() => {
        console.log("Server closed");
        process.exit(0);
      });
    });
  }
}

// Inicializa o servidor
new AppServer();
