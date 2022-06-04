const datasetModule = require('./dataset.js');

var SubItem = function(args = {}) {
	this.title = args.title || "new item";
	this.priority = args.priority || 0; //low to high: 0 to 4
	this.isComplete = args.isComplete || false;
};

SubItem.prototype = Object.create( datasetModule.datasetItem );
console.log("Created SubItem");
var SubItems = new datasetModule.Dataset("SubItems", SubItem);

export { SubItems, SubItem };