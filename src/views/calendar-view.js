import { View, toHTML } from "./view";
import format from "date-fns/format";
import ModalPresenter from "../presenters/modal-presenter";
import ApplicationPresenter from "../presenters/application-presenter";
import { isSameDay, isSameMonth } from "date-fns";

const CalendarView = function(){

    const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const MAX_ITEMS_PER_CELL = 4;

    this.callbacks = {};

    this._initialize = function(){
        this.container = toHTML(
            `<div class="calendar-view">` +
            `<h2 class="display-2 template-view__title">Calendar</h2>` +
				`<div class="calendar-container"></div>` +
            `</div>`
        );

    }

    this.createRow = function(optClasses = ""){
        return toHTML(
            `<div class="row ${optClasses}"></div>`
        );
    };

    this.createColumn = function(optClasses = ""){
        return toHTML(
            `<div class="col ${optClasses}"></div>`
        )
    }

    this.createControls = function(selectedMonth, year){
        let controlsContainer = toHTML(
            `<div>` +
                `<div class="row mb-3">` +
                    `<div class="col-auto month-col">` +
                        `<label for="month-selector">Month</label>` +
                    `</div>` +
                    `<div class="col-auto year-col">` +
                        `<label for="year-selector">Year</label>` +
                    `</div>` +
                    `<div class="col-auto submit-col d-flex align-items-end">` +
                    `</div>` +
                `</div>` +
            `</div>`
        );

        let monthSelector = toHTML(
            `<select class="form-select" id="month-selector"></select>`);
        let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        for(let monthIndex = 0; monthIndex < months.length; monthIndex++){
            let monthOption = toHTML(`<option value="${monthIndex}">${months[monthIndex]}</option>`);
            if(monthIndex == selectedMonth){
                monthOption.setAttribute("selected", "");
            }
            monthSelector.appendChild(monthOption);
        };
        controlsContainer.querySelector(".month-col").appendChild(monthSelector);

        let yearSelector = toHTML(`<select class="form-select" id="year-selector"></select>`);
        for(let yearIndex = 0; yearIndex < 10; yearIndex++){
            let yearValue = yearIndex + (year - 5);
            let yearOption = toHTML(`<option value="${yearValue}">${yearValue}</option>`);
            if(yearValue == year){
                yearOption.setAttribute("selected", "");
            };
            yearSelector.appendChild(yearOption);
        };
        controlsContainer.querySelector(".year-col").appendChild(yearSelector);

        let submitButton = toHTML(`<button class="btn btn-primary calendar-btn">Set</button>`);
        let onSubmit = this.callbacks.updateCalendarDate;
        submitButton.addEventListener("click", function(){
            let newMonth = document.getElementById("month-selector").value;
            let newYear = document.getElementById("year-selector").value;
            console.log(`newMonth: ${newMonth}, newYear: ${newYear}`);
            onSubmit(newMonth, newYear);
        });
        controlsContainer.querySelector(".submit-col").appendChild(submitButton);

        return controlsContainer;
    }

    this.createMonthlyCalendar = function(month, year){
        let daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        let daysOfTheWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        let days = daysInMonth[month]
        let rows = Math.ceil(days / 7);
        let columns = 7;

        let container = toHTML('<div class="container"></div>');

        //Create header row
        let headerRow = this.createRow("calendar__header-row gx-0");
        for(let i = 0; i < columns; i++){
            let headerCol = this.createColumn("calendar__header-col");
            headerCol.append(daysOfTheWeek[i]);
            headerRow.appendChild(headerCol);
        }
        container.appendChild(headerRow);

        //create calendar body
        let currentDay = 1;
        let firstDayOfTheMonth = new Date(year, month, 1).getDay();
        for(let i = 0; i < rows; i++){
            let currentRow = this.createRow("calendar__row gx-0");
            for(let j = 0; j < columns; j++){
                let currentCol = this.createColumn("calendar__col");
                if((currentDay > 1 && currentDay <= days) || (firstDayOfTheMonth == j)){
                    currentCol.appendChild(toHTML(`<div class="calendar__cell-header">${currentDay}</div>`));
                    currentCol.setAttribute("dataset-calendar-date", currentDay);
                    currentCol.appendChild(toHTML(`<div class="calendar__item-container"></div>`));
                    currentDay++;
                }
                currentRow.appendChild(currentCol);
            };
            container.appendChild(currentRow);
        }

        return container;

    };

    this.createCalendarItem = function(item){
        let calendarItem = toHTML(`<div class="calendar__item">${item.title}</div>`);
        calendarItem.addEventListener("click", function(){ 
            this.renderCalendarItemPopUp(item); 
        }.bind(this));
        return calendarItem;
    }

    this.renderCalendarItemPopUp = function(item){
        let projectTitle = item.projectId ? item.project.title : "none";
        let formattedDateString = format(item.date, "EEEE, MMMM io, yyyy"); //Day, Month Ordinal, Year
        let itemPopupContent = toHTML(
                `<div class="item-details--pop-up">` +
                    `<div class="pop-up__project">Project: ${projectTitle}</div>` +
                    `<div class="pop-up__date">Date: ${formattedDateString}</div>` +
                `</div>`
            );

        let goToItem = function(){
            ApplicationPresenter.route(`item${item.id}`);
        }

        let args = { modal: {
            title: item.title,
            contentEl: itemPopupContent,
            buttonText: "View Details",
            onProceed: goToItem,
        }, };

        let itemPopupPresenter = new ModalPresenter(args);
        itemPopupPresenter.load();
        itemPopupPresenter.view.render();
    }

    this.createCellSeeMore = function(title, items){
        let remainingItems = items.length - MAX_ITEMS_PER_CELL;
        let seeMoreButton = toHTML(`<button class="calendar__see-more btn">See ${remainingItems} More</button>`);
        
        
        let renderSeeMoreModal = function(){
            let seeMoreModalContent = toHTML(`<div class="calendar__item-container"></div>`);

            items.forEach(item => {
                console.log(item);
                let itemEl = this.createCalendarItem(item);
                seeMoreModalContent.appendChild(itemEl);
            });

            let args = { modal: {
                title: title,
                contentEl: seeMoreModalContent,
                buttonless: true,
            }};

            let modal = new ModalPresenter(args);
            modal.load();
            modal.view.render();
        }

        seeMoreButton.addEventListener("click", renderSeeMoreModal.bind(this));

        return seeMoreButton;
    }
    

    this.load = function(viewProps){
        let calendarContainer = this.container.querySelector(".calendar-container");
        calendarContainer.replaceChildren();
        
        let month = viewProps.month;
        let year = viewProps.year;

        let controls = this.createControls(month, year);
        calendarContainer.appendChild(controls);
        let monthlyCalendar = this.createMonthlyCalendar(month, year);
        calendarContainer.appendChild(monthlyCalendar);

        console.log("items are: ", viewProps.items);

        let daysThisMonth = DAYS_IN_MONTH[month];
        for(let currentDay = 1; currentDay <= daysThisMonth; currentDay++){
            let items = viewProps.items.filter(i => i.date.getDate() == currentDay);
            if(items.length > 0){
                let currentCell = monthlyCalendar.querySelector(`[dataset-calendar-date="${currentDay}"]`).querySelector(".calendar__item-container");
                for(let itemIndex = 0; itemIndex < MAX_ITEMS_PER_CELL && itemIndex < items.length; itemIndex++){
                    let itemEl = this.createCalendarItem(items[itemIndex]);
                    currentCell.appendChild(itemEl);
                }
                if(items.length > MAX_ITEMS_PER_CELL){
                    let seeMoreTitle = format(new Date(year, month, currentDay), "EEEE, MMMM do, Y");
                    let seeMore = this.createCellSeeMore(seeMoreTitle, items);
                    currentCell.appendChild(seeMore);
                }
            }  
        }

        //Highlight today if on calendar
        let today = new Date();
        let calendarMonth = new Date(year, month, 1);
        if(isSameMonth(calendarMonth, today)){
            let todayCell = monthlyCalendar.querySelector(`[dataset-calendar-date="${today.getDate()}"]`);
            todayCell.classList.add("calendar__col--today");
        }

        /*
        viewProps.items.forEach(i => {
            let day = i.date.getDate();
            let calendarEl = monthlyCalendar.querySelector(`[dataset-calendar-date="${day}"]`);
            let itemContainer = calendarEl.querySelector(`.calendar__item-container`);
            if(itemContainer.childElementCount < MAX_ITEMS){
                let itemEl = this.createCalendarItem(i.title); //changed createCalendarItem since using this algorithm
                itemEl.addEventListener("click", function(){ 
                    this.renderCalendarItemPopUp(i); 
                }.bind(this));
                itemContainer.appendChild(itemEl);
            }else if(!itemContainer.querySelector(".calendar__see-all")){
                let seeAll = toHTML('<div class="calendar__see-all"></all>')
            }
        });
        */
    };
};

CalendarView.prototype = Object.create(View);

export default CalendarView;