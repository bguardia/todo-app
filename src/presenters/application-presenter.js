import SynchronizingPresenter from './presenter.js';
import DayPresenter from './day-presenter.js';
import ProjectPresenter from './project-presenter.js';
import ProjectListPresenter from './project-list-presenter.js';
import ProjectFormPresenter from './project-form-presenter.js';
import ItemFormPresenter from './item-form-presenter.js';
import PeriodPresenter from './period-presenter.js';
import ItemDetailedPresenter from './item-detailed-presenter.js';
import ModalFormPresenter from './modal-form-presenter.js';
import CalendarPresenter from './calendar-presenter.js';
import ModalConfirmationPresenter from './modal-confirmation-presenter.js';

import { Projects } from '../models/project.js';
import { Items } from '../models/item.js';

const ONE_DAY = 24*60*60*1000;
const ONE_WEEK = ONE_DAY * 7;

var ApplicationPresenter = (function (){
	let subpresenter = null;

	let appPresenter = Object.create(SynchronizingPresenter);
	appPresenter.viewProps = {};
	appPresenter.projectList = new ProjectListPresenter();

	appPresenter.beforeInitialize = function(){
		this.view.callbacks.showTodayView = this.todayView.bind(this);
		this.view.callbacks.showTomorrowView = this.tomorrowView.bind(this);
		this.view.callbacks.showCalendarView = this.calendarView.bind(this);
		this.view.callbacks.newProject = this.newProject.bind(this);
		this.view.callbacks.newItem = this.newItem.bind(this);
		this.view.callbacks.clearLocalStorage = this.clearLocalStorage.bind(this);
	}

	appPresenter.beforeLoad = function(){
		//appPresenter.viewProps.projects = Projects.all();	
		this.projectList.load();
		this.viewProps.projectListView = this.projectList.getView();
	};

	//Subviews
	appPresenter.setSubview = function(presenter){
		if(subpresenter){
			subpresenter.unload();
		}
		subpresenter = presenter;
		subpresenter.load();
		this.view.loadSubview(subpresenter.getView());
	};

	appPresenter.todayView = function(){
		appPresenter.setSubview(new DayPresenter(new Date()));
	};

	appPresenter.tomorrowView = function(){
		let tomorrowPresenter = new DayPresenter(new Date(Date.now() + ONE_DAY));
		appPresenter.setSubview(tomorrowPresenter);
	};

	appPresenter.calendarView = function(){
		/*
		let today = new Date();
		let oneWeekLater = new Date(Date.now() + ONE_WEEK);
		appPresenter.setSubview(new PeriodPresenter(today, oneWeekLater)); */
		appPresenter.setSubview(new CalendarPresenter());
	};

	appPresenter.projectView = function(pId){
		let project = Projects.find(p => p.id === pId);
		appPresenter.setSubview(new ProjectPresenter(project));
	};

	appPresenter.itemDetailedView = function(iId){
		let item = Items.find(i => i.id === iId);
		appPresenter.setSubview(new ItemDetailedPresenter(item));
	};

	//projects getter
	appPresenter.projects = function(){
		return projects;
	};

	//User interactions
	appPresenter.newProject = function(){
		let pModalPresenter = new ModalFormPresenter(ProjectFormPresenter, { modal: { title: "New Project", }, });
		pModalPresenter.load();
		pModalPresenter.view.render();
	};

	appPresenter.newItem = function(){
		let iModalPresenter = new ModalFormPresenter(ItemFormPresenter, { modal: { title: "New Item", }});
		iModalPresenter.load();
		iModalPresenter.view.render();
	};

	//Choose a subview to load based on a string
	appPresenter.route = function(routeStr){
		console.log(`ApplicationPresenter.route: routeStr is ${routeStr}`);
		//2D Array of Route Patterns with their respective destination functions
		//If a capture group is supplied in the pattern, it will be sent as an argument to the function
		let appRoutes = [[/project(\d+)/, this.projectView],
					 	[/item(\d+)/, this.itemDetailedView],
					 	[/today/, this.todayView],
					 	[/tomorrow/, this.tomorrowView],
					 	[/weekView/, this.weekView] ];
		
		let foundRouteFunc = null;
		appRoutes.find(appRoute => {
			let routePatt = appRoute[0];
			let routingFunc = appRoute[1];
			let matchedRoute = null;
			if((matchedRoute = routePatt.exec(routeStr)) != null){
				let arg = matchedRoute.length > 1 ? matchedRoute[1] : null;
				console.log(matchedRoute);
				console.log(`arg is: ${arg}`);
				foundRouteFunc = function(){ routingFunc(arg) };
				return true;
			}
			return false;
		});

		if(foundRouteFunc){
			foundRouteFunc();
		}else{
			console.log("Route not found");
		}
	};

	appPresenter._clearLocalStorage = function(){
		//is set by app's loading function in index.js
	};

	appPresenter.clearLocalStorage = function(){
		console.log("ApplicationPresenter.clearLocalStorage");

		let clearStorageFunc = function(){
			this._clearLocalStorage();
			this.reload();
			this.todayView();
		}.bind(this);

		let modalArgs = { title: "Confirm Delete", 
						  text: "Are you sure you want to delete all ToDoApp data in local storage?",
						  onProceed: clearStorageFunc,
						  modalOpts: { procButtonText: "Confirm", 
									cancelButtonText: "Cancel", }, }

		let confirmModal = new ModalConfirmationPresenter(modalArgs);
		confirmModal.load();
		confirmModal.view.render();
	};

	return appPresenter;
})();

export default ApplicationPresenter;