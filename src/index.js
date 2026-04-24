import "./styles.css";

import Todo from "./modules/Todo.js";
import Project from "./modules/Project.js";
import ProjectList from "./modules/ProjectList.js";
import Storage from "./modules/Storage.js";
import DOMController from "./modules/DOMController.js";

// ── Initialization ───────────────────────────────────
const save = () => Storage.save(ProjectList.getProjects());

const saved = Storage.load();
if (saved) ProjectList.loadProjects(saved);

DOMController.onChange(save);
DOMController.renderAll();

// ── New Project button → opens project modal ─────────
document.getElementById("new-project-btn").addEventListener("click", () => {
  DOMController.openProjectModal();
});

// ── Project form submit ──────────────────────────────
const projectForm = document.getElementById("project-form");
projectForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = projectForm.elements.name.value.trim();
  if (!name) return;

  const project = new Project(name);
  ProjectList.addProject(project);
  ProjectList.setActiveProject(project.id);

  save();
  DOMController.closeProjectModal();
  DOMController.renderAll();
});

// ── Project modal close handlers ─────────────────────
document.querySelectorAll("[data-project-modal-close]").forEach((btn) => {
  btn.addEventListener("click", () => DOMController.closeProjectModal());
});

document.getElementById("project-modal").addEventListener("click", (e) => {
  if (e.target.id === "project-modal") DOMController.closeProjectModal();
});

// ── New Task button → opens task modal ───────────────
document.getElementById("new-task-btn").addEventListener("click", () => {
  DOMController.openModal();
});

// ── Task form submit ─────────────────────────────────
const taskForm = document.getElementById("todo-form");
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Read each field explicitly. RadioNodeList.value returns the
  // checked radio's value for the priority group.
  const title = taskForm.elements.title.value.trim();
  const description = taskForm.elements.description.value.trim();
  const dueDate = taskForm.elements.dueDate.value;
  const priority = taskForm.elements.priority.value;
  const notes = taskForm.elements.notes.value.trim();

  if (!title) {
    taskForm.elements.title.focus();
    return;
  }

  const editingId = DOMController.getEditingTodoId();
  const active = ProjectList.getActiveProject();
  if (!active) return;

  if (editingId) {
    const todo = active.getTodo(editingId);
    if (todo) {
      todo.title = title;
      todo.description = description;
      todo.dueDate = dueDate;
      todo.priority = priority;
      todo.notes = notes;
    }
  } else {
    active.addTodo(new Todo(title, description, dueDate, priority, notes));
  }

  save();
  DOMController.closeModal();
  DOMController.renderAll();
});

// ── Task modal close handlers ────────────────────────
document.querySelectorAll("[data-modal-close]").forEach((btn) => {
  btn.addEventListener("click", () => DOMController.closeModal());
});

document.getElementById("modal").addEventListener("click", (e) => {
  if (e.target.id === "modal") DOMController.closeModal();
});

// ── Global Esc key closes whichever modal is open ────
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  DOMController.closeModal();
  DOMController.closeProjectModal();
});
