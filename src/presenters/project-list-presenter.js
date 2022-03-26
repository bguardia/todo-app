import SynchronizingPresenter from './presenter.js';
import ApplicationPresenter from './application-presenter.js';

import ProjectListView from '../views/project-list-view.js';

import { Projects } from '../models/project.js';

var ProjectListPresenter = function(){
	Object.setPrototypeOf(this, Object.create(SynchronizingPresenter));
	this.subscribeToChanged();

	this.viewProps = { projects: {}, };

	this.beforeLoad = function(){
		Projects.all().forEach(p => {
			if(this.viewProps.projects[p.id]){
				this.viewProps.projects[p.id].checked = true;
			}else{
				this.viewProps.projects[p.id] = { model: p,
								  				  hideItems: true, 
												  checked: true, };
			}
		});

		//Remove any projects that no longer exist in DB
		Object.keys(this.viewProps.projects).forEach(pId => {
			let projectData = this.viewProps.projects[pId];
			if(!projectData.checked){
				delete this.viewProps.projects[pId];
			}
		});
	};

	this.afterLoad = function(){
		//Reset projects' checked status so they will be checked again on next load 
		Object.keys(this.viewProps.projects).forEach(pId => {
			let projectData = this.viewProps.projects[pId];
			projectData.checked = false;
		});
	}

	this.toggleHidden = function(projectId){
		this.viewProps.projects[projectId].hideItems = !this.viewProps.projects[projectId].hideItems;
	}

	this.beforeInitialize = function(){
		this.view.callbacks.toggleHidden = this.toggleHidden.bind(this);
		this.view.callbacks.showProject = ApplicationPresenter.projectView;
	}

	this.setView(new ProjectListView());
};

export default ProjectListPresenter;