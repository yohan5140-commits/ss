const todoForm = document.querySelector('#todo-form');
const todoInput = document.querySelector('#todo-input');
const todoList = document.querySelector('#todo-list');
const todoCount = document.querySelector('#todo-count');
const clearCompletedButton = document.querySelector('#clear-completed');
const todoTemplate = document.querySelector('#todo-item-template');

const STORAGE_KEY = 'todo-items';

function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

/** @type {{ id: string; text: string; completed: boolean }[]} */
let todos = [];

function loadTodos() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      todos = parsed.filter(
        (item) =>
          typeof item?.id === 'string' &&
          typeof item?.text === 'string' &&
          typeof item?.completed === 'boolean'
      );
    }
  } catch (error) {
    console.error('저장된 할 일을 불러오는 중 오류가 발생했습니다.', error);
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function updateCount() {
  const remaining = todos.filter((todo) => !todo.completed).length;
  todoCount.textContent =
    remaining === 0
      ? '모든 할 일을 완료했습니다!'
      : `${remaining}개의 할 일이 남았습니다.`;
}

function createTodoElement(todo) {
  const fragment = todoTemplate.content.cloneNode(true);
  const item = fragment.querySelector('.todo-item');
  const checkbox = fragment.querySelector('.todo-item__checkbox');
  const text = fragment.querySelector('.todo-item__text');
  const deleteButton = fragment.querySelector('.todo-item__delete');

  text.textContent = todo.text;
  checkbox.checked = todo.completed;

  if (todo.completed) {
    item.classList.add('todo-item--completed');
  }

  checkbox.addEventListener('change', () => {
    todo.completed = checkbox.checked;
    if (todo.completed) {
      item.classList.add('todo-item--completed');
    } else {
      item.classList.remove('todo-item--completed');
    }
    saveTodos();
    updateCount();
  });

  deleteButton.addEventListener('click', () => {
    todos = todos.filter((current) => current.id !== todo.id);
    item.remove();
    saveTodos();
    updateCount();
    todoInput.focus();
  });

  return item;
}

function renderTodos() {
  todoList.innerHTML = '';
  const fragment = document.createDocumentFragment();
  todos.forEach((todo) => {
    fragment.appendChild(createTodoElement(todo));
  });
  todoList.appendChild(fragment);
  updateCount();
}

function addTodo(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    return;
  }

  const newTodo = {
    id: createId(),
    text: trimmed,
    completed: false,
  };

  todos.unshift(newTodo);
  saveTodos();
  renderTodos();
}

function clearCompleted() {
  const hasCompleted = todos.some((todo) => todo.completed);
  if (!hasCompleted) {
    return;
  }
  todos = todos.filter((todo) => !todo.completed);
  saveTodos();
  renderTodos();
}

todoForm.addEventListener('submit', (event) => {
  event.preventDefault();
  addTodo(todoInput.value);
  todoForm.reset();
  todoInput.focus();
});

clearCompletedButton.addEventListener('click', clearCompleted);

document.addEventListener('DOMContentLoaded', () => {
  loadTodos();
  renderTodos();
});
