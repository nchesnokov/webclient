import { createRouter, createWebHistory } from 'vue-router'
import App from '../App.vue'

const routes = [
    {
        path: '/el',
        name: 'ElementPlus',
        component: App,
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