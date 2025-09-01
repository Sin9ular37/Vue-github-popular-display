import { ElMessage } from 'element-plus'

// 错误类型枚举
export const ErrorType = {
  NETWORK: 'NETWORK',
  API: 'API',
  VALIDATION: 'VALIDATION',
  UNKNOWN: 'UNKNOWN',
}

// 错误消息映射
const errorMessages = {
  [ErrorType.NETWORK]: {
    zh: '网络连接失败，请检查网络设置',
    en: 'Network connection failed, please check your network settings',
  },
  [ErrorType.API]: {
    zh: 'API 请求失败，请稍后重试',
    en: 'API request failed, please try again later',
  },
  [ErrorType.VALIDATION]: {
    zh: '输入数据无效，请检查后重试',
    en: 'Invalid input data, please check and try again',
  },
  [ErrorType.UNKNOWN]: {
    zh: '发生未知错误，请稍后重试',
    en: 'An unknown error occurred, please try again later',
  },
}

// 显示错误消息
export function showError(error, type = ErrorType.UNKNOWN, locale = 'zh') {
  let message = errorMessages[type][locale]

  if (error?.response?.status === 403) {
    message =
      locale === 'zh'
        ? 'API 访问受限，请稍后重试或使用代理服务器'
        : 'API access restricted, please try again later or use proxy server'
  } else if (error?.response?.status === 404) {
    message =
      locale === 'zh' ? '请求的资源不存在' : 'Requested resource not found'
  } else if (error?.response?.status === 429) {
    message =
      locale === 'zh'
        ? '请求过于频繁，请稍后重试'
        : 'Too many requests, please try again later'
  } else if (error?.message) {
    message = error.message
  }

  ElMessage.error({
    message,
    duration: 5000,
    showClose: true,
  })

  // 开发环境下在控制台输出详细错误信息
  if (process.env.NODE_ENV === 'development') {
    console.error('Error details:', error)
  }
}

// 显示成功消息
export function showSuccess(message) {
  ElMessage.success({
    message,
    duration: 3000,
    showClose: true,
  })
}

// 显示警告消息
export function showWarning(message) {
  ElMessage.warning({
    message,
    duration: 4000,
    showClose: true,
  })
}

// 显示信息消息
export function showInfo(message) {
  ElMessage.info({
    message,
    duration: 3000,
    showClose: true,
  })
}

// 网络错误处理
export function handleNetworkError(error, locale = 'zh') {
  if (!navigator.onLine) {
    showError(error, ErrorType.NETWORK, locale)
    return true
  }

  if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED') {
    showError(error, ErrorType.NETWORK, locale)
    return true
  }

  return false
}

// API 错误处理
export function handleApiError(error, locale = 'zh') {
  if (error.response) {
    const status = error.response.status

    if (status >= 500) {
      showError(error, ErrorType.API, locale)
      return true
    }

    if (status === 403 || status === 404 || status === 429) {
      showError(error, ErrorType.API, locale)
      return true
    }
  }

  return false
}
