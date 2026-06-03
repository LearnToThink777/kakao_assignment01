
//===init.js====================================
var todoMap;

function onload(){
    var val;
    val =document.getElementById('current-week-range').innerHTML=date_add(currentDateToString(currentDate()),0-currentDate().getDay())+'~'+date_add(currentDateToString(currentDate()),0+(6-currentDate().getDay()));
    
    todoMap= JSON.parse(localStorage.getItem("todoMap"))|| new Map();
    const objectToMap = (obj) => new Map(Object.entries(obj));
    todoMap=objectToMap(todoMap);


    if(Object.keys(todoMap).length==0) {
      todoMap= new Map();
      console.log("새로운 저장소가 생성되었습니다.");
   }

    //console.log(todoMap);
    //todoMap.set("2020-01-01",Object.fromEntries(new Map([["do it","진행 중"]])));
    //console.log(todoMap);
    const objectFromMap = Object.fromEntries(todoMap);
    localStorage.setItem("todoMap", JSON.stringify(objectFromMap));
    
    todoMap=JSON.parse(localStorage.getItem("todoMap"));
    todoMap=objectToMap(todoMap);
    console.log(todoMap);
}

// window.addEventListener('beforeunload', (event) => {
//   // 명세에 따라 preventDefault는 호출해야하며, 기본 동작을 방지합니다.
//  localStorage.setItem('todoMap', JSON.stringify(todoMap));
//   event.preventDefault();
  
// });


//===calender.js====================================
function date_add(sDate,nDays) {
    var yy = parseInt(sDate.substr(0, 4), 10);
    var mm = parseInt(sDate.substr(5, 2), 10);
    var dd = parseInt(sDate.substr(8), 10);
    
    d = new Date(yy, mm - 1, dd + nDays);
 
    yy = d.getFullYear();
    mm = d.getMonth() + 1; mm = (mm < 10) ? '0' + mm : mm;
    dd = d.getDate(); dd = (dd < 10) ? '0' + dd : dd;
 
    return '' + yy + '-' +  mm  + '-' + dd;
}
function SpanChangePrevious(){
   var week=document.getElementById('current-week-range').innerHTML.split("~");
   var startWeek= week[0];
   var endWeek= week[1];
   var val =document.getElementById('current-week-range').innerHTML=date_add(startWeek,-7)+'~'+date_add(endWeek,-7);
}
function SpanChangeNext(){

   var week=document.getElementById('current-week-range').innerHTML.split("~");
   var startWeek= week[0];
   var endWeek= week[1];
   var val =document.getElementById('current-week-range').innerHTML=date_add(startWeek,+7)+'~'+date_add(endWeek,+7);
}


function currentDateToString(Date){
    var d;
    d= Date;

    yy = d.getFullYear();
    mm = d.getMonth() + 1; mm = (mm < 10) ? '0' + mm : mm;
    dd = d.getDate(); dd = (dd < 10) ? '0' + dd : dd;
 
    return '' + yy + '-' +  mm  + '-' + dd;

}
function currentDate(){
    return new Date();
}


//============DomManage.js===========


var GplusDay=null;
function selectDay(Day){
   GplusDay=Day;

   const elementWeek = document.getElementById('weekly-calender');
   //console.log(elementWeek.children.length);
   for (let i=0;i<elementWeek.children.length;i++){
      if(i==Day){
         elementWeek.children[i].style.background='rgb(' + 217 + ',' + 135 + ',' + 239 + ')';
         continue;
      }
      elementWeek.children[i].style.background='rgb(' + 238 + ',' + 235 + ',' + 235 + ')';
   }
   createDomTodoList();
}

function readTodo(plusDay){
   var week=document.getElementById('current-week-range').innerHTML.split("~");
   var startWeek= week[0];
   var readDate=date_add(startWeek,plusDay);
   
   //console.log("읽는 날짜: "+readDate);
   todoMap= JSON.parse(localStorage.getItem("todoMap"))|| new Map();
   const objectToMap = (obj) => new Map(Object.entries(obj));
   todoMap=objectToMap(todoMap);
   // console.log(todoMap)
   // console.log(todoMap.get(readDate));
   // console.log(objectToMap(todoMap.get(readDate)));
   return objectToMap(todoMap.get(readDate));
}


function changeFilterColor(){
   console.log(document.getElementsByClassName('all-filterBtn'));
   document.getElementsByClassName('all-filterBtn')[0].style.background="rgb(" + 238 + "," + 235 + "," + 235 + ")";
   document.getElementsByClassName('all-filterBtn')[0].style.color="black";
   document.getElementsByClassName('active-filterBtn')[0].style.background="rgb(" + 238 + "," + 235 + "," + 235 + ")";
    document.getElementsByClassName('active-filterBtn')[0].style.color="black";
   document.getElementsByClassName('completed-filterBtn')[0].style.background="rgb(" + 238 + "," + 235 + "," + 235 + ")";
 document.getElementsByClassName('completed-filterBtn')[0].style.color="black";
}


function createDomTodoList(){
   changeFilterColor();
   document.getElementsByClassName('all-filterBtn')[0].style.background="rgb(" + 217 + "," + 135 + "," + 239 + ")";
   document.getElementsByClassName('all-filterBtn')[0].style.color="white";

   flushTodoDom();
   var todolist= readTodo(GplusDay);
   if(todolist==undefined||todolist==null){
      return;
   }
   //console.log(typeof(todolist));
   makeTodoDom(todolist);
   //어쩄든 전체 버튼에 불이 들어오면 좋겠다.
}

function createDomTodoListProgress(){
   changeFilterColor();
   document.getElementsByClassName('active-filterBtn')[0].style.background="rgb(" + 217 + "," + 135 + "," + 239 + ")";
   document.getElementsByClassName('active-filterBtn')[0].style.color="white";
   
   flushTodoDom();
   var todolist= readTodo(GplusDay);
   var todolistArr= Array.from(todolist);
   
   todolist=todolistArr.filter(function(c){
       return c[1]=="진행 중" 
    })
   //console.log(typeof(todolist)); 
   makeTodoDom(todolist);
}

function createDomTodoListCompleted(){
   changeFilterColor();
   document.getElementsByClassName('completed-filterBtn')[0].style.background="rgb(" + 217 + "," + 135 + "," + 239 + ")";
   document.getElementsByClassName('completed-filterBtn')[0].style.color="white";


   flushTodoDom(); 
   var todolist= readTodo(GplusDay);
    var todolistArr= Array.from(todolist);
    todolist=todolistArr.filter(function(c){
       return c[1]=="완료" 
    })
    makeTodoDom(todolist);   
}


function addTodo(){
   var week=document.getElementById('current-week-range').innerHTML.split("~");
   var startWeek= week[0];
   if(GplusDay==undefined||GplusDay==null){
      return alert("요일을 선택해주세요.") //
      //이 이후에 input의 placeholder 입력 파트가 빈 공백으로 다시 업데이트 되어야 하는데 아직 구현이 안되어있다.
   }
   var addDate= date_add(startWeek, GplusDay);
   var work=document.getElementById('todo-input').value;
   if(work==""){
    return alert("할 일을 입력해주세요")
   }

   todoMap= JSON.parse(localStorage.getItem("todoMap"))|| new Map();
   const objectToMap = (obj) => new Map(Object.entries(obj));
   todoMap=objectToMap(todoMap);
   console.log(todoMap);
   console.log(todoMap.get(addDate)); 

   var works=todoMap.get(addDate);
   if(works==undefined||works==null){   //할일 목록 조차 없음   
      todoMap.set(addDate, Object.fromEntries(new Map([[work,"진행 중"]])));

      const objectFromMap = Object.fromEntries(todoMap);
      console.log(objectFromMap)
      localStorage.setItem("todoMap", JSON.stringify(objectFromMap));

      console.log("디버깅-할일 추가(새로 생김)");
      todoMap= JSON.parse(localStorage.getItem("todoMap"))|| new Map();
      const objectToMap = (obj) => new Map(Object.entries(obj));
      todoMap=objectToMap(todoMap);
      console.log(todoMap);

      console.log("======================\n")
      createDomTodoList();
      return; 
   } 

   works=objectToMap(works);
   if(works.get(work)!=undefined||works.get(work)!=null){ 
       return alert("이미 진행 중인 일입니다.")
   }
   else if(works.get(work)=="완료"){ 
       return alert("이미 완료한 일입니다.")
   }
   else{
      works.set(work,"진행 중")
      todoMap.set(addDate,Object.fromEntries(works));
      
      const objectFromMap = Object.fromEntries(todoMap);
      localStorage.setItem("todoMap", JSON.stringify(objectFromMap));

      console.log("디버깅-할일 추가(기존)");
      todoMap= JSON.parse(localStorage.getItem("todoMap"))|| new Map();
      const objectToMap = (obj) => new Map(Object.entries(obj));
      todoMap=objectToMap(todoMap);
      console.log(todoMap);
      
   }
   createDomTodoList();//할 일을 추가한 이후에는 전체 화면으로 넘어가면 좋겠다.
}



function checkTodo(event){
   console.log("완료 호출");
   console.dir(event.target.parentElement.parentElement.firstChild.innerText);
   var checkWork= event.target.parentElement.parentElement.firstChild.innerText;
     
   var week=document.getElementById('current-week-range').innerHTML.split("~");
   var startWeek= week[0];
   var checkDate= date_add(startWeek, GplusDay);


   todoMap= JSON.parse(localStorage.getItem("todoMap"))|| new Map();
   const objectToMap = (obj) => new Map(Object.entries(obj));
   todoMap=objectToMap(todoMap);
   


   var works=todoMap.get(checkDate);
   works=objectToMap(works);
   works.set(checkWork,"완료");
   //console.log(works);
   todoMap.set(checkDate,Object.fromEntries(works)); // 불필요한 코드일 수는 있다.
   
   const objectFromMap = Object.fromEntries(todoMap);
   localStorage.setItem("todoMap", JSON.stringify(objectFromMap));

      
   createDomTodoListCompleted(); // 자동으로 완료목록 화면으로 넘어가면 좋을 것 같다.
}
function deleteTodo(event) {
   console.log("삭제 호출");
   console.dir(event.target.parentElement.parentElement.firstChild.innerText);
   //console.log(event.target.parentElement);

   var delWork= event.target.parentElement.parentElement.firstChild.innerText;
   
   var week=document.getElementById('current-week-range').innerHTML.split("~");
   var startWeek= week[0];
   var delDate= date_add(startWeek, GplusDay);

   todoMap= JSON.parse(localStorage.getItem("todoMap"))|| new Map();
   const objectToMap = (obj) => new Map(Object.entries(obj));
   todoMap=objectToMap(todoMap);

   var works=todoMap.get(delDate);
   works=objectToMap(works);
   works.delete(delWork);
   todoMap.set(delDate,Object.fromEntries(works)); // 불필요한 코드일 수는 있다.

   const objectFromMap = Object.fromEntries(todoMap);
   localStorage.setItem("todoMap", JSON.stringify(objectFromMap));


   createDomTodoList();//삭제 이후에는 전체 화면으로 넘어가면 좋겠다.
}

function editTodo(event){
 console.log("수정 호출");
  console.dir(event.target.parentElement.parentElement.firstChild.innerText);
   var oldWork= event.target.parentElement.parentElement.firstChild.innerText;
   var newWork=prompt("새로운 일을 입력해주세요.")
   

   var week=document.getElementById('current-week-range').innerHTML.split("~");
   var startWeek= week[0];
   var upDate= date_add(startWeek, GplusDay);

   todoMap= JSON.parse(localStorage.getItem("todoMap"))|| new Map();
   const objectToMap = (obj) => new Map(Object.entries(obj));
   todoMap=objectToMap(todoMap);

   var works=todoMap.get(upDate);
   works=objectToMap(works);
   works.delete(oldWork);
   works.set(newWork,"진행 중")  //키 중복을 알아서 뭔가 검사 해주나?(키가 없으면 넣고 있으면 변경?)
   todoMap.set(upDate,Object.fromEntries(works));

   const objectFromMap = Object.fromEntries(todoMap);
   localStorage.setItem("todoMap", JSON.stringify(objectFromMap));

   createDomTodoListProgress(); //수정 이후에는 진행중 화면으로 자동 넘어가면 좋겠다.
}




//==============================flush_makeDom.js===========================


function flushTodoDom(){
  const todoContainer = document.getElementById('todo-list-container');
  while(todoContainer.firstChild)  {
   //console.log(todoContainer.firstChild); 
   todoContainer.removeChild(todoContainer.firstChild);
  }
}

function makeTodoDom(todolist){
   
   var section=document.getElementById('todo-list-container')
   
   //console.log(todolist.length); //어떤 거는 undefined인데..
    for (let entry of todolist) {
         var article=document.createElement("article");
         article.setAttribute('class','todo-item')
         
         var todoContent=document.createElement('div');
         todoContent.setAttribute('class','todo-content');
         var todoContentText= document.createElement('span');
         todoContentText.setAttribute('class','todo-text');
         todoContentText.innerHTML=entry[0];
         todoContent.appendChild(todoContentText);
         article.appendChild(todoContent);    
        
         var todoActions=document.createElement('div');
         todoActions.setAttribute('class','todo-actions');
         var completeBtn= document.createElement('button');
         completeBtn.innerHTML="완료"
         completeBtn.classList.add("complete-btn")
         //completeBtn.setAttribute('onclick',`checkTodo()`);
         completeBtn.addEventListener("click",checkTodo);



         var editBtn= document.createElement('button');
         editBtn.innerHTML="수정"
         editBtn.classList.add("edit-btn")
         //editBtn.setAttribute('onclick',`editTodo()`);
         editBtn.addEventListener("click",editTodo);
          
         var deleteBtn= document.createElement('button');
         deleteBtn.innerHTML="삭제"
         deleteBtn.classList.add("delete-btn")
         //deleteBtn.setAttribute('onclick',`deleteTodo()`);
         deleteBtn.addEventListener("click", deleteTodo);
         
         todoActions.appendChild(completeBtn);
         todoActions.appendChild(editBtn);
         todoActions.appendChild(deleteBtn);
         article.appendChild(todoActions);
         section.appendChild(article);  
   }
}

