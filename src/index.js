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

//Dataset acts like a simple database
//It stores data for a specific model
var Dataset = function(name, modelConstructor){
	this.name = name
	this.set = [];
	this.count = 0;
	this.modelConstructor = modelConstructor;
};

Dataset.prototype.all = function(){
	return this.set.slice(); //return copy of set
};

Dataset.prototype.create = function(item){
	if(!this.find(x => x === item)){
		this.set.push(item);
		item.id = this.count.toString();
		this.count++;
	} else {
		throw `item already exists in ${dataset.name}`;
	}
};

Dataset.prototype.find = function(fn){
	return this.set.find(fn);
};

Dataset.prototype.filter = function(fn){
	return this.set.filter(fn);
};

Dataset.prototype.remove = function(id){
	let index = this.set.findIndex(item => item.id === id);
	console.log(`Index of ${id} in ${this.name}.set is: ${index}`);
	if(~index){
		return this.set.splice(index, 1);
	} else {
		throw `item doesn't exist in ${this.name}`;
	}
};

Dataset.prototype.loadSet = function(objArray){
	objArray.forEach(data => {
		let item = this.modelConstructor(data);
		this.set.push(item);
	});
};

//End Dataset

var setDataset = function(obj, dataset){
	obj.create = function(){
		dataset.create(this);
	};
	
	obj.destroy = function(){
		dataset.remove(this);
	};
};

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

	setDataset(this, Projects);
	this.create();
};

Project.prototype.items = function(){
   	let items = Items.filter((i) => { 
		return i.projectId === this.id });
	return items;
}

var Projects = new Dataset("Projects", Project);

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
	this.projectId = args.projectId || null;
	/* recurring
	this.isRecurring = args.isRecurring || false;
	this.recurs = ""; //daily, weekly, monthly, annually
	*/

	setDataset(this, Items);
	this.create();
};

var Items = new Dataset("Items", Item);

Object.defineProperty(Item.prototype, 'project', {
	get() { 
		if(this.projectId){
			return Projects.find(p => p.id === this.projectId);
		} else {
			return null;
		}
	},

	set(project) {
		if(project.id && Projects.find(p => p.id === project.id)){
			this.projectId = project.id;
		} else {
			throw "Does not exist in Projects set";
		};
	}, 
});
/*
Item.prototype.project = function(){
	if(this.projectId){
		Projects.find(this.projectId);
	}else{
		throw 'No associated project';
	}
}
*/

//Seed code
var myProject = new Project({ title: "Project 1",
			      description: "this is my first project", });

var mySecondProject = new Project({ title: "Project 2", 
				    description: "this is my second project", });
var itemData = [{title: "wash the dishes", description: "wash by hand", projectId: myProject.id },
	        {title: "go to susan's b-day party", description: "at Susan's house", data: new Date('February 13, 2022 18:00:00'), projectId: myProject.id},
	        {title: "eat a sandwich", description: "Preferrably a blt", projectId: myProject.id }]

itemData.forEach(d => new Item(d));
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
	let newProject = new Project(projectArgs);
};

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

var testCommonOperations = function(){
	var dispItem = function(item){
		console.log(`Item "${item.title}"\nid: ${item.id}`);
	};
	var dispProject = function(project){
		console.log(`Project "${project.title}"\nid: ${project.id}`);
		project.items().forEach(i => dispItem(i));
	};

	dispProject(myProject);
	dispProject(mySecondProject);

	console.log("add new item to myProject...");
	let newItem = new Item({title: "a new item", description: "new!", projectId: myProject.id});
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

testCommonOperations();
