import SynchronizingPresenter from './presenter.js';
import ApplicationPresenter from './application-presenter.js';
import CalendarView from '../views/calendar-view.js';

import isSameMonth from 'date-fns/isSameMonth';

import { Items } from '../models/item.js';

var CalendarPresenter = function(args = {}){
	Object.setPrototypeOf(this, Object.create(SynchronizingPresenter));
    this.subscribeToChanged();
    
    //Assign calendar to current month and year and override if arguments given
    this.viewProps = Object.assign({ month: new Date().getMonth(),
                                     year:  new Date().getFullYear(), }, args);

    this.updateCalendarDate = function(newMonth, newYear){
        this.viewProps.month = newMonth;
        this.viewProps.year = newYear;
        this.reload();
    };

    this.beforeLoad = function(){
        this.view.callbacks.updateCalendarDate = this.updateCalendarDate.bind(this);
        
        //get items for the current month
        let selectedMonth = new Date(this.viewProps.year, this.viewProps.month, 1);
        console.log("currentMonth is: ", selectedMonth);

        let items = Items.filter(i => {
            return isSameMonth(selectedMonth, i.date);
        });
        
        this.viewProps.items = items;
    };

    this.setView(new CalendarView());
};

export default CalendarPresenter;