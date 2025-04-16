import type {
  LocationQueryRaw,
  NavigationGuardNext,
  RouteLocationNormalized,
  RouteLocationRaw,
  Router
} from 'vue-router';
import type { RouteKey, RoutePath } from '@elegant-router/types';
import { getRouteName } from '@/router/elegant/transform';
import { useAuthStore } from '@/store/modules/auth';
import { useRouteStore } from '@/store/modules/route';
import { localStg } from '@/utils/storage';
import { layouts } from '../elegant/imports';


/**
 * 创建路由守卫
 *
 * @param router 路由实例
 */
export function createRouteGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {

    // 1. 优先处理 dynamic 路由
    const isDynamicRoute = to.path.includes('/dynamic/');
    if (isDynamicRoute) {
       // 1. 先确保权限路由已初始化
        const routeStore = useRouteStore();
        if (!routeStore.isInitAuthRoute) {
          await routeStore.initAuthRoute();
        }
      try {
        const dynamicRoutes = JSON.parse(localStorage.getItem('dynamicRoutes') || '[]');
        const matchedRoute = dynamicRoutes.find((route: any) => to.path === route.path);

        if (matchedRoute) {
          if (!router.hasRoute(matchedRoute.name)) {
            const files = import.meta.glob('@/views/**/*.vue');
            const componentLoader = files[matchedRoute.componentFile];
            if (componentLoader) {
              const routeConfig = {
                path: matchedRoute.path,
                name: matchedRoute.name,
                component: layouts.base,
                children: [
                  {
                    path: '',
                    name: `${matchedRoute.name}_view`,
                    component: componentLoader,
                    props: () => matchedRoute.props,
                    meta: {
                      multiTab: true,
                      hideInMenu: true,
                      keepAlive: true,
                      ...matchedRoute.meta
                    }
                  }
                ]
              };
              router.addRoute(routeConfig);
              next({ path: to.fullPath, replace: true });
              return;
            }
          } else {
            next();
            return;
          }
        }
        // 没有匹配的动态路由，走404
      } catch (error) {
        // ...日志
      }
    }

    const location = await initRoute(to);
    if (location) {
      next(location);
      return;
    }

    const authStore = useAuthStore();
    const rootRoute: RouteKey = 'root';
    const loginRoute: RouteKey = 'login';
    const noAuthorizationRoute: RouteKey = '403';

    const needLogin = !to.meta.constant;
    const routeRoles = to.meta.roles || [];
    const hasRole = authStore.userInfo.roles.some(role => routeRoles.includes(role));
    const hasAuth = authStore.isStaticSuper || !routeRoles.length || hasRole;
    const isLogin = Boolean(localStg.get('token'));
    // 如果已登录且访问登录页，则重定向到根页面
    if (to.name === loginRoute && isLogin) {
      next({ name: rootRoute });
      return;
    }

    // 如果路由不需要登录，则允许直接访问
    if (!needLogin) {
      handleRouteSwitch(to, from, next);
      return;
    }

    // 如果路由需要登录但用户未登录，则重定向到登录页
    if (!isLogin) {
      next({ name: loginRoute, query: { redirect: to.fullPath } });
      return;
    }

    // 如果用户已登录但没有权限，则重定向到403页面
    if (!hasAuth) {
      next({ name: noAuthorizationRoute });
      return;
    }
    // 正常切换路由
    handleRouteSwitch(to, from, next);
  });
}

/**
 * 初始化路由
 *
 * @param to 目标路由
 */
async function initRoute(to: RouteLocationNormalized): Promise<RouteLocationRaw | null> {
  const routeStore = useRouteStore();

  const notFoundRoute: RouteKey = 'not-found';
  const isNotFoundRoute = to.name === notFoundRoute;

  // 检查是否是动态路由
  const isDynamicRoute = to.path.includes('/dynamic/');
  if (isDynamicRoute) {
    return null;
  }

  // 如果常量路由未初始化，则初始化常量路由
  if (!routeStore.isInitConstantRoute) {
    await routeStore.initConstantRoute();

    // 由于常量路由未初始化，路由被"not-found"路由捕获
    // 在常量路由初始化后，重定向到原始路由
    const path = to.fullPath;
    const location: RouteLocationRaw = {
      path,
      replace: true,
      query: to.query,
      hash: to.hash
    };

    return location;
  }

  const isLogin = Boolean(localStg.get('token'));

  if (!isLogin) {
    // 如果用户未登录且路由是常量路由但不是"not-found"路由，则允许访问
    if (to.meta.constant && !isNotFoundRoute) {
      routeStore.onRouteSwitchWhenNotLoggedIn();

      return null;
    }

    // 如果用户未登录，则重定向到登录页
    const loginRoute: RouteKey = 'login';
    const query = getRouteQueryOfLoginRoute(to, routeStore.routeHome);

    const location: RouteLocationRaw = {
      name: loginRoute,
      query
    };

    return location;
  }

  if (!routeStore.isInitAuthRoute) {
    // 初始化权限路由
    await routeStore.initAuthRoute();

    // 由于权限路由未初始化，路由被"not-found"路由捕获
    // 在权限路由初始化后，重定向到原始路由
    if (isNotFoundRoute) {
      const rootRoute: RouteKey = 'root';
      const path = to.redirectedFrom?.name === rootRoute ? '/' : to.fullPath;

      const location: RouteLocationRaw = {
        path,
        replace: true,
        query: to.query,
        hash: to.hash
      };

      return location;
    }
  }

  routeStore.onRouteSwitchWhenLoggedIn();

  // 权限路由已初始化
  // 如果不是"not-found"路由，则允许访问
  if (!isNotFoundRoute) {
    return null;
  }

  // 如果被"not-found"路由捕获，则检查路由是否存在
  const exist = await routeStore.getIsAuthRouteExist(to.path as RoutePath);
  const noPermissionRoute: RouteKey = '403';

  if (exist) {
    const location: RouteLocationRaw = {
      name: noPermissionRoute
    };

    return location;
  }

  return null;
}

/**
 * 处理路由切换
 * 
 * @param to 目标路由
 * @param from 来源路由
 * @param next 路由守卫的 next 函数
 */
function handleRouteSwitch(to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) {
  // 处理带有 href 的路由
  if (to.meta.href) {
    window.open(to.meta.href, '_blank');

    next({ path: from.fullPath, replace: true, query: from.query, hash: to.hash });

    return;
  }

  next();
}

/**
 * 获取登录路由的查询参数
 * 
 * @param to 目标路由
 * @param routeHome 首页路由
 */
function getRouteQueryOfLoginRoute(to: RouteLocationNormalized, routeHome: RouteKey) {
  const loginRoute: RouteKey = 'login';
  const redirect = to.fullPath;
  const [redirectPath, redirectQuery] = redirect.split('?');
  const redirectName = getRouteName(redirectPath as RoutePath);

  const isRedirectHome = routeHome === redirectName;

  const query: LocationQueryRaw = to.name !== loginRoute && !isRedirectHome ? { redirect } : {};

  if (isRedirectHome && redirectQuery) {
    query.redirect = `/?${redirectQuery}`;
  }

  return query;
}