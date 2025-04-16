<template>
  <el-pagination
    v-model:current-page="currentPage"
    v-model:page-size="pageSize"
    :background="true"
    :total="total"
    :page-sizes="[10, 20, 50, 100]"
    :layout="'total, sizes, prev, pager, next, jumper'"
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
  />
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue';

export interface Props {
  total: number;
  pageSize: number;
  currentPage: number;
}

const props = withDefaults(defineProps<Props>(), {
  total: 0,
  pageSize: 10,
  currentPage: 1,
});

const emit = defineEmits(['change']);

const currentPage = ref<number>(props.currentPage);
const pageSize = ref<number>(props.pageSize);

const handleSizeChange = (newSize: number) => {
  pageSize.value = newSize;
  emit('change', { pageSize: newSize, currentPage: currentPage.value });
};

const handleCurrentChange = (newPage: number) => {
  currentPage.value = newPage;
  emit('change', { pageSize: pageSize.value, currentPage: newPage });
};
</script>
