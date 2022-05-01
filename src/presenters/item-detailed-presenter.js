import { format } from 'date-fns';
import SynchronizingPresenter from './presenter.js';
import ModalFormPresenter from './modal-form-presenter.js';
import NoteFormPresenter from './note-form-presenter.js';
import ItemFormPresenter from './item-form-presenter.js';

import ItemDetailedView from '../views/item-detailed-view.js';
import ModalConfirmationPresenter from './modal-confirmation-presenter.js';
import BreadcrumbPresenter from './breadcrumb-presenter.js';

import { Notes } from '../models/note.js';


var ItemDetailedPresenter = function(item){
	Object.setPrototypeOf(this, Object.create(SynchronizingPresenter));
	this.subscribeToChanged();

	this.item = item;
	this.viewProps = {};
	
	this.editItem = function(){
		let itemOpts = Object.assign({ id: this.item.id,
			     		       projectId: this.item.projectId, }, this.item); //id and projectId currently aren't enumerable, plan to change in future
		let opts = Object.assign({ modal: { title: "Edit Item", 
				           buttonText: "Update", },
			   		 }, itemOpts);

		let itemFormModal = new ModalFormPresenter(ItemFormPresenter, opts);
		itemFormModal.load();
		itemFormModal.view.render();
	};

	this.deleteItem = function(){
		let deleteItemFunc = function(){
			this.item.destroy();
			this.emitChanged();
			this.unload();
		}.bind(this);

		let modalArgs = { title: "Confirm Delete", 
						text: "Are you sure you want to delete this item?",
						onProceed: deleteItemFunc,
						modalOpts: { procButtonText: "Confirm", 
									cancelButtonText: "Cancel", }, }

		let confirmModal = new ModalConfirmationPresenter(modalArgs);
		confirmModal.load();
		confirmModal.view.render();
	};

	this.newNote = function(){
		let noteModalForm = new ModalFormPresenter(NoteFormPresenter, { modal: { title: "New Note", }, itemId: this.item.id, });
		noteModalForm.load();
		noteModalForm.view.render();
	};

	this.deleteNote = function(noteId){
		let note = Notes.find(n => n.id == noteId);
		if(note){
			note.destroy();
			this.reload();
		}
	}

	this.beforeInitialize = function(){
		this.view.callbacks.editItem = this.editItem.bind(this);
		this.view.callbacks.newNote = this.newNote.bind(this);
		this.view.callbacks.deleteItem = this.deleteItem.bind(this);
		this.view.callbacks.deleteNote = this.deleteNote.bind(this);
	};

	this.beforeLoad = function(){
		let breadcrumbThis = {text: this.item.title};
		let breadcrumbParent = {text: "Items"};
		let projectId = null;
		if(projectId = this.item.projectId){
			breadcrumbParent = {href: `project${projectId}`, text: this.item.project.title}
		}

		let breadcrumbPresenter = new BreadcrumbPresenter([breadcrumbParent, breadcrumbThis]);
		breadcrumbPresenter.load();
		let breadcrumbView = breadcrumbPresenter.view.container;

		this.viewProps = { title: this.item.title, 
		                   date: format(this.item.date, 'MM/dd'),
				   		   priority: this.item.priority, 
						   notes: this.item.notes, 
						   breadcrumbs: breadcrumbView,
						 };
	};

	this.setView(new ItemDetailedView);
};

export default ItemDetailedPresenter;