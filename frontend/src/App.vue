<template>
  <div class="container">
    <div class="header">
      <h2>{{ t('title') }}</h2>
      <div class="header-controls">
        <el-select v-model="sort" :placeholder="t('sortBy')" size="small">
          <el-option :label="t('stars')" value="stars" />
          <el-option :label="t('forks')" value="forks" />
          <el-option :label="t('recentlyUpdated')" value="updated" />
        </el-select>
        <el-button
          type="text"
          size="small"
          @click="toggleLanguage"
          class="lang-toggle"
        >
          {{ currentLocale === 'zh' ? 'EN' : '中文' }}
        </el-button>
        <el-button
          type="text"
          size="small"
          @click="toggleTheme"
          class="theme-toggle"
          :title="t('theme')"
        >
          {{ currentTheme === 'light' ? '🌙' : '☀️' }}
        </el-button>
      </div>
    </div>

    <div class="searchbar">
      <div class="search-input-container">
        <el-input
          v-model="q"
          clearable
          :placeholder="t('searchPlaceholder')"
          @keyup.enter="fetchRepos"
          @focus="showHistory = true"
          @blur="setTimeout(() => (showHistory = false), 200)"
        />
        <!-- 搜索历史下拉 -->
        <div
          v-if="showHistory && searchHistory.length > 0"
          class="search-history-dropdown"
        >
          <div class="history-header">
            <span>{{ t('searchHistory') }}</span>
            <el-button
              type="text"
              size="small"
              @click="clearSearchHistory"
              class="clear-history-btn"
            >
              {{ t('clear') }}
            </el-button>
          </div>
          <div
            v-for="query in searchHistory"
            :key="query"
            class="history-item"
            @click="selectFromHistory(query)"
          >
            {{ query }}
          </div>
        </div>
      </div>
      <el-select
        v-model="language"
        :placeholder="t('language')"
        clearable
        size="small"
      >
        <el-option
          v-for="l in languages"
          :key="l"
          :label="t(`languageOptions.${l}`)"
          :value="l"
        />
      </el-select>
      <el-button type="primary" @click="fetchRepos">{{
        t('search')
      }}</el-button>
    </div>

    <LoadingState v-if="loading" />

    <VirtualList
      v-else-if="repos.length > 0"
      :items="repos"
      :item-height="itemHeight"
      :container-height="containerHeight"
    >
      <template #default="{ item }">
        <div class="grid-item">
          <RepoCard :repo="item" @open="openRepo" />
        </div>
      </template>
    </VirtualList>

    <EmptyState
      v-else-if="!loading && repos.length === 0"
      :description="`${t('noResults')} - ${t('noResultsDesc')}`"
      @retry="fetchRepos"
    />

    <el-pagination
      v-if="!loading"
      layout="prev, pager, next"
      :page-size="per_page"
      v-model:current-page="page"
      @current-change="fetchRepos"
      :total="9999"
      style="margin: 16px auto; text-align: center"
    />

    <el-dialog
      v-model="showDialog"
      width="60%"
      :title="selectedRepo?.full_name"
    >
      <template v-if="selectedRepo">
        <p>{{ selectedRepo.description }}</p>
        <p>
          ⭐ {{ selectedRepo.stargazers_count }} | {{ t('forks') }}
          {{ selectedRepo.forks_count }} | {{ selectedRepo.language }}
        </p>
        <a :href="selectedRepo.html_url" target="_blank">{{
          t('openOnGitHub')
        }}</a>
        <el-divider />
        <div v-if="readmeLoading">{{ t('loadingReadme') }}</div>
        <div v-else v-html="readmeHtml" class="readme"></div>
      </template>
      <template #footer>
        <el-button @click="showDialog = false">{{ t('close') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import axios from 'axios'
import { marked } from 'marked'
import { apiCache } from './utils/cache'
import { debounce } from './utils/debounce'
import RepoCard from './components/RepoCard.vue'
import VirtualList from './components/VirtualList.vue'
import LoadingState from './components/LoadingState.vue'
import EmptyState from './components/EmptyState.vue'
import { t, currentLocale } from './i18n.js'
import {
  showError,
  showInfo,
  handleNetworkError,
  handleApiError,
} from './utils/errorHandler.js'
import {
  getStorage,
  setStorage,
  addSearchHistory,
  getSearchHistory,
  removeStorage,
  STORAGE_KEYS,
} from './utils/storage.js'
import { toggleTheme, currentTheme, initializeTheme } from './utils/theme.js'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://api.github.com'

const q = ref('')
const language = ref('')
const sort = ref('stars')
const page = ref(1)
const per_page = 50
const repos = ref([])
const loading = ref(false)

// 虚拟列表相关
const itemHeight = 140 // 每个卡片预估高度（可按需调整）
const containerHeight = ref(600)

const showDialog = ref(false)
const selectedRepo = ref(null)
const readmeHtml = ref('')
const readmeLoading = ref(false)

const languages = [
  'JavaScript',
  'TypeScript',
  'Python',
  'Go',
  'Rust',
  'C++',
  'Java',
  'HTML',
  'CSS',
]

const searchHistory = ref([])
const showHistory = ref(false)

function toggleLanguage() {
  currentLocale.value = currentLocale.value === 'zh' ? 'en' : 'zh'
  setStorage(STORAGE_KEYS.LANGUAGE, currentLocale.value)
}

const fetchRepos = debounce(async function fetchReposDebounced() {
  loading.value = true
  try {
    let query = q.value ? `${q.value}` : 'stars:>1000'
    if (language.value) query += ` language:${language.value}`
    const params = {
      q: query,
      sort: sort.value,
      order: 'desc',
      per_page,
      page: page.value,
    }
    const res = await axios.get(`${API_BASE}/search/repositories`, { params })
    repos.value = res.data.items || []

    if (repos.value.length === 0 && q.value) {
      showInfo(t('noResults'), currentLocale.value)
    }

    // 保存搜索历史
    if (q.value) {
      addSearchHistory(q.value)
      searchHistory.value = getSearchHistory()
    }

    // 保存用户偏好
    setStorage(STORAGE_KEYS.SORT_PREFERENCE, sort.value)
    setStorage(STORAGE_KEYS.LANGUAGE_FILTER, language.value)
  } catch (err) {
    // 处理网络错误
    if (handleNetworkError(err, currentLocale.value)) {
      return
    }

    // 处理 API 错误
    if (handleApiError(err, currentLocale.value)) {
      return
    }

    // 其他错误
    showError(err, 'UNKNOWN', currentLocale.value)
    repos.value = []
  } finally {
    loading.value = false
  }
}, 300)

function openRepo(repo) {
  selectedRepo.value = repo
  showDialog.value = true
  fetchReadme(repo)
}

async function fetchReadme(repo) {
  readmeLoading.value = true
  readmeHtml.value = ''
  try {
    const cacheKey = `readme_${repo.owner.login}_${repo.name}`
    const cached = apiCache.getStats && null // placeholder to ensure import is used
    const url = `${API_BASE}/repos/${repo.owner.login}/${repo.name}/readme`
    const res = await apiCache.cachedRequest(
      cacheKey,
      () => axios.get(url, { headers: { Accept: 'application/vnd.github.v3.raw' } }).then(r => r),
      5 * 60 * 1000
    )
    // 如果直接拿 content（base64）:
    if (res.data.content) {
      const decoded = atob(res.data.content)
      readmeHtml.value = marked(decoded)
    } else if (typeof res.data === 'string') {
      // 当 Accept: raw 时，直接返回 markdown 文本
      readmeHtml.value = marked(res.data)
    }
  } catch (err) {
    showError(err, 'API', currentLocale.value)
    readmeHtml.value = `<p>${t('failedToLoadReadme')}</p>`
  } finally {
    readmeLoading.value = false
  }
}

// 计算并设置容器高度
function updateContainerHeight() {
  const viewportHeight = window.innerHeight || 800
  const headerHeight = 160 // 头部+搜索区域的估算高度
  containerHeight.value = Math.max(360, viewportHeight - headerHeight)
}

// 初始化用户偏好
function initializeUserPreferences() {
  // 加载语言偏好
  const savedLanguage = getStorage(STORAGE_KEYS.LANGUAGE)
  if (savedLanguage) {
    currentLocale.value = savedLanguage
  }

  // 加载排序偏好
  const savedSort = getStorage(STORAGE_KEYS.SORT_PREFERENCE)
  if (savedSort) {
    sort.value = savedSort
  }

  // 加载语言筛选偏好
  const savedLanguageFilter = getStorage(STORAGE_KEYS.LANGUAGE_FILTER)
  if (savedLanguageFilter) {
    language.value = savedLanguageFilter
  }

  // 加载搜索历史
  searchHistory.value = getSearchHistory()
}

// 从历史记录中选择搜索
function selectFromHistory(query) {
  q.value = query
  showHistory.value = false
  fetchRepos()
}

// 清空搜索历史
function clearSearchHistory() {
  searchHistory.value = []
  removeStorage(STORAGE_KEYS.SEARCH_HISTORY)
}

// 初始化
initializeUserPreferences()
initializeTheme()
updateContainerHeight()
window.addEventListener('resize', updateContainerHeight)
fetchRepos()

watch(sort, () => {
  page.value = 1
  fetchRepos()
})
</script>

<style>
.readme {
  background: var(--bg-secondary);
  padding: 16px;
  border-radius: 8px;
  font-size: 14px;
  color: var(--text-primary);
}
.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px;
  background: var(--bg-primary);
  color: var(--text-primary);
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.header-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}
.lang-toggle,
.theme-toggle {
  font-size: 14px;
  color: #409eff;
}

.theme-toggle {
  margin-left: 8px;
}
.searchbar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.search-input-container {
  position: relative;
  flex: 1;
}

.search-history-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 12px;
  color: #909399;
}

.clear-history-btn {
  padding: 0;
  font-size: 12px;
}

.history-item {
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.history-item:hover {
  background-color: #f5f7fa;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
}

.grid-item {
  padding: 6px;
}
</style>
