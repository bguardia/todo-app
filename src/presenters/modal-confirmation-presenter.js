import SynchronizingPresenter from './presenter.js';

import ModalView from '../views/modal-view.js';

import { toHTML } from '../utilities/string-to-html.js';

var ModalConfirmationPresenter = function(opts){
	Object.setPrototypeOf(this, Object.create(SynchronizingPresenter));

 	let contentText = opts.text || "Are you sure you want to proceed?";
	let defaultContent = toHTML(`<p>${contentText}</p>`);

	this.viewProps = Object.assign({ title: "Confirm",
									 contentEl: defaultContent,
									 onProceed: null,
									 //onCancel: null,
									 modalOpts: { procButtonText: "Confirm",
					   				 			  cancelButtonText: "Cancel", },
					   				}, opts);

	this.setView(new ModalView());
}

export default ModalConfirmationPresenter;