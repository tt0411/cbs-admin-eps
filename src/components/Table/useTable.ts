
import { isArray, isFunction } from "@vue/shared";
import { reactive, ref, watch } from "vue";

export interface TableData {
  list: any[];
  total: number;
  isLoading: boolean;
}

export function useTable(dataLoader: Function | any[], searchForm: any) {
  const tableRef = ref<HTMLElement>();

  const tableData = reactive<TableData>({
    list: [],
    total: 0,
    isLoading: false,
  });

  async function requestTableData(dataLoader: any, searchForm: any) {
    tableData.isLoading = true;

    if (!isArray(dataLoader) && !isFunction(dataLoader)) {
      console.error("----表格数据必须是方法或者数组----");
      return;
    }

    let promiseLoader = (searchForm: any) =>
      Promise.resolve(
        isArray(dataLoader) ? dataLoader : dataLoader(searchForm)
      );

    try {
      const result = await promiseLoader(searchForm);

      if (Array.isArray(result)) {
        tableData.list = result;
        tableData.total = result.length;
        tableData.isLoading = false;
        return;
      }

      const { success, data, rows }: any = result;

      if (!success) {
        tableData.list = [];
        tableData.total = 0;
        tableData.isLoading = false;
        return;
      }
      tableData.list = Array.isArray(data) ? data : data.list || rows;
      tableData.total = data.total || tableData.list.length;
    } catch (error) {
      console.error(error);
    } finally {
      tableData.isLoading = false;
    }
  }

  function refreshTableData(searchFormModel = {}) {
    requestTableData(
      dataLoader,
      Object.assign({}, searchFormModel)
    );
  }

  // 监听 dataLoader 的变化
  if (isArray(dataLoader)) {
    watch(
      () => dataLoader,
      (newValue) => {
        tableData.list = newValue;
        tableData.total = newValue.length;
      },
      { deep: true }
    );
  }

  return {
    tableRef,
    tableData,
    requestTableData,
    refreshTableData,
  };
}
