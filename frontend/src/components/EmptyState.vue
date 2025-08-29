<template>
  <div class="empty-container">
    <el-empty :image="emptyImage" :image-size="120" :description="description">
      <template #description>
        <span>{{ description }}</span>
      </template>
      <el-button type="primary" @click="$emit('retry')">
        {{ t('retry') }}
      </el-button>
    </el-empty>
  </div>
</template>

<script setup>
import { t } from '../i18n.js'

defineProps({
  description: {
    type: String,
    default: '',
  },
  emptyImage: {
    type: String,
    default: 'https://shadow.elemecdn.com/app/element/empty.5d7c6b6e.svg',
  },
})

defineEmits(['retry'])
</script>

<style scoped>
.empty-container {
  padding: 40px 20px;
  text-align: center;
}
</style>
