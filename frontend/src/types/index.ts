// GitHub 仓库相关类型
export interface GitHubUser {
  login: string
  id: number
  avatar_url: string
  html_url: string
  type: string
}

export interface GitHubRepository {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  clone_url: string
  git_url: string
  ssh_url: string
  svn_url: string
  homepage: string | null
  size: number
  stargazers_count: number
  watchers_count: number
  language: string | null
  has_issues: boolean
  has_projects: boolean
  has_downloads: boolean
  has_wiki: boolean
  has_pages: boolean
  has_discussions: boolean
  forks_count: number
  mirror_url: string | null
  archived: boolean
  disabled: boolean
  open_issues_count: number
  license: {
    key: string
    name: string
    url: string | null
    spdx_id: string | null
    node_id: string
  } | null
  allow_forking: boolean
  is_template: boolean
  web_commit_signoff_required: boolean
  topics: string[]
  visibility: string
  forks: number
  open_issues: number
  watchers: number
  default_branch: string
  score: number
  owner: GitHubUser
  created_at: string
  updated_at: string
  pushed_at: string
}

export interface GitHubSearchResponse {
  total_count: number
  incomplete_results: boolean
  items: GitHubRepository[]
}

export interface GitHubReadmeResponse {
  name: string
  path: string
  sha: string
  size: number
  url: string
  html_url: string
  git_url: string
  download_url: string | null
  type: string
  content: string
  encoding: string
}

// 应用状态类型
export interface AppState {
  query: string
  language: string
  sort: string
  page: number
  per_page: number
  repos: GitHubRepository[]
  loading: boolean
  showDialog: boolean
  selectedRepo: GitHubRepository | null
  readmeHtml: string
  readmeLoading: boolean
  searchHistory: string[]
  showHistory: boolean
}

// 用户偏好类型
export interface UserPreferences {
  language: string
  sort: string
  languageFilter: string
  theme: string
}

// 错误类型
export interface AppError {
  message: string
  type: string
  status?: number
  response?: any
}

// 主题类型
export type ThemeType = 'light' | 'dark'

export interface ThemeConfig {
  name: string
  label: {
    zh: string
    en: string
  }
  icon: string
  cssVars: Record<string, string>
}

// 语言类型
export type LocaleType = 'zh' | 'en'

// 排序选项类型
export type SortOption = 'stars' | 'forks' | 'updated'

// 编程语言类型
export type ProgrammingLanguage =
  | 'JavaScript'
  | 'TypeScript'
  | 'Python'
  | 'Go'
  | 'Rust'
  | 'C++'
  | 'Java'
  | 'HTML'
  | 'CSS'
