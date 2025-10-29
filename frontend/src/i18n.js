import { ref } from 'vue'

export const messages = {
  zh: {
    title: 'GitHub 热门项目',
    sortBy: '排序方式',
    stars: '星标数',
    forks: '复刻数',
    recentlyUpdated: '最近更新',
    search: '搜索',
    searchPlaceholder: '搜索项目 (例如: vue, react)',
    language: '编程语言',
    allLanguages: '所有语言',
    view: '查看',
    details: '详情',
    loading: '加载中...',
    openOnGitHub: '在 GitHub 上查看',
    close: '关闭',
    loadingReadme: '正在加载 README...',
    failedToLoadReadme: '加载 README 失败',
    translating: '正在翻译描述...',
    noDescription: '暂无描述',
    retry: '重试',
    noResults: '没有找到相关项目',
    noResultsDesc: '尝试调整搜索条件或关键词',
    searchError: '搜索失败，请重试',
    networkError: '网络连接失败',
    apiError: 'API 请求失败',
    searchHistory: '搜索历史',
    clear: '清空',
    theme: '主题',
    lightTheme: '浅色主题',
    darkTheme: '深色主题',
    languageOptions: {
      JavaScript: 'JavaScript',
      TypeScript: 'TypeScript',
      Python: 'Python',
      Go: 'Go',
      Rust: 'Rust',
      'C++': 'C++',
      Java: 'Java',
      HTML: 'HTML',
      CSS: 'CSS',
    },
  },
  en: {
    title: 'GitHub Popular Projects',
    sortBy: 'Sort by',
    stars: 'Stars',
    forks: 'Forks',
    recentlyUpdated: 'Recently Updated',
    search: 'Search',
    searchPlaceholder: 'Search (e.g. vue, react)',
    language: 'Language',
    allLanguages: 'All Languages',
    view: 'View',
    details: 'Details',
    loading: 'Loading...',
    openOnGitHub: 'Open on GitHub',
    close: 'Close',
    loadingReadme: 'Loading README...',
    failedToLoadReadme: 'Failed to load README',
    translating: 'Translating description...',
    noDescription: 'No description provided',
    retry: 'Retry',
    noResults: 'No projects found',
    noResultsDesc: 'Try adjusting your search criteria or keywords',
    searchError: 'Search failed, please try again',
    networkError: 'Network connection failed',
    apiError: 'API request failed',
    searchHistory: 'Search History',
    clear: 'Clear',
    theme: 'Theme',
    lightTheme: 'Light Theme',
    darkTheme: 'Dark Theme',
    languageOptions: {
      JavaScript: 'JavaScript',
      TypeScript: 'TypeScript',
      Python: 'Python',
      Go: 'Go',
      Rust: 'Rust',
      'C++': 'C++',
      Java: 'Java',
      HTML: 'HTML',
      CSS: 'CSS',
    },
  },
}

export const currentLocale = ref('zh')

export function t(key) {
  const locale = currentLocale.value
  const keys = key.split('.')
  let value = messages[locale]

  for (const k of keys) {
    if (value && value[k]) {
      value = value[k]
    } else {
      return key
    }
  }

  return value
}
