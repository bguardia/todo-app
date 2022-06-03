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
		this.modal = new Modal(this.container);

		//Remove modal from DOM tree after it has been hidden
		this.container.addEventListener("hidden.bs.modal", function(e){
			this.remove();
		});

		if(!modalOpts.buttonless){
			this.procBtn = this.container.querySelector("#modal-save-btn");
			this.procBtn.addEventListener("click", function(e){
				viewProps.onProceed(e)
				this.modal.hide();
			}.bind(this));
		}
	}
};
ModalView.prototype = Object.create(View);

export default ModalView;