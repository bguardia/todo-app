import SynchronizingPresenter from './presenter.js';
import SubItemFormView from '../views/subitem-form-view.js';

import { SubItems } from '../models/subitem.js';

var SubItemFormPresenter = function(opts = {}){
	Object.setPrototypeOf(this, Object.create(SynchronizingPresenter));
	
	this.defaultValues = Object.assign({ id: "",
					     itemId: "", 
					     title: "",
	                     priority: 0, }, opts);

	console.log("SubItemFormPresenter", this.defaultValues);
	this.viewProps = {};

	this.createOrUpdateItem = function(){
		let args = this.getFormData();
		console.log("args are:", args);
		let subItem = SubItems.find(i => i.id == this.defaultValues.id);
		if(subItem){
			console.log("SubItem exists, calling subItem.update");
			item.update(args);
		}else{
			console.log("SubItem does not exist. Creating new subItem.");
			SubItems.create(args);
		}
		this.emitChanged();
	};

	this.onSave = this.createOrUpdateItem.bind(this);

	this.beforeInitialize = function(){
	        this.view.onSave = this.createOrUpdateItem.bind(this);
	};

	this.beforeLoad = function(){
		this.viewProps = { title: this.defaultValues.title,
				           priority: this.defaultValues.priority,
				           itemId: this.defaultValues.itemId, };
	};

	this.getFormData = function(){
		return this.view.getFormData();
	};

	this.setView(new SubItemFormView()) //set default view;
};

export default SubItemFormPresenter;