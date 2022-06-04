import { format } from 'date-fns';

import SynchronizingPresenter from './presenter.js';
import ItemFormView from '../views/item-form-view.js';

import { Items } from '../models/item.js';

var ItemFormPresenter = function(opts = {}){
	Object.setPrototypeOf(this, Object.create(SynchronizingPresenter));
	
	this.defaultValues = Object.assign({ 
						 id: "",
					     projectId: "", 
					     title: "",
			       		 date: new Date(), 
	                     priority: 0,
						 description: "", }, opts);

	console.log("ItemFormPresenter", this.defaultValues);
	this.viewProps = {};

	this.createOrUpdateItem = function(){
		let args = this.getFormData();
		console.log("args are:", args);
		let item = Items.find(i => i.id == this.defaultValues.id);
		if(item){
			console.log("Item exists, calling item.update");
			item.update(args);
		}else{
			console.log("Item does not exist. Creating new item.");
			Items.create(args);
		}
		this.emitChanged();
	};

	this.onSave = this.createOrUpdateItem.bind(this);

	this.beforeInitialize = function(){
	        this.view.onSave = this.createOrUpdateItem.bind(this);
	};

	this.beforeLoad = function(){
		this.viewProps = { title: this.defaultValues.title,
						   date: format(this.defaultValues.date, 'yyyy-MM-dd'),
				   	 	   priority: this.defaultValues.priority,
				   		   projectId: this.defaultValues.projectId,
						   description: this.defaultValues.description, };
	};

	this.getFormData = function(){
		return this.view.getFormData();
	};

	this.setView(new ItemFormView()) //set default view;
};

export default ItemFormPresenter;