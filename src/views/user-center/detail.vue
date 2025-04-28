<template>
  <p>这是详情页面 {{ id }} name:{{ name }}</p>
</template>
<script setup lang="ts">
defineProps({
  id: {
    type: Number,
  },
  name: {
    type: String,
    default: '111'
  }
})
</script>