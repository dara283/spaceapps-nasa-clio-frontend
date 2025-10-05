import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import '@/assets/theme.css'       // <-- add this line

// Leaflet CSS + fix for default icon paths
import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).toString(),
  iconUrl:       new URL('leaflet/dist/images/marker-icon.png',     import.meta.url).toString(),
  shadowUrl:     new URL('leaflet/dist/images/marker-shadow.png',   import.meta.url).toString(),
});


createApp(App).use(router).mount('#app')
