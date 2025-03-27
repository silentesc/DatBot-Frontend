<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import Cookies from 'js-cookie';
import settings from '@/settings.json';
import { useRoute } from 'vue-router';
import data from 'emoji-mart-vue-fast/data/all.json';
import { Picker, EmojiIndex } from 'emoji-mart-vue-fast/src';
import ErrorMessage from '@/components/ErrorMessage.vue';

const route = useRoute();
const guildId = route.params.guildId as string;

// State variables
const selectedSection = ref('Reaction Roles');
const isAddReactionRoleModalOpen = ref(false);
const messageContent = ref('');
const selectedEmojis = ref<string[]>([]);
const selectedChannelId = ref<string | null>(null);
const roles = ref<Role[]>([]);
const channels = ref<Category[]>([]);
const reactionRoleMessages = ref<ReactionRoleMessage[]>([]);
const isRolesDropdownOpen = ref<{ [emoji: string]: boolean }>({});
const isChannelDropdownOpen = ref(false);
const showEmojiPicker = ref(false);
const errorMessage = ref('');
const emojiRoles = ref<{ emoji: string; role: Role | null }[]>([]);
const reactionRoleType = ref<'STANDARD' | 'UNIQUE'>('STANDARD');
const isTypeDropdownOpen = ref(false);

// Constants
const sections = ['Reaction Roles', 'Welcome'];
const emojiIndex = new EmojiIndex(data);

// Interfaces
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

interface ReactionRoleMessage {
  message_id: string;
  message: string;
  channel_id: string;
  emoji_roles: {
    emoji: string;
    role_name: string;
    role_color: number;
  }[];
}

// Help function
const decimalToHex = (decimal: number): string => {
  return '#' + decimal.toString(16).padStart(6, '0');
};

// Emoji functions
const handleEmojiSelect = (emoji: any) => {
  if (!selectedEmojis.value.includes(emoji.native)) {
    selectedEmojis.value.push(emoji.native);
  } else {
    errorMessage.value = "You've already selected that emoji!";
    setTimeout(() => (errorMessage.value = ''), 3500);
  }
};

const removeEmoji = (emojiToRemove: string, event: Event) => {
  selectedEmojis.value = selectedEmojis.value.filter((emoji) => emoji !== emojiToRemove);
  showEmojiPicker.value = !showEmojiPicker.value;
};

// Role functions
const addRoleToEmoji = (emoji: string, role: Role) => {
  const emojiRole = emojiRoles.value.find((er) => er.emoji === emoji);
  if (emojiRole) {
    emojiRole.role = role;
  } else {
    emojiRoles.value.push({ emoji, role });
  }
  isRolesDropdownOpen.value = { ...isRolesDropdownOpen.value, [emoji]: false };
  showEmojiPicker.value = !showEmojiPicker.value;
};

const toggleRolesDropdown = (emoji: string, event: Event) => {
  if (!(event.target as HTMLElement).closest('.custom-dropdown')) {
    return;
  }
  isRolesDropdownOpen.value = {
    ...isRolesDropdownOpen.value,
    [emoji]: !isRolesDropdownOpen.value[emoji],
  };
};

// Channel functions
const toggleChannelDropdown = () => {
  isChannelDropdownOpen.value = !isChannelDropdownOpen.value;
};

const selectChannelItem = (channelId: string | null) => {
  selectedChannelId.value = channelId;
  isChannelDropdownOpen.value = false;
};

// Modal functions
const toggleEmojiPicker = () => {
  showEmojiPicker.value = !showEmojiPicker.value;
  console.log("EmojiPicker");
};

const addReactionRole = async () => {
  try {
    const sessionId: string | undefined = Cookies.get(settings.SESSION_ID_COOKIE);
    if (!sessionId || !selectedChannelId.value) {
      errorMessage.value = 'Session or Channel ID not found..';
      return;
    }

    const reactionRolesData = emojiRoles.value.map((er) => ({
      emoji: er.emoji,
      role_id: er.role?.id,
    }));

    await axios.post(`${settings.BACKEND_URL}/reaction_role/reaction_role`, reactionRolesData, {
      params: {
        session_id: sessionId,
        guild_id: guildId,
        channel_id: selectedChannelId.value,
        reaction_role_type: reactionRoleType.value,
        reaction_roles: reactionRolesData,
        message: messageContent.value,
      },
    });

    console.log('ID:' + selectedChannelId.value);

    isAddReactionRoleModalOpen.value = false;
    fetchReactionRoleMessages();

    if (!selectedChannelId.value) {
      errorMessage.value = 'Channel ID is not saved correctly.';
      return;
    }
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || (error as Error).message || 'An unexpected error occurred.';
    setTimeout(() => (errorMessage.value = ''), 3500);
  }
};

const deleteReactionRoleMessage = async (message: ReactionRoleMessage) => {
  try {
    const sessionId: string | undefined = Cookies.get(settings.SESSION_ID_COOKIE);
    if (sessionId) {
      await axios.delete(`${settings.BACKEND_URL}/reaction_role/reaction_role`, {
        params: {
          session_id: sessionId,
          guild_id: guildId,
          channel_id: message.channel_id,
          message_id: message.message_id,
        },
      });
      reactionRoleMessages.value = reactionRoleMessages.value.filter((m) => m.message_id !== message.message_id);
    }
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || (error as Error).message || 'An unexpected error occurred.';
    setTimeout(() => (errorMessage.value = ''), 3500);
  }
};

// Fetch data
const fetchGuildData = async () => {
  try {
    const sessionId: string | undefined = Cookies.get(settings.SESSION_ID_COOKIE);
    if (sessionId) {
      const channelsResponse = await axios.get(`${settings.BACKEND_URL}/user/guild_channels`, {
        params: { session_id: sessionId, guild_id: guildId },
      });
      const textChannels = channelsResponse.data.filter((channel: any) => channel.type === 0);
      const categories = channelsResponse.data.filter((channel: any) => channel.type === 4);
      channels.value = categories
        .filter((category: any) => textChannels.some((channel: any) => channel.parentId === category.id))
        .map((category: any) => ({
          ...category,
          children: textChannels.filter((channel: any) => channel.parentId === category.id),
        }));

      const rolesResponse = await axios.get(`${settings.BACKEND_URL}/user/guild_roles`, {
        params: { session_id: sessionId, guild_id: guildId },
      });
      roles.value = rolesResponse.data.sort((a: Role, b: Role) => b.position - a.position);

      fetchReactionRoleMessages();
    }
  } catch (error) {
    console.error('Data could not be loaded:', error);
  }
};

const fetchReactionRoleMessages = async () => {
  try {
    const sessionId: string | undefined = Cookies.get(settings.SESSION_ID_COOKIE);
    if (sessionId) {
      const response = await axios.get(`${settings.BACKEND_URL}/reaction_role/reaction_roles`, {
        params: { session_id: sessionId, guild_id: guildId },
      });
      reactionRoleMessages.value = response.data;
    }
  } catch (error) {
    console.error('Reaction Role Messages could not be loaded:', error);
  }
};

// Watcher
watch(isAddReactionRoleModalOpen, (newValue) => {
  if (!newValue) {
    messageContent.value = '';
    selectedEmojis.value = [];
    emojiRoles.value = [];
    selectedChannelId.value = null;
    isRolesDropdownOpen.value = {};
  }
});

// Hooks
onMounted(fetchGuildData);
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

          <div v-if="reactionRoleMessages.length > 0">
            <h3>Existing Reaction Role Messages</h3>
            <div v-for="message in reactionRoleMessages" :key="message.message_id">
              <div class="reaction-role-message">
                <p><strong>Message:</strong> {{ message.message }}</p>
                <p>
                  <strong>Channel:</strong>
                  {{
                    channels
                      .flatMap((c) => c.children)
                      .find((channel) => channel.id === message.channel_id)?.name
                  }}
                </p>
                <div class="reactions">
                  <span v-for="reaction in message.emoji_roles" :key="reaction.emoji">
                    {{ reaction.emoji }} -
                    <span class="role-with-color">
                      {{ reaction.role_name }}
                      <span class="role-color-indicator" :style="{
                        backgroundColor:
                          '#' + reaction.role_color.toString(16).padStart(6, '0'),
                      }"></span>
                    </span>
                  </span>
                </div>
                <button class="danger-button" @click="deleteReactionRoleMessage(message)">
                  Delete
                </button>
              </div>
            </div>
          </div>

          <div v-if="isAddReactionRoleModalOpen" class="modal">
            <h2>Add Reaction Roles</h2>
            <label>
              Message:
              <textarea v-model="messageContent"></textarea>
            </label>
            <label>
              Kanal:
              <div class="custom-dropdown">
                <div class="dropdown-header" @click="toggleChannelDropdown">
                  {{
                    selectedChannelId
                      ? channels
                        .flatMap((category) => category.children)
                        .find((channel) => channel.id === selectedChannelId)?.name
                      : 'Select Channel'
                  }}
                  <span class="arrow" :class="{ open: isChannelDropdownOpen }"></span>
                </div>
                <div v-if="isChannelDropdownOpen" class="dropdown-list" :class="{ open: isChannelDropdownOpen }">
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
                <Picker :data="emojiIndex" set="twitter" title="Select Emoji" @select="handleEmojiSelect"
                  showSkinTones="" />
              </div>
              <div>
                <span v-for="emoji in selectedEmojis" :key="emoji">
                  <div class="emoji-role-container">
                    <span style="font-size: 2em;">{{ emoji }}</span>
                    <label>
                      <div class="custom-dropdown">
                        <div class="dropdown-header" @click.stop="(event) => toggleRolesDropdown(emoji, event)">
                          {{emojiRoles.find((er) => er.emoji === emoji)?.role?.name || 'Select Role'}}
                          <span class="arrow" :class="{ open: isRolesDropdownOpen[emoji] }"></span>
                        </div>
                        <div v-if="isRolesDropdownOpen[emoji]" class="dropdown-list2"
                          :class="{ open: isRolesDropdownOpen[emoji] }">
                          <div v-for="role in roles" :key="role.id" class="role-item"
                            @click="addRoleToEmoji(emoji, role)">
                            <span class="role-color-indicator" :style="{
                              backgroundColor:
                                role.color === 0 ? '#99AAB5' : decimalToHex(role.color),
                            }"></span>
                            {{ role.name }}
                          </div>
                        </div>
                      </div>
                    </label>
                    <button class="danger-button" @click="(event) => removeEmoji(emoji, event)">X</button>
                  </div>
                </span>
              </div>
            </label>
            <label>
              Type:
              <div class="custom-dropdown">
                <div class="dropdown-header" @click="isTypeDropdownOpen = !isTypeDropdownOpen">
                  {{ reactionRoleType === 'STANDARD' ? 'Standard' : 'Unique' }}
                  <span class="arrow" :class="{ open: isTypeDropdownOpen }"></span>
                </div>
                <div v-if="isTypeDropdownOpen" class="dropdown-list" :class="{ open: isTypeDropdownOpen }">
                  <div class="channel-item" @click="reactionRoleType = 'STANDARD'; isTypeDropdownOpen = false">Standard
                  </div>
                  <div class="channel-item" @click="reactionRoleType = 'UNIQUE'; isTypeDropdownOpen = false">Unique
                  </div>
                </div>
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
  font-family: Arial, Helvetica;
  font-size: 15px;
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
  margin-top: 5px;
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

.reaction-role-message {
  border: 1px solid var(--accent);
  border-radius: 5px;
  padding: 10px;
  margin-bottom: 10px;
  background-color: var(--secondary);
  color: #fff;
  font-size: 15px;
}

.reaction-role-message p {
  margin: 5px 0;
  font-size: 15px;
}

.reaction-role-message strong {
  color: var(--accent);
}

.reactions {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 10px;
}

.reactions span {
  background-color: #4a6591;
  padding: 5px 10px;
  border-radius: 3px;
}

.reactions span strong {
  color: var(--accent);
}

h3 {
  color: #fff;
  margin-bottom: 10px;
}

.role-with-color {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.role-color-indicator {
  width: 15px;
  height: 15px;
  border-radius: 50%;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.2s ease;
}

.dropdown-header:hover {
  background-color: var(--accent);
}

.dropdown-header .arrow {
  display: inline-block;
  width: 0;
  height: 0;
  margin-left: 5px;
  vertical-align: middle;
  border-top: 5px solid white;
  border-right: 5px solid transparent;
  border-left: 5px solid transparent;
  transition: transform 0.3s ease-in-out;
}

.dropdown-list.open+.dropdown-header .arrow,
.dropdown-list2.open+.dropdown-header .arrow,
.dropdown-header.open .arrow {
  transform: rotate(180deg);
}

.dropdown-list,
.dropdown-list2 {
  position: absolute;
  top: calc(100% + 2px);
  left: 0;
  width: 100%;
  background-color: var(--background);
  border: 1px solid var(--accent);
  border-radius: 5px;
  z-index: 10;
  overflow: auto;
  max-height: 300px;
  opacity: 0;
  transform: translateY(-10px);
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.dropdown-list.open,
.dropdown-list2.open {
  opacity: 1;
  transform: translateY(0);
}

.category-header {
  padding: 8px 12px;
  background-color: #263652;
  color: #eaf4f5;
  font-weight: bold;
  border-bottom: 1px solid var(--accent);
}

.channel-item,
.role-item {
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  color: #fff;
}

.channel-item:hover,
.role-item:hover {
  background-color: #4a6591;
}

.role-color-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
}

.arrow {
  display: inline-block;
  width: 0;
  height: 0;
  margin-left: 5px;
  vertical-align: middle;
  border-top: 5px solid black;
  border-right: 5px solid transparent;
  border-left: 5px solid transparent;
  transition: transform 0.3s ease-in-out;
}

.arrow.open {
  transform: rotate(180deg);
}
</style>
