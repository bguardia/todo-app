import { format } from 'date-fns';
import ApplicationPresenter from './application-presenter.js';
import SynchronizingPresenter from './presenter.js';
import ModalConfirmationPresenter from './modal-confirmation-presenter.js';
import ModalFormPresenter from './modal-form-presenter.js';
import ItemFormPresenter from './item-form-presenter.js';
import ItemView from '../views/item-view.js';

var ItemPresenter = function(item, opts = {}){
	Object.setPrototypeOf(this, Object.create(SynchronizingPresenter));
	
	this.itemModel = item;

	this.markComplete = function(){
		this.itemModel.isComplete = true;
		this.reload();
	};

	this.editItem = function(){
		let itemOpts = Object.assign({ id: this.itemModel.id,
			     		       projectId: this.itemModel.projectId, }, this.itemModel); //id and projectId currently aren't enumerable, plan to change in future
		let opts = Object.assign({ modal: { title: "Edit Item", 
				           					buttonText: "Update", },
			   		 					  }, itemOpts);

		let itemFormModal = new ModalFormPresenter(ItemFormPresenter, opts);
		itemFormModal.load();
		itemFormModal.view.render();
	};

	this.deleteItem = function(){
		let onProceedFunc = function(){
			this.itemModel.destroy();
			this.reload();
		}.bind(this);

		let args = { title: "Confirm Delete",
					 text: "Are you sure you want to delete this item?",
					 onProceed: onProceedFunc,
				     modalOpts: { procButtonText: "Delete",
					              cancelButtonText: "Cancel", },
		}

		let confirmDeleteModal = new ModalConfirmationPresenter(args);
		confirmDeleteModal.load();
		confirmDeleteModal.view.render();
	
	}

	this.showDetailedView = function(){
		ApplicationPresenter.itemDetailedView(this.itemModel.id);
	};

	this.beforeInitialize = function(){
		this.view.callbacks.showDetailedView = this.showDetailedView.bind(this);
		this.view.callbacks.deleteItem = this.deleteItem.bind(this);
		this.view.callbacks.editItem = this.editItem.bind(this);
	};

	this.viewProps = { title: this.itemModel.title, 
			   date: format(this.itemModel.date, 'MM/dd'),
			   priority: this.itemModel.priority, 
			   isComplete: this.itemModel.isComplete,
			   markComplete: this.markComplete.bind(this), };

	Object.assign(this.viewProps, opts);

	this.setView(new ItemView());
};

export default ItemPresenter;
