import { ResourceModel } from '@bryntum/schedulerpro';

// Custom resource model for D365 Field Service bookable resources
export default class CustomResourceModel extends ResourceModel {
    static $name = 'CustomResourceModel';

    static fields = [
        { name : 'id', dataSource : 'bookableresourceid' },
        { name : 'bookableresourceid', type : 'string' },
        {
            name    : 'imageUrl',
            type    : 'string',
            convert : (_value, data) => {
                const entityImage = data.ContactId?.entityimage;
                if (entityImage) {
                    // entityimage is base64 encoded, convert to data URL
                    return `data:image/jpeg;base64,${entityImage}`;
                }
                return null;
            }
        },
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
