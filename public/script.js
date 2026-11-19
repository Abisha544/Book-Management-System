const API_URL = '/books';

// DOM
const bookForm    = document.getElementById('book-form');
const bookIdInput = document.getElementById('book-id');
const titleInput  = document.getElementById('title');
const authorInput = document.getElementById('author');
const priceInput  = document.getElementById('price');
const submitBtn   = document.getElementById('submit-btn');
const cancelBtn   = document.getElementById('cancel-btn');
const formTitle   = document.getElementById('form-title');
const bookList    = document.getElementById('book-list');
const emptyState  = document.getElementById('empty-state');
const searchInput = document.getElementById('search-input');
const totalBooks  = document.getElementById('total-books');
const totalValue  = document.getElementById('total-value');
const toast       = document.getElementById('toast');

let allBooks = [];

// ---------- Toast ----------
let toastTimer;
function showToast(message, type = 'success') {
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

// ---------- Escape HTML ----------
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ---------- Load books ----------
async function loadBooks() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    const { data } = await res.json();
    allBooks = data;
    renderBooks(allBooks);
    updateStats();
  } catch (err) {
    showToast(`Failed to load books: ${err.message}`, 'error');
  }
}

// ---------- Render ----------
function renderBooks(books) {
  bookList.innerHTML = '';

  if (books.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }
  emptyState.classList.add('hidden');

  books.forEach(book => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${book.id}</td>
      <td class="book-title">${escapeHtml(book.title)}</td>
      <td>${escapeHtml(book.author)}</td>
      <td class="price">₹${book.price}</td>
      <td class="actions-cell">
        <button class="icon-btn edit" onclick="editBook(${book.id})">Edit</button>
        <button class="icon-btn delete" onclick="deleteBook(${book.id})">Delete</button>
      </td>
    `;
    bookList.appendChild(tr);
  });
}

// ---------- Stats ----------
function updateStats() {
  totalBooks.textContent = allBooks.length;
  const total = allBooks.reduce((sum, b) => sum + Number(b.price || 0), 0);
  totalValue.textContent = `₹${total.toLocaleString('en-IN')}`;
}

// ---------- Add / Update ----------
bookForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    title: titleInput.value.trim(),
    author: authorInput.value.trim(),
    price: parseFloat(priceInput.value)
  };
  const editingId = bookIdInput.value;

  try {
    const res = editingId
      ? await fetch(`${API_URL}/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      : await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Request failed');

    showToast(result.message, 'success');
    resetForm();
    loadBooks();
  } catch (err) {
    showToast(err.message, 'error');
  }
});

// ---------- Edit ----------
async function editBook(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    const result = await res.json();
    if (!res.ok) throw new Error(result.message);

    const book = result.data;
    bookIdInput.value = book.id;
    titleInput.value  = book.title;
    authorInput.value = book.author;
    priceInput.value  = book.price;

    submitBtn.textContent = 'Update Book';
    formTitle.textContent = `Edit Book #${book.id}`;
    cancelBtn.classList.remove('hidden');

    formTitle.scrollIntoView({ behavior: 'smooth', block: 'center' });
    titleInput.focus();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ---------- Delete ----------
async function deleteBook(id) {
  if (!confirm(`Delete book #${id}?`)) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message);

    showToast(result.message, 'success');
    loadBooks();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ---------- Reset ----------
function resetForm() {
  bookForm.reset();
  bookIdInput.value = '';
  submitBtn.textContent = 'Add Book';
  formTitle.textContent = 'Add New Book';
  cancelBtn.classList.add('hidden');
}
cancelBtn.addEventListener('click', resetForm);

// ---------- Search ----------
searchInput.addEventListener('input', () => {
  const q = searchInput.value.toLowerCase().trim();
  const filtered = allBooks.filter(b =>
    b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
  );
  renderBooks(filtered);
});

// ---------- Init ----------
loadBooks();