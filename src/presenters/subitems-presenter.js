import SynchronizingPresenter from './presenter.js';
import SubItemPresenter from './subitem-presenter.js';

import SubItemsView from '../views/subitems-view.js';

var SubItemsPresenter = function(items){
	Object.setPrototypeOf(this, Object.create(SynchronizingPresenter));
	//this.subscribeToChanged();

	this.items = items;
	this.viewProps = {};

	this.showCompleted = false;
	this.toggleShowCompleted = function(){
		this.showCompleted = !this.showCompleted;
		this.reload();
	};

	this.beforeInitialize = function(){
		this.view.callbacks.toggleShowCompleted = this.toggleShowCompleted.bind(this);
	};

	this.beforeViewLoad = function(){

		let itemComponents = this.items.map(i => { 
			let hide = !(this.showCompleted || !i.isComplete);
			let iPresenter = new SubItemPresenter(i, { hide });
			iPresenter.load();
			return iPresenter.getView(); });

		this.viewProps.itemComponents = itemComponents;
	};

	this.setView(new SubItemsView());
};

export default SubItemsPresenter;