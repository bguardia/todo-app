import components from '../utilities/components.js';
import { View, toHTML } from './view.js';


var cleanInput = function(inputStr){
	let cleanedStr = inputStr.replace(/</g, '&lt;').replace(/>/g, '&gt;');
	return cleanedStr;
};

var ItemFormView = function(){

	this.updatePriorityColor = function(){
		let priorityInput = this.container.querySelector("#priority-input");
		let inputValue = priorityInput.value;
		let priorityContainer = this.container.querySelector(".item-priority-container");
		let currentPriorityIcon = this.container.querySelector(".item-priority-icon");

		let iconValue = currentPriorityIcon.getAttribute("data-item-priority");
		if(inputValue != iconValue){
			priorityContainer.replaceChildren();
			let newPriorityIcon = components.priorityIcon(inputValue, { includeText: true });
			priorityContainer.appendChild(newPriorityIcon);
		}

		/*
		let iconValue = priorityIcon.getAttribute("data-item-priority");
		if(inputValue != iconValue){
			priorityIcon.setAttribute("data-item-priority", inputValue);
		} */
	};

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
						`<label class="form-label" for="priority-input">Priority</label>` +
						`<div class="row">` +
							`<div class="col flex-grow-1">` +
								`<input type="range" class="form-range" id="priority-input" name="title" min="0" max="4">` +
							`</div>` +
							`<div class="col flex-grow-1 item-priority-container">` +
								/* `<i class="fa-solid fa-flag item-priority-icon" data-item-priority="2"></i>` + */
							`</div>` +
					`</div>` +
				`</div>` +
			`</div>`
		);

		let priorityContainer = this.container.querySelector(".item-priority-container");
		priorityContainer.appendChild(components.priorityIcon(0, { includeText: true }));

		let priorityInput = this.container.querySelector("#priority-input");
		priorityInput.addEventListener("input", this.updatePriorityColor.bind(this));
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

		this.updatePriorityColor();

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