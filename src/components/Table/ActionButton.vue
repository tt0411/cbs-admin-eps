<template>
    <template v-for="(button, index) in visibleButtons" :key="index">
      <el-button
        v-if="visible(button)"
        v-bind="buttonProps(button)"
        @click="() => button.click(scope, props.exposeObject)"
      >
        {{ computedActionName(button, props.scope.row) }}
      </el-button>
    </template>
  
    <el-dropdown
      v-if="hiddenButtons.length > 0"
      placement="bottom"
      trigger="click"
    >
    <el-button class="ml-10px" v-bind="hiddenButtons.length ? buttonProps(hiddenButtons[0]) : {}">更多</el-button>
    <template #dropdown>
    <el-dropdown-menu>
      <el-dropdown-item class="flex flex-col px-16px py-0" v-for="(button, index) in hiddenButtons" :key="index">
        <el-button
          v-if="visible(button)"
          v-bind="buttonProps(button)"
          @click="() => button.click(scope, props.exposeObject)"
          style="display: block; margin-bottom: 5px;"
        >
          {{ computedActionName(button, props.scope.row) }}
          </el-button>
    </el-dropdown-item>
    </el-dropdown-menu>
    </template>
    </el-dropdown>
  </template>
  
  <script setup lang="ts">
  import { computed } from "vue";
  import { Action, TColumn } from "./tableColumns";
  import { isFunction } from "@vue/shared";
  
  const props = withDefaults(
    defineProps<{ actions: Action[]; scope: any; exposeObject: any }>(),
    {}
  );
  
  // 计算按钮属性
  const buttonProps = (button: Action) => {
    let customProps: any = isFunction(button.provideProps)
      ? button.provideProps(props.scope)
      : button.provideProps || {};
  
    return Object.assign(
      {
        marginRight: "10px",
        type: "text",
      },
      customProps
    );
  };
  
  // 判断按钮是否可见
  const visible = (button: Action) => {
    return isFunction(button.visible)
      ? button.visible(props.scope)
      : button.visible === undefined
      ? true
      : button.visible;
  };
  
  // 计算按钮名称
  const computedActionName = (button: Action, row: TColumn) => {
    return !isFunction(button.text)
      ? button.text
      : computed(() => button.text(row)).value?.replace(/\"/g, "");
  };
  
  // 可见的按钮
  const visibleButtons = computed(() => {
    return props.actions.slice(0, 4); // 最多展示前 4 个按钮
  });
  
  // 隐藏的按钮
  const hiddenButtons = computed(() => {
    return props.actions.slice(4); // 超过 4 个的按钮
  });
  </script>