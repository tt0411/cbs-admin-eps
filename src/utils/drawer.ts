import { createApp, h, ref } from 'vue';
import { ElDrawer, ElButton } from 'element-plus';

/**
 * @param component 抽屉默认内容 - 插槽名为 #default
 * @param props 抽屉默认内容的属性
 * @param modalProps 抽屉的属性
 */
export function Drawer(component: any, props: any, modalProps: any) {
  const open = ref(true);
  const loading = ref(false);
  const instance = ref();

  // Drawer 必须是函数式组件
  const drawer = () =>
    h(
      ElDrawer,
      {
        ...modalProps,
        modelValue: open.value,
        onClosed() {
          app.unmount();
          document.body.removeChild(div);
        },
      },
      {
        default: () => h(component, { ...props, ref: instance }),
        footer: () =>
          h('div', { className: 'drawer-footer' }, [
            h(ElButton, { onClick: cancel }, () => '取 消'),
            h(
              ElButton,
              { type: 'primary', onClick: submit, loading: loading.value },
              () => '确 认'
            ),
          ]),
      }
    );

  const app = createApp(drawer);
  const div = document.createElement('div');
  document.body.appendChild(div);
  app.mount(div);

  // 确认按钮
  async function submit() {
    loading.value = true;
    try {
      await instance.value?.submit?.(); // 调用子组件的 submit 方法
      open.value = false; // 关闭抽屉
    } finally {
      loading.value = false;
    }
  }

  // 取消按钮
  function cancel() {
    open.value = false; // 关闭抽屉
  }
}