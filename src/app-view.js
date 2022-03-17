import View from './view.js';
const { toHTML } = require('./string-to-html.js');

export const ApplicationView = (function(){
	let view = Object.create(View);

    view.callbacks = { showTodayView: null,
                       showTomorrowView: null, 
                       showWeekView: null, 
                       newProject: null, 
                       newItem: null, };

    view._initialize = function(){

        view.container = toHTML(
            `<div class="app-container">` +
                `<div class="header d-flex align-items-center">` +
                    `<h1 class="header__logo">TodoApp</h1>` +
                `</div>` +
                `<div class="main-container row g-0">` +
                    `<div class="left-nav col-3 d-flex flex-column">` +
                        `<div class="left-nav__buttons-container d-flex flex-column">` +
                            `<button id="nav__today-btn" class="btn">Today</button>` +
                            `<button id="nav__tomorrow-btn" class="btn">Tomorrow</button>` +
                            `<button id="nav__week-btn" class="btn">This Week</button>` +
                            `<button id="nav__new-project-btn" class="btn">New Project</button>` +
                            `<button id="nav__new-item-btn" class="btn">New Item</button>` +
                        `</div>` +
                        `<div class="left-nav__projects-container flex-fill">` + //Projectlist Container
                        `</div>` +
                    `</div>` +
                    `<div id="subview-container" class="container col-9 overflow-auto p-5"></div>` + //Subview Container
                `</div>` +
            `</div>`
        );

        let todayBtn = this.container.querySelector("#nav__today-btn");
        todayBtn.addEventListener("click", this.callbacks.showTodayView);

        let tomorrowBtn = this.container.querySelector("#nav__tomorrow-btn");
        tomorrowBtn.addEventListener("click", this.callbacks.showTomorrowView);

        let weekBtn = this.container.querySelector("#nav__week-btn");
        weekBtn.addEventListener("click", this.callbacks.showWeekView);

        let newProjectBtn = this.container.querySelector("#nav__new-project-btn");
        newProjectBtn.addEventListener("click", this.callbacks.newProject);

        let newItemBtn = this.container.querySelector("#nav__new-item-btn");
        newItemBtn.addEventListener("click", this.callbacks.newItem);

    };

	view.render = function(){
		document.body.appendChild(view.container);
	};

	view.load = function(viewProps){
        let projectList = this.container.querySelector(".left-nav__projects-container");
		projectList.replaceChildren();
		projectList.appendChild(viewProps.projectListView.container);
	};

	view.loadSubview = function(subview){
        let subviewContainer = this.container.querySelector("#subview-container");
		subview.renderIn(subviewContainer);
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