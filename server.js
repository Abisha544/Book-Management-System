const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// ---------- Middleware ----------
app.use(express.json());                       // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));// Parse URL-encoded bodies
app.use(express.static(path.join(__dirname, 'public'))); // Serve frontend

// ---------- In-memory "database" ----------
let books = [
  { id: 1, title: 'The Alchemist', author: 'Paulo Coelho', price: 299 },
  { id: 2, title: 'Atomic Habits', author: 'James Clear', price: 499 },
  { id: 3, title: 'Clean Code', author: 'Robert C. Martin', price: 799 }
];

let nextId = 4; // auto-increment for new books

// ---------- Routes ----------

// GET /books - Retrieve all books
app.get('/books', (req, res) => {
  res.status(200).json({ success: true, count: books.length, data: books });
});

// GET /books/:id - Retrieve a single book
app.get('/books/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const book = books.find(b => b.id === id);

  if (!book) {
    return res.status(404).json({ success: false, message: `Book with ID ${id} not found` });
  }
  res.status(200).json({ success: true, data: book });
});

// POST /books - Add a new book
app.post('/books', (req, res) => {
  const { title, author, price } = req.body;

  // Validation
  if (!title || !author || price === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Please provide title, author, and price'
    });
  }
  if (typeof price !== 'number' || price < 0) {
    return res.status(400).json({ success: false, message: 'Price must be a non-negative number' });
  }

  const newBook = { id: nextId++, title, author, price };
  books.push(newBook);

  res.status(201).json({ success: true, message: 'Book added successfully', data: newBook });
});

// PUT /books/:id - Update a book
app.put('/books/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = books.findIndex(b => b.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: `Book with ID ${id} not found` });
  }

  const { title, author, price } = req.body;

  if (!title || !author || price === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Please provide title, author, and price'
    });
  }
  if (typeof price !== 'number' || price < 0) {
    return res.status(400).json({ success: false, message: 'Price must be a non-negative number' });
  }

  books[index] = { id, title, author, price };
  res.status(200).json({ success: true, message: 'Book updated successfully', data: books[index] });
});

// DELETE /books/:id - Delete a book
app.delete('/books/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = books.findIndex(b => b.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: `Book with ID ${id} not found` });
  }

  const deleted = books.splice(index, 1)[0];
  res.status(200).json({ success: true, message: 'Book deleted successfully', data: deleted });
});

// ---------- 404 handler for unknown API routes ----------
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ---------- Global error handler ----------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ---------- Start server ----------
app.listen(PORT, () => {
  console.log(`✅ Book Management server running at http://localhost:${PORT}`);
});