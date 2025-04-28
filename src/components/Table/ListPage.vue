<template>
  <div ref="listPageRef" class="list-page">
    <!-- 搜索 -->
    <div ref="searchFormRef" class="mb-15px pb-5px border-b-1px">
      <SearchForm :searchParams="initialSearchParams" :loading="tableData.isLoading"
       @search="handleSearch" @reset="handleReset">
        <template v-if="$slots.visibleConditions" #visibleConditions="{ scope }">
          <slot name="visibleConditions" :scope="scope"></slot>
        </template>
        <template v-if="$slots.hiddenConditions" #hiddenConditions="{ scope }">
          <slot name="hiddenConditions" :scope="scope"></slot>
        </template>
        <template v-if="$slots.moreConditions" #moreConditions="{ scope }">
          <slot name="moreConditions" :scope="scope"></slot>
        </template>
      </SearchForm>
    </div>
    <!-- 表格操作 -->
    <div class="mb-10px flex items-center" ref="toolbarRef">
      <ToolBarButton :actions="props.toolbar" />
      <slot name="toolbar"></slot>
    </div>
    <!-- 表格主体 -->
    <el-table-plus ref="tableInstance" :data="tableData.list" :is-loading="tableData.isLoading"
      :columns="tableCheckedColumns" :tableHeight="tableHeight" :props="props.props" :toolbar="props.toolbar"
      :events="props.events" :useSearch="props.useSearch" v-bind="Object.assign($attrs.props || {}, {})"
      @update:columns="data => updateTableColumns(data, props.actions)"
      @refresh="(params) => refreshTableData({ ...searchFormModel, ...params })">
      <template v-for="column in tableCheckedColumns.filter((col) => col.slotName)"
        v-slot:[column.slotName]="{ row, col, index }">
        <slot :name="column.slotName" :row="row" :col="col" :index="index"></slot>
      </template>
    </el-table-plus>
    <!-- 分页 -->
    <div class="flex mt-20px justify-between" ref="paginationRef">
      <el-icon v-if="props.props.showColumnSetting" class="text-18px cursor-pointer text-#333"
        @click="columnSettingVisible = true">
        <Setting />
      </el-icon>
      <Pagination v-if="props.props.showPagination" type="custom" :pageSize="searchFormModel.pageSize"
        :currentPage="searchFormModel.pageNum" :total="tableData.total" @change="onPaginationChange">
      </Pagination>
    </div>
    <!-- 表格列设置 -->
    <TableCustomSetting :visible="columnSettingVisible" :columns="tableColumns" :columnWidth="'164px'"
      @close="columnSettingVisible = false" @submit="submitColumnSetting" />
  </div>
</template>
<script setup lang="ts">
import ElTablePlus from "./Table.vue";
import Pagination from "./Pagination.vue"
import ToolBarButton from "./ToolBarButton.vue";
import TableCustomSetting from "./TableCustomSetting.vue";
import { Setting } from "@element-plus/icons-vue";
import { useTable } from "@/components/Table/useTable";
import { useColumn } from "@/components/Table/tableColumns";
import { reactive, ref, onMounted, watchEffect, onUnmounted, nextTick } from "vue";
import { isFunction } from "@vue/shared";

export interface IProps {
  loader: Function | Array<any>;
  columns: any[];
  actions?: any[];
  toolbar?: any[];
  tableHeight?: string;
  props?: any;
  events?: any;
  useSearch?: any;
  searchParams?: any;
}

const props = withDefaults(defineProps<IProps>(), {
  props: {},
  events: {},
  toolbar: () => [],
  searchParams: {},
  tableHeight: "calc(100vh - 280px)",
});

const tableInstance = ref<any>(null);

const { tableColumns, tableCheckedColumns, updateTableColumns } = useColumn(props.columns, props.actions || []);

const columnSettingVisible = ref(false)
function submitColumnSetting(data: any) {
  updateTableColumns(data, props.actions)
  columnSettingVisible.value = false
}

let searchFormModel = reactive<any>({
  pageNum: 1,
  pageSize: 10,
  ...props.searchParams
});

// 保存初始的 searchParams
let initialSearchParams = {};

const { tableData, refreshTableData } = useTable(
  props.loader,
  searchFormModel
);

const getTableData = async () => {
  await refreshTableData(searchFormModel)
  if (isFunction(props.useSearch.afterSearch)) {
    await props.useSearch.afterSearch(searchFormModel, tableData)
   }
};

const toSearch = async () => {
  initialSearchParams = searchFormModel
  if (isFunction(props.useSearch.beforeSearch)) {
    await props.useSearch.beforeSearch(searchFormModel)
    initialSearchParams = { ...searchFormModel }
  }
  if (props.props.isFirstSearch !== false) {
    getTableData()
  }
}

toSearch()

const onPaginationChange = ({ currentPage, pageSize }: any) => {
  searchFormModel.pageNum = currentPage;
  searchFormModel.pageSize = pageSize;
  getTableData()
};

const handleSearch = async (form: any) => {
  searchFormModel.pageNum = 1;
  searchFormModel = {
    ...searchFormModel,
    ...form,
  }
  getTableData()
};

const handleReset = async (form: any) => {
  Object.assign(searchFormModel, {
    ...form,
  });
  if(props.props.resetToSearch !== false) {
    getTableData()
  }
};

/***表格动态高度计算***/
const listPageRef = ref<any>(null);
const toolbarRef = ref<any>(null);
const paginationRef = ref<any>(null);
const searchFormRef = ref<any>(null);
const tableHeight = ref(0);
const updateTableHeight = () => {
  nextTick(() => {
    tableHeight.value =
      listPageRef.value?.clientHeight -
      searchFormRef.value?.clientHeight -
      paginationRef.value?.clientHeight -
      toolbarRef.value?.clientHeight -
      80;
  });
};

let cancelWatch: (() => void) | null = null;

onMounted(async () => {
  cancelWatch = watchEffect(() => updateTableHeight());
  window.addEventListener("resize", () => nextTick(() => updateTableHeight()));
});

onUnmounted(() => {
  if (cancelWatch) {
    cancelWatch();
  }
  window.removeEventListener("resize", () => nextTick(() => updateTableHeight()));
});

function clearSelection() {
  tableInstance.value?.exposeObject.clearSelection();
}

defineExpose({
  handleSearch,
  clearSelection,
  resetSearch: handleReset,
  searchParams: searchFormModel,
});
</script>
<style lang="scss">
html.dark .list-page {
  background-color: #18181c !important;
}
</style>
<style lang="scss" scoped>
.list-page {
  background-color: #fff;
  margin: 10px;
  transition: background-color 0.2s;
}
</style>