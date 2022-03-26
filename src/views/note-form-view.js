import { View, toHTML } from './view.js';

var NoteFormView = function(){
	this._initialize = function(){

		this.container = toHTML(
			`<div>` +
				`<label class="form-label" for="note-text-area">Text</label>` +
				`<textarea id="note-text-area" class="form-control" rows="3"></textarea>` +
				`<input type="hidden" id="item-id"></input>` +
			`</div>`);

		this.textArea = this.container.querySelector("#note-text-area");
		this.hiddenItemIdInput = this.container.querySelector("#item-id");
	}

	this.load = function(viewProps){
		this.textArea.innerHTML = viewProps.text;
		this.hiddenItemIdInput.value = viewProps.itemId;
	}

	this.getFormData = function(){
		return { text: this.textArea.value,
				 itemId: this.hiddenItemIdInput.value, };
	}
};
NoteFormView.prototype = Object.create(View);

export default NoteFormView;
