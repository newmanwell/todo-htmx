const express = require('express');
const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// In-memory data store
let todos = [
  { id: 1, text: 'Learn HTMX', done: false },
  { id: 2, text: 'Build a todo app', done: false }
];
let nextId = 3;

// Helper: renders the todo list as an HTML fragment
function renderTodoList() {
  if (todos.length === 0) {
    return '<p class="empty">No todos yet. Add one above!</p>';
  }

  return todos.map(todo => `
    <div class="todo-item ${todo.done ? 'done' : ''}" id="todo-${todo.id}">
      <input
        type="checkbox"
        ${todo.done ? 'checked' : ''}
        hx-post="/todos/${todo.id}/toggle"
        hx-target="#todo-list"
        hx-swap="innerHTML"
      />
      <span>${todo.text}</span>
      <button
        hx-delete="/todos/${todo.id}"
        hx-target="#todo-list"
        hx-swap="innerHTML"
      >
        Delete
      </button>
    </div>
  `).join('');
}

// GET / - serve the main page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// GET /todos - return current list (useful for initial load via hx-get, if you want that instead of server-rendering it)
app.get('/todos', (req, res) => {
  res.send(renderTodoList());
});

// POST /todos - add a new todo
app.post('/todos', (req, res) => {
  const text = req.body.text;
  if (text && text.trim() !== '') {
    todos.push({ id: nextId++, text: text.trim(), done: false });
  }
  res.send(renderTodoList());
});

// POST /todos/:id/toggle - toggle done state
app.post('/todos/:id/toggle', (req, res) => {
  const id = parseInt(req.params.id);
  const todo = todos.find(t => t.id === id);
  if (todo) {
    todo.done = !todo.done;
  }
  res.send(renderTodoList());
});

// DELETE /todos/:id - remove a todo
app.delete('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  todos = todos.filter(t => t.id !== id);
  res.send(renderTodoList());
});

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});