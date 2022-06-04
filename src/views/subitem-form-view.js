import { View, toHTML } from './view.js';

var SubItemFormView = function(){

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

		let priorityInput = this.container.querySelector("#priority-input");
		priorityInput.value = viewProps.priority;

		let itemIdInput = this.container.querySelector("#project-id-input");
		itemIdInput.value = viewProps.itemId;
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