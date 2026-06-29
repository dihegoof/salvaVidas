import {
  App
} from "./core/App.js";
import {
  AuthService
} from "./services/AuthService.js";
import {
  AuthRenderer
} from "./ui/AuthRenderer.js";
import {
  AuthEvents
} from "./ui/AuthEvents.js";
import {
  Toast
} from "./modules/toast/Toast.js";

document.getElementById("togglePasswordBtn")?.addEventListener("click", () => {
  const input = document.getElementById("authPassword");
  input.type = input.type === "password" ? "text" : "password";
});

AuthEvents.register();

async function start() {
  try {
    const user = await AuthService.getUser();
    if (user) {
      AuthRenderer.showApp();
      await App.init();
    } else {
      AuthRenderer.showAuth("login");
    }
  } catch (err) {
    console.error("Erro ao iniciar:", err);
    AuthRenderer.showAuth("login");
    if (err?.message?.includes("fetch") || err?.message?.includes("network")) {
      Toast.error("Sem conexão com o servidor. Verifique sua internet.");
    }
  }
}

start();
