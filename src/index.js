const datasetModule = require('./dataset.js');
import View from './view.js';
import SynchronizingPresenter from './presenter.js';
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


var ProjectListPresenter = function(){
	Object.setPrototypeOf(this, Object.create(SynchronizingPresenter));
	this.subscribeToChanged();

	this.viewProps = { projects: {}, };

	this.beforeLoad = function(){
		Projects.all().forEach(p => {
			if(!this.viewProps.projects[p.id]){
				this.viewProps.projects[p.id] = { model: p,
								  hideItems: true, };
			}
		});
	}

	this.toggleHidden = function(projectId){
		this.viewProps.projects[projectId].hideItems = !this.viewProps.projects[projectId].hideItems;
	}

	this.beforeInitialize = function(){
		this.view.callbacks.toggleHidden = this.toggleHidden.bind(this);
	}

	this.setView(new ProjectListView());
};

var ProjectListView = function(){

	this.callbacks = {};

	this._initialize = function(){
		this.container = document.createElement("div");
		this.projectListContainer = document.createElement("ul");
		this.container.appendChild(this.projectListContainer);
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
		let itemsListContainer = document.createElement("ul");
		itemsListContainer.id = this.getItemsListId(project.id);
		project.items.forEach(i => {
			if(!i.isComplete){
				let itemListItem = document.createElement("li");
				itemListItem.innerHTML = i.title;
				itemsListContainer.appendChild(itemListItem);
			}
		});

		return itemsListContainer;
	};

	this.load = function(viewProps){
		this.projectListContainer.replaceChildren();
		Object.keys(viewProps.projects).forEach(key => {
			let pObj = viewProps.projects[key]
			let p = pObj.model;
			let projectListItem = document.createElement("li");
			let projectTitleContainer = document.createElement("div");
			let projectTitleEl = document.createElement("a");
			projectTitleEl.innerHTML = p.title;
			projectTitleEl.addEventListener("click", () => ApplicationPresenter.projectView(p.id));

			projectListItem.appendChild(projectTitleContainer);
			projectTitleContainer.appendChild(projectTitleEl);

			let toggleBtn = document.createElement("button");
			toggleBtn.setAttribute("data-target", this.getItemsListId(p.id));
			toggleBtn.setAttribute("data-project-id", p.id);

			let toggleHidden = this.callbacks.toggleHidden;
			toggleBtn.addEventListener("click", function(){
				let targetId = this.getAttribute("data-target");
				let targetEl = document.querySelector(`#${targetId}`);
				targetEl.classList.toggle("d-none");
				this.innerHTML = this.innerHTML == "+" ? "-" : "+";
				toggleHidden(this.getAttribute("data-project-id"));
			});
			projectTitleContainer.appendChild(toggleBtn);

			let itemsListContainer = this.createItemList(p);

			if(pObj.hideItems){
				itemsListContainer.className = "d-none";
				toggleBtn.innerHTML = "+";
			}else{
				toggleBtn.innerHTML = "-";
			}

			projectListItem.appendChild(itemsListContainer);
			this.projectListContainer.appendChild(projectListItem);
		});
	}
};
ProjectListView.prototype = Object.create(View);

var ApplicationPresenter = (function (){
	let subpresenter = null;

	let appPresenter = Object.create(SynchronizingPresenter);
	appPresenter.viewProps = {};
	appPresenter.projectList = new ProjectListPresenter();

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


var ApplicationView = (function(){
	let view = Object.create(View);

	view.container = document.createElement("div");
	let navContainer = document.createElement("div");
	view.container.appendChild(navContainer);

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
	newProjectButton.addEventListener("click", ApplicationPresenter.newProject.bind(ApplicationPresenter));
	newProjectButton.innerHTML = "New Project";
	navContainer.appendChild(newProjectButton);

	let newItemButton = document.createElement("button");
	newItemButton.addEventListener("click", ApplicationPresenter.newItem.bind(ApplicationPresenter));
	newItemButton.innerHTML = "New Item";
	navContainer.appendChild(newItemButton);

	view.projectList = document.createElement("div");
	navContainer.appendChild(view.projectList);
	//let projectListItems = [];

	let subviewContainer = document.createElement("div");
	view.container.appendChild(subviewContainer);

	let loadListItem = function(item, elId = item.id){
		let listItem = document.createElement("li");
		listItem.id = elId;
		let anchor = document.createElement("a");
		anchor.innerHTML = item.title;
		anchor.addEventListener("click", () => ApplicationPresenter.projectView(item.id));
		listItem.appendChild(anchor);

		return listItem;
	};

	view.render = function(){
		document.body.appendChild(view.container);
	};

	view.load = function(viewProps){
		/*
		projectList.replaceChildren();
		viewProps.projects.forEach(project => {
			projectList.appendChild(loadListItem(project, `project${project.id}`));
		});
*/
		this.projectList.replaceChildren();
		this.projectList.appendChild(viewProps.projectListView.container);
	};

	view.loadSubview = function(subview){
		subview.renderIn(subviewContainer);
	};

	view.loadModal = function(view, onSave){
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

	return view;
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
		this.container = document.createElement("div");
		this.itemsContainer = document.createElement("ul");
		
		//toggleShowCompletedItemsButton
		let toggleCallback = this.toggleShowCompleted.bind(this);
		this.toggleShowCompletedItemsButton = components.button("Show Completed Items");
		this.toggleShowCompletedItemsButton.setAttribute("data-state", "show");
		this.toggleShowCompletedItemsButton.addEventListener("click", function(){
			toggleCallback(this);
		});

		this.container.appendChild(this.toggleShowCompletedItemsButton);

		//sortBySelector
		this.sortBySelector = document.createElement("select");
		this.sortBySelector.name = "sortBy";
		["date", "priority"].forEach(str => {
			let option = document.createElement("option");
			option.value = str;
			option.innerHTML = str;
			this.sortBySelector.appendChild(option);
		});
		

		//sortOrderSelector
		this.sortOrderSelector = document.createElement("select");
		this.sortOrderSelector.name = "sortOrder";
		[{ innerHTML: "descending", value: "desc"}, 
		 { innerHTML: "ascending", value: "asc"  }].forEach(obj => {
			let option = document.createElement("option");
			option.innerHTML = obj.innerHTML;
			option.value = obj.value;
			this.sortOrderSelector.appendChild(option);
		});

		let changeSort = this.callbacks.changeSort;
		[this.sortBySelector, this.sortOrderSelector].forEach(el => {
			el.addEventListener("change", function(){
				let sortOpts = {};
				sortOpts[this.name] = this.value;
				changeSort(sortOpts);
			});
			this.container.appendChild(el);
		});

		this.container.appendChild(this.itemsContainer);

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
	}

	this.editProject = function(){
		let projectData = Object.assign({ id: this.projectModel.id, }, this.projectModel);
		let modalOpts = Object.assign({ modal: { title: "Edit Project", }, }, projectData);
		let pModalPresenter = new ModalFormPresenter(ProjectFormPresenter, modalOpts); 
		pModalPresenter.load();
		pModalPresenter.view.render();
	};

	this.newItem = function(){
		let modalPresenter = new ModalFormPresenter(ItemFormPresenter, { modal: { title: "New Item", }, 
									         projectId: this.projectModel.id });
		modalPresenter.load();
		modalPresenter.view.render();
	};

	this.afterInitialize = function(){
		this.view.callbacks.addItem = this.newItem.bind(this);
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

	this._initialize = function(){//create DOM elements
		this.container = document.createElement("div");
		this.titleEl = document.createElement("h2");
		this.subviewContainer = document.createElement("div");

		this.newItemButton = components.button("Add Item");
		this.newItemButton.addEventListener("click", function(){
			this.callbacks.addItem();
		}.bind(this));

		this.container.appendChild(this.titleEl);
		this.container.appendChild(this.subviewContainer);
		this.container.appendChild(this.newItemButton);
	};

	this._clear = function(){//empty all DOM elements
		this.titleEl = null;
		this.newItemButton = null;
		this.subviewContainer = null;
		this.callbacks = { addItem: null, 
		                   toggleShowCompleted: null, };
	};

	this.load = function(viewProps){
		this.titleEl.innerHTML = viewProps.title;
		this.subviewContainer.replaceChildren();
		this.subviewContainer.appendChild(viewProps.subview.container);
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
	projectView.projectTitle = null;
	projectView.projectDesc = null;
	projectView.newItemButton = null;
	projectView.itemContainer = null;
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
		this.container = document.createElement("div");
		this.projectTitle = document.createElement("p");
		this.projectDesc = document.createElement("p");
		this.itemContainer = document.createElement("ul");

		this.editProjectButton = document.createElement("button");
		this.editProjectButton.innerHTML = "Edit Project";
		this.editProjectButton.addEventListener("click", this.callbacks.editProject);

		this.newItemButton = components.button("Add Item");
		this.newItemButton.addEventListener("click", function(){
			this.callbacks.addItem();
		}.bind(this));

		this.container.appendChild(this.projectTitle);
		this.container.appendChild(this.projectDesc);
		this.container.appendChild(this.editProjectButton);
		this.container.appendChild(this.itemContainer);
		this.container.appendChild(this.newItemButton);
	};

	projectView._clear = function(){//empty all DOM elements
		console.log("Called projectView._clear");
		this.projectTitle = null;
		this.projectDesc = null;
		this.newItemButton = null;
		this.itemContainer = null;
		this.callbacks = {};
	};

	projectView.load = function(args){//load data form model into DOM
		this.itemContainer.replaceChildren();
		this.projectTitle.innerHTML = "Project: " + args.project.title;
		this.projectDesc.innerHTML = "Description: " + args.project.description;

		this.itemContainer.appendChild(args.subview.container); //ItemsView
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
		this.container = document.createElement("div");
		this.projectIdInput = document.createElement("input");
		this.projectIdInput.setAttribute("type", "hidden");
		
		this.titleInputContainer = components.createInput({ label: "Name", name: "title", placeholder: "Task name" });
		this.titleInput = this.titleInputContainer.querySelector("input");

		this.dateInputContainer = components.createInput({ type: "date", name: "date", label: "Date", })
		this.dateInput = this.dateInputContainer.querySelector("input");

		this.priorityInputContainer = components.createInput({ type: "number", name: "priority", label: "Priority", min: 0, max: 4, });
		this.priorityInput = this.priorityInputContainer.querySelector("input");

		this.container.appendChild(this.titleInputContainer);
		this.container.appendChild(this.dateInputContainer);
		this.container.appendChild(this.priorityInputContainer);
		this.container.appendChild(this.projectIdInput);
	};

	this.load = function(viewProps){
		this.titleInput.value = viewProps.title;
		this.dateInput.value = viewProps.date;
		this.priorityInput.value = viewProps.priority;
		this.projectIdInput.value = viewProps.projectId;
	};

	this.getFormData = function(){
		console.log("ItemFormView.getFormData:");
		let formData =  { title: this.titleInput.value,
		         	  date: new Date(this.dateInput.value),
		         	  projectId: this.projectIdInput.value,
				  priority: this.priorityInput.value, };
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

	this.showDetailedView = function(){
		ApplicationPresenter.itemDetailedView(this.itemModel.id);
	};

	this.beforeInitialize = function(){
		this.view.callbacks.showDetailedView = this.showDetailedView.bind(this);
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
		this.container = document.createElement("div");
		this.container.className = "d-flex";

		this.itemTitle = document.createElement("p");
		this.itemTitle.addEventListener("click", this.callbacks.showDetailedView);
		this.itemDate = document.createElement("p");
		this.itemPriority = document.createElement("p");

		this.container.appendChild(this.itemTitle);
		this.container.appendChild(this.itemDate);
		this.container.appendChild(this.itemPriority);
	};

	this._markCompleteButton = function(markComplete){
		let completeBtn = document.createElement("button");
		completeBtn.innerHTML = "Mark Complete";
		completeBtn.addEventListener("click", markComplete);
		return completeBtn; 
	};

	this.load = function(iObj){
		this.itemTitle.innerHTML = iObj.title;
		this.itemDate.innerHTML = iObj.date;
		this.itemPriority.innerHTML = iObj.priority;

		if(iObj.isComplete && this.completeBtn){
			this.completeBtn.remove();
		} else if(!iObj.isComplete && !this.completeBtn){
			this.completeBtn = this._markCompleteButton(iObj.markComplete);
			this.container.appendChild(this.completeBtn);
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
		this.container = document.createElement("div");
		this.titleEl = document.createElement("h2");
		this.detailsContainer = document.createElement("div");
		this.dateEl = document.createElement("p");
		this.priorityEl = document.createElement("p");

		this.editItemButton = document.createElement("button");
		this.editItemButton.innerHTML = "Edit";
		this.editItemButton.addEventListener("click", this.callbacks.editItem);

		this.addNoteButton = document.createElement("button");
		this.addNoteButton.innerHTML = "Add Note";
		this.addNoteButton.addEventListener("click", this.callbacks.newNote);

		this.detailsContainer.appendChild(this.dateEl);
		this.detailsContainer.appendChild(this.priorityEl);

		this.notesContainer = document.createElement("div");
		this.container.appendChild(this.titleEl);
		this.container.appendChild(this.detailsContainer);
		this.container.appendChild(this.editItemButton);
		this.container.appendChild(this.notesContainer);
		this.container.appendChild(this.addNoteButton);
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
		this.container = document.createElement("div");
		this.textAreaLabel = document.createElement("label");
		this.textAreaLabel.innerHTML = "Text";
		this.textAreaLabel.className = "form-label";
		this.textAreaLabel.setAttribute("for", "note-text-area");
		this.textArea = document.createElement("textarea");
		this.textArea.id = "note-text-area";
		this.textArea.className = "form-control";
		this.textArea.setAttribute("rows", 3);

		this.hiddenItemIdInput = document.createElement("input");
		this.hiddenItemIdInput.setAttribute("type", "hidden");

		this.container.appendChild(this.textAreaLabel);
		this.container.appendChild(this.textArea);
		this.container.appendChild(this.hiddenItemIdInput);
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
		this.container = components.modal(viewProps.title, viewProps.subview.container);
		this.saveBtn = this.container.querySelector("#modal-save-btn");
		this.saveBtn.innerHTML = viewProps.saveButtonText;
		this.modal = new Modal(this.container);
		this.saveBtn.addEventListener("click", function(e){
			viewProps.onSave(e)
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
		this.viewProps.saveButtonText = opts.modal && opts.modal.buttonText || "Save";
		this.viewProps.subview = presenter.getView();
		this.viewProps.onSave = presenter.onSave.bind(presenter);
	};

	this.setView(new ModalView());
};


var testAppView = function(){
	toDoApp.load();
	ApplicationPresenter.setView(ApplicationView);
	ApplicationPresenter.load();
	ApplicationView.render();
};

window.addEventListener("load", testAppView);
