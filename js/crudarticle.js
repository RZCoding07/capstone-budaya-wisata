const API_BASE_URL = 'https://capstone-api-production-e3c7.up.railway.app/articles';

function getToken() {
  return localStorage.getItem('token'); // Ambil token dari localStorage
}

async function getAllArticles() {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Token tidak ditemukan! Silakan login terlebih dahulu.');
    }

    const response = await fetch(API_BASE_URL, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const articles = await response.json();
    console.log('All Articles:', articles);
    displayArticles(articles);
  } catch (error) {
    console.error('Error fetching articles:', error);
  }
}

function displayArticles(articles) {
  const tableBody = document.getElementById('article-table-body');
  tableBody.innerHTML = ''; // Bersihkan isi sebelumnya

  articles.forEach((article) => {
    const row = document.createElement('tr');

    row.innerHTML = `
            <td>${article.id}</td>
            <td>${article.title}</td>
            <td>${article.category}</td>
            <td>${article.location}</td>
            <td>
                ${article.image ? `<img src="${article.image}" alt="Article Image" width="200">` : 'No Image'}
            </td>
            <td>
                <button class="action-btn edit-btn" onclick="editArticle('${article.id}')">Edit</button>
                <button class="action-btn delete-btn" onclick="deleteArticle('${article.id}')">Hapus</button>
            </td>
        `;

    tableBody.appendChild(row);
  });
}

async function addArticle(event) {
  event.preventDefault();

  const title = document.getElementById('title').value;
  const category = document.getElementById('category').value;
  const location = document.getElementById('location').value;
  const imageInput = document.getElementById('image');

  if (!title || !category || !location) {
    alert('Semua field wajib diisi!');
    return;
  }

  let imageUrl = '';
  if (imageInput.files.length > 0) {
    const imageFile = imageInput.files[0];
    imageUrl = await uploadImage(imageFile);
  }

  const newArticle = {
    title,
    category,
    location,
    image: imageUrl,
  };

  try {
    const token = getToken();
    if (!token) {
      throw new Error('Token tidak ditemukan! Silakan login terlebih dahulu.');
    }

    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newArticle),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    document.getElementById('output').textContent = 'Artikel berhasil ditambahkan!';
    document.getElementById('dataForm').reset();
    getAllArticles();
  } catch (error) {
    console.error('Error adding article:', error);
    document.getElementById('output').textContent = 'Gagal menambahkan artikel!';
  }
}

async function uploadImage(file) {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('https://api.imgbb.com/1/upload?key=YOUR_IMGBB_API_KEY', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Gagal mengunggah gambar!');
    }

    const result = await response.json();
    return result.data.url;
  } catch (error) {
    console.error('Error uploading image:', error);
    return '';
  }
}

function editArticle(id) {
  alert(`Edit artikel dengan ID: ${id}`);
}

async function deleteArticle(id) {
  const confirmation = confirm('Apakah Anda yakin ingin menghapus artikel ini?');
  if (!confirmation) return;

  try {
    const token = getToken();
    if (!token) {
      throw new Error('Token tidak ditemukan! Silakan login terlebih dahulu.');
    }

    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    alert('Artikel berhasil dihapus!');
    getAllArticles();
  } catch (error) {
    console.error('Error deleting article:', error);
    alert('Gagal menghapus artikel!');
  }
}

document.getElementById('dataForm').addEventListener('submit', addArticle);
document.addEventListener('DOMContentLoaded', getAllArticles);
