import { isSameDay, format } from 'date-fns';

import SynchronizingPresenter from './presenter.js';
import ItemsPresenter from './items-presenter.js';
import ModalFormPresenter from './modal-form-presenter.js';
import ItemFormPresenter from './item-form-presenter.js';

import TemplateView from '../views/template-view.js';

import { Items } from '../models/item.js';

var DayPresenter = function(date){
	Object.setPrototypeOf(this, Object.create(SynchronizingPresenter));
	this.subscribeToChanged();

	this.items = [];
	this.date = date;
	this.itemsPresenter = new ItemsPresenter(this.items);

	this.getTitle =	function(){
		let title = "";
		let today = new Date();
		let tomorrow = new Date(Date.now() + (24*60*60*1000));
		console.log({ date: this.date, today: today, tomorrow: tomorrow });
		if(isSameDay(this.date, today)){
			title = "Today";
		}else if(isSameDay(this.date, new Date(Date.now() + (24*60*60*1000)))){
			title = "Tomorrow";
		}else{
			title = format(this.date, 'EEEE, LLLL io, y');
		}

		return title;
	};

	this.viewProps = { title: this.getTitle(), };

	this.addItem = function(){
		let modalPresenter = new ModalFormPresenter(ItemFormPresenter, { modal: { title: "New Item", }, 
										 date: this.date, });
		modalPresenter.load();
		modalPresenter.view.render();
	};

	this.beforeInitialize = function(){
		this.view.callbacks.addItem = this.addItem.bind(this);
	};

	this.beforeLoad = function(){
		this.items.splice(0, this.items.length); //clear array
		Items.all().forEach(i => { 
			if(isSameDay(i.date, this.date)){
				this.items.push(i);
			}
		});
		this.itemsPresenter.load();
		this.viewProps.subview = this.itemsPresenter.getView(); 
	};

	this.createItem = function(args){
		Object.assign(args, { date: this.date });
		let item = Items.create(args);
		this.reload();
	};

	this.setView(new TemplateView());
};

export default DayPresenter;