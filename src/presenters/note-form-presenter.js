import SynchronizingPresenter from './presenter.js';

import NoteFormView from '../views/note-form-view.js';

import { Notes } from '../models/note.js';

var NoteFormPresenter = function(opts = {}){
	Object.setPrototypeOf(this, Object.create(SynchronizingPresenter));

	this.viewProps = Object.assign({ text: "", }, opts);

	this.createOrUpdateNote = function(){
		let formData = this.view.getFormData();
		let note = Notes.find(n => n.id === this.viewProps.id);
		if(note){
			note.update(formData);
		}else{
			Notes.create(formData);
		}
		this.emitChanged();
	};

	this.onSave = this.createOrUpdateNote.bind(this);
	this.setView(new NoteFormView());
}

export default NoteFormPresenter;