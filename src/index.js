import "./style.css";
import editSvg from "./assests/edit.svg"
import deleteSvg from "./assests/delete.svg"
import {format} from "date-fns"

// Data
class ToDo {
    constructor({ title, description, dueDate, priority }) {
        this.id = crypto.randomUUID();
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.priority = priority;
    }
}

class ToDoList {
    constructor(projectName) {
        this.projectName = projectName;
        this.items = [];
    }

    getAll() {
        return this.items;
    }

    add(data) {
        const todo = new ToDo(data);
        this.items.push(todo);
        return todo;
    }

    update(id, updatedData) {
        const todo = this.findById(id);
        if (!todo) return;

        Object.assign(todo, updatedData);
    }

    delete(id) {
        this.items = this.items.filter(todo => todo.id !== id);
    }

    findById(id) {
        return this.items.find(todo => todo.id === id);
    }
}

class ToDoListManager {
    constructor() {
        this.projects = new Map();
        this.activeProjectId = null;

        this.createProject("default", "My Project");
        this.setActiveProject("default");
    }

    createProject(id, name) {
        if (this.projects.has(id)) return false;
        this.projects.set(id, new ToDoList(name));
        return true;
    }

    getProject(id) {
        return this.projects.get(id);
    }

    getActiveProject() {
        return this.getProject(this.activeProjectId);
    }

    setActiveProject(id) {
        if (!this.projects.has(id)) return false;
        this.activeProjectId = id;
        return true;
    }

    getAllProjects() {
        return [...this.projects.entries()].map(([id, project]) => ({
            id,
            name: project.projectName
        }));
    }
}

// UI
const dom = {
    createTodoBtn: document.querySelector("#create-todo-btn"),
    submitBtn: document.querySelector("#submit-btn"),
    cancelBtn: document.querySelector("#cancel-btn"),
    newProjectBtn: document.querySelector("#create-project-btn"),
    projectFormSelect: document.querySelector("#project-select"), // form
    projectViewSelect: document.querySelector("#project-change"), // main / dropdown
    dialog: document.querySelector("dialog"),
    list: document.querySelector("ul"),
    form: document.querySelector("form"),

    titleInput: document.querySelector("#get-title"),
    descriptionInput: document.querySelector("#get-description"),
    dateInput: document.querySelector("#get-date"),
    priorityInput: document.querySelector("#get-priority")
};

function renderTodoList(project) {
    dom.list.innerHTML = "";

    project.getAll().forEach(todo => {
        const li = document.createElement("li");
        li.dataset.todoId = todo.id;
        li.innerHTML = `
            <p id="title">${todo.title}</p>
            <p id="desc">${todo.description}</p>
            <p id="date">${format(todo.dueDate, "d MMM")} (${todo.priority})</p>
            <button class="edit-btn">
                <img src="${editSvg}" alt="" class="edit-img">
            </button>
            <button class="delete-btn">
                <img src="${deleteSvg}" alt="" class="delete-img">
            </button>
        `;

        dom.list.appendChild(li);
    });
}

function renderProjectOptions(manager) {
    const projects = manager.getAllProjects();

    dom.projectFormSelect.innerHTML = "";
    dom.projectViewSelect.innerHTML = "";

    projects.forEach(({ id, name }) => {
        const option = new Option(name, id);
        dom.projectFormSelect.appendChild(option);

        const viewOption = new Option(name, id);
        if (id === manager.activeProjectId) viewOption.selected = true;
        dom.projectViewSelect.appendChild(viewOption);
    });
}

// Events
const manager = new ToDoListManager();
let editingTodoId = null;

renderProjectOptions(manager);
renderTodoList(manager.getActiveProject());

dom.createTodoBtn.addEventListener("click", () => {
    dom.dialog.showModal();
});

dom.cancelBtn.addEventListener("click", () => {
    dom.dialog.close();
    dom.form.reset();
    editingTodoId = null;
});

dom.submitBtn.addEventListener("click", e => {
    e.preventDefault();

    const data = {
        title: dom.titleInput.value,
        description: dom.descriptionInput.value,
        dueDate: dom.dateInput.value,
        priority: dom.priorityInput.value
    };

    const project = manager.getProject(dom.projectFormSelect.value);

    if (editingTodoId) {
        project.update(editingTodoId, data);
    } else {
        project.add(data);
    }

    editingTodoId = null;
    dom.submitBtn.textContent = "Create";

    if (dom.projectViewSelect.value !== dom.projectFormSelect.value) {
        dom.projectViewSelect.value = dom.projectFormSelect.value;
    }

    renderTodoList(project);
    dom.form.reset();
    dom.dialog.close();
    dom.submitBtn.disabled = true;
});

dom.newProjectBtn.addEventListener("click", () => {
    const name = prompt("Project Name");
    if (!name) return;

    const id = name.toLowerCase().replace(/\s+/g, "-");
    manager.createProject(id, name);

    renderProjectOptions(manager);
});

dom.projectViewSelect.addEventListener("change", e => {
    manager.setActiveProject(e.target.value);
    renderTodoList(manager.getActiveProject());
});

(function () {
    let eventCounter = 0;
    dom.submitBtn.disabled = true;

    function validateAndEnable(event){
        const value = event.currentTarget.value;
        eventCounter++;

        if (value !== "" && eventCounter === 2) {
            dom.submitBtn.disabled = false;
            eventCounter = 0;
        }
    }

    dom.dateInput.addEventListener("change", validateAndEnable);
    dom.titleInput.addEventListener("keyup", validateAndEnable);
})();

document.addEventListener("click", e => {
    const li = e.target.closest("li");
    if (!li) return;

    const project = manager.getActiveProject();
    const todoId = li.dataset.todoId;

    if (e.target.classList.contains("delete-img")) {
        project.delete(todoId);
        renderTodoList(project);
    }

    if (e.target.classList.contains("edit-img")) {
        const todo = project.findById(todoId);
        if (!todo) return;

        editingTodoId = todoId;
        dom.titleInput.value = todo.title;
        dom.descriptionInput.value = todo.description;
        dom.dateInput.value = todo.dueDate;
        dom.priorityInput.value = todo.priority;

        dom.submitBtn.textContent = "Save";
        dom.submitBtn.disabled = false;
        dom.dialog.showModal();
    }
});