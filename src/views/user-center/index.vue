<script setup lang="ts">
import ListPage from '@/components/Table/ListPage.vue';
import Select from '@/components/select/index.vue';
import { getCurrentInstance, ref } from 'vue';
import { module } from './lib'

const pageRef = ref();
const instance = getCurrentInstance();
const table = ref<any>()

table.value = module(instance);

const initials = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']
const options = Array.from({ length: 1000 }).map((_, idx) => ({
  value: `Option ${idx + 1}`,
  label: `${initials[idx % 10]}${idx}`,
}))

const selectedRows = ref<any[]>([])
function search() {
  pageRef.value?.handleSearch();
}

function handleChangeSelection(val: any) {
  selectedRows.value = val
  if(!val.length) {
    pageRef.value?.clearSelection();
  }
}

defineExpose({
  search,
  handleChangeSelection
})
// setTimeout(() => {
//   // table.value.loader.splice(0, table.value.loader.length);
//   table.value.loader.push({ id: 8, status1: '未开始', status2: '已过期', channelName: '小红书111'}) 
// }, 2000);
</script>
<template>
  <list-page ref="pageRef" v-bind="table">
    <template #visibleConditions="{ scope }">
      <el-form-item label="机构网点" prop="outletsCodes">
          <Select 
          v-model="scope.outletsCodes"
          :multiple="true"
          labelKey="outletsName"
          valueKey="outletsCode"
          :allSelectModule="{ key: '全部', value: 'all' }"
          url="/cbs-core-web/outlets/page"
          /> 
      </el-form-item>
      <el-form-item label="本地网点" prop="localOutletsCodes">
        <Select 
          v-model="scope.localOutletsCodes"
          :multiple="true"
          :options="options"
          :allSelectModule="{ key: '全部', value: 'all' }"
          />
      </el-form-item>
      <el-form-item label="物流公司" prop="logisticsCodes">
        <el-input v-model="scope.logisticsCodes" />
        </el-form-item>
        <el-form-item label="渠道名称" prop="name">
          <el-input v-model="scope.name" />
        </el-form-item>
    </template>
    <!-- <template #hiddenConditions="{ scope }">
      <div class="grid grid-cols-2">
      <el-form-item label="工单号" prop="orderCode">
        <el-input v-model="scope.orderCode" />
      </el-form-item>
      <el-form-item label="创建人" prop="by">
        <el-input v-model="scope.by" />
      </el-form-item>
    </div>
    </template> -->
    <template #moreConditions="{ scope }">
      <div class="grid grid-cols-2">
      <el-form-item label="工单号" prop="orderCode">
        <el-input v-model="scope.orderCode" />
      </el-form-item>
      <el-form-item label="创建人" prop="by">
        <el-input v-model="scope.by" />
      </el-form-item> 
     </div>
    </template>
    <!-- <template #toolbar>
      <el-button type="primary">新增</el-button>
    </template> -->
    <template #status="scope">{{ scope.row.status }}</template>
    <template #channelType="{ row }"> 
      <el-tag v-if="row.channelType"> {{ row.channelType }}</el-tag>
    </template>
    <!-- <template #operations="scope">
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
    </template> -->
  </list-page>
</template>