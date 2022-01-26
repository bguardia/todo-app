var Datasets = Object.create(null);

var eachDataset = function(fn){
	let datasetArray = Object.keys(Datasets).map(k => Datasets[k]);
	datasetArray.forEach(fn);
};

//begin Dataset (in MVC, similar to Model class)
//Dataset keeps track of instances of its 'type'
//and contains methods for search, retrieval, creation and removal
var Dataset = function(name, modelConstructor){
	this.name = name
	this.set = [];
	this.count = 0;
	this.modelConstructor = modelConstructor;
	modelConstructor.prototype.dataset = this.name;
	Datasets[this.name] = this;
};

Dataset.prototype.create = function(args){
	let item = new this.modelConstructor(args);
        this.set.push(item);
	args = Object.assign(args, { id: this.count.toString(), dataset: this.name, });
	item.setDatasetProperties(args);
	this.count++;
	return item;
};

Dataset.prototype.remove = function(id){
	let index = this.set.findIndex(item => item.id === id);
	console.log(`Index of ${id} in ${this.name}.set is: ${index}`);
	if(~index){
		return this.set.splice(index, 1)[0];
	} else {
		throw `item with id ${id} doesn't exist in ${this.name}`;
	}
};

Dataset.prototype.reset = function(){
	this.set = [];
	this.count = 0;
}

//Search/set return functions
Dataset.prototype.all = function(){
	return this.set.slice(); //return copy of set
};

Dataset.prototype.find = function(fn){
	return this.set.find(fn);
};

Dataset.prototype.filter = function(fn){
	return this.set.filter(fn);
};

//Loading/saving functions
Dataset.prototype.load = function(datasetDataObj){
	this.count = datasetDataObj.count;
	datasetDataObj.set.forEach(data => {
		let item = new this.modelConstructor(data);
		item.setDatasetProperties(data);
		this.set.push(item);
	});
};

Dataset.prototype.dump = function(){
	return { type: "Dataset",
	         name: this.name, 
		 count: this.count, 
	         set: this.set  };
};
//End Dataset

//begin datasetItem (in MVC, similar to an instance of Model)
//datasetItem holds properties that Dataset applies
//and methods connected to Dataset
var datasetItem = {
	datasetProperties: { dataset: "", //keeps track of dataset-related properties for setDatasetProperties
			     id: "", },   //Other properties, such as foreign dataset keys, may be added to declare associations
					
	setDatasetProperties: function(args) {
		Object.keys(this.datasetProperties).forEach(k => {
			if(args[k]){
				Object.defineProperty(this, k, { value: args[k], }); //Set dataset-related properties to be non-enumerable
			}
		});
	},

	toJSON: function(){
		let obj = {};
		Object.keys(this).concat(Object.keys(this.datasetProperties)).forEach(k => obj[k] = this[k]);
		return obj;
	},

	destroy: function(){
		Datasets[this.dataset].remove(this);
	},
};

//Associates datasetItems and creates new methods and properties for associations
//
//belongsTo association creates a getter and setter for the owner
//the Key is ownerConstructor.name with first letter lowercased
//ex) object belonging to MyItem has the 'myItem' key
//
//hasMany association creates a getter for the ownees, and generator for new ownees
//the Key is owneeConstructer.name with first letter lowercased, plus 's'
//ex) object having many MyItem has the 'myItems' key
//the Generator method is "new" + owneeConstructor.name
//ex) the generator for MyItem is 'newMyItem'
var setAssociation = function(objConstructor, args){
	let obj = objConstructor.prototype;
	if(args.belongsTo){
		let ownerName = firstLetterToLowercase(args.belongsTo.name);
		let ownerTable = Datasets[args.belongsTo.prototype.dataset]
		let ownerIdKey = ownerName + "Id";
		obj.datasetProperties[ownerName + "Id"] = "";
		console.log("In setAssociation(belongsTo):");
		console.log({ ownerName, ownerTable, ownerIdKey, dataset: args.belongsTo.prototype.dataset, });

		Object.defineProperty(obj, ownerName, {
			get(){ return ownerTable.find(o => o.id === this[ownerIdKey]) },
			set(newOwner){
				if(ownerTable.find(o => o.id === newOwner.id)){
					obj[ownerIdKey] = newOwner.id;
				} else {
					throw `Object is not part of ${ownerName}`
				}
			}
		});
	} else if(args.hasMany){
		let thisName = firstLetterToLowercase(objConstructor.name);
		let owneeName = firstLetterToLowercase(args.hasMany.name);
		let owneeTable = Datasets[args.hasMany.prototype.dataset]
		let thisIdKey = thisName + "Id";

		console.log({ owneeName, owneeTable });
		Object.defineProperty(obj, `${owneeName}s`, {
			get(){	return owneeTable.filter(o => o[thisIdKey] === this.id)},
		});
		
		obj[`new${args.hasMany.name}`] = function(args){ 
			args[thisIdKey] = this.id;
			return owneeTable.create(args); 
		};
	}
};
//utility for setAssociation
var firstLetterToLowercase = function(str) { return str.charAt(0).toLowerCase() + str.substring(1); };

module.exports = { Dataset, 
		   eachDataset,
		   datasetItem,
		   setAssociation };
/*
export { Dataset, datasetItem };
*/
