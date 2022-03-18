const datasetModule = require('./dataset.js');
import View from './view.js';
import SynchronizingPresenter from './presenter.js';
import { Modal } from 'bootstrap';
import { format } from 'date-fns';
import { isSameDay } from 'date-fns';
import { endOfDay } from 'date-fns';
import { startOfDay } from 'date-fns';
import './style.css';
import './assets/font-awesome/js/all.js';

import { ApplicationView } from './app-view.js';
const { toHTML } = require(`./string-to-html.js`);


//Check for localStorage
//code from: https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
function storageAvailable(type) {
    var storage;
    try {
        storage = window[type];
        var x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch(e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            (storage && storage.length !== 0);
    }
}

//applicationLoader
var toDoApp = {
	config: { storageLoc: "toDoApp", },

	load: function(){
		if(storageAvailable('localStorage')){
			let toDoAppData = localStorage.getItem(this.config.storageLoc);
			console.log({ toDoAppData });
			if(toDoAppData){
				let parsedData = JSON.parse(toDoAppData);
				console.log(parsedData);
				datasetModule.eachDataset(dataset => {
					if(parsedData[dataset.name]){
						dataset.load(parsedData[dataset.name]);
					}
				});
			}
		}
	},

	save: function(){
		if(storageAvailable('localStorage')){
			let toDoAppData = {};
			datasetModule.eachDataset(dataset => {
				toDoAppData[dataset.name] = dataset.dump();
			});

			localStorage.setItem(this.config.storageLoc, JSON.stringify(toDoAppData));
		}
	},

	clearData: function(){
		if(storageAvailable('localStorage')){
			localStorage.removeItem(this.config.storageLoc);
		}
	},
};


//Project, Projects
var Project = function(args = {}) {
	this.title = args.title || "new project";
	this.description = args.description || "";
};
Project.prototype = Object.create( datasetModule.datasetItem );

var Projects = new datasetModule.Dataset("Projects", Project);

//Item, Items
var Item = function(args = {}) {
	this.title = args.title || "new item";
	this.description = args.description || "";
	this.date = args.date || Date.now();
	this.priority = args.priority || 0; //low to high: 0 to 4
	/*
	this.isAllDay = false;
	this.startTime = this.isAllDay ? "00:00" : args.startTime; //if no time is given, treat as all-day
	this.endTime = this.isAllDay ? "23:59" : args.endTime;
	*/
	this.isComplete = args.isComplete || false;
	/* recurring
	this.isRecurring = args.isRecurring || false;
	this.recurs = ""; //daily, weekly, monthly, annually
	*/
};
Item.prototype = Object.create( datasetModule.datasetItem );

var Items = new datasetModule.Dataset("Items", Item);

var Note = function(args = {}){
	this.text = args.text;
}
Note.prototype = Object.create(datasetModule.datasetItem);
var Notes = new datasetModule.Dataset("Notes", Note);

//Create associations
datasetModule.setAssociation(Project, { hasMany: Item });
datasetModule.setAssociation(Item, { belongsTo: Project });
datasetModule.setAssociation(Item, { hasMany: Note });
datasetModule.setAssociation(Note, { belongsTo: Item });
//Seed code

var seedData = function() {
	var myProject = Projects.create({ title: "Project 1",
				      description: "this is my first project", });

	var mySecondProject = Projects.create({ title: "Project 2", 
					    description: "this is my second project", });
	var itemData = [{title: "wash the dishes", description: "wash by hand", projectId: myProject.id },
			{title: "go to susan's b-day party", description: "at Susan's house", date: new Date('February 13, 2022 18:00:00'), projectId: myProject.id},
			{title: "eat a sandwich", description: "Preferrably a blt", projectId: myProject.id }]

	itemData.forEach(d => Items.create(d));
};



//UI components
var components = {

	createInput: function(args){//{ type = text, name, label, [placeholder, min, max] }
		let input = document.createElement("input");
		input.type = args.type || "text";
		input.name = args.name;
		input.id = args.name;
		input.className = "form-control";

		if(input.type == "text"){
			input.setAttribute("placeholder", args.placeholder);
		}else if(input.type == "number"){
			args.min && input.setAttribute("min", args.min);
			args.max && input.setAttribute("max", args.max);
		}

		let label = document.createElement("label");
		label.setAttribute("for", args.name);
		label.innerHTML = args.label;
		label.className = "col-form-label";

		let fieldContainer = document.createElement("div");
		fieldContainer.appendChild(label);
		fieldContainer.appendChild(input);

		return fieldContainer; 
	},

	modal: function(title, modalContent, optArgs){
		let procButtonText = optArgs.procButtonText || "Create";
		let cancelButtonText = optArgs.cancelButtonText || "Close";

		let modal = toHTML('<div class="modal" tabindex="-1">' +
								'<div class="modal-dialog">' +
									'<div class="modal-content">' +
										'<div class="modal-header">' +
											`<h5 class="modal-title">${title}</h5>` +
										`</div>` +
										`<div class="modal-body"></div>` + //modalContent goes here
										`<div class="modal-footer">` +
											`<button class="btn btn-secondary" data-bs-dismiss="modal">${cancelButtonText}</button>` +
											`<button id="modal-save-btn" class="btn btn-primary" data-bs-dismiss="modal">${procButtonText}</button>` +
										`</div>` +
									`</div>` +
								`</div>` +
							`</div>`);

		let contentContainer = modal.querySelector('.modal-body');
		contentContainer.appendChild(modalContent);

		return modal;
	},

	button: function(str, opts = { className: "btn-primary" }) {
		let btn = document.createElement("button");
		btn.className = "btn";
		if(opts.className){ 
			opts.className.split(' ').forEach(c => btn.classList.add(c)); 
		};
		btn.innerHTML = str;
		return btn;
	},

	icon: function(className) {
		let icon = document.createElement("span");
		icon.className = className;
		return icon; 
	}
}


var ProjectListPresenter = function(){
	Object.setPrototypeOf(this, Object.create(SynchronizingPresenter));
	this.subscribeToChanged();

	this.viewProps = { projects: {}, };

	this.beforeLoad = function(){
		Projects.all().forEach(p => {
			if(this.viewProps.projects[p.id]){
				this.viewProps.projects[p.id].checked = true;
			}else{
				this.viewProps.projects[p.id] = { model: p,
								  				  hideItems: true, 
												  checked: true, };
			}
		});

		//Remove any projects that no longer exist in DB
		Object.keys(this.viewProps.projects).forEach(pId => {
			let projectData = this.viewProps.projects[pId];
			if(!projectData.checked){
				delete this.viewProps.projects[pId];
			}
		});
	};

	this.afterLoad = function(){
		//Reset projects' checked status so they will be checked again on next load 
		Object.keys(this.viewProps.projects).forEach(pId => {
			let projectData = this.viewProps.projects[pId];
			projectData.checked = false;
		});
	}

	this.toggleHidden = function(projectId){
		this.viewProps.projects[projectId].hideItems = !this.viewProps.projects[projectId].hideItems;
	}

	this.beforeInitialize = function(){
		this.view.callbacks.toggleHidden = this.toggleHidden.bind(this);
		this.view.callbacks.showProject = ApplicationPresenter.projectView;
	}

	this.setView(new ProjectListView());
};

var ProjectListView = function(){

	this.callbacks = {};

	this._initialize = function(){
		this.container = toHTML(
				`<ul class="projects-list list-group">` +
				`</ul>`
		);

	};

	this.toggleHidden = function(){
		let targetId = this.getAttribute("data-target");
		let targetEl = document.querySelector(`#${targetId}`);
		targetEl.classList.toggle("d-none");
		this.innerHTML = this.innerHTML == "+" ? "-" : "+";
	};

	this.getItemsListId = function(projectId){
		return `project-${projectId}-items-list`;
	};

	this.createItemList = function(project){
		let elId = this.getItemsListId(project.id);
		let itemsListContainer = toHTML(
			`<ul class="items-list" id="${elId}"></ul>`
		);

		project.items.forEach(i => {
			if(!i.isComplete){
				let itemListItem = toHTML(
					`<li class="items-list__item">${i.title}</li>`
				);
				itemsListContainer.appendChild(itemListItem);
			}
		});

		return itemsListContainer;
	};

	this.load = function(viewProps){
		//this.projectListContainer.replaceChildren();
		this.container.replaceChildren();

		Object.keys(viewProps.projects).forEach(key => {
				let pObj = viewProps.projects[key];
				
				let p = pObj.model;
				let itemsListId = this.getItemsListId(p.id);
				let projectListItem = toHTML(
					`<li class="projects-list__project">` + 
						`<div class="d-flex justify-content-between">` +
							`<button class="projects-list__project-title" data-project-id="${p.id}">${p.title}</button>` +
							`<button class="projects-list__toggle-btn" data-target="${itemsListId}" data-project-id="${p.id}">` +
							`</button>` +
						`</div>` +
					`</li>`
				);
				
				let projectListTitle = projectListItem.querySelector(".projects-list__project-title");
				let showProjectView = this.callbacks.showProject;
				projectListTitle.addEventListener("click", function(){
					let pId = this.getAttribute("data-project-id");
					showProjectView(pId);
				});

				let toggleBtn = projectListItem.querySelector(".projects-list__toggle-btn");
				let toggleHidden = this.callbacks.toggleHidden;
				toggleBtn.addEventListener("click", function(){
					let targetId = this.getAttribute("data-target");
					let targetEl = document.querySelector(`#${targetId}`);
					targetEl.classList.toggle("d-none");
					this.innerHTML = this.innerHTML == "+" ? "-" : "+";
					toggleHidden(this.getAttribute("data-project-id"));
				});

				let itemsList = this.createItemList(p);
				projectListItem.appendChild(itemsList);

				if(pObj.hideItems){
					itemsList.classList.add("d-none");
					toggleBtn.innerHTML = "+";
				}else{
					toggleBtn.innerHTML = "-";
				}

				this.container.appendChild(projectListItem);
		});

		if(Object.keys(viewProps.projects).length <= 0){
			let itsEmptyNotice = toHTML(
				`<li class="projects-list__project">` + 
					`<div class="d-flex justify-content-between">` +
						`<p>No projects here!</p>` +
					`</div>` +
				`</li>`
			);
			this.container.appendChild(itsEmptyNotice);
		}
	}
};
ProjectListView.prototype = Object.create(View);

var ApplicationPresenter = (function (){
	let subpresenter = null;

	let appPresenter = Object.create(SynchronizingPresenter);
	appPresenter.viewProps = {};
	appPresenter.projectList = new ProjectListPresenter();

	appPresenter.beforeInitialize = function(){
		this.view.callbacks.showTodayView = this.todayView.bind(this);
		this.view.callbacks.showTomorrowView = this.tomorrowView.bind(this);
		this.view.callbacks.showWeekView = this.weekView.bind(this);
		this.view.callbacks.newProject = this.newProject.bind(this);
		this.view.callbacks.newItem = this.newItem.bind(this);
	}

	appPresenter.beforeLoad = function(){
		//appPresenter.viewProps.projects = Projects.all();	
		this.projectList.load();
		this.viewProps.projectListView = this.projectList.getView();
	};

	//Subviews
	appPresenter.setSubview = function(presenter){
		if(subpresenter){
			subpresenter.unload();
		}
		subpresenter = presenter;
		subpresenter.load();
		this.view.loadSubview(subpresenter.getView());
	};

	appPresenter.todayView = function(){
		appPresenter.setSubview(new DayPresenter(new Date()));
	};

	appPresenter.tomorrowView = function(){
		let tomorrowPresenter = new DayPresenter(new Date(Date.now() + (24*60*60*1000)));
		appPresenter.setSubview(tomorrowPresenter);
	};

	appPresenter.weekView = function(){
		let today = new Date();
		let oneWeekLater = new Date(Date.now() + (24*60*60*1000)*7);
		appPresenter.setSubview(new PeriodPresenter(today, oneWeekLater));
	};

	appPresenter.projectView = function(pId){
		let project = Projects.find(p => p.id === pId);
		appPresenter.setSubview(new ProjectPresenter(project));
	};

	appPresenter.itemDetailedView = function(iId){
		let item = Items.find(i => i.id === iId);
		appPresenter.setSubview(new ItemDetailedPresenter(item));
	};

	//projects getter
	appPresenter.projects = function(){
		return projects;
	};

	//User interactions
	appPresenter.newProject = function(){
		let pModalPresenter = new ModalFormPresenter(ProjectFormPresenter, { modal: { title: "New Project", }, });
		pModalPresenter.load();
		pModalPresenter.view.render();
	};

	appPresenter.newItem = function(){
		let iModalPresenter = new ModalFormPresenter(ItemFormPresenter, { modal: { title: "New Item", }});
		iModalPresenter.load();
		iModalPresenter.view.render();
	};

	return appPresenter;
})();


var ItemsPresenter = function(items){
	Object.setPrototypeOf(this, Object.create(SynchronizingPresenter));
	//this.subscribeToChanged();

	this.items = items;
	this.viewProps = {};
	this.sortBy = "date";
	this.sortOrder = "asc";

	this.showCompleted = false;
	this.toggleShowCompleted = function(){
		this.showCompleted = !this.showCompleted;
		this.reload();
	};

	this.changeSort = function(sortOpts){
		let sortChanged = false
		if(sortOpts.sortBy && this.sortBy != sortOpts.sortBy){
			this.sortBy = sortOpts.sortBy;
			sortChanged = true;
		}
		if(sortOpts.sortOrder && this.sortOrder != sortOpts.sortOrder){
			this.sortOrder = sortOpts.sortOrder;
			sortChanged = true;
		}
		if(sortChanged){
			this.reload(false); //Don't emit onChanged
		}
	};

	this.sortItems = function(){
		let sortOrder = this.sortOrder == "desc" ? -1 : 1;

		this.items.sort((a, b) => {
			if(a[this.sortBy] > b[this.sortBy]){
				return sortOrder * 1;
			}else if(a[this.sortBy] < b[this.sortBy]){
				return sortOrder * -1;
			}
			return 0;
		});	
	};

	this.beforeInitialize = function(){
		this.view.callbacks.changeSort = this.changeSort.bind(this);
		this.view.callbacks.toggleShowCompleted = this.toggleShowCompleted.bind(this);
	};

	this.beforeViewLoad = function(){
		this.sortItems();
		this.viewProps.sortBy = this.sortBy;
		this.viewProps.sortOrder = this.sortOrder;

		let itemComponents = this.items.map(i => { 
			let hide = !(this.showCompleted || !i.isComplete);
			let iPresenter = new ItemPresenter(i, { hide });
			iPresenter.load();
			return iPresenter.getView(); });
		this.viewProps.itemComponents = itemComponents;
	};

	this.setView(new ItemsView());
};

var ItemsView = function(){

	this.callbacks = {};

	this._initialize = function(title){
		this.container = toHTML(
				`<div>` +
					`<div>` +
						`<div class="row">` +
							`<div class="col">` +
								`<button class="btn btn-primary" id="show-completed-btn" data-state="show">Show Completed Items</button>` +
							`</div>` +
							`<div class="col">` +
								`<label class="form-label" for="sort-by-select">Sort By</label>` +
								`<select class="form-select" name="sortBy" id="sort-by-select">` +
									'<option value="date">Date</option>' +
									'<option value="priority">Priority</option>' +
								'</select>' +
							`</div>` +
							`<div class="col">` +
								`<label class="form-label" for="sort-order-select">Order</label>` +
								`<select class="form-select" name="sortOrder" id="sort-order-select">` +
									`<option value="desc">Descending</option>` +
									`<option value="asc">Ascending</option>` +
								`</select>` +
							`</div>` +
						`</div>` +
					`</div>` +
					`<ul class="item-pills-group" id="items-container"></ul>` +
				`</div>`);

		let toggleCallback = this.toggleShowCompleted.bind(this);
		this.toggleShowCompletedItemsButton = this.container.querySelector("#show-completed-btn");
		this.toggleShowCompletedItemsButton.addEventListener("click", function(){
			toggleCallback(this);
		})

		let changeSort = this.callbacks.changeSort;
		this.sortBySelector = this.container.querySelector("#sort-by-select");
		this.sortOrderSelector = this.container.querySelector("#sort-order-select");
		[this.sortBySelector, this.sortOrderSelector].forEach(el => {
			el.addEventListener("change", function(){
				let sortOpts = {};
				sortOpts[this.name] = this.value;
				changeSort(sortOpts);
			})
		});

		this.itemsContainer = this.container.querySelector("#items-container");
	};

	this.toggleShowCompleted = function(btn){
		let btnState = btn.getAttribute("data-state");
		if(btnState == "show"){
			btn.setAttribute("data-state", "hide");
			btn.innerHTML = "Hide Completed Items";
		}else{
			btn.setAttribute("data-state", "show");
			btn.innerHTML = "Show Completed Items";
		}
		this.callbacks.toggleShowCompleted();
	};

	this.load = function(viewProps){
		Array.from(this.sortBySelector.children).forEach(el => {
			if(el.value == viewProps.sortBy){
				el.setAttribute("selected", "");
			}else{
				el.removeAttribute("selected");
			}
		});

		Array.from(this.sortOrderSelector.children).forEach(el => {
			if(el.value == viewProps.sortOrder){
				el.setAttribute("selected", true);
			}else{
				el.setAttribute("selected", false);
			}
		});

		this.itemsContainer.replaceChildren();
		if(!!viewProps.itemComponents.length){
			viewProps.itemComponents.forEach(i => {
				this.itemsContainer.appendChild(i.container);
			});
		}
	};

	this.renderIn = function(parentEl){
		parentEl.appendChild(this.container);
	};

};
ItemsView.prototype = Object.create(View);


var ProjectPresenter = function(pObj){
	Object.setPrototypeOf(this, Object.create(SynchronizingPresenter));
	this.subscribeToChanged();

	this.projectModel = pObj;
	this.viewProps = { project: pObj };
	this.allowShowCompleted = false;

	this.items = [];
	this.itemsPresenter = new ItemsPresenter(this.items);

	this.beforeLoad = function(){
		this.items.splice(0, this.items.length);
		this.projectModel.items.forEach(i => { this.items.push(i) });

		this.itemsPresenter.load();
		this.viewProps.subview = this.itemsPresenter.getView();
		this.view.callbacks.editProject = this.editProject.bind(this);
		this.view.callbacks.addItem = this.newItem.bind(this);
		this.view.callbacks.deleteProject = this.deleteProject.bind(this);
	}

	this.editProject = function(){
		let projectData = Object.assign({ id: this.projectModel.id, }, this.projectModel);
		let modalOpts = Object.assign({ modal: { title: "Edit Project", }, }, projectData);
		let pModalPresenter = new ModalFormPresenter(ProjectFormPresenter, modalOpts); 
		pModalPresenter.load();
		pModalPresenter.view.render();
	};

	this.deleteProject = function(){
		let deleteProjFunc = function(){
				this.projectModel.destroy();
				this.emitChanged();
				this.unload();
		}.bind(this);

		let modalArgs = { title: "Confirm Delete", 
						  text: "Are you sure you want to delete this project?",
						  onProceed: deleteProjFunc,
						  modalOpts: { procButtonText: "Confirm", 
									   cancelButtonText: "Cancel", }, }

		let confirmModal = new ModalConfirmationPresenter(modalArgs);
		confirmModal.load();
		confirmModal.view.render();
	}

	this.newItem = function(){
		let modalPresenter = new ModalFormPresenter(ItemFormPresenter, { modal: { title: "New Item", }, 
									         projectId: this.projectModel.id });
		modalPresenter.load();
		modalPresenter.view.render();
	};

	this.setView(ProjectView);
};

var DayPresenter = function(date){
	Object.setPrototypeOf(this, Object.create(SynchronizingPresenter));
	this.subscribeToChanged();

	this.items = [];
	this.date = date;
	this.itemsPresenter = new ItemsPresenter(this.items);

	this.getTitle =	function(){
		let title = "";
		let today = new Date();
		let tomorrow = new Date(Date.now() + (24*60*60*1000));
		console.log({ date: this.date, today: today, tomorrow: tomorrow });
		if(isSameDay(this.date, today)){
			title = "Today";
		}else if(isSameDay(this.date, new Date(Date.now() + (24*60*60*1000)))){
			title = "Tomorrow";
		}else{
			title = format(this.date, 'EEEE, LLLL io, y');
		}

		return title;
	};

	this.viewProps = { title: this.getTitle(), };

	this.addItem = function(){
		let modalPresenter = new ModalFormPresenter(ItemFormPresenter, { modal: { title: "New Item", }, 
										 date: this.date, });
		modalPresenter.load();
		modalPresenter.view.render();
	};

	this.beforeInitialize = function(){
		this.view.callbacks.addItem = this.addItem.bind(this);
	};

	this.beforeLoad = function(){
		this.items.splice(0, this.items.length); //clear array
		Items.all().forEach(i => { 
			if(isSameDay(i.date, this.date)){
				this.items.push(i);
			}
		});
		this.itemsPresenter.load();
		this.viewProps.subview = this.itemsPresenter.getView(); 
	};

	this.createItem = function(args){
		Object.assign(args, { date: this.date });
		let item = Items.create(args);
		this.reload();
	};

	this.setView(new TemplateView());
};

var TemplateView = function(){
	this.titleEl = null;
	this.subviewContainer = null;
	this.toggleShowCompletedItemsButton = null;
	this.newItemButton = null;
	this.callbacks = {};

	this._initialize = function(){
		this.container = toHTML(
			`<div class="col-8">` + 
				`<h2 class="display-2 template-view__title"></h2>` +
				`<div class="template-view__subview"></div>` +
				`<button class="btn btn-primary template-view__item-btn">Add Item</button>` +
			`</div>`
		);

		let newItemBtn = this.container.querySelector(".template-view__item-btn");
		newItemBtn.addEventListener("click", this.callbacks.addItem);
	};

	this._clear = function(){//empty all DOM elements
		this.titleEl = null;
		this.newItemButton = null;
		this.subviewContainer = null;
		this.callbacks = { addItem: null, 
		                   toggleShowCompleted: null, };
	};

	this.load = function(viewProps){
		let titleEl = this.container.querySelector(".template-view__title");
		titleEl.innerHTML = viewProps.title;

		let subviewContainer = this.container.querySelector(".template-view__subview");
		subviewContainer.replaceChildren();
		subviewContainer.appendChild(viewProps.subview.container);
	}
}

TemplateView.prototype = Object.create(View);

var PeriodPresenter = function(startDate, endDate){
	Object.setPrototypeOf(this, Object.create(SynchronizingPresenter));
	this.subscribeToChanged();
	
	this.startDate = startDate;
	this.endDate = endDate;
	this.showCompleted = false;

	this.items = [];
	this.itemsPresenter = new ItemsPresenter(this.items);

	this.viewProps = { };
	this.viewProps.title = `${format(this.startDate, 'MM/dd')} to ${format(this.endDate, 'MM/dd')}`;

	this.addItem = function(){
		let modalPresenter = new ModalFormPresenter(ItemFormPresenter, { modal: { title: "New Item" },
										 date: this.startDate, });
		modalPresenter.load();
		modalPresenter.view.render();
	};

	this.beforeInitialize = function(){
		this.view.callbacks.addItem = this.addItem.bind(this);
	};

	this.beforeLoad = function(){
		this.items.splice(0, this.items.length);
		Items.all().forEach(i => {
			if(i.date >= startOfDay(this.startDate) &&
			   i.date <= endOfDay(this.endDate)){
				this.items.push(i);
			}
		});

		this.itemsPresenter.load();
		this.viewProps.subview = this.itemsPresenter.getView();
	};

	this.setView(new TemplateView()) //set default view;
};

var ItemFormPresenter = function(opts = {}){
	Object.setPrototypeOf(this, Object.create(SynchronizingPresenter));
	
	this.defaultValues = Object.assign({ id: "",
					     projectId: "", 
					     title: "",
			       		     date: new Date(), 
	                                     priority: 0, }, opts);

	console.log("ItemFormPresenter", this.defaultValues);
	this.viewProps = {};

	this.createOrUpdateItem = function(){
		let args = this.getFormData();
		console.log("args are:", args);
		let item = Items.find(i => i.id == this.defaultValues.id);
		if(item){
			console.log("Item exists, calling item.update");
			item.update(args);
		}else{
			console.log("Item does not exist. Creating new item.");
			Items.create(args);
		}
		this.emitChanged();
	};

	this.onSave = this.createOrUpdateItem.bind(this);

	this.beforeInitialize = function(){
	        this.view.onSave = this.createOrUpdateItem.bind(this);
	};

	this.beforeLoad = function(){
		this.viewProps = { title: this.defaultValues.title,
				   date: format(this.defaultValues.date, 'yyyy-MM-dd'),
				   priority: this.defaultValues.priority,
				   projectId: this.defaultValues.projectId, };
	};

	this.getFormData = function(){
		return this.view.getFormData();
	};

	this.setView(new ItemFormView()) //set default view;
};

var ProjectFormPresenter = function(opts = {}){
	Object.setPrototypeOf(this, Object.create(SynchronizingPresenter));
	//does not reload so does not need to subscribe to onChanged event	

	this.viewProps = Object.assign({ title: "" }, opts);

	this.createOrUpdateProject = function(){
		let args = this.getFormData();
		let project = Projects.find(p => p.id === this.viewProps.id);
		if(project){
			project.update(args);
		}else{
			Projects.create(args);
		}
		this.emitChanged();
	};

	this.onSave = this.createOrUpdateProject.bind(this);

	this.getFormData = function(){
		return this.view.getFormData();
	}

	this.setView(new ProjectFormView()) //set default view;
};

var ProjectView = (function(){
	let projectView = Object.create(View);

	projectView.callbacks = { addItem: null,
				  editProject: null };

	/* Idea for property storage
	 * 
	let properties = { project: { title: null, 
				      description: null, }, 
			   items:   [{ title: null, 
			   	       description: null, 
			   	       date: null,        }] };
	*/

	projectView._initialize = function(){//create DOM elements
		this.container = toHTML(
			`<div class="col-8">` +
				`<div class="project__header">` +
					`<div class="project__text-container">` +
						`<h2 class="display-2 project__title"></h2>` + 
						`<p class="project__description"></p>` +
					`</div>` +
					`<div class="project__controls">` +
						`<button class="project__edit-button btn btn-secondary"><i class="fa-solid fa-pencil"></i></button>` +
						`<button class="project__delete-button btn btn-danger"><i class="fa-solid fa-xmark"></i></button>` +
					`</div>` +
				`</div>` +
				`<div class="items-container">` +
				`</div>` +
				`<button class="new-item-btn btn btn-primary">Add Item</button>` +
			`</div>`
		);

		let editProjectBtn = this.container.querySelector(".project__edit-button");
		editProjectBtn.addEventListener("click", this.callbacks.editProject);

		let deleteProjectBtn = this.container.querySelector(".project__delete-button");
		deleteProjectBtn.addEventListener("click", this.callbacks.deleteProject);

		let newItemBtn = this.container.querySelector(".new-item-btn");
		newItemBtn.addEventListener("click", this.callbacks.addItem);

	};

	projectView._clear = function(){//empty all DOM elements
		console.log("Called projectView._clear");
		this.callbacks = {};
	};

	projectView.load = function(args){//load data form model into DOM
		let itemsContainer = this.container.querySelector(".items-container");
		itemsContainer.replaceChildren();

		let projectTitle = this.container.querySelector(".project__title");
		projectTitle.innerHTML = args.project.title;

		let projectDesc = this.container.querySelector(".project__description");
		projectDesc.innerHTML = args.project.description;

		itemsContainer.appendChild(args.subview.container); //ItemsView
	};


	return projectView;
})();

var ProjectFormView = function(){

	this._initialize = function(){
		this.container = document.createElement("div");
		this.titleInputContainer = components.createInput({ label: "Name", name: "title", placeholder: "Go to the store" });
		this.titleInput = this.titleInputContainer.querySelector("input");
		this.container.appendChild(this.titleInputContainer);
		this._isInitialized = true;
	};

	this.load = function(viewProps){
		this.titleInput.value = viewProps.title;
	};

	this.getFormData = function(){
		return { title: this.titleInput.value };
	};
};
ProjectFormView.prototype = Object.create(View);

var ItemFormView = function(){

	this._initialize = function(){

		this.container = toHTML(
			`<div>` +
				`<input type="hidden" name="project-id-input" id="project-id-input">` +
				`<div class="row">` +
					`<div class="col">` +
						`<label class="form-label" for="title-input">Name</label>` +
						`<input type="text" class="form-control" id="title-input" name="title" placeholder="Task name">` +
					`</div>` +
				`</div>` +
				`<div class="row">` +
					`<div class="col">` +
						`<label class="form-label" for="date-input">Date</label>` +
						`<input type="date" class="form-control" id="date-input" name="title">` +
					`</div>` +
					`<div class="col">` +
						`<label class="form-label" for="priority-input">Priority (0-4)</label>` +
						`<input type="number" class="form-control" id="priority-input" name="title" min="0" max="4">` +
					`</div>` +
				`</div>` +
			`</div>`
		);
		
	};

	this.load = function(viewProps){
		let titleInput = this.container.querySelector("#title-input");
		titleInput.value = viewProps.title;

		let dateInput = this.container.querySelector("#date-input");
		dateInput.value = viewProps.date;

		let priorityInput = this.container.querySelector("#priority-input");
		priorityInput.value = viewProps.priority;

		let projectIdInput = this.container.querySelector("#project-id-input");
		projectIdInput.value = viewProps.projectId;
	};

	this.getFormData = function(){
		console.log("ItemFormView.getFormData:");
		let titleInput = this.container.querySelector("#title-input");
		let dateInput = this.container.querySelector("#date-input");
		let priorityInput = this.container.querySelector("#priority-input");
		let projectIdInput = this.container.querySelector("#project-id-input");

		let formData =  { title: titleInput.value,
		         	  date: new Date(dateInput.value),
		         	  projectId: projectIdInput.value,
				  priority: priorityInput.value, };
		console.log(formData);
		return formData;
	};

};
ItemFormView.prototype = Object.create(View);


var ItemPresenter = function(item, opts = {}){
	Object.setPrototypeOf(this, Object.create(SynchronizingPresenter));
	
	this.itemModel = item;

	this.markComplete = function(){
		this.itemModel.isComplete = true;
		this.reload();
	};

	this.deleteItem = function(){
		let onProceedFunc = function(){
			this.itemModel.destroy();
			this.reload();
		}.bind(this);

		let args = { title: "Confirm Delete",
					 text: "Are you sure you want to delete this item?",
					 onProceed: onProceedFunc,
				     modalOpts: { procButtonText: "Delete",
					              cancelButtonText: "Cancel", },
		}

		let confirmDeleteModal = new ModalConfirmationPresenter(args);
		confirmDeleteModal.load();
		confirmDeleteModal.view.render();
	
	}

	this.showDetailedView = function(){
		ApplicationPresenter.itemDetailedView(this.itemModel.id);
	};

	this.beforeInitialize = function(){
		this.view.callbacks.showDetailedView = this.showDetailedView.bind(this);
		this.view.callbacks.deleteItem = this.deleteItem.bind(this);
	};

	this.viewProps = { title: this.itemModel.title, 
			   date: format(this.itemModel.date, 'MM/dd'),
			   priority: this.itemModel.priority, 
			   isComplete: this.itemModel.isComplete,
			   markComplete: this.markComplete.bind(this), };

	Object.assign(this.viewProps, opts);

	this.setView(new ItemView());
};


var ItemView = function(){
	this.container = null;
	this.itemTitle = null;
	this.itemDate = null;
	this.itemPriority = null;

	this.callbacks = {};

	this._initialize = function(){

		this.container = toHTML(
			`<div class="item-pill d-flex align-items-center mt-2 mb-2">` +
				//`<div class="item-pill__text-container d-flex flex-column justify-content-center">` +
				`<div class="item-pill__text-container flex-grow-1">` +
					`<div class="row">` +
						`<p class="item-pill__title fs-4"></p>` +
					`</div>` +
					//`<div class="item-pill__details d-flex justify-content-evenly">` +
					`<div class="row">` +
					`<div class="item-pill__details">` +
						`<p><i class="fa-solid fa-clock"></i><span class="item-pill__date"></span></p>` +
						`<p><i class="fa-solid fa-flag"></i><span class="item-pill__priority"></span></p>` +
					`</div>` +
					`</div>` +
				`</div>` +
				`<div class="item-pill__controls">` +
					`<button class="item-pill__edit">` +
						`<i class="fa-solid fa-pen"></i>` +
					`</button>` +
					`<button class="item-pill__delete">` +
						`<i class="fa-solid fa-xmark"></i>` +
					`</button>` +
			`</div>`);

		this.itemTitle = this.container.querySelector(".item-pill__title");
		this.itemTitle.addEventListener("click", this.callbacks.showDetailedView);

		this.itemDate = this.container.querySelector(".item-pill__date");
		this.itemPriority = this.container.querySelector(".item-pill__priority");

		this.itemDeleteBtn = this.container.querySelector(".item-pill__delete");
		this.itemDeleteBtn.addEventListener("click", this.callbacks.deleteItem);

	};

	this._markCompleteButton = function(markComplete){
		let completeBtn = document.createElement("button");
		completeBtn.className = "item-pill__mark-complete-btn btn btn-outline-success rounded-circle flex-grow-0";
		completeBtn.addEventListener("click", markComplete);
		return completeBtn; 
	};

	this.load = function(iObj){
		this.itemTitle.innerHTML = iObj.title;
		this.itemDate.innerHTML = iObj.date;
		this.itemPriority.innerHTML = iObj.priority;

		
		if(!this.completeBtn){
			this.completeBtn = this._markCompleteButton(iObj.markComplete);
			this.container.prepend(this.completeBtn);
		}

		if(iObj.isComplete){
			this.completeBtn.setAttribute("disabled", "");
			this.completeBtn.classList.remove("btn-outline-success");
			this.completeBtn.classList.add("btn-success");
		}else{
			this.completeBtn.removeAttribute("disabled");
			this.completeBtn.classList.remove("btn-success");
			this.completeBtn.classList.add("btn-outline-success");
		}

		if(iObj.hide){
			this.container.classList.add("d-none");
		}else{
			this.container.classList.remove("d-none");
		}
	};
}

ItemView.prototype = Object.create(View);

var ItemDetailedPresenter = function(item){
	Object.setPrototypeOf(this, Object.create(SynchronizingPresenter));
	this.subscribeToChanged();

	this.item = item;
	this.viewProps = {};
	
	this.editItem = function(){
		let itemOpts = Object.assign({ id: this.item.id,
			     		       projectId: this.item.projectId, }, this.item); //id and projectId currently aren't enumerable, plan to change in future
		let opts = Object.assign({ modal: { title: "Edit Item", 
				           buttonText: "Update", },
			   		 }, itemOpts);

		let itemFormModal = new ModalFormPresenter(ItemFormPresenter, opts);
		itemFormModal.load();
		itemFormModal.view.render();
	};

	this.newNote = function(){
		let noteModalForm = new ModalFormPresenter(NoteFormPresenter, { modal: { title: "New Note", }, itemId: this.item.id, });
		noteModalForm.load();
		noteModalForm.view.render();
	}

	this.beforeInitialize = function(){
		this.view.callbacks.editItem = this.editItem.bind(this);
		this.view.callbacks.newNote = this.newNote.bind(this);
	};

	this.beforeLoad = function(){
		this.viewProps = { title: this.item.title, 
		                   date: format(this.item.date, 'MM/dd'),
				   		   priority: this.item.priority, 
						   notes: this.item.notes, };
	};

	this.setView(new ItemDetailedView);
};

var ItemDetailedView = function(){
	this.callbacks = {};

	this._initialize = function(){

		this.container = toHTML(
			`<div>` +
				`<h2 id="item-title"></h2>` +
				`<div id="item-details">` +
					`<p id="item-details__date"></p>` +
					`<p id="item-details__priority"></p>` +
				`</div>` +
				`<button class="btn btn-secondary" id="item-edit-btn">Edit</button>` +
				`<div class="item-notes-container"></div>` +
				`<button class="btn btn-primary" id="item-add-note-btn">Add Note</button>` +
			`</div>`);

		this.titleEl = this.container.querySelector("#item-title");
		this.dateEl = this.container.querySelector("#item-details__date");
		this.priorityEl = this.container.querySelector("#item-details__priority");
		this.notesContainer = this.container.querySelector(".item-notes-container");

		this.editItemBtn = this.container.querySelector("#item-edit-btn");
		this.editItemBtn.addEventListener("click", this.callbacks.editItem);

		this.addNoteBtn = this.container.querySelector("#item-add-note-btn");
		this.addNoteBtn.addEventListener("click", this.callbacks.newNote);
	}

	this.load = function(viewProps){
		this.titleEl.innerHTML = viewProps.title;
		this.dateEl.innerHTML = "Date: " + viewProps.date;
		this.priorityEl.innerHTML = "Priority: " + viewProps.priority;

		this.notesContainer.replaceChildren();
		viewProps.notes.forEach(note => {
			let noteEl = document.createElement("p");
			noteEl.innerHTML = note.text;
			this.notesContainer.appendChild(noteEl);
		});
		
	}
};

ItemDetailedView.prototype = Object.create(View);

var NoteFormPresenter = function(opts = {}){
	Object.setPrototypeOf(this, Object.create(SynchronizingPresenter));

	this.viewProps = Object.assign({ text: "", }, opts);

	this.createOrUpdateNote = function(){
		let formData = this.view.getFormData();
		let note = Notes.find(n => n.id === this.viewProps.id);
		if(note){
			note.update(formData);
		}else{
			Notes.create(formData);
		}
		this.emitChanged();
	};

	this.onSave = this.createOrUpdateNote.bind(this);
	this.setView(new NoteFormView());
}

var NoteFormView = function(){
	this._initialize = function(){

		this.container = toHTML(
			`<div>` +
				`<label class="form-label" for="note-text-area">Text</label>` +
				`<textarea id="note-text-area" class="form-control" rows="3"></textarea>` +
				`<input type="hidden" id="item-id"></input>` +
			`</div>`);

		this.textArea = this.container.querySelector("#note-text-area");
		this.hiddenItemIdInput = this.container.querySelector("#item-id");
	}

	this.load = function(viewProps){
		this.textArea.innerHTML = viewProps.text;
		this.hiddenItemIdInput.value = viewProps.itemId;
	}

	this.getFormData = function(){
		return { text: this.textArea.value,
				 itemId: this.hiddenItemIdInput.value, };
	}
};
NoteFormView.prototype = Object.create(View);

var ModalView = function(){
	this.render = function(){
		document.body.appendChild(this.container);
		this.modal.show();
	};

	this.load = function(viewProps){
		let modalOpts = viewProps.modalOpts || {};
		this.container = components.modal(viewProps.title, viewProps.contentEl, modalOpts);
		this.procBtn = this.container.querySelector("#modal-save-btn");
		this.modal = new Modal(this.container);
		this.procBtn.addEventListener("click", function(e){
			viewProps.onProceed(e)
			this.modal.hide();
			this.remove();
		}.bind(this));
	}
};
ModalView.prototype = Object.create(View);


var ModalFormPresenter = function(FormPresenter, opts = {}){
	Object.setPrototypeOf(this, Object.create(SynchronizingPresenter));
	this.viewProps = {};

	this.beforeLoad = function(){
		let presenter = new FormPresenter(opts);
		presenter.load();
	
		this.viewProps.title = opts.modal && opts.modal.title || "FORM";
		this.viewProps.procButtonText = opts.modal && opts.modal.buttonText || "Save";
		this.viewProps.contentEl = presenter.getView().container;
		this.viewProps.onProceed = presenter.onSave.bind(presenter);
	};

	this.setView(new ModalView());
};

var ModalConfirmationPresenter = function(opts){
	Object.setPrototypeOf(this, Object.create(SynchronizingPresenter));

 	let contentText = opts.text || "Are you sure you want to proceed?";
	let defaultContent = toHTML(`<p>${contentText}</p>`);

	this.viewProps = Object.assign({ title: "Confirm",
									 contentEl: defaultContent,
									 onProceed: null,
									 //onCancel: null,
									 modalOpts: { procButtonText: "Confirm",
					   				 			  cancelButtonText: "Cancel", },
					   				}, opts);

	this.setView(new ModalView());
}


var testAppView = function(){
	toDoApp.load();
	ApplicationPresenter.setView(ApplicationView);
	ApplicationPresenter.load();
	ApplicationView.render();
};

window.addEventListener("load", testAppView);
