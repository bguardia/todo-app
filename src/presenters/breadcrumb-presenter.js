import SynchronizingPresenter from './presenter.js';
import ApplicationPresenter from './application-presenter.js';
import BreadcrumbView from '../views/breadcrumb-view.js';

var BreadcrumbPresenter = function(args){
	Object.setPrototypeOf(this, Object.create(SynchronizingPresenter));

    var crumbs = args;

    this.routeRequest = function(routeStr){
        ApplicationPresenter.route(routeStr);
    };

    this.beforeLoad = function(){
        this.view.callbacks.routeRequest = this.routeRequest;
        this.viewProps = { crumbs: crumbs };
    };

    this.setView(new BreadcrumbView);
};

export default BreadcrumbPresenter;