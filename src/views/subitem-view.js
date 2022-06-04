import { View, toHTML } from './view.js';

var SubItemView = function(){
	this.container = null;
	this.itemTitle = null;
	this.itemPriority = null;

	this.callbacks = {};

	this._initialize = function(){

		this.container = toHTML(
			`<div class="item-pill d-flex align-items-center mt-2 mb-2">` +
				//`<div class="item-pill__text-container d-flex flex-column justify-content-center">` +
				`<div class="item-pill__text-container flex-grow-1">` +
					`<div class="row">` +
						`<p class="item-pill__title fs-4"></p>` +
					`</div>` +
					//`<div class="item-pill__details d-flex justify-content-evenly">` +
					`<div class="row">` +
					`<div class="item-pill__details">` +
						`<p><i class="fa-solid fa-flag"></i><span class="item-pill__priority"></span></p>` +
					`</div>` +
					`</div>` +
				`</div>` +
				`<div class="item-pill__controls d-flex flex-column p-2">` +
					`<button class="btn btn-outline-secondary btn-sm item-pill__edit">` +
						`<i class="fa-solid fa-pen"></i>` +
					`</button>` +
					`<button class="btn btn-outline-danger btn-sm item-pill__delete">` +
						`<i class="fa-solid fa-xmark"></i>` +
					`</button>` +
			`</div>`);

		this.itemTitle = this.container.querySelector(".item-pill__title");

		this.itemPriority = this.container.querySelector(".item-pill__priority");

		this.itemDeleteBtn = this.container.querySelector(".item-pill__delete");
		this.itemDeleteBtn.addEventListener("click", this.callbacks.deleteItem);

	};

	this._markCompleteButton = function(markComplete){
		let completeBtn = document.createElement("button");
		completeBtn.className = "item-pill__mark-complete-btn btn btn-outline-success rounded-circle flex-grow-0";
		completeBtn.addEventListener("click", markComplete);
		return completeBtn; 
	};

	this.load = function(iObj){
		this.itemTitle.innerHTML = iObj.title;
		this.itemPriority.innerHTML = iObj.priority;

		if(!this.completeBtn){
			this.completeBtn = this._markCompleteButton(iObj.markComplete);
			this.container.prepend(this.completeBtn);
		}

		if(iObj.isComplete){
			this.completeBtn.setAttribute("disabled", "");
			this.completeBtn.classList.remove("btn-outline-success");
			this.completeBtn.classList.add("btn-success");
		}else{
			this.completeBtn.removeAttribute("disabled");
			this.completeBtn.classList.remove("btn-success");
			this.completeBtn.classList.add("btn-outline-success");
		}

		if(iObj.hide){
			this.container.classList.add("d-none");
		}else{
			this.container.classList.remove("d-none");
		}
	};
}

SubItemView.prototype = Object.create(View);

export default SubItemView;