import { updateDynamics365FieldService, setTaskEditorOpen } from './d365syncData.js';
import { signOut } from './auth.js';

export const schedulerproConfig = {
    appendTo   : 'app',
    startDate  : new Date(2025, 9, 31, 8),
    endDate    : new Date(2025, 9, 31, 21),
    timeZone   : 'UTC',
    viewPreset : 'hourAndDay',
    columns    : [
        {
            text          : 'Name',
            field         : 'name',
            readOnly      : true,
            cellMenuItems : false,
            width         : 200,
            htmlEncode    : false,
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
            tooltipTemplate         : ({ duration }) => `<i class="fa fa-car"></i>Travel time: ${duration}`
        },

        taskEdit : {
            items : {
                generalTab : {
                    items : {
                        percentDoneField : null,
                        effortField      : null,
                        postambleField   : null,
                        preambleField    : {
                            label : 'Travel to'
                        }

                    }
                }
            },
            listeners : {
                beforeShow() {
                    setTaskEditorOpen(true);
                },
                // When save button is clicked, allow sync
                beforeEventSave() {
                    setTaskEditorOpen(false);
                },
                // When cancel or dialog closes without saving
                beforeCancel() {
                    setTaskEditorOpen(false);
                }
            }
        }
    },
    // Add listener for data changes
    listeners : {
        dataChange : function(event) {
            updateDynamics365FieldService(event);
        }
    },
    tbar : {
        items : {
            deleteButton : {
                text  : 'Signout',
                icon  : 'fa fa-sign-out',
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
};