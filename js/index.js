"use strict";
let tasks = [
  {
    id: 1725614122980,
    status: "uncompleted",
    text: "Occaecat non ea quis occaecat ad culpa amet deserunt incididunt elit fugiat pariatur. Exercitation commodo culpa in veniam proident laboris in. Excepteur cupidatat eiusmod dolor consectetur exercitation nulla aliqua veniam fugiat irure mollit.",
    title: "Eu ea incididunt sunt consectetur 1",
  },
  {
    id: 1725614122880,
    status: "uncompleted",
    text: "Occaecat non ea quis occaecat ad culpa amet deserunt incididunt elit fugiat pariatur. Exercitation commodo culpa in veniam proident laboris in.",
    title: "Eu ea incididunt sunt consectetur fugiat non 2",
  },
  {
    id: 1725614122780,
    status: "uncompleted",
    text: "Aliquip cupidatat ex adipisicing veniam do tempor. Lorem nulla adipisicing et esse cupidatat qui deserunt in fugiat duis est qui. Est adipisicing ipsum qui cupidatat exercitation. Cupidatat aliqua deserunt id deserunt excepteur nostrud culpa eu voluptate excepteur. Cillum officia proident anim aliquip. Dolore veniam qui reprehenderit voluptate non id anim.",
    title: "Deserunt laborum id consectetur pariatur veniam occaecat 3",
  },
  {
    id: 1725614122680,
    status: "uncompleted",
    text: "Aliquip cupidatat ex adipisicing veniam do tempor. Lorem nulla adipisicing et esse cupidatat qui deserunt in fugiat duis est qui. Est adipisicing ipsum qui cupidatat exercitation. Cupidatat aliqua deserunt id deserunt excepteur nostrud culpa eu voluptate excepteur. Cillum officia proident anim aliquip.",
    title: "Deserunt laborum id consectetur 4",
  },
];

/* const modifiedTasks = tasks.map((task) => ({
  ...task,
  status: task.completed ? "completed" : "uncompleted",
}));
console.log(modifiedTasks); */

// CRUD - create read update delete

// dom elements

const todoList = getElement(".todo__list");
const todoForm = getElement(".todo__form");
const [inputTitle, inputText, btnSubmit] = todoForm.elements; //destruct.
const todoFilter = getElement(".todo__filter p");
const todoFilterList = getElement(".todo__filter-list");

// variables
const tasksObj =
  JSON.parse(localStorage.getItem("tasks")) ||
  tasks.reduce((acc, task) => {
    acc[task.id] = task;
    return acc;
  }, {});

let activeFilter = localStorage.getItem("filter") || "all";

// events
setActiveFilterItem();
renderTasks(filterSortTasks());

todoForm.addEventListener("submit", onSubmitForm);
inputTitle.addEventListener("input", (e) => validateInput(e, 3));
inputText.addEventListener("input", (e) => validateInput(e, 10));
todoList.addEventListener("click", onDeleteTask);
todoList.addEventListener("click", onChangeStatus);
todoFilter.addEventListener("click", onToggleFilter);
todoFilterList.addEventListener("click", onChooseFilterItem);

// functions
function getElement(selector) {
  return document.querySelector(selector);
}

function setActiveFilterItem() {
  const filterItem = getElement(`.todo__filter-list .${activeFilter}`);
  filterItem.classList.add("active");
  todoFilter.innerHTML = `Filter: &nbsp;${
    activeFilter[0].toUpperCase() + activeFilter.slice(1)
  }`;
}

function createTaskTemplate({ title, text, id, status }) {
  return `
    <li class="todo__item ${status}" id="${id}">
      <h3 class="todo__item-title">${title}</h3>
      <p class="todo__item-text">${text}</p>
      <div class="todo__item-options">
        <button class="btn btn--black btn--complete">${
          status === "completed" ? "Completed" : "Complete"
        }</button>
        <button class="btn btn--red btn--confirm">Delete task</button>
      </div>
      <div class="todo__item-alert">
        <p>Are you shure you want to delete task?</p>
        <div>
          <button class="btn btn--red btn--delete">Delete</button>
          <button class="btn btn--black btn--cancel">Cancel</button>
        </div>
      </div>
    </li>
  `;
}

function renderTasks(tasks = []) {
  if (!tasks.length) {
    todoList.innerHTML =
      "<p class='empty-list'>You don't have any tasks here</p>";
    return;
  }

  let template = "";
  for (const key in tasks) {
    template += createTaskTemplate(tasks[key]);
  }
  todoList.innerHTML = template;
}

function onSubmitForm(e) {
  e.preventDefault();

  const title = inputTitle.value;
  const text = inputText.value;
  createNewTask(title, text);
  updateTasksInLS();
  renderTasks(filterSortTasks());
  todoForm.reset();
  btnSubmit.setAttribute("disabled", true);
}

function validateInput({ target }, length) {
  if (target.value.trim().length < length) {
    const message = target.getAttribute("data-message");
    target.nextElementSibling.innerText = message;
    target.classList.add("error");
  } else {
    target.nextElementSibling.innerText = "";
    target.classList.remove("error");
  }

  if (inputTitle.value.length >= 3 && inputText.value.length >= 10) {
    btnSubmit.removeAttribute("disabled");
  }
}

function createNewTask(title, text) {
  const task = {
    id: Date.now(),
    status: "uncompleted",
    text,
    title,
  };
  tasksObj[task.id] = task;
  return task;
}

function onDeleteTask({ target }) {
  if (target.classList.contains("btn--confirm")) {
    confirmDeleteTask(target);
  }
  if (target.classList.contains("btn--cancel")) {
    cancelDeleteTask(target);
  }
  if (target.classList.contains("btn--delete")) {
    deleteTask(target);
    updateTasksInLS();
  }
}

function confirmDeleteTask(target) {
  const todoItem = target.closest(".todo__item");
  const itemAlert = todoItem.querySelector(".todo__item-alert");
  const itemOptions = todoItem.querySelector(".todo__item-options");

  itemOptions.classList.add("hidden");
  itemAlert.classList.add("active");
}

function cancelDeleteTask(target) {
  const todoItem = target.closest(".todo__item");
  const itemAlert = todoItem.querySelector(".todo__item-alert");
  const itemOptions = todoItem.querySelector(".todo__item-options");

  itemOptions.classList.remove("hidden");
  itemAlert.classList.remove("active");
}

function deleteTask(target) {
  const todoItem = target.closest(".todo__item");
  const itemId = todoItem.getAttribute("id");

  delete tasksObj[itemId];
  renderTasks(filterSortTasks());
}

function onChangeStatus({ target }) {
  if (target.classList.contains("btn--complete")) {
    const todoItem = target.closest(".todo__item");
    const itemId = todoItem.getAttribute("id");
    tasksObj[itemId].status =
      tasksObj[itemId].status === "completed" ? "uncompleted" : "completed";

    updateTasksInLS();
    renderTasks(filterSortTasks());
  }
}

function sortTasks(tasks) {
  return Object.values(tasks).sort(
    (a, b) =>
      (b.status === "uncompleted") - (a.status === "uncompleted") || b.id - a.id
  );
}

function updateTasksInLS() {
  localStorage.setItem("tasks", JSON.stringify(tasksObj));
}

function onToggleFilter({ target }) {
  target.nextElementSibling.classList.toggle("active");
  /////////
  todoList.classList.toggle("margin");
}

function onChooseFilterItem({ target }) {
  if (target.nodeName === "LI") {
    todoFilter.innerHTML = `Filter: &nbsp;${target.innerText}`;
    todoFilterList.classList.remove("active");

    for (const li of todoFilterList.children) {
      li.classList.remove("active");
    }
    target.classList.add("active");

    activeFilter = target.classList[0];
    localStorage.setItem("filter", activeFilter);
    /////////////
    todoList.classList.remove("margin");
    renderTasks(filterSortTasks());
  }
}

function filterTasks() {
  const tasks = Object.values(tasksObj);
  const oneDayInMs = 24 * 60 * 60 * 1000;

  if (activeFilter === "all") {
    return tasks;
  }
  if (activeFilter === "new") {
    return tasks.filter((task) => Date.now() - task.id < oneDayInMs);
  }
  if (activeFilter === "old") {
    return tasks.filter((task) => Date.now() - task.id > oneDayInMs);
  }
  return tasks.filter((task) => task.status === activeFilter);
}

function filterSortTasks() {
  return sortTasks(filterTasks());
}

/* function phoneFactory1() {
  const phoneCase = "Case";
  const screens = screenFactory(300);
  const batteryes = batteryFactory(4200, 300);
  return `Phone with ${phoneCase}, ${screens} and ${batteryes}`;
}

function phoneFactory2() {
  const phoneCase = "Case";
  const screens = screenFactory(1000);
  const batteryes = batteryFactory();
  return `Phone with ${phoneCase}, ${screens} and ${batteryes}`;
}

function screenFactory(amount) {
  return `Screens ${amount}`;
}

function batteryFactory() {
  return "Battery";
}

phoneFactory1(); // -> "Phone with case, screen and battery" */
