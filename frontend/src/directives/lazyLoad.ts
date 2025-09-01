import type { DirectiveBinding } from 'vue'

interface LazyLoadElement extends HTMLElement {
  _lazyLoadObserver?: IntersectionObserver
  _lazyLoadSrc?: string
}

const lazyLoad = {
  mounted(el: LazyLoadElement, binding: DirectiveBinding) {
    const src = binding.value
    if (!src) return

    // 设置占位符
    el.setAttribute(
      'src',
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmN2ZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzkwOTM5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+'
    )
    el.classList.add('lazy-loading')

    // 创建 Intersection Observer
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement
            img.src = src
            img.classList.remove('lazy-loading')
            img.classList.add('lazy-loaded')

            // 图片加载完成后移除观察器
            img.onload = () => {
              observer.unobserve(img)
            }

            // 图片加载失败处理
            img.onerror = () => {
              img.src =
                'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZlNmU2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2Y1NjY2YSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIGVycm9yPC90ZXh0Pjwvc3ZnPg=='
              img.classList.remove('lazy-loading')
              img.classList.add('lazy-error')
            }
          }
        })
      },
      {
        rootMargin: '50px', // 提前50px开始加载
        threshold: 0.1,
      }
    )

    // 保存引用
    el._lazyLoadObserver = observer
    el._lazyLoadSrc = src

    // 开始观察
    observer.observe(el)
  },

  updated(el: LazyLoadElement, binding: DirectiveBinding) {
    const newSrc = binding.value
    const oldSrc = el._lazyLoadSrc

    if (newSrc !== oldSrc) {
      // 如果图片源发生变化，重新开始懒加载
      if (el._lazyLoadObserver) {
        el._lazyLoadObserver.disconnect()
      }

      // 重新应用指令
      lazyLoad.mounted(el, binding)
    }
  },

  beforeUnmount(el: LazyLoadElement) {
    // 清理观察器
    if (el._lazyLoadObserver) {
      el._lazyLoadObserver.disconnect()
      delete el._lazyLoadObserver
    }
    delete el._lazyLoadSrc
  },
}

export default lazyLoad
