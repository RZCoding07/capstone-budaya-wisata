document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async function (event) {
      event.preventDefault();

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const loginBtn = document.getElementById('login-btn');

      // Tambahkan animasi loading
      loginBtn.classList.add('loading');
      loginBtn.disabled = true;

      try {
        const response = await axios.post('https://capstone-api-production-e3c7.up.railway.app/users/login', {
          email,
          password,
        });

        const { role, token } = response.data;

        if (token) {
          localStorage.setItem('token', token);
          alert('Login berhasil!');
          window.location.href = role === 'admin' ? 'article.html' : 'home.html';
        }
      } catch (error) {
        console.error('Login gagal:', error.response?.data);
        alert('Login gagal: ' + (error.response?.data?.message || 'Terjadi kesalahan'));
      } finally {
        // Hapus animasi loading setelah proses selesai
        loginBtn.classList.remove('loading');
        loginBtn.disabled = false;
      }
    });
  }

  const regisForm = document.getElementById('regis-form');
  if (regisForm) {
    regisForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const email = document.getElementById('email').value;
      const regisBtn = document.getElementById('regis-btn');

      // Aktifkan animasi loading
      regisBtn.classList.add('loading');
      regisBtn.disabled = true;

      try {
        const res = await axios.post('https://capstone-api-production-e3c7.up.railway.app/users/register', {
          username,
          password,
          email,
        });

        alert('Register Is SUCCESS!');
        window.location.href = 'index.html';
      } catch (error) {
        console.error('Register gagal:', error.response?.data);
        alert('Register gagal: ' + (error.response?.data?.message || 'Terjadi kesalahan'));
      } finally {
        // Hapus animasi loading setelah proses selesai
        regisBtn.classList.remove('loading');
        regisBtn.disabled = false;
      }
    });
  }
});
