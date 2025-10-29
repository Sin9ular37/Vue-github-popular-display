<template>
  <div class="container">
    <div class="header">
      <h2>{{ t('title') }}</h2>
      <div class="header-controls">
        <el-select v-model="sort" :placeholder="t('sortBy')" class="sort-select">
          <el-option :label="t('stars')" value="stars" />
          <el-option :label="t('forks')" value="forks" />
          <el-option :label="t('recentlyUpdated')" value="updated" />
        </el-select>
        <el-button type="text" @click="toggleLanguage" class="lang-toggle">
          {{ currentLocale === 'zh' ? 'EN' : '中文' }}
        </el-button>
        <el-button
          type="text"
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
        class="language-select"
      >
        <el-option
          v-for="l in languages"
          :key="l"
          :label="t(`languageOptions.${l}`)"
          :value="l"
        />
      </el-select>
      <el-button type="primary" class="search-btn" @click="fetchRepos">
        {{ t('search') }}
      </el-button>
    </div>

    <LoadingState v-if="loading" />

    <div v-else-if="repos.length > 0" class="repo-grid">
      <div
        v-for="item in repos"
        :key="item.id"
        class="repo-grid-item"
      >
        <RepoCard :repo="item" @open="openRepo" />
      </div>
    </div>

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
import { translateBatch } from './utils/translator.js'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://api.github.com'

const q = ref('')
const language = ref('')
const sort = ref('stars')
const page = ref(1)
const per_page = 50
const repos = ref([])
const loading = ref(false)

let translationToken = 0

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

async function applyTranslations(reposList) {
  if (
    currentLocale.value !== 'zh' ||
    !Array.isArray(reposList) ||
    reposList.length === 0
  ) {
    return
  }

  reposList.forEach(repo => {
    if (repo) {
      repo.isTranslating = false
    }
  })

  const targetRepos = reposList.filter(
    repo =>
      repo &&
      typeof repo.description === 'string' &&
      repo.description.trim().length > 0
  )

  if (targetRepos.length === 0) {
    reposList.forEach(repo => {
      if (repo) repo.isTranslating = false
    })
    return
  }

  const token = ++translationToken
  targetRepos.forEach(repo => {
    repo.isTranslating = true
  })

  try {
    const descriptions = targetRepos.map(repo => repo.description.trim())
    const translationMap = await translateBatch(descriptions, 'zh')
    if (token !== translationToken) {
      return
    }

    targetRepos.forEach(repo => {
      const key = repo.description.trim()
      repo.translated_description =
        translationMap[key] || repo.description || ''
      repo.isTranslating = false
    })
  } catch (error) {
    console.warn('Failed to translate repository descriptions:', error)
    if (token === translationToken) {
      targetRepos.forEach(repo => {
        repo.translated_description = repo.description
        repo.isTranslating = false
      })
    }
  }
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

    if (currentLocale.value === 'zh') {
      await applyTranslations(repos.value)
    } else {
      translationToken++
      repos.value.forEach(repo => {
        if (repo) {
          repo.isTranslating = false
        }
      })
    }
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
fetchRepos()

watch(sort, () => {
  page.value = 1
  fetchRepos()
})

watch(
  () => currentLocale.value,
  async newLocale => {
    if (newLocale === 'zh') {
      await applyTranslations(repos.value)
    } else {
      translationToken++
      repos.value.forEach(repo => {
        if (repo) {
          repo.isTranslating = false
        }
      })
    }
  }
)
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
  border-radius: 16px;
  box-shadow: 0 10px 30px var(--shadow-color);
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 12px;
  flex-wrap: wrap;
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
  height: 36px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  padding: 0 12px;
}

.theme-toggle {
  margin-left: 8px;
}
.searchbar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.search-input-container {
  position: relative;
  flex: 1;
  min-width: 220px;
}

.search-input-container .el-input__wrapper {
  width: 100%;
}

.searchbar .el-input__wrapper {
  height: 44px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  box-shadow: none;
  background: var(--card-bg);
  color: var(--text-primary);
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.searchbar .el-input__wrapper.is-focus,
.searchbar .el-input__wrapper:hover {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.15);
}

.searchbar .el-input__inner {
  font-size: 14px;
  color: var(--text-primary);
}

.searchbar .language-select {
  width: 180px;
}

.searchbar .search-btn {
  height: 44px;
  min-width: 110px;
  border-radius: 10px;
  font-weight: 600;
}

.searchbar .el-button--primary {
  height: 44px;
  border-radius: 10px;
  font-weight: 600;
}

.searchbar .el-select {
  flex-shrink: 0;
}

.searchbar .el-select .el-input__wrapper {
  width: 100%;
}

.searchbar .el-select .el-input__inner {
  cursor: pointer;
}

.searchbar .el-input,
.searchbar .el-select,
.searchbar .search-btn {
  flex-basis: auto;
}

.header-controls .el-select {
  min-width: 200px;
}

.header-controls .sort-select .el-input__wrapper {
  height: 36px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  box-shadow: none;
  background: var(--card-bg);
}

.header-controls .sort-select .el-input__wrapper.is-focus,
.header-controls .sort-select .el-input__wrapper:hover {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.15);
}

.header-controls .el-button {
  border-radius: 10px;
}

.search-history-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 var(--shadow-color);
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border-color);
  font-size: 12px;
  color: var(--text-secondary);
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
  background-color: var(--hover-bg);
}
.repo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.repo-grid-item {
  padding: 4px;
}

@media (max-width: 768px) {
  .searchbar {
    flex-direction: column;
    align-items: stretch;
  }

  .searchbar .language-select,
  .searchbar .search-btn {
    width: 100%;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-controls {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
