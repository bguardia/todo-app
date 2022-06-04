import { View, toHTML, nl2br } from './view.js';

var ItemDetailedView = function(){
	this.callbacks = {};

	this._initialize = function(){

		this.container = toHTML(
			`<div class="col-8">` +
				`<div class="breadcrumb-container"></div>` +
			/*
				`<nav aria-label="breadcrumb" class="view__breadcrumb">` +
					`<ol class="breadcrumb">` +
					`</ol>` +
				`</nav>` + */
				`<div class="project__header">` +
					`<div class="project__text-container">` +
						`<h2 id="item-title" class="display-2 project__title"></h2>` + 
						`<div id="item-details" class="item-pill__details">` +
							`<p><i class="fa-solid fa-clock"></i><span id="item-details__date" class="item-pill__date"></span></p>` +
							`<p><i class="fa-solid fa-flag"></i><span id="item-details__priority" class="item-pill__priority"></span></p>` +
						`</div>` +
					`</div>` +
					`<div class="description-container">` +
						`<p class="description-container__header h4">Description</p>` +
						`<p class="model-description"></p>` +
					`</div>` +
					`<div class="project__controls">` +
						`<button id="item-edit-btn" class="project__edit-button btn btn-secondary"><i class="fa-solid fa-pencil"></i></button>` +
						`<button class="project__delete-button btn btn-danger"><i class="fa-solid fa-xmark"></i></button>` +
					`</div>` +
				`</div>` +
				//`<h3 class="notes-header">Notes</h3>` +
				//`<div class="items-container item-notes-container">` +
				//`</div>` +
				`<p class="notes-header h4">SubItems</p>` +
				`<div class="items-container">` +
				`</div>` +
				//`<button class="btn btn-primary" id="item-add-note-btn">Add Note</button>` +
				`<button class="btn btn-primary" id="item-add-subitem-btn">Add SubItem</button>` +
			`</div>`
		);

		let editItemBtn = this.container.querySelector("#item-edit-btn");
		editItemBtn.addEventListener("click", this.callbacks.editItem);

		/*
		let addNoteBtn = this.container.querySelector("#item-add-note-btn");
		addNoteBtn.addEventListener("click", this.callbacks.newNote);
		*/

		let addSubItemBtn = this.container.querySelector("#item-add-subitem-btn");
		addSubItemBtn.addEventListener("click", this.callbacks.newSubItem);

		let deleteItemBtn = this.container.querySelector(".project__delete-button");
		deleteItemBtn.addEventListener("click", this.callbacks.deleteItem);
	}

	this.load = function(viewProps){
		let titleEl = this.container.querySelector("#item-title");
		titleEl.innerHTML = viewProps.title;

		let dateEl = this.container.querySelector("#item-details__date");
		dateEl.innerHTML = viewProps.date;

		let priorityEl = this.container.querySelector("#item-details__priority");
		priorityEl.innerHTML = viewProps.priority;

		let descriptionEl = this.container.querySelector(".model-description");
		if(viewProps.description != ""){
			descriptionEl.innerHTML = nl2br(viewProps.description);
		}else{
			descriptionEl.innerHTML = "Edit item to enter a description";
			descriptionEl.classList.add("model-description--empty");
		}
		
/*
		let breadcrumbEl = this.container.querySelector(".breadcrumb");
		let href = "#";
		let parentText = "All Items";
		if(viewProps.breadcrumbParent){
			href = viewProps.breadcrumbParent.href;
			parentText = viewProps.breadcrumbParent.text;
		}
		breadcrumbEl.appendChild(toHTML(
			`<li class="breadcrumb-item">` +
				`<a href="${href}">${parentText}</a>` + 
			`</li>`));
		breadcrumbEl.appendChild(toHTML(
			`<li class="breadcrumb-item">Item</li>`
		)); */
		let breadcrumbContainer = this.container.querySelector(".breadcrumb-container");
		breadcrumbContainer.replaceChildren();
		breadcrumbContainer.append(viewProps.breadcrumbs);

		/* NOTES CONTAINER
		let notesContainer = this.container.querySelector(".item-notes-container");
		notesContainer.replaceChildren();
		viewProps.notes.forEach(note => {
			let noteEl = toHTML(
				`<div class="note d-flex justify-content-between">` + 
					`<p class="note__text">${note.text}</p>` +
					`<button class="btn btn-danger delete-note-btn" data-js-note-id="${note.id}"><i class="fa-solid fa-xmark"></i></button>` +
				`</div>`);

			let deleteNoteBtn = noteEl.querySelector(".delete-note-btn");
			let deleteNoteFunc = this.callbacks.deleteNote;
			deleteNoteBtn.addEventListener("click", function(){
				let noteId = this.getAttribute("data-js-note-id");
				deleteNoteFunc(noteId);
			});

			notesContainer.appendChild(noteEl);
		});
		*/

		let itemsContainer = this.container.querySelector(".items-container");
		itemsContainer.replaceChildren();
		itemsContainer.appendChild(viewProps.subItemsView);
	}
};

ItemDetailedView.prototype = Object.create(View);

export default ItemDetailedView;