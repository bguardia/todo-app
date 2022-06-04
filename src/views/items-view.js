import { View, toHTML } from './view.js';

var ItemsView = function(){

	this.callbacks = {};

	this._initialize = function(title){
		this.container = toHTML(
				`<div>` +
					`<div>` +
						`<div class="row align-items-end">` +
							`<div class="col">` +
								`<button class="btn btn-primary" id="show-completed-btn" data-state="show">Show Completed Items</button>` +
							`</div>` +
							`<div class="col">` +
								`<label class="form-label" for="sort-by-select">Sort By</label>` +
								`<select class="form-select" name="sortBy" id="sort-by-select">` +
									'<option value="date">Date</option>' +
									'<option value="priority">Priority</option>' +
								'</select>' +
							`</div>` +
							`<div class="col">` +
								`<label class="form-label" for="sort-order-select">Order</label>` +
								`<select class="form-select" name="sortOrder" id="sort-order-select">` +
									`<option value="desc">Descending</option>` +
									`<option value="asc">Ascending</option>` +
								`</select>` +
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

		let changeSort = this.callbacks.changeSort;
		this.sortBySelector = this.container.querySelector("#sort-by-select");
		this.sortOrderSelector = this.container.querySelector("#sort-order-select");
		[this.sortBySelector, this.sortOrderSelector].forEach(el => {
			el.addEventListener("change", function(){
				let sortOpts = {};
				sortOpts[this.name] = this.value;
				changeSort(sortOpts);
			})
		});

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
		Array.from(this.sortBySelector.children).forEach(el => {
			if(el.value == viewProps.sortBy){
				el.setAttribute("selected", "");
			}else{
				el.removeAttribute("selected");
			}
		});

		Array.from(this.sortOrderSelector.children).forEach(el => {
			if(el.value == viewProps.sortOrder){
				el.setAttribute("selected", true);
			}else{
				el.setAttribute("selected", false);
			}
		});

		this.itemsContainer.replaceChildren();
		if(!!viewProps.itemComponents.length){
			viewProps.itemComponents.forEach(i => {
				this.itemsContainer.appendChild(i.container);
			});
		} else {
            this.itemsContainer.appendChild(toHTML(`<p class="empty-container-placeholder">No items found</p>`))
        }
	};

	this.renderIn = function(parentEl){
		parentEl.appendChild(this.container);
	};

};

ItemsView.prototype = Object.create(View);

export default ItemsView;