const datasetModule = require('./dataset.js');

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

var applicationLoader = (function(){
	let applicationPrefix = "toDoApp";
	let projectsKey = applicationPrefix + "_projects";
	let loadProjects = function(){
		if(storageAvailable('localStorage')){
				console.log("localStorage is available.")
			if(!localStorage.getItem(projectsKey)){
				console.log("Application data not found");
				return [];
			}else{
				console.log("Application data found");
				return JSON.parse(localStorage.getItem(projectsKey)); //array of objects (without methods)
			}
		}
		console.log("localStorage is unavailable");
		return [];
	};

	return { loadProjects: loadProjects };
})();

var dataSerializer = (function(){
	let applicationPrefix = "toDoApp";
	let projectsKey = applicationPrefix + "_projects";
	let saveProjects = function(){
		if(storageAvailable('localStorage')){
			console.log("localStorage is available");
			let serializedData = JSON.stringify(Projects.all);
			localStorage.setItem(projectsKey, serializedData);
		}else{
			throw "localStorage not available";
		}
	}

	return { saveProjects: saveProjects };
})();


var Project = function(args = {}) {
	this.title = args.title || "new project";
	this.description = args.description || "";
	/*
        this.addItem = function(newItem) {
		this.items.push(newItem);
	};

	this.removeItem = function(item){
		let id = this.items.findIndex(_item => _item === item);
		return this.items.splice(id, 1);	
	};*/
};

Project.prototype = Object.create( datasetModule.datasetItem );

var Projects = new datasetModule.Dataset("Projects", Project);

var Item = function(args = {}) {
	this.title = args.title || "new item";
	this.description = args.description || "";
	/*
	this.date = args.date || Date.now();
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
var myProject = Projects.create({ title: "Project 1",
			      description: "this is my first project", });

var mySecondProject = Projects.create({ title: "Project 2", 
				    description: "this is my second project", });
var itemData = [{title: "wash the dishes", description: "wash by hand", projectId: myProject.id },
	        {title: "go to susan's b-day party", description: "at Susan's house", data: new Date('February 13, 2022 18:00:00'), projectId: myProject.id},
	        {title: "eat a sandwich", description: "Preferrably a blt", projectId: myProject.id }]

itemData.forEach(d => Items.create(d));

//simple event handler
var EventHandler = (function(){
	var events = {}; 
	var createEvent = function(eventName){
		events[eventName] = []; //empty Array to be filled be subscribers
	};

	var cancel = function(eventName, callbackFn){
		let index = events[eventName].findIndex(fn => fn === callbackFn);

	};

	var subscribe = function(eventName, callbackFn){
		events[eventName].push(callbackFn);
	};

	var publish = function(eventName){
		events[eventName].forEach(callback => callback());
	};
	
	return { createEvent: createEvent,
		 subscribe: subscribe,
		 publish: publish };
})();

//Sample user interactions
var createProject = function(projectArgs){
	return Projects.create(projectArgs);
};

var createItem = function(itemArgs){
	return Items.create(itemArgs);
}

var addItemToProject = function(item, project){
	project.addItem(item);
};

var removeItemFromProject = function(item, project){
	project.removeItem(item);
};

var moveItem = function(item, project){
	item.project = project;
};

var destroyItem = function(item){ //should only need item
	Items.remove(item.id);
};

var itemsController = {
	_new: function(){
		let item = Items.create();
	},

	create: function(args){
		let item = Items.create(args);
		return item;
	},

	update: function(args){
		let item = Items.find(i => i.id === args.itemId);
		if(item){
			item.update(args);
		} else {
		  throw 'no item found';	
		}
	},

	destroy: function(args){
		let item = Items.find(i => i.id === args.itemId);
		if(item){
			item.destroy();
		}
	},
};

var projectsController = {
	_new: function(){
		let toDoContainer = document.getElementById("toDoContainer");
		toDoContainer.replaceChildren();
		toDoContainer.appendChild(components.projectForm());
	},

	index: function(){
		let projects = Projects.all();
		let toDoContainer = document.getElementById("toDoContainer");
		toDoContainer.replaceChildren();
		projects.forEach(p => {
			let pComponent = components.project(p);
			toDoContainer.appendChild(pComponent)});
	},

	create: function(args) {
		console.log("Called projectsController.create");
		let toDoContainer = document.getElementById("toDoContainer");
		let project = Projects.create(args);
		console.log("project is:");
		console.log(project);
		console.log("Project's enumerable properties are:");
		Object.keys(project).forEach(k => console.log({ k }));
		toDoContainer.replaceChildren();
		toDoContainer.appendChild(components.project(project));
	},

	update: function(args) {
		let project = Projects.find(i => i.id === args.projectId);
		if(project){
			project.update(args);
		} else {
		  throw 'no project found';	
		}

	},

	destroy: function(args) {
		let project = Projects.find(p => p.id === args.projectId);
		if(project){
			project.destroy();
		}
	},
};

var components = {
	createInput: function(args){
		let input = document.createElement("input");
		input.type = "text";
		input.name = args.name;
		input.id = args.name;
		input.setAttribute("placeholder", args.placeholder);
		let label = document.createElement("label");
		label.setAttribute("for", args.name);
		label.innerHTML = args.label;
		
		let fieldContainer = document.createElement("div");
		fieldContainer.appendChild(label);
		fieldContainer.appendChild(input);

		return fieldContainer; 
	},

	project: function(pObj) {
		let listEl = document.createElement("ul");
		let listTitle = document.createElement("li");
		listTitle.innerHTML = pObj.title;
		listEl.appendChild(listTitle);

		let itemsListItem = document.createElement("li");
		let itemsList = document.createElement("ul")
		itemsListItem.appendChild(itemsList);
		pObj.items.forEach(item => {
			let listItem = document.createElement("li");
			listItem.innerHTML = item.title;
			itemsList.appendChild(listItem);
		});

		let newItemField = this.itemForm(pObj.id, itemsList);
		itemsList.appendChild(newItemField);
		listEl.appendChild(itemsList);
		return listEl;
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

	button: function(str) {
		let btn = document.createElement("button");
		btn.innerHTML = str;
		return btn;
	},
}

var projectView = {
	
};


var testMain = function() {
	let projectIndexBtn = components.button("See all projects");
	projectIndexBtn.addEventListener("click", () => { projectsController.index(); });
	let projectNewBtn = components.button("New Project");
	projectNewBtn.addEventListener("click", () => { projectsController._new(); });
	document.body.appendChild(projectIndexBtn);
	document.body.appendChild(projectNewBtn);
}

var testCommonOperations = function(){
	var dispItem = function(item, prefix = ""){
		console.log(`${prefix}Item "${item.title}"\n${prefix}id: ${item.id}`);
	};
	var dispProject = function(project){
		console.log(`Project "${project.title}"\nid: ${project.id}`);
		project.items().forEach(i => dispItem(i, "-->"));
	};

	dispProject(myProject);
	dispProject(mySecondProject);

	console.log("add new item to myProject...");
	let newItem = createItem({title: "a new item", description: "new!", projectId: myProject.id});
	dispProject(myProject);

	console.log("Move item to second Project...");
	moveItem(newItem, mySecondProject);
	dispProject(myProject);
	dispProject(mySecondProject);

	console.log("Destroy item...");
	let itemToDestroy = myProject.items()[1];
	destroyItem(itemToDestroy);
	dispProject(myProject);
}

//Test code
/*
var myJSON = JSON.stringify(myProject);

console.log(myJSON);

var myProjects = applicationLoader.loadProjects();

console.log("myProjects is " + myProjects);

if(myProjects.length == 0){
	let projectsJSON = JSON.stringify([myProject]);
	localStorage.setItem("toDoApp_projects", projectsJSON);
}
*/

window.addEventListener("load", testMain);
