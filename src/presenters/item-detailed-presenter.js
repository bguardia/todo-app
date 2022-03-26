import { format } from 'date-fns';
import SynchronizingPresenter from './presenter.js';
import ModalFormPresenter from './modal-form-presenter.js';
import NoteFormPresenter from './note-form-presenter.js';
import ItemFormPresenter from './item-form-presenter.js';

import ItemDetailedView from '../views/item-detailed-view.js';



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

	this.newNote = function(){
		let noteModalForm = new ModalFormPresenter(NoteFormPresenter, { modal: { title: "New Note", }, itemId: this.item.id, });
		noteModalForm.load();
		noteModalForm.view.render();
	}

	this.beforeInitialize = function(){
		this.view.callbacks.editItem = this.editItem.bind(this);
		this.view.callbacks.newNote = this.newNote.bind(this);
	};

	this.beforeLoad = function(){
		this.viewProps = { title: this.item.title, 
		                   date: format(this.item.date, 'MM/dd'),
				   		   priority: this.item.priority, 
						   notes: this.item.notes, };
	};

	this.setView(new ItemDetailedView);
};

export default ItemDetailedPresenter;