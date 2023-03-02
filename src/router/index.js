import { createRouter, createWebHistory } from 'vue-router'
import AppEL from '../AppEL.vue'
import AppPV from '../AppPV.vue'

const routes = [
    {
        path: '/el',
        name: 'ElementPlus',
        component: AppEL,
    },
    {
        path: '/pv',
        name: 'PrimeVue',
        component: AppPV,
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: { template: '<h2>Page Not Found</h2>' },
    },
]
const router = createRouter({
    history: createWebHistory(),
    routes,
})
export default router