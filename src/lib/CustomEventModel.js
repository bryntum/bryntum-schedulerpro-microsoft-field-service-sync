import { EventModel } from '@bryntum/schedulerpro';

// Custom event model for D365 Field Service bookings
export default class CustomEventModel extends EventModel {
    static $name = 'CustomEventModel';

    static fields = [
        { name : 'id', dataSource : 'bookableresourcebookingid' },
        { name : 'bookableresourcebookingid', type : 'string' },
        { name : 'startDate', dataSource : 'msdyn_estimatedarrivaltime', type : 'date' },
        { name : 'endDate', dataSource : 'endtime', type : 'date' },
        { name : 'durationUnit', defaultValue : 'minute' },
        {
            name    : 'preamble',
            type    : 'string',
            convert : (_value, data) => {
                const duration = data.msdyn_estimatedtravelduration;
                return duration ? `${duration} minutes` : null;
            }
        },
        { name : 'resourceId', dataSource : 'Resource.bookableresourceid' },
        {
            name    : 'etag',
            type    : 'string',
            convert : (_value, data) => {
                const raw = data['@odata.etag'];
                return raw ? raw.replace(/\\"/g, '"') : null;
            }
        }
    ];
}
