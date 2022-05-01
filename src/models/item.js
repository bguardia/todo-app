const datasetModule = require('./dataset.js');
import { Project } from './project.js';
import { Note } from './note.js';

var Item = function(args = {}) {
	this.title = args.title || "new item";
	this.description = args.description || "";
	this.date = Date.parse(args.date) || Date.now();
	this.priority = args.priority || 0; //low to high: 0 to 4
	/*
	this.isAllDay = false;
	this.startTime = this.isAllDay ? "00:00" : args.startTime; //if no time is given, treat as all-day
	this.endTime = this.isAllDay ? "23:59" : args.endTime;
	*/
	this.isComplete = args.isComplete || false;
	/* recurring
	this.isRecurring = args.isRecurring || false;
	this.recurs = ""; //daily, weekly, monthly, annually
	*/
};
Item.prototype = Object.create( datasetModule.datasetItem );
console.log("Created Item");
var Items = new datasetModule.Dataset("Items", Item);

/*
datasetModule.setAssociation(Item, { belongsTo: Project });
datasetModule.setAssociation(Item, { hasMany: Note });
*/

export { Items, Item };