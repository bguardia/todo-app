const View = {
	container: null,
	_isInitialized: false,
	_initialize: function(){
		//Initialize DOM elements here
	},
	initialize: function(){
		this._initialize();
		this._isInitialized = true;
	},
	load: function(){
		throw "No load method has been defined";
	},
	render: function(){
		document.body.appendChild(this.container);
	},
	renderIn: function(parentEl){
		parentEl.appendChild(this.container);
	},
	remove: function(){
		this.container.remove();
		this.clear();
	},
	_clear: function(){
		//DOM elements to clear here
	},
	clear: function(){
		this._clear();
		this.container = null;
		this._isInitialized = false;
	},
	isInitialized: function(){
		return this._isInitialized;
	},
	/* only for main view
	loadSubview: function(){
		//display subview
	},
	loadModal: function(){

	},*/
};

export default View;