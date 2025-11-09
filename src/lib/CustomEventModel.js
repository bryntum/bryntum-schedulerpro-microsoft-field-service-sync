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
        // Store the raw travel duration value
        { name : 'travelDuration', dataSource : 'msdyn_estimatedtravelduration', type : 'number' },
        {
            name    : 'preamble',
            type    : 'string',
            convert : (_value, data) => {
                // Only convert when loading from D365 (data will have msdyn_estimatedtravelduration)
                if (data && data.msdyn_estimatedtravelduration != null) {
                    console.log(data.msdyn_estimatedtravelduration, typeof data.msdyn_estimatedtravelduration);
                    return `${data.msdyn_estimatedtravelduration} minutes`;
                }
                // Return null to let the raw value pass through
                return null;
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
