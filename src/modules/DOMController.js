import { format, isPast, isToday, parseISO } from "date-fns";
import ProjectList from "./ProjectList.js";

const DOMController = (() => {
  const projectListEl = document.getElementById("project-list");
  const projectHeaderEl = document.getElementById("project-header");
  const todoListEl = document.getElementById("todo-list");

  const modalEl = document.getElementById("modal");
  const formEl = document.getElementById("todo-form");
  const modalTitleEl = document.getElementById("modal-title");
  const submitLabelEl = formEl.querySelector("[data-submit-label]");

  const projectModalEl = document.getElementById("project-modal");
  const projectFormEl = document.getElementById("project-form");

  let editingTodoId = null;
  let onChangeHandler = null;

  const notifyChange = () => {
    if (onChangeHandler) onChangeHandler();
  };

  const formatDueDate = (dateStr) => {
    if (!dateStr) return "—";
    return format(parseISO(dateStr), "MMM d");
  };

  const isOverdue = (todo) => {
    if (!todo.dueDate || todo.complete) return false;
    const date = parseISO(todo.dueDate);
    return isPast(date) && !isToday(date);
  };

  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  const buildProjectItem = (project, isActive) => {
    const li = document.createElement("li");
    li.className = "project-item";
    if (isActive) li.classList.add("project--active");
    li.dataset.id = project.id;

    const dot = document.createElement("span");
    dot.className = "project-item__dot";

    const name = document.createElement("span");
    name.className = "project-item__name";
    name.textContent = project.name;

    const count = document.createElement("span");
    count.className = "project-item__count";
    count.textContent = project.todos.length;

    li.append(dot, name, count);

    li.addEventListener("click", () => {
      ProjectList.setActiveProject(project.id);
      api.renderAll();
    });

    return li;
  };

  const buildTodoRow = (todo, project) => {
    const row = document.createElement("div");
    row.className = `todo-row todo--${todo.priority || "low"}`;
    if (todo.complete) row.classList.add("todo--complete");
    if (isOverdue(todo)) row.classList.add("todo--overdue");
    row.dataset.id = todo.id;

    // Checkbox
    const check = document.createElement("button");
    check.type = "button";
    check.className = "todo-row__check";
    check.setAttribute("aria-label", "Toggle complete");
    check.addEventListener("click", (e) => {
      e.stopPropagation();
      todo.toggleComplete();
      api.renderAll();
      notifyChange();
    });

    // Body (title + optional subtitle)
    const body = document.createElement("div");
    body.className = "todo-row__body";

    const title = document.createElement("div");
    title.className = "todo-row__title";
    title.textContent = todo.title || "Untitled";
    body.appendChild(title);

    if (todo.description) {
      const sub = document.createElement("div");
      sub.className = "todo-row__subtitle";
      sub.textContent = todo.description;
      body.appendChild(sub);
    }

    // Due date
    const due = document.createElement("div");
    due.className = "todo-row__due";
    due.textContent = formatDueDate(todo.dueDate);

    // Priority badge
    const priority = document.createElement("div");
    priority.className = "todo-row__priority";
    if (todo.priority) {
      const badge = document.createElement("span");
      badge.className = `priority-badge priority-badge--${todo.priority}`;

      const badgeDot = document.createElement("span");
      badgeDot.className = "priority-badge__dot";

      const label = document.createElement("span");
      label.textContent = capitalize(todo.priority);

      badge.append(badgeDot, label);
      priority.appendChild(badge);
    }

    // Delete button
    const del = document.createElement("button");
    del.type = "button";
    del.className = "todo-row__delete";
    del.setAttribute("aria-label", "Delete task");
    del.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M2.5 4h9M5.5 4V2.5h3V4M6 6.5v4M8 6.5v4M3.5 4l.5 7.5h6l.5-7.5"
              stroke="currentColor" stroke-width="1.4"
              stroke-linecap="round" stroke-linejoin="round" />
      </svg>`;
    del.addEventListener("click", (e) => {
      e.stopPropagation();
      project.removeTodo(todo.id);
      api.renderAll();
      notifyChange();
    });

    // Row click → edit modal
    row.addEventListener("click", () => {
      api.openModal(todo);
    });

    row.append(check, body, due, priority, del);
    return row;
  };

  const buildEmptyState = () => {
    const empty = document.createElement("div");
    empty.className = "todo-list__empty";

    const icon = document.createElement("div");
    icon.className = "todo-list__empty-icon";
    icon.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <polyline points="4,10.5 8.5,15 16,6"
                  stroke="currentColor" stroke-width="1.6"
                  stroke-linecap="round" stroke-linejoin="round" />
      </svg>`;

    const title = document.createElement("div");
    title.className = "todo-list__empty-title";
    title.textContent = "All quiet here";

    const hint = document.createElement("div");
    hint.className = "todo-list__empty-hint";
    hint.textContent =
      "Press 'New Task' to add your first todo to this project.";

    empty.append(icon, title, hint);
    return empty;
  };

  const buildHeader = (project) => {
    const fragment = document.createDocumentFragment();

    const title = document.createElement("h1");
    title.className = "project-header__title";
    title.textContent = project.name;
    fragment.appendChild(title);

    const total = project.todos.length;
    const overdue = project.todos.filter(isOverdue).length;
    const completed = project.todos.filter((t) => t.complete).length;

    const meta = document.createElement("div");
    meta.className = "project-header__meta";
    const parts = [`${total} ${total === 1 ? "task" : "tasks"}`];
    if (overdue > 0) parts.push(`${overdue} overdue`);
    if (completed > 0) parts.push(`${completed} done`);
    meta.textContent = parts.join(" · ");
    fragment.appendChild(meta);

    return fragment;
  };

  // Public API 
  const api = {
    renderProjects(projects, activeProjectId) {
      projectListEl.innerHTML = "";
      projects.forEach((project) => {
        projectListEl.appendChild(
          buildProjectItem(project, project.id === activeProjectId)
        );
      });
    },

    renderTodos(project) {
      todoListEl.innerHTML = "";
      projectHeaderEl.innerHTML = "";

      if (!project) {
        todoListEl.appendChild(buildEmptyState());
        return;
      }

      projectHeaderEl.appendChild(buildHeader(project));

      if (project.todos.length === 0) {
        todoListEl.appendChild(buildEmptyState());
        return;
      }

      project.todos.forEach((todo) => {
        todoListEl.appendChild(buildTodoRow(todo, project));
      });
    },

    renderAll() {
      const projects = ProjectList.getProjects();
      const active = ProjectList.getActiveProject();
      api.renderProjects(projects, active?.id);
      api.renderTodos(active);
    },

    openModal(todo = null) {
      editingTodoId = todo ? todo.id : null;
      modalTitleEl.textContent = todo ? "Edit Task" : "New Task";
      submitLabelEl.textContent = todo ? "Save Changes" : "Create Task";

      formEl.reset();

      if (todo) {
        formEl.elements.title.value = todo.title || "";
        formEl.elements.description.value = todo.description || "";
        formEl.elements.dueDate.value = todo.dueDate || "";
        formEl.elements.notes.value = todo.notes || "";
        const priorityRadio = formEl.querySelector(
          `input[name="priority"][value="${todo.priority}"]`
        );
        if (priorityRadio) priorityRadio.checked = true;
      }

      modalEl.classList.add("modal--open");
      modalEl.setAttribute("aria-hidden", "false");
      setTimeout(() => formEl.elements.title.focus(), 30);
    },

    closeModal() {
      // Blur any focused descendant before hiding (avoids the
      // "aria-hidden on focused descendant" accessibility warning).
      if (modalEl.contains(document.activeElement)) {
        document.activeElement.blur();
      }
      modalEl.classList.remove("modal--open");
      modalEl.setAttribute("aria-hidden", "true");
      formEl.reset();
      editingTodoId = null;
    },

    openProjectModal() {
      projectFormEl.reset();
      projectModalEl.classList.add("modal--open");
      projectModalEl.setAttribute("aria-hidden", "false");
      setTimeout(() => projectFormEl.elements.name.focus(), 30);
    },

    closeProjectModal() {
      if (projectModalEl.contains(document.activeElement)) {
        document.activeElement.blur();
      }
      projectModalEl.classList.remove("modal--open");
      projectModalEl.setAttribute("aria-hidden", "true");
      projectFormEl.reset();
    },

    getEditingTodoId() {
      return editingTodoId;
    },

    onChange(handler) {
      onChangeHandler = handler;
    },
  };

  return api;
})();

export default DOMController;
