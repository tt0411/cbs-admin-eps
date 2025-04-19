<template>
  <div ref="listPageRef" class="list-page">
    <!-- 搜索框 -->
    <!-- <SearchForm v-show="props.filterItems?.length > 0" v-model:height="searchFormHeight"
      :filterItems="props.filterItems" @search="dispatchSearch">
    </SearchForm>
     -->
    <div ref="searchFormRef"></div>
      <!-- 表格操作 -->
      <div class="mb-10px" ref="toolbarRef">
      <ToolBarButton :actions="props.toolbar"/>
        <!-- <el-button type="warning" size="small" @click="refreshTableData(searchFormModel)">
          <el-icon style="vertical-align: middle">
            <Refresh />
          </el-icon>
        </el-button>
       <el-button type="info" size="small" @click.stop="tableSettingDialog.open()">
          <el-icon style="vertical-align: middle">
            <Setting />
          </el-icon>
        </el-button> -->
        <!-- <el-button type="success" size="small" @click="requestFullScreen.toggle()">
          <el-icon style="vertical-align: middle">
            <FullScreen />
          </el-icon>
        </el-button> -->
      </div>
      <!-- 表格主体 -->
      <el-table-plus ref="tableInstance" 
        :data="tableData.list"
        :is-loading="tableData.isLoading"
        :columns="tableCheckedColumns" 
        :tableHeight="tableHeight"
        :props="props.props" 
        :toolbar="props.toolbar"
        :searchParams="props.searchParams"
        :events="props.events" 
        :useSearch="props.useSearch"
        v-bind="Object.assign($attrs.props || {}, {})"
        @refresh="(params) => refreshTableData({ ...searchFormModel, ...params })">
        <template v-for="column in tableCheckedColumns.filter((col) => col.slotName)"
          v-slot:[column.slotName]="{ row, col, index }">
          <slot :name="column.slotName" :row="row" :col="col" :index="index"></slot>
        </template>
      </el-table-plus>
      

      <!-- 分页 -->
      <div class="flex mt-20px justify-between" ref="paginationRef">
        <el-icon v-if="props.props.showColumnSetting" class="text-18px cursor-pointer text-#333" @click="columnSettingVisible = true"><Setting /></el-icon>
      <Pagination v-if="props.props.showPagination" type="custom" :pageSize="searchFormModel.pageSize" :currentPage="searchFormModel.pageNum"  :total="tableData.total"
        @change="onPaginationChange">
      </Pagination>  
     </div>
  
    <TableCustomSetting :visible="columnSettingVisible" :columns="tableColumns" :columnWidth="'164px'" @close="columnSettingVisible = false" @submit="submitColumnSetting"/>
  </div>
</template>
<script setup lang="ts">
// import SearchForm from "@/components/Forms/SearchForm.vue";
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

const tableInstance = ref(null);

const { tableColumns, tableCheckedColumns, updateTableColumns } = useColumn(props.columns, props.actions || []);

const columnSettingVisible = ref(false)

function submitColumnSetting(data: any) {
  updateTableColumns(data, props.actions)
  columnSettingVisible.value = false
}

const searchFormModel = reactive<any>({
   ...props.searchParams, 
   pageNum: 1, 
   pageSize: 10 
});

const { tableData, refreshTableData } = useTable(
  props.loader,
  searchFormModel
);

const toSearch = async () => {
  if(isFunction(props.useSearch.beforeSearch)) {
   await props.useSearch.beforeSearch(searchFormModel)
  }
  if(props.props.isFirstSearch !== false) {
    await refreshTableData(searchFormModel)
  }
  if(isFunction(props.useSearch.afterSearch)) {
    await props.useSearch.afterSearch(searchFormModel)
  }
}

toSearch()

const onPaginationChange = ({ currentPage, pageSize }: any) => {
  searchFormModel.pageNum = currentPage;
  searchFormModel.pageSize = pageSize;
  refreshTableData(searchFormModel);
};

const dispatchSearch = (form: any) => {
  searchFormModel.pageNum = 1;
  refreshTableData(searchFormModel);
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
      65;
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


defineExpose({
  toSearch,
  dispatchSearch,
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