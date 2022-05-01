import { format, startOfDay, endOfDay } from 'date-fns';

import SynchronizingPresenter from './presenter.js';
import ItemsPresenter from './items-presenter.js';
import ModalFormPresenter from './modal-form-presenter.js';
import ItemFormPresenter from './item-form-presenter.js';

import TemplateView from '../views/template-view.js';

import { Items } from '../models/item.js';
import BreadcrumbPresenter from './breadcrumb-presenter.js';

var PeriodPresenter = function(startDate, endDate){
	Object.setPrototypeOf(this, Object.create(SynchronizingPresenter));
	this.subscribeToChanged();
	
	this.startDate = startDate;
	this.endDate = endDate;
	this.showCompleted = false;

	this.items = [];
	this.itemsPresenter = new ItemsPresenter(this.items);

	this.viewProps = { };
	this.viewProps.title = `${format(this.startDate, 'MM/dd')} to ${format(this.endDate, 'MM/dd')}`;

	this.addItem = function(){
		let modalPresenter = new ModalFormPresenter(ItemFormPresenter, { modal: { title: "New Item" },
										 date: this.startDate, });
		modalPresenter.load();
		modalPresenter.view.render();
	};

	this.beforeInitialize = function(){
		this.view.callbacks.addItem = this.addItem.bind(this);
	};

	this.beforeLoad = function(){
		this.items.splice(0, this.items.length);
		Items.all().forEach(i => {
			if(i.date >= startOfDay(this.startDate) &&
			   i.date <= endOfDay(this.endDate)){
				this.items.push(i);
			}
		});

		let breadcrumbPresenter = new BreadcrumbPresenter([{text: "Views"}, {text: "Week View"}]);
		breadcrumbPresenter.load();
		this.viewProps.breadcrumbs = breadcrumbPresenter.view.container;

		this.itemsPresenter.load();
		this.viewProps.subview = this.itemsPresenter.getView();
	};

	this.setView(new TemplateView()) //set default view;
};

export default PeriodPresenter;