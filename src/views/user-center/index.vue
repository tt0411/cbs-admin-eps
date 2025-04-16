<script setup lang="ts">
import ListPage from '@/components/Table/ListPage.vue';
import { getCurrentInstance, ref } from 'vue';
import { module } from './lib'

const pageRef = ref();
const instance = getCurrentInstance();
const table = ref<any>()


table.value = module(instance);

function search() {
   pageRef.value?.toSearch();
}

defineExpose({
  search
})
// setTimeout(() => {
//   // table.value.loader.splice(0, table.value.loader.length);
//   table.value.loader.push({ id: 8, status1: '未开始', status2: '已过期', channelName: '小红书'}) 
// }, 2000);
</script>
<template>
  <list-page ref="pageRef" v-bind="table">
    <template #status="scope">{{ scope.row.status }}</template>
    <template #channelType="{ row }"> 
      <el-tag v-if="row.channelType"> {{ row.channelType }}</el-tag>
    </template>
    <template #operations="scope">
      <div class="flex">
        <el-button
          v-for="(action, index) in table.actions"
          type="text"
          :key="index"
          @click="action.click(scope, table)"
        >
          {{ action.text }}
        </el-button>
      </div>
    </template>
  </list-page>
</template>
