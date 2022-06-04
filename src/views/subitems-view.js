import { View, toHTML } from './view.js';

var SubItemsView = function(){

	this.callbacks = {};

	this._initialize = function(title){
		this.container = toHTML(
				`<div>` +
					`<div>` +
						`<div class="row align-items-end">` +
							`<div class="col">` +
								`<button class="btn btn-primary" id="show-completed-btn" data-state="show">Show Completed SubItems</button>` +
							`</div>` +
						`</div>` +
					`</div>` +
					`<ul class="item-pills-group" id="items-container"></ul>` +
				`</div>`);

		let toggleCallback = this.toggleShowCompleted.bind(this);
		this.toggleShowCompletedItemsButton = this.container.querySelector("#show-completed-btn");
		this.toggleShowCompletedItemsButton.addEventListener("click", function(){
			toggleCallback(this);
		})

		this.itemsContainer = this.container.querySelector("#items-container");
	};

	this.toggleShowCompleted = function(btn){
		let btnState = btn.getAttribute("data-state");
		if(btnState == "show"){
			btn.setAttribute("data-state", "hide");
			btn.innerHTML = "Hide Completed Items";
		}else{
			btn.setAttribute("data-state", "show");
			btn.innerHTML = "Show Completed Items";
		}
		this.callbacks.toggleShowCompleted();
	};

	this.load = function(viewProps){

		this.itemsContainer.replaceChildren();
		if(!!viewProps.itemComponents.length){
			viewProps.itemComponents.forEach(i => {
				this.itemsContainer.appendChild(i.container);
			});
		} else {
            this.itemsContainer.appendChild(toHTML(`<p class="empty-container-placeholder">No subitems</p>`))
        }
	};

	this.renderIn = function(parentEl){
		parentEl.appendChild(this.container);
	};

};

SubItemsView.prototype = Object.create(View);

export default SubItemsView;