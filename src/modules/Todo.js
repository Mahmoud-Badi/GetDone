class Todo {
  constructor(title, description, dueDate, priority, notes) {
    this.id = crypto.randomUUID();
    this.title = title;
    this.description = description;
    this.dueDate = dueDate;
    this.priority = priority;
    this.notes = notes;
    this.complete = false;
  }

  toggleComplete() {
    this.complete = !this.complete;
  }
}

export default Todo;
