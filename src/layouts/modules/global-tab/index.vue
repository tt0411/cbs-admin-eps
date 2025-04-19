<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { PageTab } from '@sa/materials';
import { VueDraggable } from 'vue-draggable-plus'
import { useAppStore } from '@/store/modules/app';
import { useThemeStore } from '@/store/modules/theme';
import { useRouteStore } from '@/store/modules/route';
import { useTabStore } from '@/store/modules/tab';
import ContextMenu from './context-menu.vue';

defineOptions({ name: 'GlobalTab' });

const route = useRoute();
const appStore = useAppStore();
const themeStore = useThemeStore();
const routeStore = useRouteStore();
const tabStore = useTabStore();
const tabRef = ref<HTMLElement>();

async function scrollToActiveTab() {
  await nextTick();
  const container = tabRef.value;
  if (!container) return;

  const tabNodes = container.querySelectorAll('[data-tab-id]');
  for (let i = 0; i < tabNodes.length; ++i) {
    const node = tabNodes[i] as HTMLElement;
    const tabId = node.getAttribute('data-tab-id');
    if (tabId === tabStore.activeTabId) {
      // 让当前tab居中
      const containerRect = container.getBoundingClientRect();
      const nodeRect = node.getBoundingClientRect();
      const offset = nodeRect.left - containerRect.left - (containerRect.width - nodeRect.width) / 2;
      container.scrollLeft += offset;
      break;
    }
  }
}

function getContextMenuDisabledKeys(tabId: string) {
  const disabledKeys: App.Global.DropdownKey[] = [];

  if (tabStore.isTabRetain(tabId)) {
    const homeDisable: App.Global.DropdownKey[] = ['closeCurrent', 'closeLeft'];
    disabledKeys.push(...homeDisable);
  }

  return disabledKeys;
}

async function handleCloseTab(tab: App.Global.Tab) {
  await tabStore.removeTab(tab.id);

  if (themeStore.resetCacheStrategy === 'close') {
    routeStore.resetRouteCache(tab.routeKey);
  }
}

async function refresh() {
  appStore.reloadPage(500);
}

interface DropdownConfig {
  visible: boolean;
  x: number;
  y: number;
  tabId: string;
}

const dropdown = ref<DropdownConfig>({
  visible: false,
  x: 0,
  y: 0,
  tabId: ''
});

function setDropdown(config: Partial<DropdownConfig>) {
  Object.assign(dropdown.value, config);
}

let isClickContextMenu = false;

function handleDropdownVisible(visible: boolean | undefined) {
  if (!isClickContextMenu) {
    setDropdown({ visible });
  }
}

async function handleContextMenu(e: MouseEvent, tabId: string) {
  e.preventDefault();

  const { clientX, clientY } = e;

  isClickContextMenu = true;

  const DURATION = dropdown.value.visible ? 150 : 0;

  setDropdown({ visible: false });

  setTimeout(() => {
    setDropdown({
      visible: true,
      x: clientX,
      y: clientY,
      tabId
    });
    isClickContextMenu = false;
  }, DURATION);
}

function init() {
  tabStore.initTabStore(route);
}

function onTabsChange(newTabs: any) {
  tabStore.setTabs(newTabs);
}

// watch
watch(
  () => route.fullPath,
  () => {
    tabStore.addTab(route);
  }
);
watch(
  () => tabStore.activeTabId,
  () => {
    scrollToActiveTab();
  }
);

// init
init();
</script>

<template>
  <DarkModeContainer class="size-full flex-y-center px-16px shadow-tab">
    <div class="h-full flex-1-hidden">
      <div
        ref="tabRef"
        class="tab-scroll-x h-full flex overflow-x-auto pr-18px"
        :class="[themeStore.tab.mode === 'chrome' ? 'items-end' : 'items-center gap-12px']"
      >
        <VueDraggable
          :modelValue="tabStore.tabs"
          @update:modelValue="onTabsChange"
          :filter="'.none_draggable'"
          :preventOnFilter="false"
          class="h-full flex pr-18px"
        >
            <div v-for="tab in tabStore.tabs" :key="tab.id" :data-tab-id="tab.id" class="pt-10px h-full flex items-center pr-4"
            :class="tab.id === '/home' ? 'none_draggable' : ''">
              <PageTab
                :mode="themeStore.tab.mode"
                :dark-mode="themeStore.darkMode"
                :active="tab.id === tabStore.activeTabId"
                :active-color="themeStore.themeColor"
                :closable="!tabStore.isTabRetain(tab.id)"
                @click="tabStore.switchRouteByTab(tab)"
                @close="handleCloseTab(tab)"
                @contextmenu="handleContextMenu($event, tab.id)"
              >
                <template #prefix>
                  <SvgIcon
                    :icon="tab.icon"
                    :local-icon="tab.localIcon"
                    class="inline-block align-text-bottom text-16px"
                  />
                </template>
                <div class="max-w-240px ellipsis-text">{{ tab.label }}</div>
              </PageTab>
            </div>
        </VueDraggable>
      </div>
    </div>
    <div>
      <ReloadButton :loading="!appStore.reloadFlag" @click="refresh" />
    </div>
    <FullScreen :full="appStore.fullContent" @click="appStore.toggleFullContent" />
  </DarkModeContainer>
  <ContextMenu
    :visible="dropdown.visible"
    :tab-id="dropdown.tabId"
    :disabled-keys="getContextMenuDisabledKeys(dropdown.tabId)"
    :x="dropdown.x"
    :y="dropdown.y"
    @update:visible="handleDropdownVisible"
  />
</template>

<style>
.tab-scroll-x {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
:deep(.tab-scroll-x)::-webkit-scrollbar {
  display: none;
}
:deep(.none_draggable) {
  pointer-events: auto !important;
  touch-action: manipulation;
}
</style>
