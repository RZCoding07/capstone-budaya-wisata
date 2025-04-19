const API_BASE_URL = 'https://capstone-api-production-e3c7.up.railway.app';
let currentUsername = null;
let currentUserRole = null;

// Menangani scroll untuk header
window.addEventListener('scroll', function () {
  const header = document.querySelector('header');
  const loginButton = document.querySelector('#login-button');
  const logoutButton = document.querySelector('#logout-button');

  if (window.scrollY > 50) {
    header.classList.add('scrolled');
    loginButton?.classList.add('scrolled');
    logoutButton?.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
    loginButton?.classList.remove('scrolled');
    logoutButton?.classList.remove('scrolled');
  }
});

// Menampilkan/menghilangkan tombol login/logout
document.addEventListener('DOMContentLoaded', async () => {
  const loginButton = document.getElementById('login-button');
  const logoutButton = document.getElementById('logout-button');
  const token = localStorage.getItem('token');

  if (loginButton && logoutButton) {
    if (token) {
      loginButton.style.display = 'none';
      logoutButton.style.display = 'inline';

      logoutButton.addEventListener('click', function (event) {
        event.preventDefault();
        localStorage.removeItem('token');
        alert('Logout berhasil!');
        window.location.reload();
      });

      // Ambil username & role dari token
      try {
        const res = await fetch(`${API_BASE_URL}/users/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (res.ok) {
          currentUsername = data.data.username;
          currentUserRole = data.data.role;
        
          // Tampilkan link dashboard jika admin
          const dashboardLink = document.getElementById('dashboard-link');
          if (dashboardLink) {
            dashboardLink.style.display = 'inline';
          }
        }
        
      } catch (error) {
        console.error('Gagal mengambil data user:', error);
      }

    } else {
      loginButton.style.display = 'inline';
      logoutButton.style.display = 'none';
    }
  }

  renderArticlesByCategory();
});

// Ambil data artikel dari API
async function fetchArticles() {
  try {
    const response = await fetch(`${API_BASE_URL}/articles`);
    if (!response.ok) throw new Error('Gagal mengambil data artikel.');

    const result = await response.json();
    renderCards(result.data, 'articles-container');

  } catch (error) {
    console.error('Error fetching articles:', error);
  }
}


// Tampilkan detail artikel
async function showArticleDetails(articleId) {
  try {
    const response = await fetch(`${API_BASE_URL}/articles/${articleId}`);
    if (!response.ok) throw new Error('Failed to fetch article details.');

    const article = await response.json();

    
    document.getElementById('expanded-title').innerText = article.data?.title || 'No Title';
    document.getElementById('expanded-text').innerText = article.data?.longdesc || 'No Description Available';
    document.getElementById('expanded-image').src = article.data?.image || '';
    document.getElementById('popup-location').innerHTML = article.data?.location || 'No Location Available';

    await renderFeedback(articleId);

    document.getElementById('expanded-content').classList.add('active');
    document.getElementById('overlay').classList.add('active');

    const closeButton = document.getElementById('close-button');
    if (closeButton) {
      closeButton.addEventListener('click', closeArticleDetails);
    }

  } catch (error) {
    alert('Error fetching article details: ' + error.message);
  }
}

// Render ulasan
async function renderFeedback(articleId) {

  try {
    const feedbackContainer = document.getElementById('feedback-container');
    const response = await fetch(`${API_BASE_URL}/articles/${articleId}/feedback`);
    const feedbacks = await response.json();

    feedbackContainer.innerHTML = '';
    feedbacks.data.forEach((feedback) => {
      const feedbackElement = document.createElement('div');
      feedbackElement.classList.add('feedback-item');

      const photoUrl = feedback.image || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(feedback.username);
      const isOwner = feedback.username === currentUsername || currentUserRole === 'admin';

      feedbackElement.innerHTML = ` 
        <img class="feedback-photo" src="${photoUrl}" alt="Foto ${feedback.username}" />
        <div class="feedback-details">
          <div class="username">${feedback.username}</div>
          <div class="rating">Rating: ${feedback.rating}</div>
          <div class="ulasan">${feedback.ulasan}</div>
          <div class="date">${new Date(feedback.createdAt).toLocaleDateString()}</div>
          ${isOwner ? `<button class="delete-feedback" data-id="${feedback.id}">Hapus</button>` : ''}
        </div>
      `;

      feedbackContainer.appendChild(feedbackElement);
    });

    // Tambahkan event listener ke tombol hapus
    const deleteButtons = document.querySelectorAll('.delete-feedback');
    deleteButtons.forEach((button) => {
      button.addEventListener('click', async (e) => {
        const feedbackId = e.target.getAttribute('data-id');
        const confirmed = confirm('Apakah kamu yakin ingin menghapus ulasan ini?');
        if (!confirmed) return;

        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${API_BASE_URL}/articles/${feedbackId}/feedback`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          const result = await res.json();

          if (res.ok) {
            alert('Ulasan berhasil dihapus!');
            renderFeedback(currentArticleId);
          } else {
            alert('Gagal menghapus ulasan: ' + result.message);
          }

        } catch (err) {
          console.error('Gagal menghapus ulasan:', err);
        }
      });
    });

  } catch (error) {
    console.error('Error rendering feedback:', error);
  }
}

// Kirim ulasan
document.getElementById('submit-feedback')?.addEventListener('click', async () => {
  currentArticleId = articleId; // Tambahkan ini di awal fungsi

  let rating = document.getElementById('rating').value;
  const ulasan = document.getElementById('feedback-comment').value;

  rating = parseInt(rating, 10);
  const feedbackData = { rating, ulasan };

  const token = localStorage.getItem('token');
  if (!token) {
    alert('Anda perlu login untuk memberikan feedback!');
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/articles/${currentArticleId}/feedback`, {
      method: 'POST',
      body: JSON.stringify(feedbackData),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    const result = await response.json();

    if (response.ok) {
      alert('Feedback berhasil dikirim!');
      renderFeedback(currentArticleId);
    } else {
      alert('Gagal mengirim feedback: ' + result.message);
    }
  } catch (error) {
    console.error('Error submitting feedback:', error);
  }
});

// Tutup detail artikel
function closeArticleDetails() {
  document.getElementById('expanded-content').classList.remove('active');
  document.getElementById('overlay').classList.remove('active');
}

// Render artikel berdasarkan kategori
async function renderArticlesByCategory() {
  try {
    const response = await fetch(`${API_BASE_URL}/articles`);
    if (!response.ok) throw new Error('Gagal mengambil data artikel.');

    const result = await response.json();
    const articles = result.data;

    // Filter artikel berdasarkan kategori
    const cultureArticles = articles.filter(article => article.category === 'Budaya');
    const tourArticles = articles.filter(article => article.category === 'Wisata');

    // Render artikel kategori budaya di halaman culture
    renderCards(cultureArticles, 'culture-container');

    // Render artikel kategori wisata di halaman tour
    renderCards(tourArticles, 'tour-container');
  } catch (error) {
    console.error('Error fetching articles:', error);
  }
}

// Fungsi render kartu artikel untuk kategori tertentu
function renderCards(articles, containerId) {
  const container = document.getElementById(containerId);

  if (!container) {
    console.error(`Element dengan ID ${containerId} tidak ditemukan.`);
    return;
  }

  container.innerHTML = ''; // Clear the container before rendering new cards

  articles.forEach((article) => {
    const card = document.createElement('div');
    card.classList.add('card');

    const imageUrl = article.image;

    card.innerHTML = `
      <img src="${imageUrl}" alt="${article.title || 'No Title'}" />
      <div class="card-content">
        <h2 class="card-title">${article.title || 'No Title'}</h2>
        <p class="card-description">${article.shortdesc || 'No Description'}</p>
        <button id="btn-${article.id}">Pelajari selengkapnya</button>
      </div>
    `;

    const button = card.querySelector(`#btn-${article.id}`);
    button.addEventListener('click', () => showArticleDetails(article.id));

    container.appendChild(card);
  });
}

document.getElementById("search-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const query = document.getElementById("search-input").value.trim();
  if (query) {
    window.location.href = `search.html?q=${encodeURIComponent(query)}`;
  }
});
