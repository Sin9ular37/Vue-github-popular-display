<template>
  <div class="card">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
      <div>
        <div class="repo-name">{{ repo.full_name }}</div>
        <div class="small">{{ repo.description }}</div>
      </div>
      <div style="text-align:right">
        <div class="small">⭐ {{ repo.stargazers_count }}</div>
        <div class="small">🍴 {{ repo.forks_count }}</div>
      </div>
    </div>
    <div style="margin-top:10px;display:flex;justify-content:space-between;align-items:center">
      <div class="small">{{ repo.language || '—' }}</div>
      <div style="display:flex;gap:8px">
        <a :href="repo.html_url" target="_blank" class="button">查看</a>
        <button class="button" @click="$emit('open', repo)">详情</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ repo: Object })
</script> 