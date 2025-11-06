import { SchedulerPro } from '@bryntum/schedulerpro';
import './style.css';
import { schedulerproConfig } from './schedulerproConfig';
import { signIn } from './auth.js';
import { getResources, getBookings } from './crudFunctions.js';
import CustomEventModel from './lib/CustomEventModel.js';
import CustomResourceModel from './lib/CustomResourceModel.js';

const signInLink = document.getElementById('signin');
const loaderContainer = document.querySelector('.loader-container');

async function displayUI() {
    const account = sessionStorage.getItem('msalAccount');
    if (!account) {
        await signIn();
    }
    signInLink.style = 'display: none';
    const content = document.getElementById('content');
    content.style = 'display: block';

    // Display Scheduler Pro after sign in
    const [resourcesData, bookingsData] = await Promise.all([
        getResources(),
        getBookings()
    ]);

    // Initialize Scheduler Pro with raw D365 data
    // Field mapping is handled by CustomEventModel and CustomResourceModel
    const schedulerPro = new SchedulerPro({
        ...schedulerproConfig,
        resourceStore : {
            modelClass : CustomResourceModel,
            data       : resourcesData.value
        },
        eventStore : {
            modelClass : CustomEventModel,
            data       : bookingsData.value
        }
    });
}

if (sessionStorage.getItem('msalAccount')) {
    displayUI();
    signInLink.style = 'display: none';
}
else {
    signInLink.style = 'display: block';
}

loaderContainer.style = 'display: none';

signInLink.addEventListener('click', displayUI);
