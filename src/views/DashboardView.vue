<script setup lang="ts">
import DashboardNavbarComponent from '@/components/DashboardNavbarComponent.vue';
import OverviewComponent from '@/components/plugins/OverviewComponent.vue';
import ReactionRoleComponent from '@/components/plugins/ReactionRoleComponent.vue';
import WelcomeMessageComponent from '@/components/plugins/WelcomeMessageComponent.vue';
import { Plugins } from '@/models';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const guildId = ref<string>(route.params.guildId as string);
const plugin = ref<string>(route.params.plugin as string);

const setPlugin = (newPlugin: string) => {
    plugin.value = newPlugin;
    router.push({ name: 'DashboardView', params: { guildId: guildId.value, plugin: newPlugin } });
}
</script>

<template>
    <div class="dashboard-container">
        <DashboardNavbarComponent :plugin="plugin" @plugin-selected="setPlugin" />
        
        <div class="dashboard-content">
            <OverviewComponent v-if="plugin === Plugins.OVERVIEW" />
            <WelcomeMessageComponent v-else-if="plugin === Plugins.WELCOME_MESSAGE" :guild-id="guildId" />
            <ReactionRoleComponent v-else-if="plugin === Plugins.REACTION_ROLES" :guild-id="guildId" />
            <div v-else>
                <h1>Plugin not found</h1>
            </div>
        </div>
    </div>
</template>

<style scoped>
.dashboard-container {
    display: flex;
}

.dashboard-content {
    flex: 1;
    margin: var(--margin-large);
}
</style>
