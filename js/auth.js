function parseJwt(token) {
    try {
      const base64Payload = token.split('.')[1]; // ambil bagian payload
      const payload = atob(base64Payload); // decode base64
      return JSON.parse(payload); // ubah ke objek JS
    } catch (e) {
      console.error("Invalid token", e);
      return null;
    }
  }
  
  window.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const dashboardLink = document.getElementById("dashboard-link");
    const loginButton = document.getElementById("login-button");
    const logoutButton = document.getElementById("logout-button");
  
    if (token) {
      const userData = parseJwt(token);
      if (userData && userData.role === "admin") {
        dashboardLink.style.display = "inline";
      } else {
        dashboardLink.style.display = "none";
      }
  
      loginButton.style.display = "none";
      logoutButton.style.display = "inline";
    } else {
      dashboardLink.style.display = "none";
      loginButton.style.display = "inline";
      logoutButton.style.display = "none";
    }
  });
  
  function logout() {
    localStorage.removeItem("token");
    window.location.href = "..index.html";
  }
  