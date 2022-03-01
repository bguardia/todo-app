import View from './view.js';

export const ApplicationView = (function(){
	let view = Object.create(View);

    view.callbacks = { showTodayView: null,
                       showTomorrowView: null, 
                       showWeekView: null, 
                       newProject: null, 
                       newItem: null, };

    view._initialize = function(){
        view.container = document.createElement("div");
        view.container.className = "app-container";

        let headerContainer = document.createElement("div");
        headerContainer.className = "header d-flex align-items-center";
        let logoEl = document.createElement("h1");
        logoEl.className = "header__logo";
        logoEl.innerHTML = "TodoApp";
        headerContainer.appendChild(logoEl);
        view.container.appendChild(headerContainer);

        let mainContainer = document.createElement("div");
        mainContainer.className = "main-container row"
        view.container.appendChild(mainContainer);
        let navContainer = document.createElement("div");
        navContainer.className = "left-nav col-3 d-flex flex-column";
        mainContainer.appendChild(navContainer);

        //Controls
        let buttonsContainer = document.createElement("div");
        buttonsContainer.className = "left-nav__buttons-container d-flex flex-column";

        let todayButton = document.createElement("button");
        todayButton.addEventListener("click", this.callbacks.showTodayView);
        todayButton.innerHTML = "Today";

        let tomorrowButton = document.createElement("button");
        tomorrowButton.addEventListener("click", this.callbacks.showTomorrowView);
        tomorrowButton.innerHTML = "Tomorrow";

        let weekButton = document.createElement("button");
        weekButton.addEventListener("click", this.callbacks.showWeekView);
        weekButton.innerHTML = "This Week";

        let newProjectButton = document.createElement("button");
        newProjectButton.addEventListener("click", this.callbacks.newProject);
        newProjectButton.innerHTML = "New Project";

        let newItemButton = document.createElement("button");
        newItemButton.addEventListener("click", this.callbacks.newItem);
        newItemButton.innerHTML = "New Item";

        [todayButton, tomorrowButton, weekButton, newProjectButton, newItemButton].forEach(b => {
            b.className = "btn";
            buttonsContainer.appendChild(b); });

        navContainer.appendChild(buttonsContainer);
        view.projectList = document.createElement("div");
        view.projectList.className = "left-nav__projects-container flex-fill";
        navContainer.appendChild(view.projectList);
        //let projectListItems = [];

        this.subviewContainer = document.createElement("div");
        this.subviewContainer.className = "container col-9";
        mainContainer.appendChild(this.subviewContainer);
    };

	view.render = function(){
		document.body.appendChild(view.container);
	};

	view.load = function(viewProps){
		this.projectList.replaceChildren();
		this.projectList.appendChild(viewProps.projectListView.container);
	};

	view.loadSubview = function(subview){
		subview.renderIn(this.subviewContainer);
	};

	view.loadModal = function(view, onSave){
		let modalEl = components.modal("Modal", view.container);
		let saveBtn = modalEl.querySelector("#modal-save-btn");
		this.modal = new Modal(modalEl);
		saveBtn.addEventListener("click", function(e){
			onSave(e)
			this.modal.hide();
			modalEl.remove();
		}.bind(this));
		this.modal.show();
	}

	return view;
})();