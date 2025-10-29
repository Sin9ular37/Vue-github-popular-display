<template>
  <el-card class="repo-card">
    <div class="repo-card__header">
      <div class="repo-card__title">
        <div class="repo-name">{{ repo.full_name }}</div>
        <div class="muted">
          <span>{{ descriptionText }}</span>
          <span
            v-if="isTranslating"
            class="muted__loading"
          >
            {{ t('translating') }}
          </span>
        </div>
      </div>
      <div class="repo-card__meta">
        <div class="muted">⭐ {{ repo.stargazers_count }}</div>
        <div class="muted">🍴 {{ repo.forks_count }}</div>
      </div>
    </div>
    <div class="repo-card__footer">
      <div class="muted">{{ repo.language || '—' }}</div>
      <div class="repo-card__actions">
        <el-button type="primary" size="small" @click="goRepo">
          {{ t('view') }}
        </el-button>
        <el-button type="info" size="small" @click="$emit('open', repo)">
          {{ t('details') }}
        </el-button>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { computed } from 'vue'
import { t, currentLocale } from '../i18n.js'

const props = defineProps({
  repo: {
    type: Object,
    default: () => ({}),
  },
})

const goRepo = () => {
  if (props.repo?.html_url) {
    window.open(props.repo.html_url, '_blank')
  }
}

const isTranslating = computed(() => {
  return currentLocale.value === 'zh' && props.repo?.isTranslating
})

const descriptionText = computed(() => {
  const translated = props.repo?.translated_description
  const original = props.repo?.description
  if (currentLocale.value === 'zh') {
    if (translated && translated.trim()) {
      return translated
    }
    if (original && original.trim()) {
      return original
    }
    return t('noDescription')
  }
  if (original && original.trim()) {
    return original
  }
  return t('noDescription')
})
</script>

<style scoped>
.repo-card {
  border-radius: 14px;
  overflow: hidden;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.repo-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.08);
}

.repo-card :deep(.el-card__body) {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: var(--card-bg);
}

.repo-name {
  font-weight: 600;
  margin-bottom: 4px;
  color: var(--text-primary);
  word-break: break-word;
}

.repo-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.repo-card__title {
  flex: 1;
  min-width: 0;
}

.repo-card__meta {
  display: flex;
  flex-direction: column;
  text-align: right;
  gap: 4px;
}

.repo-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.repo-card__actions {
  display: flex;
  gap: 8px;
}

.muted {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.muted__loading {
  margin-left: 8px;
  font-size: 11px;
  color: #409eff;
}
</style>
