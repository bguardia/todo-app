const datasetModule = require('./dataset.js');
import { Modal } from 'bootstrap';
import { format } from 'date-fns';
import { isSameDay } from 'date-fns';
import { endOfDay } from 'date-fns';
import { startOfDay } from 'date-fns';

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

//Create associations
datasetModule.setAssociation(Project, { hasMany: Item });
datasetModule.setAssociation(Item, { belongsTo: Project });

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

//simple event handler
var EventHandler = (function(){
	var events = {}; 
	var createEvent = function(eventName){
		events[eventName] = []; //empty Array to be filled be subscribers
		return eventName;
	};

	var unsubscribe = function(eventName, callbackFn){
		let index = events[eventName].findIndex(fn => fn === callbackFn);
		events[eventName].splice(index, 1);
	};

	var subscribe = function(eventName, callbackFn){
		events[eventName].push(callbackFn);
	};

	var publish = function(eventName, emitter){
		events[eventName].forEach(callback => callback(emitter));
	};
	
	return { createEvent: createEvent,
		 subscribe: subscribe,
		 unsubscribe: unsubscribe,
		 publish: publish };
})();

//UI components
var components = {

	form: function(obj, onSubmit){
		let container = document.createElement("div");
		Object.keys(obj).forEach(()=>{
			let input = this.createInput({ name: k, placeholder: obj[k] });
			container.appendChild(input);
		});

		let btn = document.createElement("button");
		btn.addEventListener("click", onSubmit);

		return container;
	},

	table: function(objs, headers, opts = {}){
		let table = document.createElement("table");
		table.className = "table";
		let tHead = document.createElement("thead");
		let headerRow = document.createElement("tr");
		headers.forEach(h => {
			let header = document.createElement("th");
			header.innerHTML = h;
			headerRow.appendChild(header);
		});
		tHead.appendChild(headerRow);

		let tBody = document.createElement("tbody");
		objs.forEach(o => {
			let row = document.createElement("tr");
			headers.forEach(h => {
				let cell = document.createElement("td");
				if(opts[h]){
					opts[h](o, cell);
				} else {
					cell.innerHTML = o[h];
				}
				row.appendChild(cell);
			});
			tBody.appendChild(row);
		});

		table.appendChild(tHead);
		table.appendChild(tBody);
		
		return table;
	},

	projectsTable: function(projects){
		let itemCount = function(obj, cell){
			cell.innerHTML = obj.items.length;
		};

		let showBtn = function(obj, cell){
			let btn = this.button("Show", { className: "btn-primary" });
			btn.addEventListener("click", () => { projectsController.show({ projectId: obj.id }); });
			cell.appendChild(btn);
		}.bind(this);

		let editBtn = function(obj, cell){
			let btn = this.button("Edit", { className: "btn-secondary" });
			btn.addEventListener("click", () => { projectsController.edit({ projectId: obj.id }); });
			cell.appendChild(btn);
		}.bind(this);

		let delBtn = function(obj, cell){
			let btn = this.button("Delete", { className: "btn-danger", });
			btn.addEventListener("click", () => { projectsController.destroy({ projectId: obj.id }); });
			cell.appendChild(btn);
		}.bind(this);

		let table = this.table(projects, 
				       ["id", "title", "description", "items", "show", "edit", "destroy"],
				       { items: itemCount, show: showBtn, edit: editBtn, destroy: delBtn });

		return table;
	},

	itemsTable: function(items){
		let getProject = function(obj, cell){
			cell.innerHTML = obj.project.title;
		};
		let showBtn = function(obj, cell){
			let btn = this.button("Show", { className: "btn-primary" });
			btn.addEventListener("click", () => { itemsController.show({ itemId: obj.id }); });
			cell.appendChild(btn);
		}.bind(this);

		let editBtn = function(obj, cell){
			let btn = this.button("Edit", { className: "btn-secondary" });
			btn.addEventListener("click", () => { itemsController.edit({ itemId: obj.id }); });
			cell.appendChild(btn);
		}.bind(this);

		let delBtn = function(obj, cell){
			let btn = this.button("Delete", { className: "btn-danger" });
			btn.addEventListener("click", () => { itemsController.destroy({ itemId: obj.id }); });
			cell.appendChild(btn);
		}.bind(this);

		let formatDate = function(obj, cell){
			//let date = new Date().setTime(obj.date);
			cell.innerHTML = format(obj.date, 'MM/dd');
		};

		let table = this.table(items,
				       ["id", "title", "description", "date", "isComplete", "project", "show", "edit", "destroy"],
				       { date: formatDate, project: getProject, show: showBtn, edit: editBtn, destroy: delBtn });

		return table;
	},

	createInput: function(args){
		let input = document.createElement("input");
		input.type = "text";
		input.name = args.name;
		input.id = args.name;
		input.className = "form-control";
		input.setAttribute("placeholder", args.placeholder);
		let label = document.createElement("label");
		label.setAttribute("for", args.name);
		label.innerHTML = args.label;
		label.className = "col-form-label";
		let fieldContainer = document.createElement("div");
		fieldContainer.appendChild(label);
		fieldContainer.appendChild(input);

		return fieldContainer; 
	},

	project: function(pObj) {
		let projectContainer = document.createElement("div");
		let listTitle = document.createElement("p");
		listTitle.innerHTML = pObj.title;
		projectContainer.appendChild(listTitle);
		projectContainer.appendChild(this.itemsTable(pObj.items));
		/*
		let itemsListItem = document.createElement("li");
		let itemsList = document.createElement("ul")
		itemsListItem.appendChild(itemsList);
		pObj.items.forEach(item => {
			let listItem = document.createElement("li");
			listItem.appendChild(this.projectItem(item));
			itemsList.appendChild(listItem);
		});*/
		
		//let newItemField = this.itemForm(pObj.id, itemsList);
		//itemsList.appendChild(newItemField);
		//projectContainer.appendChild(itemsList);
		return projectContainer;
	},

	projectItem: function(iObj){
		let itemContainer = document.createElement("div");
		itemContainer.className = "d-flex justify-content-between border rounded-pill";

		//completed Button
		let completedButton = document.createElement("button");
		completedButton.className = "border border-3 rounded-circle";
		completedButton.addEventListener("click", () => {
			itemsController.update({ itemId: iObj.id, isComplete: true });
		});

		//show Button
		let showButton = document.createElement("button");
		showButton.innerHTML = "+";
		showButton.addEventListener("click", () => {
			itemsController.show({ itemId: iObj.id });
		});

		//item title
		let itemInfoContainer = document.createElement("div")
		let itemTitle = document.createElement("p");
		itemTitle.innerHTML = iObj.title;
		itemInfoContainer.appendChild(itemTitle);
		
		let itemDate = document.createElement("p");
		itemDate.innerHTML = format(iObj.date, 'MM/dd');
		itemInfoContainer.appendChild(itemDate);

		itemContainer.appendChild(completedButton);
		itemContainer.appendChild(itemInfoContainer);
		itemContainer.appendChild(showButton);

		return itemContainer;
	},

	projectForm: function(){
		let form = document.createElement("form");

		let titleField = this.createInput({ name: "projectTitle", label: "Project Name", });
		let descField = this.createInput({ name: "projectDesc", label: "Details", });
		let submitBtn = document.createElement("button");
		submitBtn.innerHTML = "Create";
		submitBtn.addEventListener("click", function(){
			let title = document.getElementById("projectTitle").value;
			let description = document.getElementById("projectDesc").value;
			projectsController.create({ title: title, description: description });
		});

		form.appendChild(titleField);
		form.appendChild(descField);
		form.appendChild(submitBtn);

		return form;
	},

	itemForm: function(projectId, parentEl){
		let container = document.createElement("li");
		let projectPrefix = `project_${projectId}_`;
		let itemField = this.createInput({ name: `${projectPrefix}itemTitle`, label: "Task", });
		let descField = this.createInput({ name: `${projectPrefix}itemDesc`, label: "Details", });
		let addItem = document.createElement("button");
		addItem.innerHTML = "Add item";

		let createItem = this.item.bind(this);
		let createItemForm = this.itemForm.bind(this);
		addItem.addEventListener("click", function(){
			addItem.setAttribute("disabled", true);
			let title = document.getElementById(`${projectPrefix}itemTitle`).value;
			let description = document.getElementById(`${projectPrefix}itemDesc`).value;
			let item = itemsController.create({ title: title, 
						 	    description: description,
						 	    projectId: projectId,
						 	  });
		        container.remove();	
			parentEl.appendChild(createItem(item));
			parentEl.appendChild(createItemForm(projectId, parentEl));
		});

		container.appendChild(itemField);
		container.appendChild(descField);
		container.appendChild(addItem);

		return container;
	},


	item: function(iObj) {
		let container = document.createElement("li");
		let itemTitleSpan = document.createElement("span");
		itemTitleSpan.innerHTML = iObj.title;
		let itemDescSpan = document.createElement("span");
		let breakEl = document.createElement("br");
		itemDescSpan.innerHTML = iObj.description;
		container.appendChild(itemTitleSpan);
		container.appendChild(breakEl);
		container.appendChild(itemDescSpan);
		return container;
	},

	itemDetailed: function(iObj) {
		let container = document.createElement("div");
		let itemTitle = document.createElement("p");
		itemTitle.innerHTML = iObj.title;
		let itemDescription = document.createElement("p");
		itemDescription.innerHTML = iObj.description;
		let itemDate = document.createElement("p");
		itemDate.innerHTML = format(iObj.date, 'MM/dd');

		container.appendChild(itemTitle);
		container.appendChild(itemDescription);
		container.appendChild(itemDate);

		return container;
		
	},

	projectFormModal: function(onSaveCallback){
		let formContainer = document.createElement("div");
		let titleInput = this.createInput({ name: "Title", placeholder: "New project" });
		formContainer.appendChild(titleInput);
		return this.modal("New Project", formContainer, onSaveCallback);
	},

	itemFormModal: function(onSaveCallback){
		let formContainer = document.createElement("div");
		let titleInput = this.createInput({ name: "Title", placeholder: "Go to the store" });
		formContainer.appendChild(titleInput);
		return this.modal("New Item", formContainer, onSaveCallback);
	},

	modalButton: function(){
	
	},

	modal: function(title, modalContent){
		let container = document.createElement("div");
		container.className = "modal";
		container.setAttribute("tabindex", "-1");
		let dialog = document.createElement("div");
		dialog.className = "modal-dialog";
		container.appendChild(dialog);

		let content = document.createElement("div");
		content.className = "modal-content";
		dialog.appendChild(content);
		let header = document.createElement("div");
		header.className = "modal-header";
		content.appendChild(header);

		let titleEl = document.createElement("h5");
		titleEl.className = "modal-title";
		titleEl.innerHTML = title;
		header.appendChild(titleEl);

		let closeBtn = document.createElement("button");
		closeBtn.className = "btn-close";
		closeBtn.setAttribute("data-bs-dismiss", "modal");
		closeBtn.setAttribute("aria-label", "Close");
		header.appendChild(closeBtn);

		let body = document.createElement("div");
		body.className = "modal-body";
		body.appendChild(modalContent);
		content.appendChild(body);

		let footer = document.createElement("div");
		footer.className = "modal-footer";
		content.appendChild(footer);

		let footerCloseBtn = document.createElement("button");
		footerCloseBtn.className = "btn btn-secondary";
		footerCloseBtn.setAttribute("data-bs-dismiss", "modal");
		footerCloseBtn.innerHTML = "Close";
		footer.appendChild(footerCloseBtn);

		let footerSaveBtn = document.createElement("button");
		footerSaveBtn.className = "btn btn-primary";
		footerSaveBtn.id = "modal-save-btn";
		footerSaveBtn.innerHTML = "Create";
		footer.appendChild(footerSaveBtn);
		
		return container;
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
}

var SynchronizingPresenter = {
	changeEvent: EventHandler.createEvent("changed"), //return event name
	boundCallback: null, 
	view: null,
	emitChanged: function(){
		EventHandler.publish(this.changeEvent, this);
	},
	subscribeToChanged: function(){
		this.boundCallback = this.onChanged.bind(this);
		EventHandler.subscribe(this.changeEvent, this.boundCallback);
	},
	unsubscribeToChanged: function(){
		EventHandler.unsubscribe(this.changeEvent, this.boundCallback);
		this.boundCallback = null;
	},
	_onChanged: function(){
		this.reload(false); //load without emitting event
	},
	onChanged: function(emitter){//callback for changeEvent
		if(emitter != this){//ignore events emitted by self
			this._onChanged();
		}
	},

	load: function(){
		//individual load logic here
	},

	unload: function(){
		this.unsubscribeToChanged();
		this.view.remove();
	},

	reload: function(emitEvent = true){//each object should call reload after it updates data
		this.load();
		if(emitEvent){
			this.emitChanged();
		}
	},
};

var ApplicationPresenter = (function (){
	let projects = [];
	let view = null;
	let subpresenter = null;

	let appPresenter = Object.create(SynchronizingPresenter);
	appPresenter.subscribeToChanged();

	appPresenter.load = function(){
		projects = Projects.all();	
		loadView();
	};

	let loadView = function(){
		//refresh view
		view.load(projects);
	};

	appPresenter.setView = function(newView){
		view = newView;	
	};

	//Subviews
	appPresenter.setSubview = function(presenter){
		if(subpresenter){
			subpresenter.unload();
		}
		subpresenter = presenter;
		subpresenter.load();
		view.loadSubview(subpresenter.getView());
	};

	appPresenter.todayView = function(){
		appPresenter.setSubview(new DayPresenter(new Date()));
		console.log("todayView");
	};

	appPresenter.tomorrowView = function(){
		let tomorrowPresenter = new DayPresenter(new Date(Date.now() + (24*60*60*1000)));
		appPresenter.setSubview(tomorrowPresenter);
		console.log("tomorrowView");
	};

	appPresenter.weekView = function(){
		console.log("weekView");
		let today = new Date();
		let oneWeekLater = new Date(Date.now() + (24*60*60*1000)*7);
		appPresenter.setSubview(new PeriodPresenter(today, oneWeekLater));
	};

	appPresenter.projectView = function(pId){
		let project = projects.find(p => p.id === pId);
		appPresenter.setSubview(new ProjectPresenter(project));
	};

	//projects getter
	appPresenter.projects = function(){
		return projects;
	};

	//User interactions
	appPresenter.newProject = function(){
		let pFormPresenter = new ProjectFormPresenter();
		pFormPresenter.load();
		let onSave = pFormPresenter.createProject.bind(pFormPresenter);
		view.loadModal(pFormPresenter.getView(), onSave);
	};

	appPresenter.newItem = function(){
		let iFormPresenter = new ItemFormPresenter();
		iFormPresenter.load();
		let onSave = iFormPresenter.createItem.bind(iFormPresenter);
		view.loadModal(iFormPresenter.getView(), onSave);
	};

	//appPresenter.setView(ApplicationView);

	return appPresenter;
})();

//Main View
//Sample of main functions
var View = {
	container: null,
	_isInitialized: false,
	_initialize: function(){
		//Initialize DOM elements here
	},
	initialize: function(){
		this._initialize();
		this._isInitialized = true;
	},
	load: function(){
		throw "No load method has been defined";
	},
	render: function(){
		//Any special rendering for main view (document.body.appendChild(this.container) ?)
	},
	renderIn: function(parentEl){
		parentEl.appendChild(this.container);
	},
	remove: function(){
		this.container.remove();
		this.clear();
	},
	_clear: function(){
		//DOM elements to clear here
	},
	clear: function(){
		this._clear();
		this.container = null;
		this._isInitialized = false;
	},
	isInitialized: function(){
		return this._isInitialized;
	},
	/* only for main view
	loadSubview: function(){
		//display subview
	},
	loadModal: function(){

	},*/
};

var ApplicationView = (function(){
	/*
	let header = document.createElement("header");
	let title = document.createElement("h1");
	title.innerHTML = "ToDo App";
	header.appendChild(title);

	let verticalNav = document.createElement("div");
	verticalNav.className = "d-flex";
	let verticalNavTop = document.createElement("div");

	let todayBtn = document.createElement("button");
	todayBtn.innerHTML = "Today";
	todayBtn.addEventListener("click", ()=>{ });
	verticalNavTop.appendChild(todayBtn);

	let tomorrowBtn = document.createElement("button");
	tomorrowBtn.innerHTML = "Tomorrow";
	tomorrowBtn.addEventListener("click", ()=>{ });
	verticalNavTop.appendChild(tomorrowBtn);

	let thisWeekBtn = document.createElement("button");
	thisWeekBtn.innerHTML = "This Week";
	thisWeekBtn.addEventListener("click", ()=>{ });
	verticalNavTop.appendChild(thisWeekBtn);
	*/
	let viewContainer = document.createElement("div");
	let navContainer = document.createElement("div");
	viewContainer.appendChild(navContainer);

	//Controls
	let todayButton = document.createElement("button");
	todayButton.addEventListener("click", ApplicationPresenter.todayView);
	navContainer.appendChild(todayButton);
	todayButton.innerHTML = "Today";

	let tomorrowButton = document.createElement("button");
	tomorrowButton.addEventListener("click", ApplicationPresenter.tomorrowView);
	tomorrowButton.innerHTML = "Tomorrow";
	navContainer.appendChild(tomorrowButton);

	let weekButton = document.createElement("button");
	weekButton.addEventListener("click", ApplicationPresenter.weekView);
	weekButton.innerHTML = "This Week";
	navContainer.appendChild(weekButton);

	let newProjectButton = document.createElement("button");
	newProjectButton.addEventListener("click", ApplicationPresenter.newProject);
	newProjectButton.innerHTML = "New Project";
	navContainer.appendChild(newProjectButton);

	let newItemButton = document.createElement("button");
	newItemButton.addEventListener("click", ApplicationPresenter.newItem);
	newItemButton.innerHTML = "New Item";
	navContainer.appendChild(newItemButton);

	let projectList = document.createElement("ul");
	navContainer.appendChild(projectList);
	let projectListItems = [];

	let subviewContainer = document.createElement("div");
	viewContainer.appendChild(subviewContainer);

	let loadListItem = function(item, elId = item.id){
		let listItem = document.createElement("li");
		listItem.id = elId;
		let anchor = document.createElement("a");
		anchor.innerHTML = item.title;
		anchor.addEventListener("click", () => ApplicationPresenter.projectView(item.id));
		listItem.appendChild(anchor);

		return listItem;
	};

	let render = function(){
		document.body.appendChild(viewContainer);
	};

	let load = function(projects){
		projectList.replaceChildren();
		projects.forEach(project => {
			projectList.appendChild(loadListItem(project, `project${project.id}`));
		});

	};

	let loadSubview = function(subview){
		subview.renderIn(subviewContainer);
	};

	let loadModal = function(view, onSave){
		let modalEl = components.modal("Modal", view.container);
		let saveBtn = modalEl.querySelector("#modal-save-btn");
		this.modal = new Modal(modalEl);
		saveBtn.addEventListener("click", function(e){
			onSave(e)
			this.modal.hide();
			modalEl.remove();
		}.bind(this));
		this.modal.show();
	}

	return { render: render, 
		 load: load, 
		 loadSubview: loadSubview,
		 loadModal: loadModal };
})();

var ProjectPresenter = function(pObj){
	Object.setPrototypeOf(this, Object.create(SynchronizingPresenter));
	this.subscribeToChanged();

	this.projectModel = pObj;
	this.projectItems = [];
	this.allowShowCompleted = false;
	this.projectId = pObj.id;
	this.projectTitle = pObj.title;
	this.projectDesc = pObj.description;

	this.view = null;

	this.load = function(){
		this.projectItems = [];
		console.log(`Called ProjectPresenter.load (${this.projectModel.title})`);
		this.projectModel.items.forEach(i => {
			if(this.allowShowCompleted || !i.isComplete){
				this.projectItems.push(i);
			}
		});
		this.loadView();
	};

	this.updateProject = function(args){
		this.projectModel.update(args);
		this.reload();
	};

	this.newItem = function(){
		let iFormPresenter = new ItemFormPresenter({ projectId: this.projectModel.id });
		iFormPresenter.load();
		let onSave = iFormPresenter.createItem.bind(iFormPresenter);
		this.view.loadModal(iFormPresenter.getView(), onSave);
	};
/*
	this.createItem = function(args){
		this.projectModel.newItem(args);
		this.reload();
	};
*/
	this.toggleShowCompleted = function(){
		this.allowShowCompleted = !this.allowShowCompleted;
		this.reload();
	};

	this.markCompleted = function(itemId){
		console.log(`this.markCompleted: projectModel: ${this.projectModel.title}`);
		let item = this.projectModel.items.find(i => i.id === itemId);
		console.log(`item is ${item}`);
		item.update({ isComplete: true });
		this.reload();
	};

	this.setView = function(view){
		this.view = view; 
	};

	this.loadView = function(){
		console.log("ProjectPresenter.loadView");
		if(!this.view.isInitialized()){
			console.log("View isn't initialized");
			this.view.initialize();
			this.view.callbacks.markCompleted = this.markCompleted.bind(this);
			this.view.callbacks.toggleShowCompleted = this.toggleShowCompleted.bind(this);
			this.view.callbacks.addItem = this.newItem.bind(this);
		}
		this.view.load({ project: this.projectModel, items: this.projectItems });
	};

	this.getView = function(){
		return this.view;
	};

	this.setView(ProjectView);
};

var ItemPresenter = function(iObj){
	Object.setPrototypeOf(this, Object.create(SynchronizingPresenter));
	this.subscribeToChanged();

	this.itemModel = iObj;

	this.view = null;

	this.load = function(){
		console.log("Called ItemViewModel.load");
		this.loadView();
	};

	this.updateItem = function(args){
		this.itemModel.update(args);
		this.reload();
	};

	this.setView = function(view){
		this.view = view; 
	};

	this.loadView = function(){
		if(!this.view.isInitialized()){
			this.view.initialize();
		}
		view.load(this.itemModels);
	};

	this.getView = function(){
		return this.view;
	};

	this.setView(itemView);
};

var DayPresenter = function(date){
	Object.setPrototypeOf(this, Object.create(SynchronizingPresenter));
	this.subscribeToChanged();

	this.itemModels = [];
	this.date = date;

	this.view = null;

	this.title = function(){
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

	this.load = function(){
		console.log("Called DayViewModel.load");
		this.itemModels = Items.filter(i => { 
			return isSameDay(i.date, this.date); 
		});

		console.log("this.itemModels is:");
		console.log(this.itemModels);
		this.loadView();
	};

	this.createItem = function(args){
		Object.assign(args, { date: this.date });
		let item = Items.create(args);
		this.reload();
	};

	this.setView = function(view){
		this.view = view; 
	};

	this.loadView = function(){
		if(!this.view.isInitialized()){
			this.view.initialize(this.title());
		}
		this.view.load(this.itemModels);
	};

	this.getView = function(){
		return this.view;
	};

	this.setView(new ItemsView());
};

var PeriodPresenter = function(startDate, endDate){
	Object.setPrototypeOf(this, Object.create(SynchronizingPresenter));
	this.subscribeToChanged();
	
	this.itemModels = [];
	this.startDate = startDate;
	this.endDate = endDate;

	this.view = null;

	this.load = function(){
		console.log("Called PeriodViewModel.load");
		this.itemModels = Items.filter(i => {
			return i.date >= startOfDay(this.startDate) &&
			       i.date <= endOfDay(this.endDate);
		});
		this.loadView();
	};

	this.setView = function(view){
		this.view = view; 
	};

	this.title = function(){
		return `${format(this.startDate, 'MM/dd')} to ${format(this.endDate, 'MM/dd')}`;
	};

	this.loadView = function(){
		if(!this.view.isInitialized()){
			this.view.initialize(this.title());
		}
		this.view.load(this.itemModels);
	};

	this.getView = function(){
		return this.view;
	}

	this.setView(new ItemsView()) //set default view;
};

var ItemFormPresenter = function(opts = {}){
	Object.setPrototypeOf(this, Object.create(SynchronizingPresenter));
	
	this.view = null;
	this.defaultValues = Object.assign({ projectId: "", 
			       		     date: format(new Date(), 'yyyy-MM-dd'), 
	                                   }, opts);

	this.load = function(){
		console.log("Called ItemFormPresenter.load");
		this.loadView();
	};

	this.createItem = function(){
		let args = this.getFormData();
		Items.create(args);
		this.emitChanged();
	};

	this.setView = function(view){
		this.view = view; 
		this.view.onSave = this.createItem.bind(this);
	};

	this.loadView = function(){
		if(!this.view.isInitialized()){
			this.view.initialize();
			this.view.projectIdInput.value = this.defaultValues.projectId;
			this.view.dateInput.value = this.defaultValues.date
		}
		this.view.load(this.itemModels);
	};

	this.getView = function(){
		return this.view;
	}

	this.getFormData = function(){
		return this.view.getFormData();
	};

	this.setView(new ItemFormView()) //set default view;
};

var ProjectFormPresenter = function(){
	Object.setPrototypeOf(this, Object.create(SynchronizingPresenter));
	//does not reload so does not need to subscribe to onChanged event	

	this.view = null;

	this.createProject = function(){
		let args = this.getFormData();
		Projects.create(args);
		this.emitChanged();
	};

	this.load = function(){
		console.log("Called ProjectFormPresenter.load");
		this.loadView();
	};

	this.setView = function(view){
		this.view = view; 
		view.onSave = this.createProject.bind(this);
	};

	this.loadView = function(){
		if(!this.view.isInitialized()){
			this.view.initialize();
		}
		this.view.load();
	};

	this.getView = function(){
		return this.view;
	}

	this.getFormData = function(){
		return this.view.getFormData();
	}

	this.setView(new ProjectFormView()) //set default view;
};

/* Subviews
*/

var ProjectView = (function(){
	let projectView = Object.create(View);
	projectView.projectTitle = null;
	projectView.projectDesc = null;
	projectView.newItemButton = null;
	projectView.toggleShowCompletedItemsButton = null;
	projectView.itemContainer = null;
	projectView.items = {};
	projectView.callbacks = { markCompleted: null,
			  	  toggleShowCompleted: null,
	                          addItem: null, };

	/* Idea for property storage
	 * 
	let properties = { project: { title: null, 
				      description: null, }, 
			   items:   [{ title: null, 
			   	       description: null, 
			   	       date: null,        }] };
	*/

	projectView._initialize = function(){//create DOM elements
		this.container = document.createElement("div");
		this.projectTitle = document.createElement("p");
		this.projectDesc = document.createElement("p");
		this.itemContainer = document.createElement("ul");

		this.toggleShowCompletedItemsButton = components.button("Show Completed Items");
		this.toggleShowCompletedItemsButton.setAttribute("data-state", "show");
		this.toggleShowCompletedItemsButton.addEventListener("click", function(){
			toggleShowCompleted(this);
		});

		this.newItemButton = components.button("Add Item");
		this.newItemButton.addEventListener("click", function(){
			this.callbacks.addItem();
		}.bind(this));
		this.container.appendChild(this.projectTitle);
		this.container.appendChild(this.projectDesc);
		this.container.appendChild(this.itemContainer);
		this.container.appendChild(this.newItemButton);
	};

	projectView.toggleShowCompleted = function(btn){
		let btnState = btn.getAttribute("data-state");
		if(btnState == "show"){
			btn.setAttribute("data-state", "hide");
		}else{
			btn.setAttribute("data-state", "show");
		}
		callbacks.toggleShowCompleted();
	};

	let createItem = function() {
		let container = document.createElement("div");
		container.className = "d-flex";
		let completeBtn = document.createElement("button");
		completeBtn.innerHTML = "Mark complete";
		let itemTitle = document.createElement("p");
		let itemDate = document.createElement("p");
		container.appendChild(itemTitle);
		container.appendChild(itemDate);
		container.appendChild(completeBtn);
		return { container: container,
			 itemTitle: itemTitle,
			 itemDate: itemDate,
			 completeBtn: completeBtn, };
	};

	projectView._clear = function(){//empty all DOM elements
		console.log("Called projectView._clear");
		this.projectTitle = null;
		this.projectDesc = null;
		this.newItemButton = null;
		this.itemContainer = null;
		this.items = {};
		this.callbacks = { markCompleted: null, 
		              toggleShowCompleted: null, };
	};

	projectView.load = function(args){//load data form model into DOM
		this.itemContainer.replaceChildren();
		this.projectTitle.innerHTML = "Project: " + args.project.title;
		this.projectDesc.innerHTML = "Description: " + args.project.description;
		args.items.forEach((i) => {
			let itemLi = loadItem(i);
			this.itemContainer.appendChild(itemLi);
		});
	};
	let loadItem = function(item){
		let thisItemEl = projectView.items[item.id];
		if(!thisItemEl){
			thisItemEl = createItem();
			projectView.items[item.id] = thisItemEl;
			let markCompleted = projectView.callbacks.markCompleted;
			thisItemEl.completeBtn.addEventListener("click", () => { markCompleted(item.id)});
		}

		thisItemEl.itemTitle.innerHTML = item.title;
		thisItemEl.itemDate.innerHTML = format(item.date, 'MM/dd');

		return thisItemEl.container;
	};

	projectView.loadModal = function(view, onSave){
		let modalEl = components.modal("Modal", view.container);
		let saveBtn = modalEl.querySelector("#modal-save-btn");
		this.modal = new Modal(modalEl);
		saveBtn.addEventListener("click", function(e){
			onSave(e)
			this.modal.hide();
			modalEl.remove();
		}.bind(this));
		this.modal.show();
	};

	return projectView;
})();

var ProjectFormView = function(){

	this.container = null;
	this._isInitialized = false;

	this.initialize = function(){
		this.container = document.createElement("div");
		this.titleInputContainer = components.createInput({ label: "New Project", name: "title", placeholder: "Go to the store" });
		this.titleInput = this.titleInputContainer.querySelector("input");
		this.container.appendChild(this.titleInputContainer);
		this._isInitialized = true;
	};

	this.renderIn = function(parentEl){
		parentEl.appendChild(this.container);
	};

	this.load = function(){

	};

	this.getFormData = function(){
		console.log("ProjectFormView.getFormData:");
		console.log(`titleInput is: ${this.titleInput}`);
		console.log(`this.titleInput.value = ${this.titleInput.value}`);
		return { title: this.titleInput.value };
	};

	this.remove = function(){
		this.container.remove();
	};

	this.isInitialized = function(){
		return this._isInitialized;
	}
};

var ItemFormView = function(){

	this.container = null;
	this._isInitialized = false;

	this.initialize = function(){
		this.container = document.createElement("div");
		this.projectIdInput = document.createElement("input");
		this.projectIdInput.setAttribute("type", "hidden");
		this.titleInputContainer = components.createInput({ label: "New Task", name: "title", placeholder: "Task name" });
		this.titleInput = this.titleInputContainer.querySelector("input");
		this.dateInput = document.createElement("input");
		this.dateInput.setAttribute("type", "date");
		this.container.appendChild(this.titleInputContainer);
		this.container.appendChild(this.dateInput);
		this.container.appendChild(this.projectIdInput);
		this._isInitialized = true;
	};

	this.renderIn = function(parentEl){
		parentEl.appendChild(this.container);
	};

	this.load = function(){
	};

	this.getFormData = function(){
		console.log("ItemFormView.getFormData:");
		let formData =  { title: this.titleInput.value,
		         	  date: new Date(this.dateInput.value),
		         	  projectId: this.projectIdInput.value };
		console.log(formData);
		return formData;
	};

	this.remove = function(){
		this.container.remove();
	};

	this.isInitialized = function(){
		return this._isInitialized;
	}
};

var ItemsView = function(){
	this.container = null;
	this.itemContainer = null;
	this._isInitialized = false;

	this.initialize = function(title){
		this.container = document.createElement("div");
		this.titleEl = document.createElement("h2");
		this.titleEl.innerHTML = title;
		this.container.appendChild(this.titleEl);
		this.itemContainer = document.createElement("ul");
		this.container.appendChild(this.itemContainer);
		this._isInitialized = true;
	};

	this.load = function(items){
		console.log("ItemsView items are:");
		console.log(items);
		this.itemContainer.replaceChildren();
		items.forEach(i => {
			let itemLi = document.createElement("li");
			itemLi.innerHTML = "Item: " + i.title;
			this.itemContainer.appendChild(itemLi);
		});
	};

	this.renderIn = function(parentEl){
		parentEl.appendChild(this.container);
	};

	this.remove = function(){
		this.container.remove();
	};

	this.isInitialized = function(){
		return this._isInitialized;
	}
}

var testAppView = function(){
	toDoApp.load();
	ApplicationPresenter.setView(ApplicationView);
	ApplicationPresenter.load();
	ApplicationView.render();
};

window.addEventListener("load", testAppView);
