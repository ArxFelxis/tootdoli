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
    constructor () {
        this.list =[];
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

// Maybe class all this query selector maybe...
const myToDoList = new ToDoList();
const createToDoBtn = document.querySelector("#create-todo-btn");
const submitBtn = document.querySelector("#submit-btn");
const cancelBtn = document.querySelector("#cancel-btn");
const dialog = document.querySelector("dialog");
const defaultProject = document.querySelector("ul");
const form = document.querySelector("form");
let edit = null;

createToDoBtn.addEventListener ("click", () => {
    dialog.showModal();
});

submitBtn.addEventListener ("click", (event) => {
    event.preventDefault();

    const title = document.querySelector("#get-title").value;
    const description = document.querySelector("#get-description").value;
    const date = document.querySelector("#get-date").value;
    const priority = document.querySelector("#get-priority").value;

    if (edit !== null) {
        myToDoList.updateToDo(edit, title, description, date, priority)
        
        edit = null;
        submitBtn.textContent = "Submit";
        
    } else {
        myToDoList.addToDo(title, description, date, priority);
    }

    myToDoList.displayToDoList();

    form.reset();
    dialog.close();
})

cancelBtn.addEventListener ("click", () => {
    dialog.close();
})

document.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-btn")) {
        const li = e.target.closest("li");
        const toDoId = li.dataset.toDoId;

        myToDoList.deleteToDo(toDoId);
        myToDoList.displayToDoList();
    }

    if (e.target.classList.contains("edit-btn")) {
        dialog.showModal();
        const li = e.target.closest("li");
        const toDoId = li.dataset.toDoId;
        edit = toDoId;
        let findToDo = myToDoList.getList().find(toDo => {
            return toDo.id == toDoId;
        })
        document.querySelector("#get-title").value = findToDo.title;
        document.querySelector("#get-description").value = findToDo.description;
        document.querySelector("#get-date").value = findToDo.dueDate;
        document.querySelector("#get-priority").value = findToDo.priority;
        submitBtn.textContent = "Save";
    }
})