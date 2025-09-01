<template>
  <div
    class="virtual-list-container"
    ref="containerRef"
    :style="{ height: containerHeight + 'px' }"
  >
    <div class="virtual-list-spacer" :style="{ height: totalHeight + 'px' }">
      <div
        class="virtual-list-content"
        :style="{ transform: `translateY(${offsetY}px)` }"
      >
        <slot
          v-for="(item, index) in visibleItems"
          :key="getItemKey(item, startIndex + index)"
          :item="item"
          :index="startIndex + index"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

interface Props {
  items: any[]
  itemHeight: number
  containerHeight: number
  overscan?: number
}

const props = withDefaults(defineProps<Props>(), {
  overscan: 5,
})

const emit = defineEmits<{
  scroll: [scrollTop: number]
}>()

const containerRef = ref<HTMLElement>()
const scrollTop = ref(0)

// 计算可见区域
const startIndex = computed(() => {
  return Math.max(
    0,
    Math.floor(scrollTop.value / props.itemHeight) - props.overscan
  )
})

const endIndex = computed(() => {
  const visibleCount = Math.ceil(props.containerHeight / props.itemHeight)
  return Math.min(
    props.items.length,
    Math.floor(scrollTop.value / props.itemHeight) +
      visibleCount +
      props.overscan
  )
})

const visibleItems = computed(() => {
  return props.items.slice(startIndex.value, endIndex.value)
})

const totalHeight = computed(() => {
  return props.items.length * props.itemHeight
})

const offsetY = computed(() => {
  return startIndex.value * props.itemHeight
})

// 获取项目的唯一键
const getItemKey = (item: any, index: number) => {
  return item?.id || index
}

// 处理滚动事件
const handleScroll = () => {
  if (containerRef.value) {
    scrollTop.value = containerRef.value.scrollTop
    emit('scroll', scrollTop.value)
  }
}

// 滚动到指定索引
const scrollToIndex = (index: number) => {
  if (containerRef.value) {
    const targetScrollTop = index * props.itemHeight
    containerRef.value.scrollTop = targetScrollTop
  }
}

// 滚动到顶部
const scrollToTop = () => {
  if (containerRef.value) {
    containerRef.value.scrollTop = 0
  }
}

// 暴露方法
defineExpose({
  scrollToIndex,
  scrollToTop,
})

onMounted(() => {
  if (containerRef.value) {
    containerRef.value.addEventListener('scroll', handleScroll)
  }
})

onUnmounted(() => {
  if (containerRef.value) {
    containerRef.value.removeEventListener('scroll', handleScroll)
  }
})

// 监听容器高度变化
watch(
  () => props.containerHeight,
  () => {
    // 重新计算可见区域
  }
)
</script>

<style scoped>
.virtual-list-container {
  overflow-y: auto;
  position: relative;
}

.virtual-list-spacer {
  position: relative;
}

.virtual-list-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}
</style>
