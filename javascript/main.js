'use strict';

$(document).ready(function(){


//global variables
var tasks = [];
var rows_per_page = 5;
//index of first row on page, it's used in page changing
var element_index_on_first_row = 0;
var element_index_on_last_row = rows_per_page;
/*sorting indexes used to check how many times headers have been clicked
if 0 => sorting not applied
   1 => sort ascending
   2 => sort descending
*/
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
    //set the tasks wrapper height when user selects number of rows per page
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
    //apply style on sorted headers
    sortingAppliedIndicator: (element,sort_index) => {
      if(sort_index == 0){
        $(element).css({'backgroundColor':'#494430'});
      }
      else{
        $(element).css({'backgroundColor':'#7d7d7d'});
      }
    },
    updateVisibleRowsSign: () =>{
      var last_visible_row;
      if(element_index_on_first_row+rows_per_page>tasks.length){
        last_visible_row = element_index_on_first_row+(tasks.length%rows_per_page);
      }
      else{
        last_visible_row = element_index_on_first_row+rows_per_page;
      }
      var html_string = (element_index_on_first_row+1)+'-'+last_visible_row+' of '+tasks.length;
      $('.visible-rows').html(html_string);
    },
    getNameInput: () => {
      return $("input[name='task-name']").val();
    },
    getPriorityInput: () => {
      return $("select[name='task-priority']").val();
    },
    clearInput: () => {
      $("input[name='task-name']").val('');
    },
    closeForm: () => {
      $('.add-rows-form-container').css({'opacity':'0','visibility':'hidden'});
    },
    openForm:() =>{
      $('.add-rows-form-container').css({'opacity':'1','visibility':'visible'});
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
          return(mapProrities[a.priority]-mapProrities[b.priority])
        }
      }
      return function(a,b){
        return(mapProrities[b.priority]-mapProrities[a.priority])
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




var Controller = (function(ObjMan,UserInt){

  //load initial methods
  ObjMan.loadTasksFromStorage();
  UserInt.addTasks(tasks,tasks.length);
  UserInt.updateVisibleTasks(element_index_on_first_row,element_index_on_last_row);
  UserInt.changeNextPageArrows();
  UserInt.updateVisibleRowsSign();

  //wrap repeating methods in functions
  var userInterfaceSortingMethods = function(element,sorted_tasks,sort_index){
    UserInt.clearTasksWrapper();
    UserInt.addTasks(sorted_tasks,tasks.length);
    UserInt.updateVisibleTasks(element_index_on_first_row,element_index_on_last_row);
    UserInt.changeNextPageArrows();
    UserInt.sortingAppliedIndicator(element,sort_index);
  };

  var updateTasks_Range_Arrows = function(){
    UserInt.updateVisibleTasks(element_index_on_first_row,element_index_on_last_row);
    UserInt.changeNextPageArrows();
    UserInt.updateVisibleRowsSign();
  };

  $('.open-form').click(function(){
    UserInt.openForm();
  });

//sorting events
  $('.name').click(function(){
    //cancel sorting on remaining columns
    sort_priority_index = 0;
    sort_done_index = 0;
    UserInt.sortingAppliedIndicator('.done',sort_done_index);
    UserInt.sortingAppliedIndicator('.priority',sort_priority_index);
    if(sort_name_index ==2){
      sort_name_index =0;
      userInterfaceSortingMethods(this,tasks,sort_name_index);
      return;
    }
    sort_name_index++;
    var sortedTasks = ObjMan.sortNameAndDone(this.className,sort_name_index);
    userInterfaceSortingMethods(this,sortedTasks,sort_name_index);
  });

  $('.priority').click(function(){
    sort_name_index = 0;
    sort_done_index = 0;
    UserInt.sortingAppliedIndicator('.name',sort_name_index);
    UserInt.sortingAppliedIndicator('.done',sort_done_index);
    if(sort_priority_index ==2){
      sort_priority_index =0;
      userInterfaceSortingMethods(this,tasks,sort_priority_index);
      return;
    }
    sort_priority_index++;
    var sortedTasks = ObjMan.sortPriorities(sort_priority_index);
    userInterfaceSortingMethods(this,sortedTasks,sort_priority_index);
  });

  $('.done').click(function(){
    sort_name_index = 0;
    sort_priority_index = 0;
    UserInt.sortingAppliedIndicator('.name',sort_name_index);
    UserInt.sortingAppliedIndicator('.priority',sort_priority_index);
    if(sort_done_index ==2){
      sort_done_index =0;
      userInterfaceSortingMethods(this,tasks,sort_done_index);
      return;
    }
    sort_done_index++;
    var sortedTasks = ObjMan.sortNameAndDone(this.className,sort_done_index);
    userInterfaceSortingMethods(this,sortedTasks,sort_done_index);
  });
  //change checkbox
  $('.tasks-wrapper').on('change','#done-checkbox',function(){
    var index = $(this).parents().eq(2).index();
    ObjMan.changeCheckBoxValue(index);
    ObjMan.updateStorage();

  });
  //delete task
  $('.tasks-wrapper').on('click','.delete-icon',function(){
    var index = $(this).parent().index();
    ObjMan.removeTask(index);
    ObjMan.updateStorage();
    UserInt.removeTask(index);
    updateTasks_Range_Arrows();
  });

  $("button[name='add-task-button']").click(function(){
    if($('input[name="task-name"]').val() != ''){
      var name = UserInt.getNameInput();
      var priority = UserInt.getPriorityInput();
      ObjMan.addTask(name,priority);
      ObjMan.updateStorage();
      UserInt.addTasks(tasks);
      updateTasks_Range_Arrows();
      UserInt.clearInput();
      UserInt.closeForm();
    }
  });
  //change the page
  $(".right").click(function(){
    if(element_index_on_last_row >= tasks.length){
      return;
    }
    element_index_on_last_row += rows_per_page;
    element_index_on_first_row += rows_per_page;
    updateTasks_Range_Arrows();
  });

  $(".left").click(function(){
    if(element_index_on_first_row == 0){
      return;
    }
    element_index_on_last_row -= rows_per_page;
    element_index_on_first_row -= rows_per_page;
    updateTasks_Range_Arrows();
  });

  $("select[name='rows-per-page']").change(function(){
    rows_per_page = Number($("select[name='rows-per-page']").val());
    element_index_on_first_row = 0;
    element_index_on_last_row = rows_per_page;
    UserInt.setTaskWrapperHeight(rows_per_page);
    updateTasks_Range_Arrows();
  });
  $('.close-form').click(function(){
    UserInt.closeForm();
  })


})(ObjectManaging,UserInterface);


});
