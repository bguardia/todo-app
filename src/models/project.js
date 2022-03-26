const datasetModule = require('./dataset.js');
import { Item } from './item.js';

var Project = function(args = {}) {
	this.title = args.title || "new project";
	this.description = args.description || "";
};
Project.prototype = Object.create( datasetModule.datasetItem );
console.log("Created Project");
var Projects = new datasetModule.Dataset("Projects", Project);
/*
datasetModule.setAssociation(Project, { hasMany: Item });
*/
export { Projects, Project };