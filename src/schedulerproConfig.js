const today = new Date();

export const schedulerproConfig = {
    appendTo  : 'app',
    startDate : new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8),
    endDate   : new Date(today.getFullYear(), today.getMonth(), today.getDate(), 21),
    columns   : [
        { text : 'Name', field : 'name', width : 160 }
    ],
    project : {

        resources : [
            { id : 1, name : 'Dan Stevenson' },
            { id : 2, name : 'Talisha Babin' }
        ],

        events : [
            { id : 1, startDate : '2025-12-01', duration : 3, durationUnit : 'd', name : 'Event 1' },
            { id : 2, duration : 4, durationUnit : 'd', name : 'Event 2' }
        ],

        assignments : [
            { event : 1, resource : 1 },
            { event : 2, resource : 2 }
        ],

        dependencies : [
            { fromEvent : 1, toEvent : 2 }
        ]
    }
};