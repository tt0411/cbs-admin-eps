<template>
  <template v-for="(button, index) in actions" :key="index">
    <el-button
      v-if="visible(button)"
      v-bind="buttonProps(button)"
      @click="() => button.click()"
    >
     {{ button.text }}
    </el-button>
  </template>
</template>

<script setup lang="ts">
import { Action } from "./tableColumns";
import { isFunction } from "@vue/shared";

const props = withDefaults(
  defineProps<{ actions: any[]; }>(),
  {}
);
// 计算按钮属性
const buttonProps = (button: Action) => {
  let customProps: any = isFunction(button.provideProps) ? button.provideProps() : button.provideProps

  return Object.assign(
    {
      marginRight: "10px",
      size: 'medium',
      type: "primary",
    },
    customProps
  );
};

// 判断按钮是否可见
const visible = (button: Action) => {
  return isFunction(button.visible) ? button.visible(button) : button.visible === undefined ? true : button.visible;
};

</script>