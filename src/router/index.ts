import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CallbackView from '@/views/CallbackView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'HomeView',
      component: HomeView,
    },
    {
      path: '/auth/discord',
      name: 'callback',
      component: CallbackView,
    }
  ],
})

export default router
