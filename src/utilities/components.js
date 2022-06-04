const { toHTML } = require('./string-to-html.js');

const components = {

	createInput: function(args){//{ type = text, name, label, [placeholder, min, max] }
		let input = document.createElement("input");
		input.type = args.type || "text";
		input.name = args.name;
		input.id = args.name;
		input.className = "form-control";

		if(input.type == "text"){
			input.setAttribute("placeholder", args.placeholder);
		}else if(input.type == "number"){
			args.min && input.setAttribute("min", args.min);
			args.max && input.setAttribute("max", args.max);
		}

		let label = document.createElement("label");
		label.setAttribute("for", args.name);
		label.innerHTML = args.label;
		label.className = "col-form-label";

		let fieldContainer = document.createElement("div");
		fieldContainer.appendChild(label);
		fieldContainer.appendChild(input);

		return fieldContainer; 
	},

	modal: function(title, modalContent, optArgs){
		let procButtonText = optArgs.procButtonText || "Create";
		let cancelButtonText = optArgs.cancelButtonText || "Close";

		let modal = toHTML('<div class="modal" tabindex="-1">' +
								'<div class="modal-dialog">' +
									'<div class="modal-content">' +
										'<div class="modal-header modal-header--todo-app">' +
											`<h5 class="modal-title">${title}</h5>` +
											`<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>` +
      									`</div>` +
										`<div class="modal-body"></div>` + //modalContent goes here
										`<div class="modal-footer">` +
											`<button class="btn btn-secondary" data-bs-dismiss="modal">${cancelButtonText}</button>` +
											`<button id="modal-save-btn" class="btn btn-primary" data-bs-dismiss="modal">${procButtonText}</button>` +
										`</div>` +
									`</div>` +
								`</div>` +
							`</div>`);

		let contentContainer = modal.querySelector('.modal-body');
		contentContainer.appendChild(modalContent);

		//Option to remove footer
		let buttonless = optArgs.buttonless;
		if(buttonless){
			modal.querySelector(".modal-footer").remove();
		}

		return modal;
	},

	dropdown: function(btnText, dropdownItems = []){
		/* dropdownItems contains an object for each link in the dropdown:
	       { text: "Text to be placed in the dropdown menu", 
	         onClick: functionToCallWhenClicked,  }
		*/
		let dropdown = toHTML(
			`<div class="dropdown">` +
				`<button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">` +
		  			btnText +
				`</button>` +
				`<ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">` +
		  		`</ul>` +
	  		`</div>`);
		let dropdownMenu = dropdown.querySelector(".dropdown-menu");

		let dropdownItemHTML = `<li><a class="dropdown-item"">txt</a></li>`;
		dropdownItems.forEach(item => {
			let itemEl = toHTML(dropdownItemHTML.replace('txt', item.text));
			itemEl.addEventListener("click", item.onClick);
			dropdownMenu.appendChild(itemEl);
		});
		
		return dropdown;
	},

	button: function(str, opts = { className: "btn-primary" }) {
		let btn = document.createElement("button");
		btn.className = "btn";
		if(opts.className){ 
			opts.className.split(' ').forEach(c => btn.classList.add(c)); 
		};
		btn.innerHTML = str;
		return btn;
	},

	icon: function(className) {
		let icon = document.createElement("span");
		icon.className = className;
		return icon; 
	}
};

export default components;