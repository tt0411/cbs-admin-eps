import { Plus } from '@element-plus/icons-vue'
import dayjs from 'dayjs';
import { nextTick } from 'vue';
import DialogComp from './dialogComp.vue';
import { nav } from '@/utils/navigation';
import DetailComponent from './detail.vue';

let proxy: any;
export const module: any = (instance: any) => {
  nextTick(() => {
    proxy = instance.exposed;
  })
  return {
    //支持el-table的所有属性
    props: {
      rowKey: 'id', // 表格rowKey
      columnDrag: true, // 列是否可拖拽
      isFirstSearch: true, // 进入页面是否立即调用接口搜索
      resetToSearch: true, // 重置之后是否搜索
      showPagination: true, // 是否显示分页
      showColumnSetting: true, // 是否显示列设置
      spanMethod: ({ row, column, rowIndex, columnIndex }: any) => {
        // // 合并行
        if (column.property === 'channelName' && rowIndex === 0) {
          return [2, 1]; 
        }
        if(column.property === 'channelName' && rowIndex === 1){
          return [0, 0];
        }
      //  合并列
        if (rowIndex === 2 && columnIndex === 3) {
          return [1, 2]; // 合并当前单元格和右侧单元格
        }
        if (rowIndex === 2 && columnIndex === 4) {
          return [0, 0]; // 隐藏被合并的单元格
        }
      },
    },
    searchParams: {
      name: '1',
      status: '1',
      logisticsCodes: '顺丰',
      outletsCodes: ['114001', '113002'],
      pageSize: 20
    },
    useSearch: {
      beforeSearch: (params: any) => {
        params.age = 18;
        // console.log("beforeSearch triggered:", params);
      },
      afterSearch: (val: any) => {
        proxy.handleChangeSelection([])
        // console.log("afterSearch triggered:", val);
      },
    },
    //支持el-table的所有方法
    events: {
      rowDblclick: (row: any, column: any) => {
        console.log("rowDbClick triggered:", row, column);
      },
      filterChange(newFilters: any) {
        console.log(newFilters, '===newFilters===');
      },
      selectionChange(val: any) {
        proxy.handleChangeSelection(val)  
      }
    },
    loader: [
      {
        id: 1, workOrderNo: 'GD2025042401', remark: 1, status1: '1', status2: '2', channelType: '邮箱', channelName: '抖音', createTime: dayjs(new Date).format('YYYY-MM-DD HH:mm:ss'), updateTime: dayjs(new Date).format('YYYY-MM-DD HH:mm:ss'),
        //  children: [{ id: 5, status1: '1-1', status2: '1-2', channelName: '抖音', createTime: dayjs(new Date).format('YYYY-MM-DD HH:mm:ss'), updateTime: dayjs(new Date).format('YYYY-MM-DD HH:mm:ss') }] 
      },
      { id: 2, workOrderNo: 'GD2025042402', remark: 2, status1: '111', status2: '渠道名称渠道', channelName: '微信', createTime: dayjs(new Date).format('YYYY-MM-DD HH:mm:ss'), updateTime: dayjs(new Date).format('YYYY-MM-DD HH:mm:ss') },
      { id: 3, workOrderNo: 'GD2025042403', remark: 3, status1: '333', status2: '4444', channelName: '微博', createTime: dayjs(new Date).format('YYYY-MM-DD HH:mm:ss'), updateTime: dayjs(new Date).format('YYYY-MM-DD HH:mm:ss') },
      { id: 4, workOrderNo: 'GD2025042404', remark: 4, status1: '444', status2: '3231', channelName: '小红书', createTime: dayjs(new Date).format('YYYY-MM-DD HH:mm:ss'), updateTime: dayjs(new Date).format('YYYY-MM-DD HH:mm:ss') },
    ],
    columns: [
      { type: "selection", label: "全选" },
      { type: "index", label: "序号" },
      {
        label: '工单号',
        prop: 'workOrderNo',
        width: '160px',
        dragged: true,
      },
      {
        label: "渠道名称",
        prop: "channelName",
        headerTip: '渠道名称渠道名称渠道名称渠道名称渠道名称渠道名称渠道名称渠道名称渠道名称渠道名称渠道名称',
        sortable: true,
        align: "left",
        // 表头列筛选需要加此字段
        columnKey: 'channelName',
        filters:[
          { text: '抖音', value: '抖音' },
          { text: '微信', value: '微信' },
          { text: '微博', value: '微博' },
          { text: '小红书', value: '小红书' },
        ]
      },
      {
        label: "标签",
        prop: "tags",
      },
      {
        label: "备注",
        prop: "remark",
      },
      {
        label: "通知方式",
        prop: "channelType",
        headerTip: '通知方式',
        slotName: "channelType",
      },
      {
        label: "启用状态",
        slotName: "status",
        headerTip: '启用状态',
        children: [
          {
            label: "启用状态1",
            headerTip: '启用状态1',
            prop: "status1"
          },
          {
            label: "启用状态2",
            headerTip: '启用状态2',
            prop: "status2"
          }
        ]
      },
      { label: "创建时间", prop: "createTime", width: '120px' },
      { label: "创建人", prop: "createBy" },
      { label: "修改时间", prop: "updateTime" },
      { label: "修改人", prop: "updateBy" },
      // { label: "操作", fixed: 'right', width: '300px', slotName: "operations" },
    ],
    toolbar: [
      {
        text: "打开dialog",
        provideProps: () => ({
          type: 'primary',
          icon: Plus
        }),
        click: async () => {
          await proxy.search();
          nav.dialog(DialogComp, {}, {
            width: '500',
            title: '编辑信息',
          });
        },
      },
      {
        text: "打开drawer",
        provideProps: () => ({
          type: 'primary',
          icon: Plus
        }),
        click: () => {
          nav.drawer(DialogComp, {}, {
            width: '500',
            title: '编辑信息',
          });
        },
      },
    ],
    actions: [
      {
        text: "编辑",
        permission: 'xxx',
        // visible: ({ row }: any) => {
        //   return row.id === 1;
        // },
        // 支持el-button的所有属性
        provideProps: ({ row }: any) => ({
          disabled: row.id === 1,
          type: 'text'
        }),
        click: ({ row }: any, table: any) => {
          console.log(row, '====row===')
          console.log(table, '====table===')
        },
      },
      {
        text: "删除",
        permission: 'xxx',
        // visible: ({ row }: any) => {
        //   return row.id === 1;
        // },
        // 支持el-button的所有属性
        provideProps: ({ row }: any) => ({
          disabled: row.id === 1,
          type: 'text'
        }),
        click: ({ row }: any, table: any) => {
          console.log(row, '====row===')
          console.log(table, '====table===')
        },
      },
      {
        text: "查看详情",
        permission: 'xxx',
        // visible: ({ row }: any) => {
        //   return row.id === 1;
        // },
        // 支持el-button的所有属性
        provideProps: ({ row }: any) => ({
          disabled: row.id === 1,
          type: 'text'
        }),
        click: ({ row }: any, table: any) => {
          nav.page(
            {
              code: 'user-center',
              action: 'SEE',
              component: DetailComponent,
              props: {
                id: row.id,
                name: 'wmt',
              },
              providePath: () => {
                if (row) {
                  return {
                    id: row.id,
                  }
                }
              },
              meta: {
                title: `用户详情-${row.id}`,
                keepAlive: true,
                isLayout: true,
                multiTab: true,
                hideInMenu: true
              }
            },
          )
        }
    },
    {
        text: "跳转",
        // 支持el-button的所有属性
        click: ({ row }: any, table: any) => {
          proxy.search();
        },
      },
      {
        text: "展示",
        // 支持el-button的所有属性
        click: ({ row }: any, table: any) => {
          console.log(row, '====row===')
          console.log(table, '====table===')
        },
      },
      {
        text: "去下单",
        // 支持el-button的所有属性
        click: ({ row }: any, table: any) => {
          console.log(row, '====row===')
          console.log(table, '====table===')
        },
      },
    ],
  }
}