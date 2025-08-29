<template>
  <div class="loading-container">
    <el-skeleton :rows="6" animated />
    <div class="loading-text">{{ t('loading') }}</div>
  </div>
</template>

<script setup>
import { t } from '../i18n.js'

defineProps({
  text: {
    type: String,
    default: '',
  },
})
</script>

<style scoped>
.loading-container {
  padding: 20px;
  text-align: center;
}

.loading-text {
  margin-top: 16px;
  color: #909399;
  font-size: 14px;
}
</style>
