import { View, toHTML } from "./view";

const BreadcrumbView = function(){

    this.callbacks = {};

    this._initialize = function(){
        this.container = toHTML(
            `<nav aria-label="breadcrumb">` +
                `<ol class="breadcrumb">` +
                `</ol>` +
            `</nav>`
        );

    }
    
    this.load = function(viewProps){
        let breadcrumbList = this.container.querySelector(".breadcrumb");
        viewProps.crumbs.forEach(crumb => {
            let crumbEl = null;
            if(crumb.href){
                crumbEl = toHTML(`<li class="breadcrumb-item"><a href="${crumb.href}">${crumb.text}</a></li>`);
                let routeRequest = this.callbacks.routeRequest;
                let crumbLink = crumbEl.querySelector("a");
                crumbLink.addEventListener("click", function(e){
                    e.preventDefault();
                    routeRequest(this.href);
                });
            } else {
                crumbEl = toHTML(`<li class="breadcrumb-item">${crumb.text}</li>`);
            }
            
            
            breadcrumbList.appendChild(crumbEl);
        });
    };
};

BreadcrumbView.prototype = Object.create(View);

export default BreadcrumbView;