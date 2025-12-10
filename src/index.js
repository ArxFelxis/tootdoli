import "./style.css";

class ToDo {
    constructor (title, description, dueDate, priority) {
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.priority = priority;
        this.id = crypto.randomUUID();
    }
}

class ToDoList {
    constructor (projectName) {
        this.projectName = projectName;
        this.list = [];
    }

    getList() {
        return this.list;
    }

    addToDo(title, description, date, priority) {
        const toDo = new ToDo (title, description, date, priority);
        this.list.push(toDo);
        return toDo;
    }

    updateToDo(id, title, description, date, priority) {
        const index = this.list.findIndex(toDo => toDo.id === id);
        
        if (index !== -1) {
            this.list[index].title = title;
            this.list[index].description = description;
            this.list[index].dueDate = date;
            this.list[index].priority = priority;
        }
    }

    deleteToDo(toDoId) {
        this.list = this.list.filter(toDo => toDo.id !== toDoId);
    }

    displayToDoList() {
        defaultProject.innerHTML = "";

        this.list.forEach(toDo => {
            const createListElement = document.createElement("li");
            createListElement.dataset.toDoId = toDo.id;

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Delete";
            deleteBtn.className = "delete-btn";

            const editBtn = document.createElement("button");
            editBtn.textContent = "Edit";
            editBtn.className = "edit-btn";

            createListElement.textContent = `
            ${toDo.title}
            ${toDo.description}
            Due: ${toDo.dueDate}
            Priority: ${toDo.priority}
            `;

            createListElement.appendChild(deleteBtn);
            createListElement.appendChild(editBtn);

            defaultProject.appendChild(createListElement);
        });
    }
}

class ToDoListManager {
    constructor () {
        this.project = new Map();
        this.activeProjectId = null;

        this.createProject("default", "My Project");

        this.activeProjectId = "default";
    }

    createProject(id, name) {
        if (!this.project.has(id)) {
            this.project.set(id, new ToDoList(name));
            return true;
        }
        return false;
    }

    getProject(id) {
        return this.project.get(id);
    }
    
    getActiveProject() {
        return this.project.get(this.activeProjectId);
    }
    
    setActiveProject(id) {
        if (this.project.has(id)) {
            this.activeProjectId = id;
            return true;
        }
        return false;
    }

    getAllProjects() {
        return Array.from(this.project.entries()).map(([id, todoList]) => ({
            id: id,
            name: todoList.projectName
        }));
    }
}

const manager = new ToDoListManager();

const createToDoBtn = document.querySelector("#create-todo-btn");
const submitBtn = document.querySelector("#submit-btn");
const cancelBtn = document.querySelector("#cancel-btn");
const dialog = document.querySelector("dialog");
const defaultProject = document.querySelector("ul");
const form = document.querySelector("form");
let edit = null;
const newProjectBtn = document.querySelector("#create-project-btn");
const changeProjectView = document.querySelector("#project-change");

function populateProjectSelect() {
    const projectSelect = document.querySelector("#project-select");
    projectSelect.innerHTML = "";
    changeProjectView.innerHTML = "";
    
    const projects = manager.getAllProjects();
    const currentActiveId = manager.activeProjectId;
    
    projects.forEach(project => {
        // Create option for dialog dropdown
        const option = document.createElement("option");
        option.value = project.id;
        option.textContent = project.name;
        projectSelect.appendChild(option);
        
        // Create option for project view dropdown
        const viewOption = document.createElement("option");
        viewOption.value = project.id;
        viewOption.textContent = project.name;
        if (project.id === currentActiveId) {
            viewOption.selected = true;
        }
        changeProjectView.appendChild(viewOption);
    });
}

populateProjectSelect();
manager.getActiveProject().displayToDoList();

createToDoBtn.addEventListener ("click", () => {
    dialog.showModal();
});

submitBtn.addEventListener ("click", (event) => {
    event.preventDefault();

    const title = document.querySelector("#get-title").value;
    const description = document.querySelector("#get-description").value;
    const date = document.querySelector("#get-date").value;
    const priority = document.querySelector("#get-priority").value;
    const projectSelect = document.querySelector("#project-select").value;

    if (edit !== null) {
        // When editing, update in the currently active project
        const activeProject = manager.getActiveProject();
        activeProject.updateToDo(edit, title, description, date, priority);
        
        edit = null;
        submitBtn.textContent = "Submit";
        
    } else {
        // When creating new, add to the selected project
        const targetList = manager.getProject(projectSelect);
        targetList.addToDo(title, description, date, priority);
    }

    // Display the currently active project's list
    manager.getActiveProject().displayToDoList();

    form.reset();
    dialog.close();
});

cancelBtn.addEventListener ("click", () => {
    dialog.close();
});

newProjectBtn.addEventListener ("click", () => {
    const projectName = prompt("Project Name");
    if (projectName) {
        const projectId = projectName.toLowerCase().replace(/\s+/g, '-');
        manager.createProject(projectId, projectName);
        populateProjectSelect();
    }
});

changeProjectView.addEventListener ("change", (event) => {
    const selectedProjectId = event.target.value;
    manager.setActiveProject(selectedProjectId);
    manager.getActiveProject().displayToDoList();
});

document.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-btn")) {
        const li = e.target.closest("li");
        const toDoId = li.dataset.toDoId;

        const activeProject = manager.getActiveProject();
        activeProject.deleteToDo(toDoId);
        activeProject.displayToDoList();
    }

    if (e.target.classList.contains("edit-btn")) {
        dialog.showModal();
        const li = e.target.closest("li");
        const toDoId = li.dataset.toDoId;
        edit = toDoId;
        
        const activeProject = manager.getActiveProject();
        let findToDo = activeProject.getList().find(toDo => {
            return toDo.id == toDoId;
        });
        
        document.querySelector("#get-title").value = findToDo.title;
        document.querySelector("#get-description").value = findToDo.description;
        document.querySelector("#get-date").value = findToDo.dueDate;
        document.querySelector("#get-priority").value = findToDo.priority;
        submitBtn.textContent = "Save";
    }
});