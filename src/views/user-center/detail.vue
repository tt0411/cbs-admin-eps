<template>
  <div>
      <p>这是详情页面 {{ id }} name:{{ name }}</p>
      <el-input v-model="desc" />
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';

defineProps({
  id: {
    type: Number,
  },
  name: {
    type: String,
    default: '111'
  }
})

const desc = ref('')

</script>