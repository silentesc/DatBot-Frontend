<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import Cookies from 'js-cookie';
import settings from "@/settings.json";
import { useRoute } from 'vue-router';
import data from "emoji-mart-vue-fast/data/all.json";
import { Picker, EmojiIndex } from "emoji-mart-vue-fast/src";
import ErrorMessage from '@/components/ErrorMessage.vue';

const errorMessage = ref('');

const route = useRoute();
const guildId = route.params.guildId as string;

const selectedSection = ref('Reaction Roles');
const isAddReactionRoleModalOpen = ref(false);
const messageContent = ref('');
const selectedEmojis = ref<string[]>([]);
const selectedChannel = ref<string | null>(null);

const roles = ref<Role[]>([]);
const isRolesDropdownOpen = ref<{ [emoji: string]: boolean }>({});
const decimalToHex = (decimal: number): string => {
  return '#' + decimal.toString(16).padStart(6, '0');
}

const handleEmojiSelect = (emoji: any) => {
  selectedEmojis.value.push(emoji.native);
  showEmojiPicker.value = !showEmojiPicker.value;
};

const removeEmoji = (emojiToRemove: string) => {
  selectedEmojis.value = selectedEmojis.value.filter(emoji => emoji !== emojiToRemove);
  delete isRolesDropdownOpen.value[emojiToRemove];
  showEmojiPicker.value = !showEmojiPicker.value;
};

const emojiRoles = ref<{ emoji: string; role: Role | null }[]>([]);

const addRoleToEmoji = (emoji: string, role: Role) => {
  const emojiRole = emojiRoles.value.find(er => er.emoji === emoji);
  if (emojiRole) {
    emojiRole.role = role;
  } else {
    emojiRoles.value.push({ emoji, role });
  }
  isRolesDropdownOpen.value = { ...isRolesDropdownOpen.value, [emoji]: false };
  showEmojiPicker.value = !showEmojiPicker.value;
};

const channels = ref<Category[]>([]);
const isChannelDropdownOpen = ref(false);
const showEmojiPicker = ref(false);

const sections = [
  'Reaction Roles',
  'Welcome'
];

interface Channel {
  id: string;
  name: string;
  parentId?: string | null;
}

interface Category {
  id: string;
  name: string;
  children: Channel[];
}

interface Role {
  id: string;
  name: string;
  color: number;
  position: number;
}

onMounted(async () => {
  try {
    const sessionId: string | undefined = Cookies.get(settings.SESSION_ID_COOKIE);
    if (sessionId) {
      const response = await axios.get(`${settings.BACKEND_URL}/user/guild_channels`, {
        params: { session_id: sessionId, guild_id: guildId }
      });
      const textChannels = response.data.filter((channel: any) => channel.type === 0);
      const categories = response.data.filter((channel: any) => channel.type === 4);
      channels.value = categories
        .filter((category: any) =>
          textChannels.some((channel: any) => channel.parentId === category.id)
        )
        .map((category: any) => ({
          ...category,
          children: textChannels.filter(
            (channel: any) => channel.parentId === category.id
          )
        }));
    }
    if (sessionId) {
      const response = await axios.get(`${settings.BACKEND_URL}/user/guild_roles`, {
        params: { session_id: sessionId, guild_id: guildId }
      });
      roles.value = response.data;
      roles.value.sort((a, b) => b.position - a.position);
    }
  } catch (error) {
    console.error('Failed to fetch channels:', error);
  }
});

const toggleChannelDropdown = () => {
  isChannelDropdownOpen.value = !isChannelDropdownOpen.value;
};

const selectChannelItem = (channelId: string | null) => {
  selectedChannel.value = channelId;
  isChannelDropdownOpen.value = false;
};

const toggleEmojiPicker = () => {
  showEmojiPicker.value = !showEmojiPicker.value;
};

const toggleRolesDropdown = (emoji: string, event: Event) => {
  if (!(event.target as HTMLElement).closest('.custom-dropdown')) {
    return;
  }
  isRolesDropdownOpen.value = {
    ...isRolesDropdownOpen.value,
    [emoji]: !isRolesDropdownOpen.value[emoji]
  };
};

let emojiIndex = new EmojiIndex(data);

const addReactionRole = async () => {
  try {
    const sessionId: string | undefined = Cookies.get(settings.SESSION_ID_COOKIE);
    console.log('Session ID:', sessionId);

    if (!sessionId) {
      console.error('Session ID not found');
      return;
    }

    if (!selectedChannel.value) {
      console.error('Channel not selected');
      return;
    }

    const reactionRoles = emojiRoles.value.map(er => ({
      emoji: er.emoji,
      role_id: er.role?.id,
    }));
    console.log('Reaction Roles:', reactionRoles);

    console.log('Guild ID:', guildId);
    console.log('Channel ID:', selectedChannel.value);
    console.log('Message:', messageContent.value);

    const response = await axios.post(`${settings.BACKEND_URL}/reaction_role/reaction_role`, reactionRoles, {
      params: {
        session_id: sessionId,
        guild_id: guildId,
        channel_id: selectedChannel.value,
        message: messageContent.value,
        reaction_roles: reactionRoles
      }
    });

    console.log('API Response:', response.data);
    isAddReactionRoleModalOpen.value = false;
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || (error as Error).message || 'An unexpected error occurred.';
    console.error('Failed to add reaction role:', error);
    setTimeout(() => {
      errorMessage.value = '';
    }, 3500);
  }
}

watch(isAddReactionRoleModalOpen, (newValue) => {
  if (!newValue) {
    messageContent.value = '';
    selectedEmojis.value = [];
    emojiRoles.value = [];
    selectedChannel.value = null;
    isRolesDropdownOpen.value = {};
  }
});

</script>

<template>
  <div class="settings-container">
    <aside class="sidebar">
      <nav class="sidebar-nav">
        <a v-for="section in sections" :key="section" @click="selectedSection = section"
          :class="{ active: selectedSection === section }">
          <span class="sidebar-text">{{ section }}</span>
        </a>
      </nav>
    </aside>

    <main class="content">
      <ErrorMessage :message="errorMessage" />
      <h2>{{ selectedSection }}</h2>
      <div v-if="selectedSection === 'Reaction Roles'">
        <div class="reaction-roles-settings">
          <button class="add-reaction-role-button" @click="isAddReactionRoleModalOpen = true">
            Add Reaction Roles
          </button>

          <div v-if="isAddReactionRoleModalOpen" class="modal">
            <h2>Add Reaction Roles</h2>
            <label>
              Message Content:
              <textarea v-model="messageContent"></textarea>
            </label>
            <label>
              Channel:
              <div class="custom-dropdown">
                <div class="dropdown-header" @click="toggleChannelDropdown">
                  {{
                    selectedChannel
                      ? channels
                        .flatMap((category) => category.children)
                        .find((channel) => channel.id === selectedChannel)?.name
                      : 'Select Channel'
                  }}
                </div>
                <div v-if="isChannelDropdownOpen" class="dropdown-list">
                  <div v-for="category in channels" :key="category.id">
                    <div class="category-header">
                      {{ category.name }}
                    </div>
                    <div v-for="channel in category.children" :key="channel.id" class="channel-item"
                      @click="selectChannelItem(channel.id)">
                      {{ channel.name }}
                    </div>
                  </div>
                </div>
              </div>
            </label>
            <label>
              Emojis:
              <button class="emoji-select" @click="toggleEmojiPicker">
                Select Emoji
              </button>
              <div v-if="showEmojiPicker">
                <Picker :data="emojiIndex" set="twitter" title="Dominic Penis" showSkinTones="false"
                  @select="handleEmojiSelect" />
              </div>
              <div>
                <span v-for="emoji in selectedEmojis" :key="emoji">
                  <div class="emoji-role-container">
                    <span style="font-size: 2em;">{{ emoji }}</span>
                    <label>
                      <div class="custom-dropdown">
                        <div class="dropdown-header" @click.stop="(event) => toggleRolesDropdown(emoji, event)">
                          {{emojiRoles.find(er => er.emoji === emoji)?.role?.name || 'Select Role'}}
                        </div>
                        <div v-if="isRolesDropdownOpen[emoji]" class="dropdown-list2">
                          <div v-for="role in roles" :key="role.id" class="role-item"
                            @click="addRoleToEmoji(emoji, role)">
                            <span class="role-color-indicator" :style="{
                              backgroundColor: role.color === 0 ? '#99AAB5' : decimalToHex(role.color)
                            }"></span>
                            {{ role.name }}
                          </div>
                        </div>
                      </div>
                    </label>
                    <button class="danger-button" @click="removeEmoji(emoji)">X</button>
                  </div>
                </span>
              </div>
            </label>
            <button class="modal-add-button" @click="addReactionRole">
              Add
            </button>
            <button class="modal-close-button" @click="isAddReactionRoleModalOpen = false">
              Close
            </button>
          </div>
        </div>
      </div>
      <div v-else-if="selectedSection === 'Welcome'">
        <p>Placeholder</p>
      </div>
    </main>
  </div>
</template>

<style lang="css" scoped>
.settings-container {
  display: flex;
  cursor: pointer;
}

.sidebar {
  width: 250px;
  background-color: var(--background);
  border: 1px solid var(--accent);
  border-radius: 5px;
  color: white;
  overflow: hidden;
}

.sidebar-nav {
  padding: 10px;
}

.sidebar-nav a {
  margin-top: 5px;
  display: block;
  padding: 10px;
  border-radius: 5px;
  border: var(--accent) 1px solid;
  color: white;
  text-decoration: none;
  transition: all 0.3s ease;
}

.sidebar-nav a:hover {
  background-color: var(--accent);
  scale: 105%;
  transition: all 0.3s ease;
}

.sidebar-nav a.active {
  background-color: var(--secondary);
  border-radius: 5px;
  border: none;
}

.content {
  flex-grow: 1;
  padding: 20px;
}

.sidebar-text {
  display: inline;
}

.reaction-roles-settings {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.add-reaction-role-button {
  background-color: var(--accent);
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.add-reaction-role-button:hover {
  background-color: var(--secondary);
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: var(--background);
  padding: 20px;
  border: 1px solid var(--accent);
  border-radius: 5px;
  box-shadow: 0 2px 8px var(--accent);
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 700px;
  height: 800px;
  overflow-y: auto;
  outline: none;
}

.modal label {
  display: flex;
  flex-direction: column;
}

.modal input,
.modal textarea {
  padding: 8px;
  border: 1px solid var(--accent);
  border-radius: 5px;
  background-color: var(--secondary);
  color: white;
  resize: none;
}

.emoji-select {
  padding: 8px;
  border: 1px solid var(--accent);
  border-radius: 5px;
  background-color: var(--secondary);
  color: white;
  text-align: left;
  font-size: 15px;
  height: 42px;
}

.emoji-select:hover {
  cursor: pointer;
}

.modal-add-button,
.modal-close-button {
  background-color: var(--accent);
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.modal-add-button:hover,
.modal-close-button:hover {
  background-color: var(--secondary);
}

.custom-dropdown {
  position: relative;
  width: 100%;
}

.dropdown-header {
  padding: 8px;
  border: 1px solid var(--accent);
  border-radius: 5px;
  background-color: var(--secondary);
  color: white;
  cursor: pointer;
}

.dropdown-list {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background-color: var(--background);
  border: 1px solid var(--accent);
  border-radius: 5px;
  box-shadow: 0 2px 8px var(--accent);
  z-index: 10;
}

.dropdown-list2 {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  border-radius: 5px;
  box-shadow: 0 2px 8px var(--accent);
  z-index: 10;
}

.category-header {
  padding: 8px;
  background-color: #263652;
  color: #eaf4f5;
  font-weight: bold;
}

.channel-item {
  padding: 8px 20px;
  cursor: pointer;
}

.channel-item:hover {
  background-color: #4a6591;
  color: #eaf4f5;
}

.row {
  display: flex;
}

.row>* {
  margin: auto;
}

.hidden {
  display: none;
  visibility: hidden;
  background-color: lightgray;
}

::-webkit-scrollbar {
  width: 8px;
  background-color: lightgray;
}

::-webkit-scrollbar-thumb {
  background-color: rgb(73, 73, 73);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background-color: rgb(122, 122, 122);
}

h2 {
  color: #fff;
}

.danger-button {
  padding: 12px 12px;
  font-size: 1.2em;
  color: #fff;
  background-color: #994141;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.danger-button:hover {
  scale: 1.05;
  background-color: #753232;
}

.role-item {
  border: 1px solid var(--accent);
  background-color: var(--secondary);
  font-size: 15px;
  padding: 8px;
  display: flex;
  align-items: center;
  color: #fff;
}

.role-item:hover {
  background-color: var(--accent);
  cursor: pointer;
}

.role-color-indicator {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  margin-right: 8px;
}

.emoji-role-container {
  display: flex;
  align-items: center;
  border: 1px solid var(--accent);
  border-radius: 5px;
  padding: 5px;
  margin: 5px;
  background-color: var(--secondary);
}

.emoji-role-container .danger-button {
  margin-left: auto;
  margin-right: 20px;
  padding: 8px 10px;
  font-size: 1em;
  color: #fff;
  background-color: #994141;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
  max-width: 200px;
}

.emoji-role-container .danger-button:hover {
  scale: 1.05;
  background-color: #753232;
}

.emoji-role-container span[style*="font-size: 4em;"] {
  margin-right: 5px;
}

.emoji-role-container label {
  margin: 0 auto;
  flex-grow: 1;
  text-align: left;
  max-width: 500px;
}
</style>
