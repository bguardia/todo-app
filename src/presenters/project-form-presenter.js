
import SynchronizingPresenter from './presenter.js';

import ProjectFormView from '../views/project-form-view.js';

import { Projects } from '../models/project.js';

var ProjectFormPresenter = function(opts = {}){
	Object.setPrototypeOf(this, Object.create(SynchronizingPresenter));
	//does not reload so does not need to subscribe to onChanged event	

	this.viewProps = Object.assign({ title: "" }, opts);

	this.createOrUpdateProject = function(){
		let args = this.getFormData();
		let project = Projects.find(p => p.id === this.viewProps.id);
		if(project){
			project.update(args);
		}else{
			Projects.create(args);
		}
		this.emitChanged();
	};

	this.onSave = this.createOrUpdateProject.bind(this);

	this.getFormData = function(){
		return this.view.getFormData();
	}

	this.setView(new ProjectFormView()) //set default view;
};

export default ProjectFormPresenter;