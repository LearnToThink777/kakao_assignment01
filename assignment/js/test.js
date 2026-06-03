// === init.js ====================================
var todoMap;

function onload(){
    var val;
    val = document.getElementById('current-week-range').innerHTML = date_add(currentDateToString(currentDate()), 0 - currentDate().getDay()) + '~' + date_add(currentDateToString(currentDate()), 0 + (6 - currentDate().getDay()));
    
    todoMap = loadTodoMap();

    if(Object.keys(todoMap).length == 0) {
      todoMap = new Map();
    }

    saveTodoMap(todoMap);
    
    todoMap = loadTodoMap();
}

function loadTodoMap() {
    var stored = JSON.parse(localStorage.getItem("todoMap")) || {};
    return new Map(Object.entries(stored));
}

function saveTodoMap(mapData) {
    var obj = Object.fromEntries(mapData);
    localStorage.setItem("todoMap", JSON.stringify(obj));
}

function getTargetDate(plusDay) {
    var week = document.getElementById('current-week-range').innerHTML.split("~");
    var startWeek = week[0];
    return date_add(startWeek, plusDay);
}


// === calender.js ====================================
function date_add(sDate, nDays) {
    var yy = parseInt(sDate.substr(0, 4), 10);
    var mm = parseInt(sDate.substr(5, 2), 10);
    var dd = parseInt(sDate.substr(8), 10);
    
    d = new Date(yy, mm - 1, dd + nDays);
 
    yy = d.getFullYear();
    mm = d.getMonth() + 1; mm = (mm < 10) ? '0' + mm : mm;
    dd = d.getDate(); dd = (dd < 10) ? '0' + dd : dd;
 
    return '' + yy + '-' + mm + '-' + dd;
}

function SpanChangePrevious(){
   var week = document.getElementById('current-week-range').innerHTML.split("~");
   var startWeek = week[0];
   var endWeek = week[1];
   var val = document.getElementById('current-week-range').innerHTML = date_add(startWeek, -7) + '~' + date_add(endWeek, -7);
}

function SpanChangeNext(){
   var week = document.getElementById('current-week-range').innerHTML.split("~");
   var startWeek = week[0];
   var endWeek = week[1];
   var val = document.getElementById('current-week-range').innerHTML = date_add(startWeek, +7) + '~' + date_add(endWeek, +7);
}

function currentDateToString(Date){
    var d = Date;
    yy = d.getFullYear();
    mm = d.getMonth() + 1; mm = (mm < 10) ? '0' + mm : mm;
    dd = d.getDate(); dd = (dd < 10) ? '0' + dd : dd;
 
    return '' + yy + '-' + mm + '-' + dd;
}

function currentDate(){
    return new Date();
}


// ============ DomManage.js =========================
var GplusDay = null;

function selectDay(Day){
   GplusDay = Day;
   const elementWeek = document.getElementById('weekly-calender');
   for (let i = 0; i < elementWeek.children.length; i++){
      if(i == Day){
         elementWeek.children[i].style.border = '2px solid var(--primary)';
         elementWeek.children[i].style.background = 'var(--card-bg)';
         continue;
      }
      elementWeek.children[i].style.border = '1px solid var(--box-border)';
      elementWeek.children[i].style.background = 'var(--box-bg)';
   }
   createDomTodoList();
}

function readTodo(plusDay){
   var readDate = getTargetDate(plusDay);
   todoMap = loadTodoMap();
   var dayTodo = todoMap.get(readDate) || {};
   return new Map(Object.entries(dayTodo));
}

function changeFilterColor(){
   var filters = ['all-filterBtn', 'active-filterBtn', 'completed-filterBtn'];
   filters.forEach(function(className) {
       var btn = document.getElementsByClassName(className)[0];
       if(btn) {
           btn.style.background = "var(--box-bg)";
           btn.style.color = "black";
       }
   });
}

function setFilterActive(className) {
   changeFilterColor();
   var btn = document.getElementsByClassName(className)[0];
   if(btn) {
       btn.style.background = "var(--primary)";
       btn.style.color = "white";
   }
}

function createDomTodoList(){
   setFilterActive('all-filterBtn');
   flushTodoDom();
   var todolist = readTodo(GplusDay);
   if(todolist == undefined || todolist == null){
      return;
   }
   makeTodoDom(todolist);
}

function createDomTodoListProgress(){
   setFilterActive('active-filterBtn');
   flushTodoDom();
   var todolist = readTodo(GplusDay);
   var todolistArr = Array.from(todolist);
   
   todolist = todolistArr.filter(function(c){
       return c[1] == "진행 중";
    });
   makeTodoDom(todolist);
}

function createDomTodoListCompleted(){
   setFilterActive('completed-filterBtn');
   flushTodoDom(); 
   var todolist = readTodo(GplusDay);
   var todolistArr = Array.from(todolist);
   
   todolist = todolistArr.filter(function(c){
       return c[1] == "완료";
    });
    makeTodoDom(todolist);   
}

function addTodo(){
   if(GplusDay == undefined || GplusDay == null){
      return alert("요일을 선택해주세요.");
   }
   var addDate = getTargetDate(GplusDay);
   var work = document.getElementById('todo-input').value;
   if(work == ""){
    return alert("할 일을 입력해주세요");
   }

   todoMap = loadTodoMap();
   var works = todoMap.get(addDate);

   if(works == undefined || works == null){   
      todoMap.set(addDate, Object.fromEntries(new Map([[work, "진행 중"]])));
      saveTodoMap(todoMap);
      createDomTodoList();
      return; 
   } 

   works = new Map(Object.entries(works));
   if(works.get(work) != undefined || works.get(work) != null){ 
       return alert("이미 진행 중인 일입니다.");
   }
   else if(works.get(work) == "완료"){ 
       return alert("이미 완료한 일입니다.");
   }
   else{
      works.set(work, "진행 중");
      todoMap.set(addDate, Object.fromEntries(works));
      saveTodoMap(todoMap);
   }
   createDomTodoList();
}

function checkTodo(event){
   var checkWork = event.target.parentElement.parentElement.firstChild.innerText;
   var checkDate = getTargetDate(GplusDay);

   todoMap = loadTodoMap();
   var works = todoMap.get(checkDate);
   works = new Map(Object.entries(works));
   works.set(checkWork, "완료");
   
   todoMap.set(checkDate, Object.fromEntries(works));
   saveTodoMap(todoMap);
      
   createDomTodoListCompleted();
}

function deleteTodo(event) {
   var delWork = event.target.parentElement.parentElement.firstChild.innerText;
   var delDate = getTargetDate(GplusDay);

   todoMap = loadTodoMap();
   var works = todoMap.get(delDate);
   works = new Map(Object.entries(works));
   works.delete(delWork);
   
   todoMap.set(delDate, Object.fromEntries(works));
   saveSaveTodoMap(todoMap);

   createDomTodoList();
}

function editTodo(event){
   var oldWork = event.target.parentElement.parentElement.firstChild.innerText;
   var newWork = prompt("새로운 일을 입력해주세요.");
   if(!newWork) return;

   var upDate = getTargetDate(GplusDay);

   todoMap = loadTodoMap();
   var works = todoMap.get(upDate);
   works = new Map(Object.entries(works));
   works.delete(oldWork);
   works.set(newWork, "진행 중");
   
   todoMap.set(upDate, Object.fromEntries(works));
   saveTodoMap(todoMap);

   createDomTodoListProgress();
}


// ============================== flush_makeDom.js ===========================
function flushTodoDom(){
  const todoContainer = document.getElementById('todo-list-container');
  while(todoContainer.firstChild)  {
   todoContainer.removeChild(todoContainer.firstChild);
  }
}

function makeTodoDom(todolist){
   var section = document.getElementById('todo-list-container');
   
   for (let entry of todolist) {
          var article = document.createElement("article");
          article.setAttribute('class', 'todo-item');
          
          var todoContent = document.createElement('div');
          todoContent.setAttribute('class', 'todo-content');
          var todoContentText = document.createElement('span');
          todoContentText.setAttribute('class', 'todo-text');
          todoContentText.innerHTML = entry[0];
          todoContent.appendChild(todoContentText);
          article.appendChild(todoContent);    
         
          var todoActions = document.createElement('div');
          todoActions.setAttribute('class', 'todo-actions');
          
          var completeBtn = document.createElement('button');
          completeBtn.innerHTML = "완료";
          completeBtn.classList.add("complete-btn");
          completeBtn.addEventListener("click", checkTodo);

          var editBtn = document.createElement('button');
          editBtn.innerHTML = "수정";
          editBtn.classList.add("edit-btn");
          editBtn.addEventListener("click", editTodo);
           
          var deleteBtn = document.createElement('button');
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