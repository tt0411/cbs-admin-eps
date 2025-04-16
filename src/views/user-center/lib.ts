import { Plus } from '@element-plus/icons-vue'
import dayjs from 'dayjs';
import { h, nextTick } from 'vue';
import DialogComp from './dialogComp.vue';
import { Dialog } from '@/utils/dialog';
import { Drawer } from '@/utils/drawer';
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
      columnDrag: true, // 列是否可拖拽
      isFirstSearch: true, // 进入页面是否立即调用接口搜索
      showPagination: true, // 是否显示分页
      spanMethod: ({ row, column, rowIndex, columnIndex }: any) => {
        // // 合并行
        // if (column.property === 'channelName') {
        //   if (rowIndex % 2 === 0) {
        //     return [2, 1]; // 合并两行
        //   } else {
        //     return [0, 0]; // 不显示当前单元格
        //   }
        // }
        // 合并列
        if (rowIndex === 0 && columnIndex === 3) {
          return [1, 2]; // 合并当前单元格和右侧单元格
        }
        if (rowIndex === 0 && columnIndex === 4) {
          return [0, 0]; // 隐藏被合并的单元格
        }
      },
    },
    searchParams: {
      name: '1',
      status: '1',
    },
    useSearch: {
      beforeSearch: (params: any) => {
        params.age = 18;
        // console.log("beforeSearch triggered:", params);
      },
      afterSearch: (params: any) => {
        params.name = 'wmt'
        // console.log("afterSearch triggered:", params);
      },
    },
    //支持el-table的所有方法
    events: {
      rowDblclick: (row: any, column: any) => {
        console.log("rowDbClick triggered:", row, column);
      },
      headerDragend(newWidth: number, oldWidth: number, column: any) {
        console.log("headerDragend triggered", newWidth, oldWidth, column);
      },
    },
    loader: [
      {
        id: 1, status1: '1', status2: '2', channelType: '邮箱', channelName: '抖音', createTime: dayjs(new Date).format('YYYY-MM-DD HH:mm:ss'), updateTime: dayjs(new Date).format('YYYY-MM-DD HH:mm:ss'),
        //  children: [{ id: 5, status1: '1-1', status2: '1-2', channelName: '抖音', createTime: dayjs(new Date).format('YYYY-MM-DD HH:mm:ss'), updateTime: dayjs(new Date).format('YYYY-MM-DD HH:mm:ss') }] 
      },
      { id: 2, status1: '111', status2: '渠道名称渠道', channelName: '微信', createTime: dayjs(new Date).format('YYYY-MM-DD HH:mm:ss'), updateTime: dayjs(new Date).format('YYYY-MM-DD HH:mm:ss') },
      { id: 3, status1: '333', status2: '4444', channelName: '微博', createTime: dayjs(new Date).format('YYYY-MM-DD HH:mm:ss'), updateTime: dayjs(new Date).format('YYYY-MM-DD HH:mm:ss') },
      { id: 4, status1: '444', status2: '3231', channelName: '小红书', createTime: dayjs(new Date).format('YYYY-MM-DD HH:mm:ss'), updateTime: dayjs(new Date).format('YYYY-MM-DD HH:mm:ss') },
    ],
    columns: [
      { type: "selection", label: "全选" },
      { type: "index", label: "序号" },
      {
        label: "渠道名称",
        prop: "channelName",
        headerTip: '渠道名称渠道名称渠道名称渠道名称渠道名称渠道名称渠道名称渠道名称渠道名称渠道名称渠道名称',
        sortable: true,
        align: "left",
        dragged: true,
      },
      {
        label: "标签",
        prop: "tags",
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
      { label: "更新时间", prop: "updateTime" },
      { label: "更新人", prop: "updateBy" },
      // { label: "操作", slotName: "operations" },
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
            width: '30%',
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
            width: '30%',
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
              }
            },
          )
        }
    },
    {
        text: "跳转",
        // 支持el-button的所有属性
        click: ({ row }: any, table: any) => {
          console.log(row, '====row===')
          console.log(table, '====table===')
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