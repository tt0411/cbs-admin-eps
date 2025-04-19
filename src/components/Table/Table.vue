<template>
  <el-table
    class="elTable"
    ref="tableInstance"
    :data="tableData"
    :loading="props.isLoading"
    @sort-change="sortChange"
    v-on="props.events"
    :border="true"
    :stripe="false"
    :height="tableHeight"
    rowKey="id"
    :resizable="true"
    :highlightCurrentRow="true"
    v-bind="$attrs.props || {}"
  >
    <template v-for="(column, index) in tableColumns" :key="column.prop || index">
      <template v-if="column.children && column.children.length">
        <el-table-column v-bind="column">
          <template #header>
            <span>
              {{ column.label }}
            <el-tooltip v-if="column.headerTip" popper-class="tooltip" placement="top" effect="dark">
              <template #default>
                <svg-icon local-icon="question" class="tipIcon"/>
              </template>
              <template #content>
                <div class="tooltip">{{ column.headerTip }}</div>
              </template>
            </el-tooltip>
            </span>
          </template>
          <template v-if="column.filters" #filter-icon>
            <svg-icon local-icon="filter"/>
          </template>
          <template v-for="(child, childIndex) in column.children" :key="child.key || childIndex">
            <template v-if="child.children && child.children.length">
              <el-table-column v-bind="child">
                <template #header>
                  <span>
                    {{ child.label }}
                  <el-tooltip v-if="child.headerTip" popper-class="tooltip" placement="top" effect="dark">
                    <template #default>
                      <svg-icon local-icon="question" class="tipIcon"/>
                    </template>
                    <template #content>
                      <div class="tooltip">{{ child.headerTip }}</div>
                    </template>
                  </el-tooltip>
                  </span>
                </template>
                <template v-if="column.filters" #filter-icon>
                  <svg-icon local-icon="filter"/>
                </template>
                <template v-for="(grandChild, grandChildIndex) in child.children" :key="grandChild.key || grandChildIndex">
                  <el-table-column v-bind="grandChild">
                    <template #header>
                      <span>
                        {{ child.label }}
                      <el-tooltip v-if="child.headerTip" popper-class="tooltip" placement="top" effect="dark">
                        <template #default>
                          <svg-icon local-icon="question" class="tipIcon"/>
                        </template>
                        <template #content>
                          <div class="tooltip">{{ child.headerTip }}</div>
                        </template>
                      </el-tooltip>
                      </span>
                    </template>
                    <template v-if="column.filters" #filter-icon>
                      <svg-icon local-icon="filter"/>
                    </template>
                    <template #default="{ row, col, $index }">
                      <slot v-if="grandChild.slotName" :name="grandChild.slotName" :row="row" :col="col" :index="$index" :key="$index"></slot>
                      <template v-else>
                        {{
                          isFunction(grandChild.formatter)
                            ? grandChild.formatter(row, col, $index)
                            : row[grandChild.prop]
                        }}
                      </template>
                    </template>
                  </el-table-column>
                </template>
              </el-table-column>
            </template>
            <template v-else>
              <el-table-column v-bind="child">
                <template #header>
                  <span>
                    {{ child.label }}
                  <el-tooltip v-if="child.headerTip" popper-class="tooltip" placement="top" effect="dark">
                    <template #default>
                      <svg-icon local-icon="question" class="tipIcon"/>
                    </template>
                    <template #content>
                      <div class="tooltip">{{ child.headerTip }}</div>
                    </template>
                  </el-tooltip>
                  </span>
                </template>
                <template v-if="column.filters" #filter-icon>
                  <svg-icon local-icon="filter"/>
                </template>
                <template #default="{ row, col, $index }">
                <slot v-if="child.slotName" :name="child.slotName" :row="row" :col="col" :index="$index" :key="$index"></slot>
                <template v-else>
                  {{
                    isFunction(child.formatter)
                      ? child.formatter(row, col, $index)
                      : row[child.prop]
                  }}
                </template>
              </template>
              </el-table-column>
            </template>
          </template>
        </el-table-column>
      </template>
      <template v-else-if="column.type == 'action'">
        <!-- 操作列 -->
        <el-table-column  v-bind="column" #default="scope">
          <action-button :actions="column.actions" :scope="scope" :exposeObject="exposeObject"></action-button>
        </el-table-column>
      </template>
      <template v-else-if="column.type !== 'selection'">
       <el-table-column v-bind="column">
        <template #header>
            <span>
              {{ column.label }}
            <el-tooltip v-if="column.headerTip" popper-class="tooltip" placement="top" effect="dark">
              <template #default>
                <svg-icon local-icon="question" class="tipIcon"/>
              </template>
              <template #content>
                <div class="tooltip">{{ column.headerTip }}</div>
              </template>
            </el-tooltip>
            </span>
          </template>
          <template v-if="column.filters" #filter-icon>
            <svg-icon local-icon="filter" />
          </template>
         <template #default="{ row, col, $index }">
            <slot v-if="column.slotName" :name="column.slotName" :row="row" :col="col" :index="$index" :key="$index"></slot>
            <template v-else-if="column.type !== 'index'">
                <svg-icon v-if="column.dragged" local-icon="ep--rank" class="drag-icon -mt-2px inline"/>
              {{
                isFunction(column.formatter)
                  ? column.formatter(row, col, $index)
                  : row[column.prop]
              }}
            </template>
            <template v-else>
              {{ $index + 1 }}
            </template>
          </template>
        </el-table-column>
      </template>
      <template v-else>
        <el-table-column v-bind="column"></el-table-column>
      </template>
    </template>
  </el-table>
</template>

<script setup lang="ts">
import { cloneDeep } from 'lodash-es'
import { TColumn, Action } from "./tableColumns";
import { isFunction } from "@vue/shared";
import ActionButton from "./ActionButton.vue";
import { TableInstance } from "element-plus";
import { toValue, computed, reactive, ref, onMounted, nextTick, watch, useAttrs } from "vue";
import Sortable from "sortablejs";

export interface Props {
  columns?: TColumn[];
  actions?: Action[];
  toolbar?: Action[];
  data?: any;
  isLoading: boolean;
  tableHeight: number;
  events?: Record<string, Function>;
  [key: string]: any;
}

const props = withDefaults(defineProps<Props>(), {
  columns: () => [],
  actions: () => [],
  data: () => [],
  tableHeight: 500,
  isLoading: false,
  events: () => ({}), // 默认值为空对象
});

const tableData = ref<any[]>()
const tableColumns = ref<any[]>([])

watch(() => props.data, (newValue) => {
  tableData.value = newValue
}, { immediate: true })

watch(
  () => props.columns,
  (newValue) => {
    tableColumns.value = newValue
  },
  { immediate: true }
)


const emit = defineEmits(["refresh", 'update:columns']);

const refresh = () => {
  emit("refresh");
};

const sortChange = ({ column, prop, order }: any) => {
  emit("refresh", { prop, order });
}

onMounted(() => {
  const attrs = useAttrs();
  const { columnDrag } = attrs.props as any || {}
  rowDrop();
  columnDrag && columnDrop();
});


// 行拖拽
const rowDrop = () => {
	const table = document.querySelector(".elTable .el-table__body-wrapper tbody") as any;
	Sortable.create(table, {
		group: 'shared',
		animation: 150,
		ghostClass: 'sortable-ghost', //拖拽样式
		easing: 'cubic-bezier(1, 0, 0, 1)',
    handle:'.drag-icon',
		onStart: (item: any) => {},
		// 结束拖动事件
		onEnd: (item: any) => {
			setNodeSort(item.oldIndex, item.newIndex)
		},
	})
}

const setNodeSort = (oldIndex: any, newIndex: any) => {
	let arr = cloneDeep(tableData.value) || []
	const currentRow = arr.splice(oldIndex, 1)[0]
	arr.splice(newIndex, 0, currentRow)
  // 原数组置空
	tableData.value = [];
	nextTick(() => {
    tableData.value = arr;
	});
}

const columnDrop = () => {
  const wrapperTr = document.querySelector('.elTable .el-table__header-wrapper tr') as any
  Sortable.create(wrapperTr, {
    animation: 180,
    delay: 0,
    filter: "th.el-table-fixed-column--right, th.el-table-fixed-column--left, th.el-table-column--selection", // 排除固定列和序号列
    preventOnFilter: true, // 确保被过滤的列不会触发拖拽
    onEnd: (evt: any) => {
      if (tableColumns.value) {
        const oldItem = tableColumns.value[evt.oldIndex]
        tableColumns.value.splice(evt.oldIndex, 1);
        tableColumns.value.splice(evt.newIndex, 0, oldItem);
      }
    }
  })
}


const tableInstance = ref<TableInstance>();

const exposeObject: any = reactive({
  instance: tableInstance,
  refresh,
  selectionRows: toValue(computed(() => tableInstance.value?.getSelectionRows())),
});

defineExpose(exposeObject);

</script>
<style lang="scss">
.el-table tr .el-table__cell .cell{
  width: 100% !important;          
}
.el-table th.el-table__cell {
  color: #1d2129;
  font-size: 14px;
  background-color: #f5f7fa !important;
}
.el-table th.el-table-fixed-column--right {
  color: #1d2129;
  font-size: 14px;
  background-color: #f5f7fa !important;
}
.el-table thead {
  color: #1d2129;
}
.el-table .el-table__cell {
  padding: 8px;
}
.el-table__body-wrapper .el-table-column--selection>.cell, .el-table__header-wrapper .el-table-column--selection>.cell  {
  display: inline;
}

html.dark {
  .el-table th.el-table__cell {
  color: #fff;
  font-size: 14px;
  background-color: #000 !important;
}
.el-table th.el-table-fixed-column--right {
  color: #f5f7fa;
  font-size: 14px;
  background-color: #000 !important;
}
.el-table thead {
  color: #fff;
}
}
.el-table__column-filter-trigger i {
  font-size: 16px;
}
</style>
<style lang="scss" scoped>
.tipIcon {
  display: inline;
  color: var(--el-color-primary) !important;
  font-size: 18px;
  margin-top: -2px;
}
.tooltip {
   max-width: 200px;
}
.drag-icon {
  cursor: move;
}
</style>