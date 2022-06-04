
import SynchronizingPresenter from './presenter.js';

import ProjectFormView from '../views/project-form-view.js';
import ApplicationPresenter from './application-presenter.js';

import { Projects } from '../models/project.js';

var ProjectFormPresenter = function(opts = {}){
	Object.setPrototypeOf(this, Object.create(SynchronizingPresenter));
	//does not reload so does not need to subscribe to onChanged event	

	this.viewProps = Object.assign({ title: "",
                                     description: "", }, opts);

	this.createOrUpdateProject = function(){
		let args = this.getFormData();
		console.log(`formData is:`);
		console.log(args);
		let existingProject = Projects.find(p => p.id === this.viewProps.id);
		if(existingProject){
			existingProject.update(args);
		}else{
			let newProject = Projects.create(args);
			ApplicationPresenter.route(`project${newProject.id}`);
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