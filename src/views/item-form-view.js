import { View, toHTML } from './view.js';


var cleanInput = function(inputStr){
	let cleanedStr = inputStr.replace(/</g, '&lt;').replace(/>/g, '&gt;');
	return cleanedStr;
};

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
						`<label class="form-label" for="description-input">Description</label>` +
						`<textarea class="form-control" id="description-input" name="description" placeholder="A description or details for this item"></textarea>` +
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

		let descriptionInput = this.container.querySelector("#description-input");
		descriptionInput.innerHTML = viewProps.description;
	};

	this.getFormData = function(){
		console.log("ItemFormView.getFormData:");
		let titleInput = this.container.querySelector("#title-input");
		let dateInput = this.container.querySelector("#date-input");
		let priorityInput = this.container.querySelector("#priority-input");
		let projectIdInput = this.container.querySelector("#project-id-input");
		let descriptionInput = this.container.querySelector("#description-input");

		let formData =  { title: titleInput.value,
		         	  	  date: new Date(dateInput.value),
		         	  	  projectId: projectIdInput.value,
				      	  priority: priorityInput.value,
				  	 	  description: cleanInput(descriptionInput.value), };
		console.log(formData);
		return formData;
	};

};
ItemFormView.prototype = Object.create(View);

export default ItemFormView;