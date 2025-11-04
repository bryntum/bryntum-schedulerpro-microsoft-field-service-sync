import { updateDynamics365FieldService } from './d365sync.js';
import { signOut } from './auth.js';

export const schedulerproConfig = {
    appendTo   : 'app',
    startDate  : new Date(2025, 9, 31, 8),
    endDate    : new Date(2025, 9, 31, 21),
    timeZone   : 'UTC',
    viewPreset : 'hourAndDay',
    columns    : [
        {
            text : 'Name',
            field : 'name',
            width : 200,
            htmlEncode : false,
            renderer({ record }) {
                const imageUrl = record.imageUrl || `https://${import.meta.env.VITE_MICROSOFT_DYNAMICS_ORG_ID}.crm4.dynamics.com/Webresources/msdyn_/fps/ScheduleBoard/css/images/unknownResource.jpg`;
                const name = record.name || '';

                return `<div style="display: flex; align-items: center; gap: 8px;">
                    <img src="${imageUrl}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;" />
                    <span>${name}</span>
                </div>`;
            }
        }
    ],
    features : {
        dependencies : false,
        eventBuffer  : {
            // The event buffer time spans are considered as unavailable time
            bufferIsUnavailableTime : true,
            tooltipTemplate         : ({ duration }) => `<i class="b-icon b-fa-car"></i>Travel time: ${duration}`,
            renderer({ eventRecord, preambleConfig }) {
                if (eventRecord.preamble) {
                    preambleConfig.icon = eventRecord.preambleIcon;
                    preambleConfig.cls  = eventRecord.preambleCls;
                    preambleConfig.text = eventRecord.preamble.toString(true) + (eventRecord.preambleText ? ` (${eventRecord.preambleText})` : '');
                }
            }
        },

        taskEdit : {
            items : {
                generalTab : {
                    items : {
                        percentDoneField : null,
                        effortField      : null,
                        preambleField    : {
                            label : 'Travel to'
                        }

                    }
                }
            }
        }
    },
    // Add listener for data changes
    listeners : {
        dataChange : function(event) {
            updateDynamics365FieldService(event);
        }
    },tbar : {

        items : {

            deleteButton : {
                text  : 'Signout',
                icon  : 'b-fa b-fa-sign-out',
                style : 'margin-left: auto;',
                onClick() {
                    signOut().then(() => {
                        // Refresh the page after sign out
                        location.reload();
                    });
                }
            }
        }
    }
    // project : {

    //     resources : [
    //         { id : 1, name : 'Dan Stevenson' },
    //         { id : 2, name : 'Talisha Babin' }
    //     ],

    //     events : [
    //         { id : 1, startDate : '2025-12-01', duration : 3, durationUnit : 'd', name : 'Event 1' },
    //         { id : 2, duration : 4, durationUnit : 'd', name : 'Event 2' }
    //     ],

    //     assignments : [
    //         { event : 1, resource : 1 },
    //         { event : 2, resource : 2 }
    //     ],

    //     dependencies : [
    //         { fromEvent : 1, toEvent : 2 }
    //     ]
    // }
};