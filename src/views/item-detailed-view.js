import { View, toHTML } from './view.js';

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

export default ItemDetailedView;