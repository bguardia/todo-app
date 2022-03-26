import SynchronizingPresenter from './presenter.js';
import ModalFormPresenter from './modal-form-presenter.js';
import ModalConfirmationPresenter from './modal-confirmation-presenter.js';
import ProjectFormPresenter from './project-form-presenter.js';
import ItemsPresenter from './items-presenter.js';
import ItemFormPresenter from './item-form-presenter.js';

import ProjectView from '../views/project-view';

var ProjectPresenter = function(pObj){
	Object.setPrototypeOf(this, Object.create(SynchronizingPresenter));
	this.subscribeToChanged();

	this.projectModel = pObj;
	this.viewProps = { project: pObj };
	this.allowShowCompleted = false;

	this.items = [];
	this.itemsPresenter = new ItemsPresenter(this.items);

	this.beforeLoad = function(){
		this.items.splice(0, this.items.length);
		this.projectModel.items.forEach(i => { this.items.push(i) });

		this.itemsPresenter.load();
		this.viewProps.subview = this.itemsPresenter.getView();
		this.view.callbacks.editProject = this.editProject.bind(this);
		this.view.callbacks.addItem = this.newItem.bind(this);
		this.view.callbacks.deleteProject = this.deleteProject.bind(this);
	}

	this.editProject = function(){
		let projectData = Object.assign({ id: this.projectModel.id, }, this.projectModel);
		let modalOpts = Object.assign({ modal: { title: "Edit Project", }, }, projectData);
		let pModalPresenter = new ModalFormPresenter(ProjectFormPresenter, modalOpts); 
		pModalPresenter.load();
		pModalPresenter.view.render();
	};

	this.deleteProject = function(){
		let deleteProjFunc = function(){
				this.projectModel.destroy();
				this.emitChanged();
				this.unload();
		}.bind(this);

		let modalArgs = { title: "Confirm Delete", 
						  text: "Are you sure you want to delete this project?",
						  onProceed: deleteProjFunc,
						  modalOpts: { procButtonText: "Confirm", 
									   cancelButtonText: "Cancel", }, }

		let confirmModal = new ModalConfirmationPresenter(modalArgs);
		confirmModal.load();
		confirmModal.view.render();
	}

	this.newItem = function(){
		let modalPresenter = new ModalFormPresenter(ItemFormPresenter, { modal: { title: "New Item", }, 
									         projectId: this.projectModel.id });
		modalPresenter.load();
		modalPresenter.view.render();
	};

	this.setView(ProjectView);
};

export default ProjectPresenter;