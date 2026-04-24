// TODO: This module manages ALL projects in the app (the app state)
// Use the module pattern (IIFE) since we only need one instance
//
// TODO: Keep a private array of projects
//
// TODO: On initialization, create a default "Inbox" project
//
// TODO: Expose these methods:
//   - getProjects() — returns all projects
//   - getProject(id) — finds project by id
//   - addProject(project) — adds a new project
//   - removeProject(id) — removes project by id
//   - getActiveProject() — returns the currently selected project
//   - setActiveProject(id) — sets which project is currently active

import Project from "./Project.js";

const ProjectList = (() => {
  let projects = [new Project("Inbox")];
  let activeProjectId = projects[0].id;

  return {
    getProjects: () => projects,
    getProject: (id) => projects.find((p) => p.id === id),
    addProject: (project) => projects.push(project),
    removeProject: (id) => {
      projects = projects.filter((p) => p.id !== id);
      if (activeProjectId === id) {
        activeProjectId = projects[0]?.id ?? null;
      }
    },
    getActiveProject: () => projects.find((p) => p.id === activeProjectId),
    setActiveProject: (id) => { activeProjectId = id; },

    loadProjects: (loaded) => {
      if (!Array.isArray(loaded) || loaded.length === 0) return;
      projects = loaded;
      activeProjectId = loaded[0].id;
    },
  };
})();

export default ProjectList;
