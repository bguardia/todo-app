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
			`<ul class="items-list d-flex flex-column align-items-center" id="${elId}"></ul>`
		);

        if(project.items.length > 0){
            project.items.forEach(i => {
                if(!i.isComplete){
                    let itemListItem = toHTML(
                        `<li class="items-list__item">` +
							`<button class="items-list__button" data-item-id="${i.id}">${i.title}</button>` +
						`</li>`
                    );
                    itemsListContainer.appendChild(itemListItem);
                }
            });
        }else{
            itemsListContainer.appendChild(toHTML(`<li class="items-list__item">No items added</li>`))
        };

		return itemsListContainer;
	};

	this.createProjectLinks = function(){
		let showProjectView = this.callbacks.showProject;

		let projectTitleEls = this.container.querySelectorAll(".projects-list__project-title");
		projectTitleEls.forEach(el => {
			el.addEventListener("click", function(){
				let pId = this.getAttribute("data-project-id");
				showProjectView(pId);
			});
		});

	};

	this.createItemLinks = function(){
		let showItemView = this.callbacks.showItem;

		let itemEls = this.container.querySelectorAll(".items-list__button");
		itemEls.forEach(el => {
			el.addEventListener("click", function(){
				console.log("called project list item event listener");
				let itemId = el.getAttribute("data-item-id");
				showItemView(itemId);
			});
		});

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
						`<div class="d-flex justify-content-between p-1 projects-list__project-header">` +
							`<button class="projects-list__project-title" data-project-id="${p.id}">${p.title}</button>` +
							`<button class="projects-list__toggle-btn" data-target="${itemsListId}" data-project-id="${p.id}">` +
							`</button>` +
						`</div>` +
					`</li>`
				);

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

		this.createProjectLinks();
		this.createItemLinks();
	}
};
ProjectListView.prototype = Object.create(View);

export default ProjectListView;