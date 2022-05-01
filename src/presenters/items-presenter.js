import SynchronizingPresenter from './presenter.js';
import ItemPresenter from './item-presenter.js';

import ItemsView from '../views/items-view.js';

var ItemsPresenter = function(items){
	Object.setPrototypeOf(this, Object.create(SynchronizingPresenter));
	//this.subscribeToChanged();

	this.items = items;
	this.viewProps = {};
	this.sortBy = "date";
	this.sortOrder = "asc";

	this.showCompleted = false;
	this.toggleShowCompleted = function(){
		this.showCompleted = !this.showCompleted;
		this.reload();
	};

	this.changeSort = function(sortOpts){
		let sortChanged = false
		if(sortOpts.sortBy && this.sortBy != sortOpts.sortBy){
			this.sortBy = sortOpts.sortBy;
			sortChanged = true;
		}
		if(sortOpts.sortOrder && this.sortOrder != sortOpts.sortOrder){
			this.sortOrder = sortOpts.sortOrder;
			sortChanged = true;
		}
		if(sortChanged){
			this.reload(false); //Don't emit onChanged
		}
	};

	this.sortItems = function(){
		let sortOrder = this.sortOrder == "desc" ? -1 : 1;

		this.items.sort((a, b) => {
			if(a[this.sortBy] > b[this.sortBy]){
				return sortOrder * 1;
			}else if(a[this.sortBy] < b[this.sortBy]){
				return sortOrder * -1;
			}
			return 0;
		});	
	};

	this.beforeInitialize = function(){
		this.view.callbacks.changeSort = this.changeSort.bind(this);
		this.view.callbacks.toggleShowCompleted = this.toggleShowCompleted.bind(this);
	};

	this.beforeViewLoad = function(){
		this.sortItems();
		this.viewProps.sortBy = this.sortBy;
		this.viewProps.sortOrder = this.sortOrder;

		let itemComponents = this.items.map(i => { 
			let hide = !(this.showCompleted || !i.isComplete);
			let iPresenter = new ItemPresenter(i, { hide });
			iPresenter.load();
			return iPresenter.getView(); });

		this.viewProps.itemComponents = itemComponents;
	};

	this.setView(new ItemsView());
};

export default ItemsPresenter;