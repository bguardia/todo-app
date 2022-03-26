import { format } from 'date-fns';
import SynchronizingPresenter from './presenter.js';
import ModalConfirmationPresenter from './modal-confirmation-presenter.js';
import ItemView from '../views/item-view.js';

var ItemPresenter = function(item, opts = {}){
	Object.setPrototypeOf(this, Object.create(SynchronizingPresenter));
	
	this.itemModel = item;

	this.markComplete = function(){
		this.itemModel.isComplete = true;
		this.reload();
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
