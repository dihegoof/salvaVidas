import {
  AuthService
} from "../services/AuthService.js";
import {
  AuthRenderer
} from "./AuthRenderer.js";
import {
  App
} from "../core/App.js";
import {
  StorageHelper
} from "../utils/StorageHelper.js";
import {
  Toast
} from "../modules/toast/Toast.js";

export class AuthEvents {
  static register() {
    document.getElementById("toggleAuthBtn")?.addEventListener("click", () => {
      const current = document.getElementById("authScreen").dataset.mode || "login";
      AuthRenderer.setMode(current === "login" ? "register" : "login");
    });

    document.getElementById("loginBtn")?.addEventListener("click", async () => {
      const mode = document.getElementById("authScreen").dataset.mode || "login";
      const nameOrEmail = document.getElementById("authNameOrEmail").value.trim();
      const password = document.getElementById("authPassword").value;

      if (!nameOrEmail || !password) {
        Toast.warning("Preencha todos os campos");
        return;
      }

      if (mode === "register") {
        const name = document.getElementById("authName").value.trim();
        if (!name) {
          Toast.warning("Informe seu nome completo");
          return;
        }
        if (name.length < 2) {
          Toast.warning("Nome muito curto — mínimo 2 caracteres");
          return;
        }
        if (!nameOrEmail.includes("@") || !nameOrEmail.includes(".")) {
          Toast.warning("Informe um e-mail válido no cadastro");
          return;
        }
        if (password.length < 6) {
          Toast.warning("Senha muito curta — mínimo 6 caracteres");
          return;
        }
        if (password.length > 72) {
          Toast.warning("Senha muito longa — máximo 72 caracteres");
          return;
        }
      } else {
        if (password.length < 6) {
          Toast.warning("Senha deve ter pelo menos 6 caracteres");
          return;
        }
      }

      const btn = document.getElementById("loginBtn");
      btn.disabled = true;
      btn.textContent = "Aguarde...";

      try {
        if (mode === "register") {
          const name = document.getElementById("authName").value.trim();
          await AuthService.signUp(name, nameOrEmail, password);
          Toast.success("Conta criada! Entrando...");
          await AuthService.signIn(nameOrEmail, password);
        } else {
          await AuthService.signIn(nameOrEmail, password);
        }
        AuthRenderer.showApp();
        await App.init();
      } catch (err) {
        Toast.error(AuthEvents._friendlyError(err.message || ""));
        btn.disabled = false;
        btn.textContent = mode === "register" ? "Criar conta" : "Entrar";
        const fallbackMode = (err.message || "").includes("Email not confirmed") ? "login" : mode;
        AuthRenderer.setMode(fallbackMode);
      }
    });

    document.getElementById("authPassword")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") document.getElementById("loginBtn").click();
    });

    document.getElementById("logoutBtn")?.addEventListener("click", async () => {
      await AuthService.signOut();
      StorageHelper.saveUserName("");
      location.reload();
    });
  }

  static _friendlyError(msg) {
    const m = msg.toLowerCase();

    if (m.includes("invalid login credentials") || m.includes("invalid credentials"))
      return "E-mail ou senha incorretos. Verifique e tente novamente.";

    if (m.includes("email not confirmed"))
      return "Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.";

    if (m.includes("already registered") || m.includes("user already registered"))
      return "Este e-mail já está cadastrado. Tente entrar ou recupere sua senha.";

    if (m.includes("password should be at least") || m.includes("password is too short"))
      return "Senha muito curta — use pelo menos 6 caracteres.";

    if (m.includes("password should be no more") || m.includes("password is too long"))
      return "Senha muito longa — máximo de 72 caracteres.";

    if (m.includes("unable to validate email address") || m.includes("invalid email"))
      return "E-mail inválido. Verifique o formato e tente novamente.";

    if (m.includes("email rate limit") || m.includes("rate limit"))
      return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";

    if (m.includes("user not found") || m.includes("no user found"))
      return "Usuário não encontrado. Verifique o e-mail ou crie uma conta.";

    if (m.includes("encontrado"))
      return msg;

    if (m.includes("network") || m.includes("fetch"))
      return "Erro de conexão. Verifique sua internet e tente novamente.";

    if (m.includes("signup is disabled"))
      return "Cadastro temporariamente desativado. Contate o administrador.";

    if (m.includes("weak password"))
      return "Senha muito fraca. Use letras, números e caracteres especiais.";

    return "Erro ao entrar. Verifique os dados e tente novamente.";
  }
}
