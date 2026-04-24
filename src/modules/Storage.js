// TODO: This module handles saving and loading from localStorage
// Use the module pattern (IIFE) since we only need one instance
//
// TODO: expose a save(projectList) method that:
//   - converts the projectList to JSON with JSON.stringify()
//   - saves it to localStorage under the key "getdone-projects"
//
// TODO: expose a load() method that:
//   - checks if data exists in localStorage — return null if not (don't crash!)
//   - parses the JSON string back with JSON.parse()
//   - IMPORTANT: JSON strips class methods — you must rebuild Project and Todo
//     instances from the raw data so their methods work again
//   - returns the rebuilt array of Project instances
//
// Hint: import Todo and Project classes here to rebuild instances

import Project from "./Project.js";
import Todo from "./Todo.js";

const STORAGE_KEY = "getdone-projects";

const Storage = (() => {
  const rebuildTodo = (raw) => {
    const todo = new Todo(
      raw.title,
      raw.description,
      raw.dueDate,
      raw.priority,
      raw.notes
    );
    todo.id = raw.id;
    todo.complete = raw.complete;
    return todo;
  };

  const rebuildProject = (raw) => {
    const project = new Project(raw.name);
    project.id = raw.id;
    raw.todos.forEach((rawTodo) => {
      project.addTodo(rebuildTodo(rawTodo));
    });
    return project;
  };

  return {
    save(projects) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    },

    load() {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;

      try {
        const data = JSON.parse(raw);
        return data.map(rebuildProject);
      } catch {
        return null;
      }
    },
  };
})();

export default Storage;
