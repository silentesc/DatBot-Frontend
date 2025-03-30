import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CallbackView from '@/views/CallbackView.vue'
import DashboardView from '@/views/DashboardView.vue'
import DashboardGuildView from '@/views/DashboardGuildView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'HomeView',
      component: HomeView,
    },
    {
      path: "/auth/discord",
      name: "CallbackView",
      component: CallbackView,
    },
    {
      path: "/dashboard",
      name: "DashboardView",
      component: DashboardView,
    },
    {
      path: "/dashboard/:guildId",
      name: "DashboardGuildView",
      component: DashboardGuildView,
    },
  ],
})

export default router
