import { ref } from 'vue'

// 主题类型
export const ThemeType = {
  LIGHT: 'light',
  DARK: 'dark',
}

// 当前主题
export const currentTheme = ref(ThemeType.LIGHT)

// 主题配置
export const themeConfig = {
  [ThemeType.LIGHT]: {
    name: 'light',
    label: {
      zh: '浅色',
      en: 'Light',
    },
    icon: '☀️',
    cssVars: {
      '--bg-primary': '#ffffff',
      '--bg-secondary': '#f6f7fb',
      '--text-primary': '#222222',
      '--text-secondary': '#666666',
      '--border-color': '#dcdfe6',
      '--shadow-color': 'rgba(0, 0, 0, 0.06)',
      '--card-bg': '#ffffff',
      '--hover-bg': '#f5f7fa',
    },
  },
  [ThemeType.DARK]: {
    name: 'dark',
    label: {
      zh: '深色',
      en: 'Dark',
    },
    icon: '🌙',
    cssVars: {
      '--bg-primary': '#1a1a1a',
      '--bg-secondary': '#2d2d2d',
      '--text-primary': '#ffffff',
      '--text-secondary': '#b0b0b0',
      '--border-color': '#404040',
      '--shadow-color': 'rgba(0, 0, 0, 0.3)',
      '--card-bg': '#2d2d2d',
      '--hover-bg': '#404040',
    },
  },
}

// 应用主题
export function applyTheme(theme) {
  const config = themeConfig[theme]
  if (!config) return

  // 设置 CSS 变量
  Object.entries(config.cssVars).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value)
  })

  // 设置 body 类名
  document.body.className = `theme-${theme}`

  // 更新当前主题
  currentTheme.value = theme

  // 保存到本地存储
  try {
    localStorage.setItem('github-popular-theme', theme)
  } catch (error) {
    console.warn('Failed to save theme preference:', error)
  }
}

// 切换主题
export function toggleTheme() {
  const newTheme =
    currentTheme.value === ThemeType.LIGHT ? ThemeType.DARK : ThemeType.LIGHT
  applyTheme(newTheme)
}

// 初始化主题
export function initializeTheme() {
  try {
    const savedTheme = localStorage.getItem('github-popular-theme')
    if (savedTheme && themeConfig[savedTheme]) {
      applyTheme(savedTheme)
    } else {
      // 检查系统偏好
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches
      const defaultTheme = prefersDark ? ThemeType.DARK : ThemeType.LIGHT
      applyTheme(defaultTheme)
    }
  } catch (error) {
    console.warn('Failed to initialize theme:', error)
    applyTheme(ThemeType.LIGHT)
  }
}

// 监听系统主题变化
export function watchSystemTheme() {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', e => {
    const newTheme = e.matches ? ThemeType.DARK : ThemeType.LIGHT
    if (!localStorage.getItem('github-popular-theme')) {
      applyTheme(newTheme)
    }
  })
}
