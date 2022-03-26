import { View, toHTML } from './view.js';
import components from '../utilities/components.js';

var ProjectFormView = function(){

	this._initialize = function(){
		this.container = document.createElement("div");
		this.titleInputContainer = components.createInput({ label: "Name", name: "title", placeholder: "Go to the store" });
		this.titleInput = this.titleInputContainer.querySelector("input");
		this.container.appendChild(this.titleInputContainer);
		this._isInitialized = true;
	};

	this.load = function(viewProps){
		this.titleInput.value = viewProps.title;
	};

	this.getFormData = function(){
		return { title: this.titleInput.value };
	};
};
ProjectFormView.prototype = Object.create(View);

export default ProjectFormView;