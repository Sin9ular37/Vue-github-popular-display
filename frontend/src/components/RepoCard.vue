<template>
  <el-card class="repo-card">
    <div
      style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
      "
    >
      <div>
        <div class="repo-name">{{ repo.full_name }}</div>
        <div class="small">{{ repo.description }}</div>
      </div>
      <div style="text-align: right">
        <div class="small">⭐ {{ repo.stargazers_count }}</div>
        <div class="small">🍴 {{ repo.forks_count }}</div>
      </div>
    </div>
    <div
      style="
        margin-top: 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      "
    >
      <div class="small">{{ repo.language || '—' }}</div>
      <div style="display: flex; gap: 8px">
        <el-button type="primary" size="small" @click="goRepo">{{
          t('view')
        }}</el-button>
        <el-button type="info" size="small" @click="$emit('open', repo)">{{
          t('details')
        }}</el-button>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { t } from '../i18n.js'

const props = defineProps({ repo: Object })
const goRepo = () => window.open(props.repo.html_url, '_blank')
</script>

<style scoped>
.repo-card {
  border-radius: 12px;
}
.repo-name {
  font-weight: 600;
  margin-bottom: 4px;
}
.small {
  font-size: 12px;
  color: #666;
}
</style>
