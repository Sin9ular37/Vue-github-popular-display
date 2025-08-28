<template>
  <div class="container">
    <div class="header">
      <h2>GitHub 热门项目</h2>
      <div class="controls">
        <select v-model="sort" class="button">
          <option value="stars">星标数</option>
          <option value="forks">复刻数</option>
          <option value="updated">最近更新</option>
        </select>
      </div>
    </div>

    <div class="searchbar" style="margin-bottom:12px">
      <input v-model="q" @keyup.enter="fetchRepos" placeholder="搜索项目 (例如: vue, react)" style="flex:1;padding:8px;border-radius:6px;border:1px solid #ddd" />
      <select v-model="language" class="button">
        <option value="">所有语言</option>
        <option v-for="l in languages" :key="l" :value="l">{{ l }}</option>
      </select>
      <button class="button" @click="fetchRepos">搜索</button>
    </div>

    <div v-if="loading">加载中...</div>

    <div v-else class="grid">
      <RepoCard v-for="r in repos" :key="r.id" :repo="r" @open="openRepo" />
    </div>

    <div class="pagination">
      <button class="button" :disabled="page===1" @click="changePage(page-1)">上一页</button>
      <div class="small">第 {{ page }} 页</div>
      <button class="button" :disabled="repos.length===0" @click="changePage(page+1)">下一页</button>
    </div>

    <div v-if="selectedRepo" class="card" style="margin-top:12px">
      <h3>{{ selectedRepo.full_name }}</h3>
      <p class="small">{{ selectedRepo.description }}</p>
      <p class="small">⭐ {{ selectedRepo.stargazers_count }} • 复刻 {{ selectedRepo.forks_count }} • {{ selectedRepo.language }}</p>
      <a :href="selectedRepo.html_url" target="_blank" class="button">在 GitHub 上查看</a>
      <button class="button" @click="selectedRepo=null">关闭</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import axios from 'axios'
import RepoCard from './components/RepoCard.vue'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://api.github.com'

const q = ref('')
const language = ref('')
const sort = ref('stars')
const page = ref(1)
const per_page = 12
const repos = ref([])
const loading = ref(false)
const selectedRepo = ref(null)

const languages = ['JavaScript','TypeScript','Python','Go','Rust','C++','Java','HTML','CSS']

async function fetchRepos(){
  loading.value = true
  try{
    // build query; if user entered q, search by q; otherwise search by stars
    let query = q.value ? `${q.value}` : 'stars:>1000'
    if (language.value) query += ` language:${language.value}`

    const params = {
      q: query,
      sort: sort.value,
      order: 'desc',
      per_page,
      page: page.value
    }

    const url = `${API_BASE}/search/repositories`
    const res = await axios.get(url, { params })
    repos.value = res.data.items || []
  }catch(err){
    console.error(err)
    repos.value = []
  }finally{
    loading.value = false
  }
}

function changePage(p){
  page.value = p
  fetchRepos()
}

function openRepo(r){ selectedRepo.value = r }

// initial load
fetchRepos()

// watch for sort change reset to page 1
watch(sort, ()=>{ page.value = 1; fetchRepos() })
</script> 