import type { App } from 'vue';
import {
  type RouterHistory,
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory
} from 'vue-router';
import { createBuiltinVueRoutes } from './routes/builtin';
import { createRouterGuard } from './guard';


const { VITE_ROUTER_HISTORY_MODE = 'history', VITE_BASE_URL } = import.meta.env;

const historyCreatorMap: Record<Env.RouterHistoryMode, (base?: string) => RouterHistory> = {
  hash: createWebHashHistory,
  history: createWebHistory,
  memory: createMemoryHistory
};

/** 动态添加路由 */
export function addDynamicRoute(route: any) {
  if (!router.hasRoute(route.name)) {
    router.addRoute(route);
    const dynamicRoutes = JSON.parse(localStorage.getItem('dynamicRoutes') || '[]');
    const exists = dynamicRoutes.some((r: any) => r.name === route.name);
    if (!exists) {
      dynamicRoutes.push({
        path: route.path,
        name: route.name,
        componentFile: route.componentFile, // 只存唯一标识
        props: route.props,
        meta: route.meta
      });
      localStorage.setItem('dynamicRoutes', JSON.stringify(dynamicRoutes));
    }
  }
}

export const router = createRouter({
  history: historyCreatorMap[VITE_ROUTER_HISTORY_MODE](VITE_BASE_URL),
  routes: createBuiltinVueRoutes()
});

/** Setup Vue Router */
export async function setupRouter(app: App) {
  app.use(router);
  createRouterGuard(router);
  await router.isReady();
}
