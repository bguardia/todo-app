import { View, toHTML } from './view.js';

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

export default ProjectListView;