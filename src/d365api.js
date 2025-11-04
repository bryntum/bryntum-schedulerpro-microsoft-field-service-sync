import { getToken } from './auth.js';

const orgUrl = `https://${import.meta.env.VITE_MICROSOFT_DYNAMICS_ORG_ID}.api.crm4.dynamics.com`;
const apiVersion = 'v9.2';

// Fetch work orders from D365 Field Service
export async function getWorkOrders() {
    const token = await getToken();

    const response = await fetch(
        `${orgUrl}/api/data/${apiVersion}/msdyn_workorders?` +
        `$select=msdyn_workorderid,msdyn_name,msdyn_systemstatus,msdyn_datewindowstart,msdyn_datewindowend`,
        {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'OData-MaxVersion': '4.0',
                'OData-Version': '4.0'
            }
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Work Orders API Error:', errorText);
        throw new Error(`Failed to fetch work orders: ${response.statusText}`);
    }

    return await response.json();
}

// Fetch bookable resources from D365 Field Service
export async function getResources() {
    const token = await getToken();

    const response = await fetch(
        `${orgUrl}/api/data/${apiVersion}/bookableresources?` +
        `$select=bookableresourceid,name&` +
        `$expand=ContactId($select=contactid,entityimage)`,
        {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'OData-MaxVersion': '4.0',
                'OData-Version': '4.0'
            }
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch resources: ${response.statusText}`);
    }

    return await response.json();
}

// Fetch bookings (assignments) from D365 Field Service
export async function getBookings() {
    const token = await getToken();

    const response = await fetch(
        `${orgUrl}/api/data/${apiVersion}/bookableresourcebookings?` +
        `$select=bookableresourcebookingid,name,starttime,endtime,duration,msdyn_estimatedtravelduration,msdyn_estimatedarrivaltime&` +
        `$expand=Resource($select=bookableresourceid)`,
        {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'OData-MaxVersion': '4.0',
                'OData-Version': '4.0'
            }
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Bookings API Error:', errorText);
        throw new Error(`Failed to fetch bookings: ${response.statusText}`);
    }

    return await response.json();
}

// Update a work order in D365 Field Service
export async function updateWorkOrder(workOrderId, updates) {
    const token = await getToken();

    const response = await fetch(
        `${orgUrl}/api/data/${apiVersion}/msdyn_workorders(${workOrderId})`,
        {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'OData-MaxVersion': '4.0',
                'OData-Version': '4.0'
            },
            body: JSON.stringify(updates)
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to update work order: ${response.statusText}`);
    }
}

// Update a booking in D365 Field Service
export async function updateBooking(bookingId, updates) {
    const token = await getToken();

    const response = await fetch(
        `${orgUrl}/api/data/${apiVersion}/bookableresourcebookings(${bookingId})`,
        {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'OData-MaxVersion': '4.0',
                'OData-Version': '4.0'
            },
            body: JSON.stringify(updates)
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to update booking: ${response.statusText}`);
    }
}

// Create a new booking in D365 Field Service
export async function createBooking(bookingData) {
    const token = await getToken();

    const response = await fetch(
        `${orgUrl}/api/data/${apiVersion}/bookableresourcebookings`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'OData-MaxVersion': '4.0',
                'OData-Version': '4.0'
            },
            body: JSON.stringify(bookingData)
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to create booking: ${response.statusText}`);
    }

    return await response.json();
}

// Delete a booking from D365 Field Service
export async function deleteBooking(bookingId) {
    const token = await getToken();

    const response = await fetch(
        `${orgUrl}/api/data/${apiVersion}/bookableresourcebookings(${bookingId})`,
        {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'OData-MaxVersion': '4.0',
                'OData-Version': '4.0'
            }
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to delete booking: ${response.statusText}`);
    }
}
