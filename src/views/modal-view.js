import { View } from './view.js';
import { Modal } from 'bootstrap';
import components from '../utilities/components.js';

var ModalView = function(){
	this.render = function(){
		document.body.appendChild(this.container);
		this.modal.show();
	};

	this.load = function(viewProps){
		let modalOpts = viewProps.modalOpts || {};
		this.container = components.modal(viewProps.title, viewProps.contentEl, modalOpts);
		this.procBtn = this.container.querySelector("#modal-save-btn");
		this.modal = new Modal(this.container);
		this.procBtn.addEventListener("click", function(e){
			viewProps.onProceed(e)
			this.modal.hide();
			this.remove();
		}.bind(this));
	}
};
ModalView.prototype = Object.create(View);

export default ModalView;