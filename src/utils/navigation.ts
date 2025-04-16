import { addDynamicRoute, router } from '@/router';
import { useTabStore } from '@/store/modules/tab';
import { layouts } from '@/router/elegant/imports';
import { Dialog } from './dialog'
import hash from 'hash.js';
import { Drawer } from './drawer';

function btoaHash(obj: any) {
  const hh = hash.sha1().update(JSON.stringify(obj)).digest('hex');
  const a = hh.slice(0, 4).toLocaleLowerCase();
  const b = hh.slice(36, 40).toLocaleLowerCase();
  const c = hh.slice(18, 22).toLocaleLowerCase();
  return a + b + c;
}

let tabStore: ReturnType<typeof useTabStore> | null = null;
function initStore() {
  if (!tabStore) {
    tabStore = useTabStore();
  }
}

async function page(options: any) {
  initStore();
  const { code, action, type, component, providePath, props, meta } = options;
  const _props = {
    action,
    isAdd: action === 'ADD',
    isEdit: action === 'EDIT',
    isSee: action === 'SEE',
  };
  let suffixPath = '';
  if (typeof providePath === 'function' && props) {
    const injectPath = providePath(props);
    if (injectPath) {
      Object.assign(_props, injectPath);
      Object.values(injectPath).forEach((k) => {
        if (k === undefined) return;
        suffixPath += `/${k}`;
      });
    }
  }
  const __props = props ? { ...props, ..._props } : _props;
  const hashVal = btoaHash(
    Object.assign(__props, { __file: component.__file, __meta: { ...meta } })
  );
    const routeName = `dynamic-page-${hashVal}`;
    const currentPath = code ? `/${code}` : router.currentRoute.value.path;
    const detailPath = `${currentPath}/dynamic/${hashVal}/${action}${suffixPath}`;

    if (currentPath === '/') {
      return;
    }

    if (router.hasRoute(routeName)) {
      await router.push(detailPath);
      return;
    }
    const files = import.meta.glob('@/views/**/*.vue');
    const componentPath = Object.keys(files).find(key =>
      component.__file && key.endsWith(component.__file.split('/views/')[1])
    );
    let route = {};
    if (meta.isLayout !== false) {
      route = {
        path: detailPath,
        name: routeName,
        componentFile: componentPath,
        component: layouts.base,
        props,
        meta: {
          multiTab: true,
          hideInMenu: true,
          keepAlive: false,
          ...meta
        },
        children: [
          {
            path: '',
            name: `${routeName}_view`,
            component,
            props,
            meta: {
              multiTab: true,
              hideInMenu: true,
              keepAlive: false,
              ...meta
            }
          }
        ]
      };
    } else {
      route = {
        path: detailPath,
        name: `${routeName}_view`,
        componentFile: componentPath,
        component,
        props,
        meta: {
          multiTab: false,
          hideInMenu: true,
          keepAlive: false,
          ...meta
        }
      };
    }
    addDynamicRoute(route);
    await router.push(detailPath);
  }

function close(path: string) {
  initStore();
  if (tabStore) {
    tabStore.removeTab(path);
  }
  router.back();
}

function dialog(component: any, props: any, modalProps: any) {
  Dialog(component, props, modalProps)
}

function drawer(component: any, props: any, modalProps: any) {
  Drawer(component, props, modalProps)
}

export const nav = {
  page,
  drawer,
  dialog,
  close,
  btoaHash
};