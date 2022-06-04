import { format } from 'date-fns';
import ApplicationPresenter from './application-presenter.js';
import SynchronizingPresenter from './presenter.js';
import ModalConfirmationPresenter from './modal-confirmation-presenter.js';
import SubItemView from '../views/subitem-view.js';

var SubItemPresenter = function(item, opts = {}){
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

	this.beforeInitialize = function(){
		this.view.callbacks.deleteItem = this.deleteItem.bind(this);
	};

	this.viewProps = { title: this.itemModel.title, 
			   priority: this.itemModel.priority, 
			   isComplete: this.itemModel.isComplete,
			   markComplete: this.markComplete.bind(this), };

	Object.assign(this.viewProps, opts);

	this.setView(new SubItemView());
};

export default SubItemPresenter;