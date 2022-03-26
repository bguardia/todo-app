import { View, toHTML } from './view.js';

var TemplateView = function(){
	this.titleEl = null;
	this.subviewContainer = null;
	this.toggleShowCompletedItemsButton = null;
	this.newItemButton = null;
	this.callbacks = {};

	this._initialize = function(){
		this.container = toHTML(
			`<div class="col-8">` + 
				`<h2 class="display-2 template-view__title"></h2>` +
				`<div class="template-view__subview"></div>` +
				`<button class="btn btn-primary template-view__item-btn">Add Item</button>` +
			`</div>`
		);

		let newItemBtn = this.container.querySelector(".template-view__item-btn");
		newItemBtn.addEventListener("click", this.callbacks.addItem);
	};

	this._clear = function(){//empty all DOM elements
		this.titleEl = null;
		this.newItemButton = null;
		this.subviewContainer = null;
		this.callbacks = { addItem: null, 
		                   toggleShowCompleted: null, };
	};

	this.load = function(viewProps){
		let titleEl = this.container.querySelector(".template-view__title");
		titleEl.innerHTML = viewProps.title;

		let subviewContainer = this.container.querySelector(".template-view__subview");
		subviewContainer.replaceChildren();
		subviewContainer.appendChild(viewProps.subview.container);
	}
}

TemplateView.prototype = Object.create(View);

export default TemplateView;