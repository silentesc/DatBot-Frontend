import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import CallbackView from "@/views/CallbackView.vue";
import SettingsView from "@/views/SettingsView.vue";
import LandingPage from "@/views/LandingPage.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "HomeView",
      component: HomeView,
    },
    {
      path: "/auth/discord",
      name: "CallbackView",
      component: CallbackView,
    },
    {
      path: "/settings/:guildId",
      name: "settings",
      component: SettingsView,
    },
    {
      path: "/",
      name: "LandingPage",
      component: LandingPage,
    },
  ],
});

export default router;
