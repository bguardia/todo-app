//Holds onto events for Presenter Synchronization
const EventHandler = (function(){
	var events = {}; 
	var createEvent = function(eventName){
		if(!events[eventName]){
			events[eventName] = []; //empty Array to be filled be subscribers
		}
		return eventName;
	};

	var unsubscribe = function(eventName, callbackFn){
		let index = events[eventName].findIndex(fn => fn === callbackFn);
		if(~index){
		  events[eventName].splice(index, 1);
		}
	};

	var subscribe = function(eventName, callbackFn){
		events[eventName].push(callbackFn);
	};

	var publish = function(eventName, emitter){
		events[eventName].forEach(callback => callback(emitter));
	};
	
	return { createEvent: createEvent,
		 subscribe: subscribe,
		 unsubscribe: unsubscribe,
		 publish: publish };
})();

const SynchronizingPresenter = {
	changeEvent: EventHandler.createEvent("changed"), //return event name
	boundCallback: null, 
	view: null,
	viewProps: null, //Object containting properties to pass to view
	emitChanged: function(){
		EventHandler.publish(this.changeEvent, this);
	},
	subscribeToChanged: function(){
		this.boundCallback = this.onChanged.bind(this);
		EventHandler.subscribe(this.changeEvent, this.boundCallback);
	},
	unsubscribeToChanged: function(){
		EventHandler.unsubscribe(this.changeEvent, this.boundCallback);
		this.boundCallback = null;
	},
	_onChanged: function(){
		this.reload(false); //load without emitting event
	},
	onChanged: function(emitter){//callback for changeEvent
		if(emitter != this){//ignore events emitted by self
			this._onChanged();
		}
	},

	load: function(){
		this.beforeLoad();
		this.loadView();
	},

	unload: function(){
		this.beforeUnload();
		this.unsubscribeToChanged();
		this.view.remove();
	},

	reload: function(emitEvent = true){//each object should call reload after it updates data
		this.load();
		if(emitEvent){
			this.emitChanged();
		}
	},

	loadView: function(){
		if(!this.view.isInitialized()){
			this.beforeInitialize();
			this.view.initialize();
			this.afterInitialize();
		}
		this.beforeViewLoad();
		this.view.load(this.viewProps);
	},

	setView: function(view){
		this.view = view;
	},

	getView: function(){
		return this.view;
	},

	//Hooks
	beforeLoad: function(){
		//Before calling loadView
	},

	beforeInitialize: function(){
		//Inside loadView, called only before initializing an uninitialized view
	},

	afterInitialize: function(){
		//Inside loadView, called after initializing an uninitialized view
	},

	beforeViewLoad: function(){
		//Inside loadView, called every time before loading view
	},

	beforeUnload: function(){
		//Called before unloading presenter
	},
};

export default SynchronizingPresenter;