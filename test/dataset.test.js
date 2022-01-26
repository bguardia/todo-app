const _ = require('./../src/dataset.js');


var MockConstructor = function({ name }){
	this.name = name;
};

MockConstructor.prototype = Object.create(_.datasetItem);

var myDataset = new _.Dataset("testDataset", MockConstructor);

var MockConstructorTwo = function(args){
	this.fruit = args.fruit;
};
MockConstructorTwo.prototype = Object.create( _.datasetItem);

var secondDataset = new _.Dataset("secondDataset", MockConstructorTwo);


beforeEach(()=> {
	myDataset.reset();
	secondDataset.reset();
});

test('creates new objects', () => {
	let newObj = myDataset.create({ name: "newObj" });
	expect(newObj).toBeInstanceOf(MockConstructor);
});

test('gives created objects a string id', () => {
	let newObj = myDataset.create({ name: "anotherObj" });
	expect(newObj).toHaveProperty('id', expect.any(String));
});

test('removes an object from set by id', () => {
	let names = ["foo", "bar", "baz", "foobar", "foobaz"];
	names.forEach(n => myDataset.create({ name: n }));
	let toRemove = myDataset.find(obj => obj.name === "foobar");
	console.log("toRemoveId: " + toRemove.id);
	let removedItem = myDataset.remove(toRemove.id);
	console.log("removedItem.id: " + removedItem.id);
	expect(removedItem).toBe(toRemove);
	expect(myDataset.all()).toHaveLength(names.length - 1);
});

test('find returns the first item that passes the given function', () => {
	let names = ["foo", "bar", "baz", "foobar", "foobaz"];
	names.forEach(n => myDataset.create({ name: n }));
	let returned = myDataset.find(obj => obj.name.includes("baz"));
	expect(returned).toHaveProperty('name', "baz");
});

test('filter returns an array of all items that pass the given function', () => {
	let names = ["foo", "bar", "baz", "foobar", "foobaz"];
	names.forEach(n => myDataset.create({ name: n }));
	let returned = myDataset.filter(obj => obj.name.includes("foo"));
	expect(returned).toHaveLength(3);
});

test('all returns an array of all items in set', () => {
	let names = ["foo", "bar", "baz", "foobar", "foobaz"];
	names.forEach(n => myDataset.create({ name: n }));
	let returned = myDataset.all();
	expect(returned).toHaveLength(names.length);
});

test('dump returns an object containing the set of all items and the set\'s item count', () => {
	let names = ["foo", "bar", "baz", "foobar", "foobaz"];
	names.forEach(n => myDataset.create({ name: n }));
	let dumped = myDataset.dump();
	expect(dumped).toHaveProperty("count", names.length);
	expect(dumped).toHaveProperty("set", myDataset.all());
});

test('load takes an object and reinstantiates its set and count properties', () => {
	let names = ["foo", "bar", "baz", "foobar", "foobaz"];
	names.forEach(n => myDataset.create({ name: n }));
	let dumped = myDataset.dump();
	let prevSet = myDataset.all();

	//Simulate save and restart
	let deserializedDumped = JSON.parse(JSON.stringify(dumped));
	myDataset.reset();

	myDataset.load(deserializedDumped);
	let newSet = myDataset.all();

	expect(myDataset).toHaveProperty("count", deserializedDumped.count);
	expect(newSet).toHaveLength(prevSet.length);
	expect(newSet[0]).toBeInstanceOf(MockConstructor);
});


test('belongsTo: creates a getter for the owner of the item', () => {
	_.setAssociation(MockConstructorTwo, { belongsTo: MockConstructor });
	let foo = myDataset.create({ name: "foo" });
        let testItem = secondDataset.create({ fruit: "banana", mockConstructorId: foo.id, });
	console.log({ ownerId: testItem.mockConstructorId });
	expect(testItem.mockConstructor).toBe(foo);
});

test('hasMany: creates a getter for the owned items', () => {
	_.setAssociation(MockConstructor, { hasMany: MockConstructorTwo });
	let foo = myDataset.create({ name: "foo" });
	let ownee = secondDataset.create({ fruit: "banana", mockConstructorId: foo.id });

	expect(foo.mockConstructorTwos).toHaveLength(1);
	expect(foo.mockConstructorTwos[0]).toBe(ownee);
});
