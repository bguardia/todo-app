import { View, toHTML } from './view.js';
import components from '../utilities/components.js';

var SubItemFormView = function(){

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

		let priorityInput = this.container.querySelector("#priority-input");
		priorityInput.value = viewProps.priority;

		let itemIdInput = this.container.querySelector("#project-id-input");
		itemIdInput.value = viewProps.itemId;

        this.updatePriorityColor();
	};

	this.getFormData = function(){
		console.log("ItemFormView.getFormData:");
		let titleInput = this.container.querySelector("#title-input");
		let priorityInput = this.container.querySelector("#priority-input");
		let itemIdInput = this.container.querySelector("#project-id-input");

		let formData =  { title: titleInput.value,
		         	      itemId: itemIdInput.value,
				          priority: priorityInput.value, };
		console.log(formData);
		return formData;
	};

};
SubItemFormView.prototype = Object.create(View);

export default SubItemFormView;