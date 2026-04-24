# GetDone

A small, opinionated todo-list app built as part of [The Odin Project](https://www.theodinproject.com/). The goal of the project was to practice JavaScript modules, classes, Webpack, and `localStorage` persistence — all with strict separation of concerns between data and display.

## Features

- Multiple **projects**, each with its own set of todos.
- Create, edit, complete, and delete **todos** with a title, description, due date, priority, and notes.
- Visual cues for **overdue** and **due-today** items (powered by `date-fns`).
- Custom-styled **modals** for creating projects and tasks (no default `prompt()` boxes, no default browser date picker).
- Full **`localStorage` persistence** with class-instance reconstruction on load — your data and your methods both survive a refresh.
- Keyboard-friendly: `Esc` closes any open modal.

## Tech stack

- Vanilla JavaScript (ES6 modules, classes)
- [Webpack 5](https://webpack.js.org/) + `webpack-dev-server` for bundling and HMR
- [`date-fns`](https://date-fns.org/) for date formatting and overdue logic
- Hand-rolled CSS (BEM-style class naming, design-token CSS custom properties)
- `localStorage` for persistence

## Architecture

The codebase strictly separates data, persistence, and UI:

```
src/
├── index.js              # Orchestrator: wires modules + DOM events
├── template.html         # Semantic HTML shell
├── styles.css            # Design tokens + BEM components
└── modules/
    ├── Todo.js           # Todo class (data model)
    ├── Project.js        # Project class (collection of Todos)
    ├── ProjectList.js    # Singleton: in-memory list of all projects
    ├── Storage.js        # Singleton: load/save + class reconstruction
    └── DOMController.js  # Singleton: all DOM rendering & event delegation
```

Key design choices:

- `DOMController` exposes an `onChange(callback)` hook. `index.js` registers `Storage.save` as that callback, so the DOM layer never imports the storage layer (dependency inversion).
- `Storage.load()` rebuilds real `Project` and `Todo` class instances from the persisted JSON, preserving methods like `toggleComplete()`.
- All DOM events are attached via delegation on stable container nodes, so dynamically-rendered todos keep working without re-binding.

## Running locally

```bash
npm install
npm start          # dev server with HMR at http://localhost:8080
npm run build      # production bundle into ./dist
```

## License

ISC
