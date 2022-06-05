import SynchronizingPresenter from './presenter.js';

import ModalView from '../views/modal-view.js';

var ModalFormPresenter = function(FormPresenter, opts = {}){
	Object.setPrototypeOf(this, Object.create(SynchronizingPresenter));
	this.viewProps = { modalOpts: {}};

	this.beforeLoad = function(){
		let presenter = new FormPresenter(opts);
		presenter.load();
	
		this.viewProps.title = (opts.modal && opts.modal.title) ? opts.modal.title : "FORM";
		this.viewProps.modalOpts.procButtonText = opts.modal && opts.modal.buttonText || "Save";
        this.viewProps.modalOpts.cancelButtonText = opts.modal && opts.modal.cancelButtonText || "Cancel";
		this.viewProps.contentEl = presenter.getView().container;
		this.viewProps.onProceed = presenter.onSave.bind(presenter);
	};

	this.setView(new ModalView());
};

export default ModalFormPresenter;
