import { createApp, h, ref } from 'vue';
import { ElDialog, ElButton } from 'element-plus';

/**
 * @param component 弹窗默认内容-插槽名为#default
 * @param props 弹窗默认内容的属性
 * @param modalProps 弹窗属性
 */
export function Dialog(component: any, props: any, modalProps: any) {
  const open = ref(true);
  const loading = ref(false);
  const instance = ref();
  //dialog必须是函数式组件
  const dialog = () =>
    h(
      ElDialog,
      {
        draggable: true,
        closeOnClickModal: false,
        closeOnPressEscape: false,
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
          h('div', { className: 'dialog-footer' }, [
            h(ElButton, { onClick: cancel }, () => '取 消'),
            h(
              ElButton,
              { type: 'primary', onClick: submit, loading: loading.value },
              () => '确 认'
            ),
          ]),
      }
    );
  const app = createApp(dialog);
  const div = document.createElement('div');
  document.body.appendChild(div);
  app.mount(div);
  //确认按钮
  async function submit() {
    loading.value = true;
    try {
      await instance.value?.submit?.();
      open.value = false;
    } finally {
      loading.value = false;
    }
  }
  //取消按钮
  function cancel() {
    open.value = false;
  }
}
