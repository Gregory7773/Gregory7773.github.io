'use strict';

$(document).ready(function(){



var tasks = [];
var rows_per_page = 5;
var element_index_on_first_row = 0;
var element_index_on_last_row = rows_per_page;

var sort_name_index = 0;
var sort_priority_index = 0;
var sort_done_index = 0;

var UserInterface = (function(){

  return{
    addTasks: (tasks,number_of_tasks=1) =>{
      for(var counter = 0;counter<number_of_tasks;counter++){
        var text = `
        <div class ="task-row">
          <div class = "task-name">${ tasks[counter].name }</div>
          <svg class = "delete-icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 26 26" version="1.1" >
          <g id="surface1">
          <path style=" " d="M 11.5 -0.03125 C 9.542969 -0.03125 7.96875 1.59375 7.96875 3.5625 L 7.96875 4 L 4 4 C 3.449219 4 3 4.449219 3 5 L 3 6 L 2 6 L 2 8 L 4 8 L 4 23 C 4 24.644531 5.355469 26 7 26 L 19 26 C 20.644531 26 22 24.644531 22 23 L 22 8 L 24 8 L 24 6 L 23 6 L 23 5 C 23 4.449219 22.550781 4 22 4 L 18.03125 4 L 18.03125 3.5625 C 18.03125 1.59375 16.457031 -0.03125 14.5 -0.03125 Z M 11.5 2.03125 L 14.5 2.03125 C 15.304688 2.03125 15.96875 2.6875 15.96875 3.5625 L 15.96875 4 L 10.03125 4 L 10.03125 3.5625 C 10.03125 2.6875 10.695313 2.03125 11.5 2.03125 Z M 6 8 L 11.125 8 C 11.25 8.011719 11.371094 8.03125 11.5 8.03125 L 14.5 8.03125 C 14.628906 8.03125 14.75 8.011719 14.875 8 L 20 8 L 20 23 C 20 23.5625 19.5625 24 19 24 L 7 24 C 6.4375 24 6 23.5625 6 23 Z M 8 10 L 8 22 L 10 22 L 10 10 Z M 12 10 L 12 22 L 14 22 L 14 10 Z M 16 10 L 16 22 L 18 22 L 18 10 Z "/>
          </g>
          </svg>
          <div class = "task-priority">${ tasks[counter].priority }</div>
          <div class = "task-done">
            <label class = "custom-checkbox">
              <input type = "checkbox" ${ tasks[counter].done } id="done-checkbox">
              <span></span>
            </label>
          </div>
        </div>
        `
        number_of_tasks == 1 ? $(".tasks-wrapper").prepend(text) : $(".tasks-wrapper").append(text);
      }

      element_index_on_first_row = 0;
      element_index_on_last_row = rows_per_page;
    },
    updateVisibleTasks: (first,last) => {
      $(".task-row").css({"display":"none"});
      for(first;first<last;first++){
        $(".task-row").eq(first).css({"display":"block"});
      }
    },
    changeNextPageArrows: () => {
      if(element_index_on_first_row == 0){
        $('.left').css({"borderColor":"gray"});
      }
      else{
        $('.left').css({"borderColor":"black"});
      }
      if(element_index_on_last_row >= tasks.length){
        $('.right').css({"borderColor":"gray"});
      }
      else{
        $('.right').css({"borderColor":"black"});
      }
    },
    setTaskWrapperHeight: (rows) =>{
      if($(window).height()>740){
        $('.tasks-wrapper').css({height:rows*6+'vh'});
      }
      else{
        $('.tasks-wrapper').css({height:rows*11+'vh'});
      }
    },
    removeTask: (index) =>{$('.task-row').eq(index).remove();},
    clearTasksWrapper: () =>{$('.tasks-wrapper').empty()},
    sortingAppliedIndicator: (element,sort_index) => {
      if(sort_index == 1 || sort_index == 2){
        $(element).css({'backgroundColor':'#7d7d7d'});
      }
      else{
        $(element).css({'backgroundColor':'#494430'});
      }
    }
  }
})();




var ObjectManaging = (function(){

  class Task{
    constructor(name,priority,done=''){
      this.name = name;
      this.priority = priority;
      this.done = done;
    }
    static compareByStrings(property,way_of_sorting){
      if(way_of_sorting == 1){
        return function(a,b){
          if(a[property]<b[property]) return -1;
          if(a[property]>b[property]) return 1;
          return 0;
        }
      }
      return function(a,b){
        if(b[property]<a[property]) return -1;
        if(b[property]>a[property]) return 1;
        return 0;
      }
    }
    static compareByNumbers(mapProrities,way_of_sorting){
      if(way_of_sorting ==1){
        return function(a,b){
          return(mapProrities[b.priority]-mapProrities[a.priority])
        }
      }
      return function(a,b){
        return(mapProrities[a.priority]-mapProrities[b.priority])
    }
  }
    changeCheckBox(){
      this.done == '' ? this.done = 'checked':this.done = '';
    }
  }
  return{
  addTask: (name,priority) =>{tasks.unshift(new Task(name,priority))},
  removeTask:(index) =>{tasks.splice(index,1)},
  updateStorage: () => {localStorage.setItem('tasks',JSON.stringify(tasks))},
  loadTasksFromStorage: () => {
    if(localStorage.getItem('tasks') === null){
      return;
    }
    else{
      var string_tasks = JSON.parse(localStorage.getItem('tasks'));
      string_tasks.forEach((element) =>{
        tasks.push(new Task(element.name,element.priority,element.done));
      })
    }
  },
  changeCheckBoxValue: (task_index) => {
    tasks[task_index].changeCheckBox();
  },
  sortNameAndDone: (property,way_of_sorting) => {
    var sortedTasks = [];
    tasks.forEach((element)=>{
      sortedTasks.push(element);
    });
    sortedTasks.sort(Task.compareByStrings(property,way_of_sorting));
    return sortedTasks;
  },
  sortPriorities: (way_of_sorting) =>{
    var sortedTasks = [];
    tasks.forEach((element)=>{
      sortedTasks.push(element);
    });
    var mapProrities = {
      Low:1,
      Medium:2,
      High:3
    };

    sortedTasks.sort(Task.compareByNumbers(mapProrities,way_of_sorting));
    return sortedTasks;
}
  }
})();




var Controller = (function(ObjectManaging,UserInterface){


  ObjectManaging.loadTasksFromStorage();
  UserInterface.addTasks(tasks,tasks.length);
  UserInterface.updateVisibleTasks(element_index_on_first_row,element_index_on_last_row);
  UserInterface.changeNextPageArrows();


  $('.add-rows').click(function(){
    $('.add-rows-form').css({'visibility':'visible'});
  })

  $('.name').click(function(){
    sort_priority_index = 0;
    sort_done_index = 0;
    UserInterface.sortingAppliedIndicator('.done',sort_done_index);
    UserInterface.sortingAppliedIndicator('.priority',sort_priority_index);
    if(sort_name_index ==2){
      sort_name_index =0;
      UserInterface.clearTasksWrapper();
      UserInterface.addTasks(tasks,tasks.length);
      UserInterface.updateVisibleTasks(element_index_on_first_row,element_index_on_last_row);
      UserInterface.changeNextPageArrows();
      UserInterface.sortingAppliedIndicator(this,sort_name_index);
      return;
    }
    sort_name_index++;
    var sortedTasks = ObjectManaging.sortNameAndDone(this.className,sort_name_index);
    UserInterface.clearTasksWrapper();
    UserInterface.addTasks(sortedTasks,tasks.length);
    UserInterface.updateVisibleTasks(element_index_on_first_row,element_index_on_last_row);
    UserInterface.changeNextPageArrows();
    UserInterface.sortingAppliedIndicator(this,sort_name_index);
  });

  $('.priority').click(function(){
    sort_name_index = 0;
    sort_done_index = 0;
    UserInterface.sortingAppliedIndicator('.name',sort_name_index);
    UserInterface.sortingAppliedIndicator('.done',sort_done_index);
    if(sort_priority_index ==2){
      sort_priority_index =0;
      UserInterface.clearTasksWrapper();
      UserInterface.addTasks(tasks,tasks.length);
      UserInterface.updateVisibleTasks(element_index_on_first_row,element_index_on_last_row);
      UserInterface.changeNextPageArrows();
      UserInterface.sortingAppliedIndicator(this,sort_priority_index);
      return;
    }
    sort_priority_index++;
    var sortedTasks = ObjectManaging.sortPriorities(sort_priority_index);
    UserInterface.clearTasksWrapper();
    UserInterface.addTasks(sortedTasks,tasks.length);
    UserInterface.updateVisibleTasks(element_index_on_first_row,element_index_on_last_row);
    UserInterface.changeNextPageArrows();
    UserInterface.sortingAppliedIndicator(this,sort_priority_index);
  });

  $('.done').click(function(){
    sort_name_index = 0;
    sort_priority_index = 0;
    UserInterface.sortingAppliedIndicator('.name',sort_name_index);
    UserInterface.sortingAppliedIndicator('.priority',sort_priority_index);
    if(sort_done_index ==2){
      sort_done_index =0;
      UserInterface.clearTasksWrapper();
      UserInterface.addTasks(tasks,tasks.length);
      UserInterface.updateVisibleTasks(element_index_on_first_row,element_index_on_last_row);
      UserInterface.changeNextPageArrows();
      UserInterface.sortingAppliedIndicator('.done',sort_done_index);
      return;
    }
    sort_done_index++;
    var sortedTasks = ObjectManaging.sortNameAndDone(this.className,sort_done_index);
    UserInterface.clearTasksWrapper();
    UserInterface.addTasks(sortedTasks,tasks.length);
    UserInterface.updateVisibleTasks(element_index_on_first_row,element_index_on_last_row);
    UserInterface.changeNextPageArrows();
    UserInterface.sortingAppliedIndicator('.done',sort_done_index);
  });

  $('.tasks-wrapper').on('change','#done-checkbox',function(){
    var index = $(this).parents().eq(2).index();
    ObjectManaging.changeCheckBoxValue(index);
    ObjectManaging.updateStorage();

  });
  $('.tasks-wrapper').on('click','.delete-icon',function(){
    var index = $(this).parent().index();
    ObjectManaging.removeTask(index);
    ObjectManaging.updateStorage();
    UserInterface.removeTask(index);
    UserInterface.updateVisibleTasks(element_index_on_first_row,element_index_on_last_row);
    UserInterface.changeNextPageArrows();
  });

  $("button[name='add-task-button']").click(function(){
    var name = $("input[name='task-name']").val();
    var priority = $("select[name='task-priority']").val();
    ObjectManaging.addTask(name,priority);
    ObjectManaging.updateStorage();
    UserInterface.addTasks(tasks);
    UserInterface.updateVisibleTasks(element_index_on_first_row,element_index_on_last_row);
    UserInterface.changeNextPageArrows();
    $('.add-rows-form').css({'visibility':'hidden'});
  });

  $(".right").click(function(){
    if(element_index_on_last_row >= tasks.length){
      return;
    }
    element_index_on_last_row += rows_per_page;
    element_index_on_first_row += rows_per_page;
    UserInterface.updateVisibleTasks(element_index_on_first_row,element_index_on_last_row);
    UserInterface.changeNextPageArrows();
  });

  $(".left").click(function(){
    if(element_index_on_first_row == 0){
      return;
    }
    element_index_on_last_row -= rows_per_page;
    element_index_on_first_row -= rows_per_page;
    UserInterface.updateVisibleTasks(element_index_on_first_row,element_index_on_last_row);
    UserInterface.changeNextPageArrows();
  });

  $("select[name='rows-per-page']").change(function(){
    rows_per_page = Number($("select[name='rows-per-page']").val());
    element_index_on_first_row = 0;
    element_index_on_last_row = rows_per_page;
    UserInterface.updateVisibleTasks(element_index_on_first_row,element_index_on_last_row);
    UserInterface.changeNextPageArrows();
    UserInterface.setTaskWrapperHeight(rows_per_page);
  });



return{

}
})(ObjectManaging,UserInterface);


});
