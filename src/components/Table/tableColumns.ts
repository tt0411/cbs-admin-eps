import { isFunction } from "@vue/shared";
import { computed, ref } from "vue";

export type FixedType = "left" | "right" | "none" | boolean;
export type ElColumnType = "selection" | "index";
export type CustomColumnType = "text" | "action";
export type ColumnType = ElColumnType | CustomColumnType;

export type Action = {
  text: Function & string;
  click: Function;
} & {
  [key: string]: string;
};

export interface TColumn {
  label: string; // 列标题 可以是函数或字符串，根据需要在页面上显示在列
  prop?: string; // 列的属性, 如果没有指定，则使用列名称
  slotName?: string;
  sortable?: boolean;
  headerTip?: string;
  dragged?: boolean;
  align?: string;
  width?: number | string; // 列宽度 可选参数，默认为100 可以是整数或浮点数
  minWidth?: number | string; // 最小列宽度 可选参数，默认为10 可以是整数或浮点
  fixed?: FixedType; // 列宽对齐方式 left right none 默认为left 可选参数
  type?: string;
  actions?: any[];
  showOverflowTooltip?: boolean;
  visible?: boolean;
  click?: Function;
  text?: Function | string;
  children?: any[];
}

export type TColumnConfig = {};

export const actionColumn: TColumn = {
  label: "操作",
  fixed: "right",
  type: "action",
  visible: true,
  actions: [],
};

export const computedActionName = (button: Action, row: TColumn) => {
  return !isFunction(button.text)
    ? button.text
    : computed(() => button.text(row)).value?.replace(/\"/g, "");
};

const tableColumns = ref<Array<TColumn>>([]);

export const specificTypes = ["selection", "index"];

function getTextWidth(text: string, font: string = '14px Arial'): number {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (context) {
    context.font = font;
    const metrics = context.measureText(text);
    return metrics.width;
  }
  return 0;
}

function getActionsText(actions: any[]) {
  let totalWidth = 0; // 初始化总宽度
  const arr = actions.length > 4 ? actions.slice(0, 4).concat([{ text: "更多" }]) : actions;
    arr.map((action) => {
    const text = action.text;
    const width = getTextWidth(text); // 计算单个文字的宽度
    totalWidth += width; // 累加宽度
    return {
      text,
      width,
    };
  });

  return totalWidth  // 总宽度

}
const formatColumns = (columns: Array<TColumn>, actions: any[] = []) => {
  const hasAction = actions?.length > 0;
  const hasOperations = columns.find((col) => col.slotName === "operations");
  actionColumn.actions = [...actions];
  // 操作栏有插槽优先使用插槽，没有使用actions里面的操作
  const _columns: any = hasAction && !hasOperations ? [...columns, actionColumn] : [...columns];

  const newColumns = [];

  const processColumn = (column: TColumn) => {
    column = Object.assign({}, column);

    if (column.visible === false) {
      return null;
    }

    column.prop = column.prop || column.slotName;
    column.align = column.align || "center";
    column.dragged = column.dragged || false;
    column.visible = true;
    if (!column.type) {
      // 自动计算列宽度
      if (!column.width) {
        const sortWidth = column.sortable ? 20 : 0;
        const tipWidth = column.headerTip ? 20 : 0;
        const extLabelWidth = column.label.includes('时间') || column.label.includes('日期') ? 100 : 0;
        // 计算表头宽度
        const headerWidth = getTextWidth(column.label) + 40 + sortWidth + tipWidth + extLabelWidth; 
        column.minWidth = Math.max(headerWidth, 100); // 设置最小宽度
      }else{
        column.width = column.width;
      }
    }

    if (column.type === "selection") {
      column.width = column.width || "50px";
      column.fixed = "left";
    }

    if (column.type === "index") {
      column.width = column.width || "60px";
      column.fixed = "left";
    }
    // 计算操作列的宽度
    if (column.type === "action" && actions.length > 0) {
      column.fixed = "right";
      column.minWidth = getActionsText(actions) * 1.55 + "px";
    }

    if (!column.fixed) {
      column.showOverflowTooltip = column.showOverflowTooltip !== false; // 默认启用
    }

    // 递归处理 children
    if (column.children && column.children.length > 0) {
      column.children = column.children.map((child) => processColumn(child)).filter(Boolean);
    }

    return column;
  };

  for (let column of _columns) {
    const processedColumn = processColumn(column);
    if (processedColumn) {
      newColumns.push(processedColumn);
    }
  }
  return newColumns;
};

const updateTableColumns = (columnSettings: any[]) => {
  if (columnSettings.length == 0) return false;

  const columnSettingMap = new Map();

  columnSettings.forEach((col) => columnSettingMap.set(col.field, col));

  tableColumns.value = tableColumns.value.map((col: any) => {
    const colSetting = columnSettingMap.get(col.key) || {};
    Object.keys(colSetting).forEach((key) => {
      col[key] = colSetting[key];
    });
    return col;
  });

  return true;
};

export function useColumn(columns: Array<TColumn>, actions: any[]) {
  tableColumns.value = formatColumns(columns, actions);

  return {
    tableColumns,
    updateTableColumns,
    computedActionName,
  };
}
    