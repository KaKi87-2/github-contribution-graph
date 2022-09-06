// Inspired by : https://bitsofco.de/github-contribution-graph-css-grid/

const styleElement = document.createElement('style');
styleElement.appendChild(document.createTextNode(`
    :root {
        --gcg-gap: 2px;
        --gcg-week-size: calc(var(--gcg-gap) + var(--gcg-day-size));
        --gcg-color: #C9D1D9;
        --gcg-background-color: #0D1117;
        --gcg-day-size: 1rem;
        --gcg-day-background-color--empty: #161B22;
        --gcg-day-background-color-R: 57;
        --gcg-day-background-color-G: 211;
        --gcg-day-background-color-B: 83;
        --gcg-day-border-size: 1px;
        --gcg-day-border-color: #8B949E;
        --gcg-day-border-radius: 2px;
    }
    .gcg ul {
        list-style-type: none;
        margin: 0;
        padding: 0;
    }
    .gcg {
        display: inline-grid;
        grid-template-areas:
            '         __VOID__ gcg__month-list'
            'gcg__weekday-list gcg__day-list  ';
        grid-template-columns: auto 1fr;
        grid-gap: 1rem;
        color: var(--gcg-color);
        background-color: var(--gcg-background-color);
    }
    .gcg__month-list {
        grid-area: gcg__month-list;
        display: grid;
        grid-template-columns:
            calc(var(--gcg-week-size) * 4)
            calc(var(--gcg-week-size) * 4)
            calc(var(--gcg-week-size) * 4)
            calc(var(--gcg-week-size) * 5)
            calc(var(--gcg-week-size) * 4)
            calc(var(--gcg-week-size) * 4)
            calc(var(--gcg-week-size) * 5)
            calc(var(--gcg-week-size) * 4)
            calc(var(--gcg-week-size) * 4)
            calc(var(--gcg-week-size) * 5)
            calc(var(--gcg-week-size) * 4)
            calc(var(--gcg-week-size) * 5);
    }
    .gcg__weekday-list {
        grid-area: gcg__weekday-list;
        display: grid;
        grid-template-rows: repeat(7, var(--gcg-day-size));
    }
    .gcg__weekday-list,
    .gcg__day-list {
        grid-gap: var(--gcg-gap);
    }
    .gcg__day-list {
        grid-area: gcg__day-list;
        display: grid;
        grid-template-rows: repeat(7, var(--gcg-day-size));
        grid-auto-flow: column;
        grid-auto-columns: var(--gcg-day-size);
    }
    .gcg__day-list__day {
        border: var(--gcg-day-border-size) solid transparent;
        border-radius: var(--gcg-day-border-radius);
    }
    .gcg__day-list__day:hover {
        border-color: var(--gcg-day-border-color);
    }
    .gcg__day-list__day:not([data-gcg-timestamps]) {
        background-color: var(--gcg-day-background-color--empty);
    }
    .gcg__day-list__day[data-gcg-timestamps] {
        background-color: rgba(
            var(--gcg-day-background-color-R),
            var(--gcg-day-background-color-G),
            var(--gcg-day-background-color-B),
            calc(var(--gcg-count) / var(--gcg-max-count))
        );
    }
`));

const getMonths = locale => [...Array(12).keys()].map(monthNumber => {
    const date = new Date(0);
    date.setMonth(monthNumber);
    return date.toLocaleString(locale, { month: 'short' });
});

/**
 * *
 * @param {number[]} timestamps
 * @param {Intl.LocalesArgument} locale
 * @param {function} [onClick]
 * @returns {HTMLDivElement}
 */
export const create = ({
    timestamps,
    locale = 'default',
    onClick
}) => {
    if(!document.head.contains(styleElement))
        document.head.appendChild(styleElement);
    const
        containerElement = document.createElement('div'),
        startYear = new Date(timestamps[0]).getFullYear();
    containerElement.classList.add('gcg');
    {
        const monthListElement = document.createElement('ul');
        monthListElement.classList.add('gcg__month-list');
        for(const month of getMonths(locale)){
            const monthElement = document.createElement('li');
            monthElement.textContent = month;
            monthListElement.appendChild(monthElement);
        }
        containerElement.appendChild(monthListElement);
    }
    {
        const weekdayListElement = document.createElement('ul');
        weekdayListElement.classList.add('gcg__weekday-list');
        for(let weekdayNumber = 1; weekdayNumber < 8; weekdayNumber++){
            const weekdayElement = document.createElement('li');
            weekdayElement.textContent = new Date(startYear, 0, weekdayNumber).toLocaleString(locale, { weekday: 'short' });
            weekdayListElement.appendChild(weekdayElement);
        }
        containerElement.appendChild(weekdayListElement);
    }
    {
        const
            dayListElement = document.createElement('ul'),
            dayElements = [];
        containerElement.appendChild(dayListElement);
        dayListElement.classList.add('gcg__day-list');
        {
            let date = new Date(startYear, 0, 1);
            while(date.getFullYear() === startYear){
                const dayElement = document.createElement('li');
                dayElement.classList.add('gcg__day-list__day');
                dayElement.setAttribute('title', date.toLocaleDateString(locale));
                dayElement.setAttribute('data-gcg-day', date.getDate().toString());
                dayElement.setAttribute('data-gcg-month', date.getMonth().toString());
                dayElement.addEventListener('click', () => {
                    if(typeof onClick === 'function'){
                        const timestampsString = dayElement.getAttribute('data-gcg-timestamps');
                        onClick({
                            day: parseInt(dayElement.getAttribute('data-gcg-day')),
                            month: parseInt(dayElement.getAttribute('data-gcg-month')),
                            timestamps: timestampsString ? timestampsString.split(',').map(_ => parseInt(_)) : []
                        });
                    }
                });
                dayElements.push(dayElement);
                dayListElement.appendChild(dayElement);
                date.setDate(date.getDate() + 1);
            }
        }
        {
            let maxCount = 0;
            for(const timestamp of timestamps){
                const
                    date = new Date(timestamp),
                    dayElement = dayListElement.querySelector(`[data-gcg-day="${date.getDate()}"][data-gcg-month="${date.getMonth()}"]`);
                if(dayElement){
                    const count = (parseInt(dayElement.style.getPropertyValue('--gcg-count')) || 0) + 1;
                    maxCount = Math.max(maxCount, count);
                    dayElement.style.setProperty('--gcg-count', count.toString());
                    dayElement.setAttribute('data-gcg-timestamps', `${dayElement.getAttribute('data-gcg-timestamps') || ''}${timestamp},`);
                }
            }
            for(const dayElement of dayElements)
                dayElement.style.setProperty('--gcg-max-count', maxCount.toString());
        }
    }
    return containerElement;
};