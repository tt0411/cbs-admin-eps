<template>
  <p>这是详情页面 {{ id }} name:{{ name }}</p>
</template>
<script setup lang="ts">
import { nav } from '@/utils/navigation';
import { useRoute } from 'vue-router';

const props = defineProps({
  id: {
    type: Number,
  },
  name: {
    type: String,
    default: '111'
  }
})
const route = useRoute()

// setTimeout(() => {
//   nav.close(route.path)
// }, 5000)
</script>