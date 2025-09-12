<template>
  <div class="collapse-container">
    <div 
      class="collapse-header" 
      :class="{ 'is-active': isExpanded }"
      @click="toggle"
    >
      <div class="collapse-title">
        <slot name="title">
          <span class="title-text">{{ title }}</span>
          <span v-if="badge" class="title-badge">{{ badge }}</span>
        </slot>
      </div>
      <div class="collapse-icon">
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 16 16" 
          fill="currentColor"
          :class="{ 'rotated': isExpanded }"
        >
          <path d="M8 10.293l3.146-3.147a.5.5 0 0 1 .708.708l-3.5 3.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L8 10.293z"/>
        </svg>
      </div>
    </div>
    
    <transition name="collapse">
      <div v-show="isExpanded" class="collapse-content">
        <div class="collapse-body">
          <slot></slot>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  badge: {
    type: String,
    default: ''
  },
  defaultExpanded: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['expand', 'collapse', 'toggle'])

const isExpanded = ref(props.defaultExpanded)

const toggle = () => {
  if (props.disabled) return
  
  isExpanded.value = !isExpanded.value
  
  if (isExpanded.value) {
    emit('expand')
  } else {
    emit('collapse')
  }
  emit('toggle', isExpanded.value)
}

// 监听外部状态变化
watch(() => props.defaultExpanded, (newVal) => {
  isExpanded.value = newVal
})
</script>

<style scoped>
/* 苹果简约风格 */
.collapse-container {
  border: 1px solid #e5e5e7;
  border-radius: 12px;
  background: #ffffff;
  overflow: hidden;
  transition: all 0.2s ease;
}

.collapse-container:hover {
  border-color: #d1d1d6;
}

.collapse-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  cursor: pointer;
  background: #ffffff;
  transition: all 0.2s ease;
  user-select: none;
}

.collapse-header:hover {
  background: #f8f9fa;
}

.collapse-header.is-active {
  background: #f8f9fa;
  border-bottom: 1px solid #e5e5e7;
}

.collapse-title {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.title-text {
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
}

.title-badge {
  background: #007aff;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.collapse-icon {
  color: #86868b;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.collapse-header:hover .collapse-icon {
  color: #1d1d1f;
}

.collapse-icon.rotated {
  transform: rotate(180deg);
}

.collapse-content {
  overflow: hidden;
}

.collapse-body {
  padding: 20px;
  background: #ffffff;
  border-top: 1px solid #e5e5e7;
}

/* 折叠动画 */
.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
  max-height: 0;
  opacity: 0;
}

.collapse-enter-to,
.collapse-leave-from {
  max-height: 1000px;
  opacity: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .collapse-header {
    padding: 14px 16px;
  }
  
  .collapse-body {
    padding: 16px;
  }
  
  .title-text {
    font-size: 14px;
  }
}
</style>
