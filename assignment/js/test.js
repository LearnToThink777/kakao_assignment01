// === init.js ====================================
let todoMap;

function onload() {
  // 주간 범위 표시
  document.getElementById("current-week-range").innerHTML =
    date_add(currentDateToString(currentDate()), 0 - currentDate().getDay()) +
    "~" +
    date_add(currentDateToString(currentDate()), 0 + (6 - currentDate().getDay()));

  // 1) 로컬스토리지에서 todoMap 불러오기
  todoMap = loadTodoMap();

  // 2) 처음 실행(=저장된 데이터 없음)일 때만 빈 Map을 만들고 저장
  if (todoMap.size === 0) {
    todoMap = new Map();
    saveTodoMap(todoMap);
  }

  // 3) 다시 loadTodoMap() 할 필요 없음 (todoMap 이미 최신 상태)
}

function loadTodoMap() {
  const stored = localStorage.getItem("todoMap");

  // 저장된 값이 전혀 없으면(첫 실행) 빈 Map 반환
  if (!stored) {
    return new Map();
  }

  // 저장된 JSON을 객체로 파싱한 후, Map으로 변환
  const obj = JSON.parse(stored);
  return new Map(Object.entries(obj));
}

function saveTodoMap(mapData) {
  const obj = Object.fromEntries(mapData);
  localStorage.setItem("todoMap", JSON.stringify(obj));
}

function getTargetDate(plusDay) {
  const week = document.getElementById("current-week-range").innerHTML.split("~");
  const startWeek = week[0];
  return date_add(startWeek, plusDay);
}

// === calender.js ====================================
function date_add(sDate, nDays) {
  let yy = parseInt(sDate.substr(0, 4), 10);
  let mm = parseInt(sDate.substr(5, 2), 10);
  let dd = parseInt(sDate.substr(8), 10);

  const d = new Date(yy, mm - 1, dd + nDays);

  yy = d.getFullYear();
  mm = d.getMonth() + 1;
  mm = mm < 10 ? "0" + mm : mm;
  dd = d.getDate();
  dd = dd < 10 ? "0" + dd : dd;

  return "" + yy + "-" + mm + "-" + dd;
}

function SpanChangePrevious() {
  const week = document.getElementById("current-week-range").innerHTML.split("~");
  const startWeek = week[0];
  const endWeek = week[1];
  document.getElementById("current-week-range").innerHTML =
    date_add(startWeek, -7) + "~" + date_add(endWeek, -7);
}

function SpanChangeNext() {
  const week = document.getElementById("current-week-range").innerHTML.split("~");
  const startWeek = week[0];
  const endWeek = week[1];
  document.getElementById("current-week-range").innerHTML =
    date_add(startWeek, +7) + "~" + date_add(endWeek, +7);
}

function currentDateToString(date) {
  const d = date;
  let yy = d.getFullYear();
  let mm = d.getMonth() + 1;
  mm = mm < 10 ? "0" + mm : mm;
  let dd = d.getDate();
  dd = dd < 10 ? "0" + dd : dd;

  return "" + yy + "-" + mm + "-" + dd;
}

function currentDate() {
  return new Date();
}

// ============ DomManage.js =========================
let GplusDay = null;

function selectDay(Day) {
  GplusDay = Day;
  const elementWeek = document.getElementById("weekly-calender");
  for (let i = 0; i < elementWeek.children.length; i++) {
    if (i == Day) {
      elementWeek.children[i].style.border = "2px solid var(--primary)";
      elementWeek.children[i].style.background = "var(--card-bg)";
      continue;
    }
    elementWeek.children[i].style.border = "1px solid var(--box-border)";
    elementWeek.children[i].style.background = "var(--box-bg)";
  }
  createDomTodoList();
}

function readTodo(plusDay) {
  const readDate = getTargetDate(plusDay);
  todoMap = loadTodoMap();
  const dayTodo = todoMap.get(readDate) || {};
  return new Map(Object.entries(dayTodo));
}

function changeFilterColor() {
  const filters = ["all-filterBtn", "active-filterBtn", "completed-filterBtn"];
  filters.forEach((className) => {
    const btn = document.getElementsByClassName(className)[0];
    if (btn) {
      btn.style.background = "var(--box-bg)";
      btn.style.color = "black";
    }
  });
}

function setFilterActive(className) {
  changeFilterColor();
  const btn = document.getElementsByClassName(className)[0];
  if (btn) {
    btn.style.background = "var(--primary)";
    btn.style.color = "white";
  }
}

function createDomTodoList() {
  setFilterActive("all-filterBtn");
  flushTodoDom();
  const todolist = readTodo(GplusDay);
  if (todolist == undefined || todolist == null) {
    return;
  }
  makeTodoDom(todolist);
}

function createDomTodoListProgress() {
  setFilterActive("active-filterBtn");
  flushTodoDom();
  const todolistArr = Array.from(readTodo(GplusDay));

  const todolist = todolistArr.filter((c) => c[1] == "진행 중");
  makeTodoDom(todolist);
}

function createDomTodoListCompleted() {
  setFilterActive("completed-filterBtn");
  flushTodoDom();
  const todolistArr = Array.from(readTodo(GplusDay));

  const todolist = todolistArr.filter((c) => c[1] == "완료");
  makeTodoDom(todolist);
}

function addTodo() {
  if (GplusDay == undefined || GplusDay == null) {
    return alert("요일을 선택해주세요.");
  }
  const addDate = getTargetDate(GplusDay);
  const work = document.getElementById("todo-input").value;
  if (work == "") {
    return alert("할 일을 입력해주세요");
  }

  todoMap = loadTodoMap();
  const existing = todoMap.get(addDate);

  if (existing == undefined || existing == null) {
    todoMap.set(addDate, Object.fromEntries(new Map([[work, "진행 중"]])));
    saveTodoMap(todoMap);
    createDomTodoList();
    return;
  }

  const works = new Map(Object.entries(existing));
  const status = works.get(work);
  if (status === "진행 중") {
    return alert("이미 진행 중인 일입니다.");
  }
  if (status === "완료") {
    return alert("이미 완료한 일입니다.");
  }
  works.set(work, "진행 중");
  todoMap.set(addDate, Object.fromEntries(works));
  saveTodoMap(todoMap);
  createDomTodoList();
}

function checkTodo(event) {
  const checkWork = event.target.parentElement.parentElement.firstChild.innerText;
  const checkDate = getTargetDate(GplusDay);

  todoMap = loadTodoMap();
  const works = new Map(Object.entries(todoMap.get(checkDate)));
  works.set(checkWork, "완료");

  todoMap.set(checkDate, Object.fromEntries(works));
  saveTodoMap(todoMap);

  createDomTodoListCompleted();
}

function deleteTodo(event) {
  const delWork = event.target.parentElement.parentElement.firstChild.innerText;
  const delDate = getTargetDate(GplusDay);

  todoMap = loadTodoMap();
  const works = new Map(Object.entries(todoMap.get(delDate)));
  works.delete(delWork);

  todoMap.set(delDate, Object.fromEntries(works));
  saveTodoMap(todoMap);

  createDomTodoList();
}

function editTodo(event) {
  const oldWork = event.target.parentElement.parentElement.firstChild.innerText;
  const newWork = prompt("새로운 일을 입력해주세요.");
  if (!newWork) return;

  const upDate = getTargetDate(GplusDay);

  todoMap = loadTodoMap();
  const works = new Map(Object.entries(todoMap.get(upDate)));
  works.delete(oldWork);
  works.set(newWork, "진행 중");

  todoMap.set(upDate, Object.fromEntries(works));
  saveTodoMap(todoMap);

  createDomTodoListProgress();
}

// ============================== flush_makeDom.js ===========================
function flushTodoDom() {
  const todoContainer = document.getElementById("todo-list-container");
  todoContainer.replaceChildren();
}

function makeTodoDom(todolist) {
  const section = document.getElementById("todo-list-container");

  for (const entry of todolist) {
    const article = document.createElement("article");
    article.setAttribute("class", "todo-item");

    const todoContent = document.createElement("div");
    todoContent.setAttribute("class", "todo-content");
    const todoContentText = document.createElement("span");
    todoContentText.setAttribute("class", "todo-text");
    todoContentText.innerHTML = entry[0];
    todoContent.appendChild(todoContentText);
    article.appendChild(todoContent);

    const todoActions = document.createElement("div");
    todoActions.setAttribute("class", "todo-actions");

    const completeBtn = document.createElement("button");
    completeBtn.innerHTML = "완료";
    completeBtn.classList.add("complete-btn");
    completeBtn.addEventListener("click", checkTodo);

    const editBtn = document.createElement("button");
    editBtn.innerHTML = "수정";
    editBtn.classList.add("edit-btn");
    editBtn.addEventListener("click", editTodo);

    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = "삭제";
    deleteBtn.classList.add("delete-btn");
    deleteBtn.addEventListener("click", deleteTodo);

    todoActions.appendChild(completeBtn);
    todoActions.appendChild(editBtn);
    todoActions.appendChild(deleteBtn);
    article.appendChild(todoActions);
    section.appendChild(article);
  }
}
