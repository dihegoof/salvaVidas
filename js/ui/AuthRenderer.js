export class AuthRenderer {
  static showAuth(mode = "login") {
    document.getElementById("authScreen").classList.remove("hidden");
    document.getElementById("appScreen").classList.add("hidden");
    AuthRenderer.setMode(mode);
  }
  static showApp() {
    document.getElementById("authScreen").classList.add("hidden");
    document.getElementById("appScreen").classList.remove("hidden");
  }
  static setMode(mode) {
    const isLogin = mode === "login";
    document.getElementById("authNameGroup").style.display = isLogin ? "none" : "block";
    document.getElementById("authTitle").textContent = isLogin ? "Entrar" : "Criar conta";
    document.getElementById("authSubtitle").textContent = isLogin ?
      "Use seu nome ou e-mail para acessar" :
      "Preencha para criar sua conta";
    document.getElementById("loginBtn").textContent = isLogin ? "Entrar" : "Criar conta";
    document.getElementById("toggleAuthBtn").textContent = isLogin ?
      "Não tem conta? Cadastre-se" :
      "Já tem conta? Entrar";
    document.getElementById("authNameOrEmail").placeholder = isLogin ? "Nome ou e-mail" : "E-mail";
    document.getElementById("authScreen").dataset.mode = mode;
  }
}
