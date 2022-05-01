import { View, toHTML } from './view.js';

var ProjectView = (function(){
	let projectView = Object.create(View);

	projectView.callbacks = { addItem: null,
				              editProject: null };

	
	projectView._initialize = function(){//create DOM elements
		this.container = toHTML(
			`<div class="col-8">` +
				`<div class="breadcrumb-container"></div>` +
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

		let breadcrumbContainer = this.container.querySelector(".breadcrumb-container");
		breadcrumbContainer.replaceChildren();
		breadcrumbContainer.appendChild(args.breadcrumbs);

		itemsContainer.appendChild(args.subview.container); //ItemsView
	};


	return projectView;
})();

export default ProjectView;