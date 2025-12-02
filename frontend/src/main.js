import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './assets/style.css';

import { createNotivue } from 'notivue';
import 'notivue/notification.css';
import 'notivue/animations.css';
import 'notivue/notification-progress.css';

const app = createApp(App);
const notivue = createNotivue({
    position: "top-right",
    limit: 5,
    notifications: {
        global: {
            duration: 2000
        }
    }
});

app.use(notivue);
app.use(router);
app.mount('#app');