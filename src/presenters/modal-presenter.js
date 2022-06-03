import SynchronizingPresenter from './presenter.js';

import ModalView from '../views/modal-view.js';

var ModalPresenter = function(opts = {}){
	Object.setPrototypeOf(this, Object.create(SynchronizingPresenter));
	this.viewProps = { modalOpts: {}, };

	this.beforeLoad = function(){
		this.viewProps.title = opts.modal && opts.modal.title || "FORM";
        this.viewProps.modalOpts.buttonless = opts.modal && opts.modal.buttonless || false;
		this.viewProps.modalOpts.procButtonText = opts.modal && opts.modal.buttonText || "Save";
        this.viewProps.modalOpts.cancelButtonText = opts.modal && opts.modal.cancelButtonText || "Cancel";
		this.viewProps.contentEl = opts.modal.contentEl;
		this.viewProps.onProceed = opts.modal.onProceed;
	};

	this.setView(new ModalView());
};

export default ModalPresenter;