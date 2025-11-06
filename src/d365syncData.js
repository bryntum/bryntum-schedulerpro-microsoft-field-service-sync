import {
    updateBooking,
    createBooking,
    deleteBooking
} from './crudFunctions.js';

// Track if we're currently in the task editor
let isTaskEditorOpen = false;

/**
 * Set whether the task editor is open
 */
export function setTaskEditorOpen(open) {
    isTaskEditorOpen = open;
}

/**
 * Handles data changes from Bryntum Scheduler Pro and syncs them to D365 Field Service
 * @param {Object} event - The dataChange event from Bryntum Scheduler Pro
 */
export async function updateDynamics365FieldService(event) {
    const { action, record, changes, store } = event;

    console.log('Data change detected:', {
        action,
        storeId    : store.id,
        recordType : record?.constructor?.name,
        recordId   : record?.id,
        isTaskEditorOpen
    });

    // Skip if no record (can happen during batch operations)
    if (!record) {
        console.log('Skipping sync - no record');
        return;
    }

    // Skip syncing if task editor is open (changes are tentative)
    // Exception: 'remove' is always committed
    if (isTaskEditorOpen && action !== 'remove') {
        console.log('Skipping sync - task editor is open (tentative changes)');
        return;
    }

    try {
        // Handle different store types
        switch (store.id) {
            case 'events':
                console.log('Processing events store change');
                await handleEventChanges(action, record, changes);
                break;

            case 'assignments':
                // We don't use assignments store in this implementation
                // Events (bookings) are directly assigned to resources
                console.log('Assignment changes are not synced (using events only)');
                break;

            case 'resources':
                // Resources are typically managed in D365, so we don't sync these
                console.log('Resource changes are not synced to D365');
                break;

            case 'dependencies':
                // Dependencies might be handled differently in D365
                console.log('Dependency changes are not synced to D365');
                break;

            default:
                console.log(`Unhandled store: ${store.id}`);
        }
    }
    catch (error) {
        console.error('Error syncing to D365:', error);
        // Optionally show a notification to the user
        throw error;
    }
}

/**
 * Handle changes to events (bookings in our case)
 */
async function handleEventChanges(action, record, changes) {
    switch (action) {
        case 'add': {
            // Skip - actual creation happens in 'update' with _generated ID
            console.log('Add action - waiting for update with _generated ID');
            break;
        }

        case 'update': {
            // Check if this is a newly created record (has _generated ID)
            if (`${record.id}`.startsWith('_generated')) {
                // This is a new record - create it in D365
                if (!record.name) {
                    console.log('Skipping create - no name set yet');
                    return;
                }

                console.log('Creating new booking in D365 for generated ID:', record.id);

                const bookingData = {
                    name                  : record.name,
                    'resource@odata.bind' : `/bookableresources(${record.resourceId})`,
                    starttime             : record.startDate.toISOString(),
                    endtime               : record.endDate.toISOString(),
                    duration              : Math.round(record.duration) // duration in minutes
                };

                // Add travel time if preamble is set
                if (record.preamble) {
                    const travelMinutes = parseInt(record.preamble);
                    if (!isNaN(travelMinutes)) {
                        bookingData.msdyn_estimatedtravelduration = travelMinutes;
                        // Calculate estimated arrival time (starttime - travel duration)
                        const arrivalTime = new Date(record.startDate);
                        arrivalTime.setMinutes(arrivalTime.getMinutes() - travelMinutes);
                        bookingData.msdyn_estimatedarrivaltime = arrivalTime.toISOString();
                    }
                }

                const newBooking = await createBooking(bookingData);
                const newId = newBooking.bookableresourcebookingid;
                console.log('Booking created in D365:', newId);

                // Update the record with the real D365 ID
                record.eventStore.applyChangeset({
                    updated : [
                        {
                            $PhantomId                : record.id,
                            id                        : newId,
                            bookableresourcebookingid : newId
                        }
                    ]
                });
            }
            else {
                // This is an update to an existing record
                // Skip if no actual changes
                if (Object.keys(changes).length === 0) {
                    console.log('Skipping update - no changes');
                    return;
                }

                const bookingUpdates = {};

                if (changes.name) {
                    bookingUpdates.name = changes.name.value;
                }

                if (changes.startDate) {
                    bookingUpdates.starttime = changes.startDate.value.toISOString();
                }

                if (changes.endDate) {
                    bookingUpdates.endtime = changes.endDate.value.toISOString();
                }

                if (changes.duration) {
                    bookingUpdates.duration = Math.round(changes.duration.value);
                }

                // Handle resource reassignment
                if (changes.resourceId) {
                    bookingUpdates['resource@odata.bind'] = `/bookableresources(${changes.resourceId.value})`;
                }

                // Handle travel time changes
                if (changes.preamble) {
                    const travelMinutes = parseInt(changes.preamble.value);
                    if (!isNaN(travelMinutes)) {
                        bookingUpdates.msdyn_estimatedtravelduration = travelMinutes;
                        // Recalculate estimated arrival time
                        const startDate = changes.startDate?.value || record.startDate;
                        const arrivalTime = new Date(startDate);
                        arrivalTime.setMinutes(arrivalTime.getMinutes() - travelMinutes);
                        bookingUpdates.msdyn_estimatedarrivaltime = arrivalTime.toISOString();
                    }
                }

                // Only update if there are actual changes
                if (Object.keys(bookingUpdates).length > 0 && record.bookableresourcebookingid) {
                    await updateBooking(record.bookableresourcebookingid, bookingUpdates);
                    console.log('Booking updated in D365:', record.bookableresourcebookingid);
                }
            }
            break;
        }

        case 'remove': {
            // Skip if this is a generated ID (never saved to D365)
            if (`${record.id}`.startsWith('_generated')) {
                console.log('Skipping delete - record was never saved to D365');
                return;
            }

            // Delete a booking from D365
            if (record.bookableresourcebookingid) {
                await deleteBooking(record.bookableresourcebookingid);
                console.log('Booking deleted from D365:', record.bookableresourcebookingid);
            }
            break;
        }
    }
}

