<template>
  <el-dialog
    title="表格列设置"
    draggable
    :model-value="props.visible"
    @close="close"
    width="1000px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <div class="px-16px">
      <VueDraggable
         v-model="columnsList"
        :animation="150"
        class="flex pr-18px flex-wrap"
      >
        <div
          v-for="(item, index) in columnsList"
          :key="item?.prop"
          class="pt-10px flex pr-10"
          :style="{ 'width': props.columnWidth }"
        >
          <el-checkbox v-model="item.visible"
            >（{{ index + 1 }}）{{ item.label }}</el-checkbox
          >
        </div>
      </VueDraggable>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="text" @click="handleCheckAll">全选</el-button>
        <el-button type="text" @click="handleInverse">反选</el-button>
        <el-button type="text" @click="handleClear">清除</el-button>
        <el-button :icon="Refresh" @click="handleDefault">恢复默认</el-button>
        <el-button @click="close" :icon="Close">取消</el-button>
        <el-button type="primary" :icon="Check" @click="submit">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { VueDraggable } from "vue-draggable-plus";
import { ElCheckbox, ElButton } from "element-plus";
import { cloneDeep } from "lodash-es";
import { Check, Close, Refresh } from '@element-plus/icons-vue'

const emit = defineEmits(["close", "submit"]);

const props = defineProps<{
  columns: any[];
  visible: boolean;
  columnWidth: string;
}>();


const columnsList = ref<any[]>([]);
const defaultColumnsList = ref<any[]>([]);

watch(
  () => props.visible,
  (val) => {
    if (val) {      
      columnsList.value = cloneDeep(props.columns);
      defaultColumnsList.value = cloneDeep(props.columns);
    }
  },
);

function handleCheckAll() {
  columnsList.value.forEach((item) => {
    item.visible = true;
  });
}

function handleDefault() {
  columnsList.value = defaultColumnsList.value;
}

function handleInverse() {
  columnsList.value.forEach((item) => {
    item.visible = !item.visible;
  });
}

function handleClear() {
  columnsList.value.forEach((item) => {
    item.visible = false;
  });
}

function submit() {
  emit("submit", columnsList.value);
}

function close() {
  emit("close");
}
</script>

<style scoped>
</style>