import { View, toHTML } from './view.js';

var cleanInput = function(inputStr){
	let cleanedStr = inputStr.replace(/</g, '&lt;').replace(/>/g, '&gt;');
	return cleanedStr;
};

var ProjectFormView = function(){

	this._initialize = function(){

		this.container = toHTML(
			`<div>` +
				`<div class="row">` +
					`<div class="col">` +
						`<label class="form-label" for="title-input">Name</label>` +
						`<input type="text" class="form-control" id="title-input" name="title" placeholder="A name for your project (around the house, work, etc.)">` +
					`</div>` +
				`</div>` +
				`<div class="row">` +
					`<div class="col">` +
						`<label class="form-label" for="description-input">Description</label>` +
						`<textarea class="form-control" id="description-input" name="description" rows="3" placeholder="A description of your project"></textarea>` +
					`</div>` +
				`</div>` +
			`</div>`
		);
	};

	this.load = function(viewProps){
		let titleInput = this.container.querySelector("#title-input");
		titleInput.value = viewProps.title;

		let descriptionInput = this.container.querySelector("#description-input");
		descriptionInput.innerHTML = viewProps.description;
	};

	this.getFormData = function(){
		let titleInput = this.container.querySelector("#title-input");
		let descriptionInput = this.container.querySelector("#description-input");
		return { title: titleInput.value,
		         description: cleanInput(descriptionInput.value), };
	};
};
ProjectFormView.prototype = Object.create(View);

export default ProjectFormView;