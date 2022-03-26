const datasetModule = require('./dataset.js');
import { Item } from './item.js';

var Note = function(args = {}){
	this.text = args.text;
}

Note.prototype = Object.create(datasetModule.datasetItem);
console.log("Created Note");
var Notes = new datasetModule.Dataset("Notes", Note);
/*
datasetModule.setAssociation(Note, { belongsTo: Item });
*/
export { Notes, Note };
