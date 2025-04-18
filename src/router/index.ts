import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CallbackView from '@/views/CallbackView.vue'
import GuildsView from '@/views/GuildsView.vue'
import DashboardView from '@/views/DashboardView.vue'

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
      name: "GuildsView",
      component: GuildsView,
    },
    {
      path: "/dashboard/:guildId",
      redirect: (to) => {
        return { path: `/dashboard/${to.params.guildId}/bot-settings` };
      },
    },
    {
      path: "/dashboard/:guildId/:plugin",
      name: "DashboardView",
      component: DashboardView,
    },
  ],
});

export default router;
