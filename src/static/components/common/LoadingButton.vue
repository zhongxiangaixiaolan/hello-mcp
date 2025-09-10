<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="buttonClasses"
    @click="handleClick"
  >
    <!-- 加载指示器 -->
    <span v-if="loading" class="loading-spinner" :class="spinnerClasses"></span>
    
    <!-- 图标 -->
    <span v-if="icon && !loading" class="button-icon">{{ icon }}</span>
    
    <!-- 文本内容 -->
    <span class="button-text">
      <slot v-if="!loading">{{ text }}</slot>
      <span v-else>{{ loadingText }}</span>
    </span>
    
    <!-- 进度条 -->
    <div
      v-if="showProgress && progress !== null"
      class="progress-bar"
      :style="{ width: `${progress}%` }"
    ></div>
  </button>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  // 基础属性
  type: {
    type: String,
    default: 'button',
    validator: (value) => ['button', 'submit', 'reset'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  
  // 文本内容
  text: {
    type: String,
    default: ''
  },
  loadingText: {
    type: String,
    default: '加载中...'
  },
  
  // 图标
  icon: {
    type: String,
    default: ''
  },
  
  // 样式变体
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'ghost'].includes(value)
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  
  // 进度条
  showProgress: {
    type: Boolean,
    default: false
  },
  progress: {
    type: Number,
    default: null,
    validator: (value) => value === null || (value >= 0 && value <= 100)
  },
  
  // 其他选项
  block: {
    type: Boolean,
    default: false
  },
  rounded: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['click'])

// 计算属性
const buttonClasses = computed(() => [
  'loading-button',
  `loading-button--${props.variant}`,
  `loading-button--${props.size}`,
  {
    'loading-button--loading': props.loading,
    'loading-button--disabled': props.disabled,
    'loading-button--block': props.block,
    'loading-button--rounded': props.rounded,
    'loading-button--with-progress': props.showProgress
  }
])

const spinnerClasses = computed(() => [
  `loading-spinner--${props.size}`
])

// 方法
const handleClick = (event) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.loading-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px solid;
  border-radius: 4px;
  cursor: pointer;
  font-family: inherit;
  font-weight: 500;
  text-align: center;
  text-decoration: none;
  transition: all 0.2s ease;
  overflow: hidden;
  white-space: nowrap;
  user-select: none;
}

.loading-button:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(78, 201, 176, 0.3);
}

/* 尺寸变体 */
.loading-button--small {
  padding: 6px 12px;
  font-size: 12px;
  min-height: 28px;
}

.loading-button--medium {
  padding: 8px 16px;
  font-size: 13px;
  min-height: 32px;
}

.loading-button--large {
  padding: 10px 20px;
  font-size: 14px;
  min-height: 40px;
}

/* 颜色变体 */
.loading-button--primary {
  background: #4ec9b0;
  border-color: #4ec9b0;
  color: #1e1e1e;
}

.loading-button--primary:hover:not(:disabled) {
  background: #5dd4b8;
  border-color: #5dd4b8;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(78, 201, 176, 0.3);
}

.loading-button--secondary {
  background: #2d2d30;
  border-color: #3e3e42;
  color: #cccccc;
}

.loading-button--secondary:hover:not(:disabled) {
  background: #37373d;
  border-color: #4a4a4f;
  color: #ffffff;
}

.loading-button--success {
  background: #4ec9b0;
  border-color: #4ec9b0;
  color: #1e1e1e;
}

.loading-button--success:hover:not(:disabled) {
  background: #5dd4b8;
  border-color: #5dd4b8;
}

.loading-button--danger {
  background: #f14c4c;
  border-color: #f14c4c;
  color: #ffffff;
}

.loading-button--danger:hover:not(:disabled) {
  background: #ff5555;
  border-color: #ff5555;
}

.loading-button--warning {
  background: #ffcc02;
  border-color: #ffcc02;
  color: #1e1e1e;
}

.loading-button--warning:hover:not(:disabled) {
  background: #ffd633;
  border-color: #ffd633;
}

.loading-button--info {
  background: #569cd6;
  border-color: #569cd6;
  color: #ffffff;
}

.loading-button--info:hover:not(:disabled) {
  background: #6bb6ff;
  border-color: #6bb6ff;
}

.loading-button--ghost {
  background: transparent;
  border-color: #3e3e42;
  color: #cccccc;
}

.loading-button--ghost:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  border-color: #4ec9b0;
  color: #ffffff;
}

/* 状态样式 */
.loading-button--loading {
  cursor: wait;
  pointer-events: none;
}

.loading-button--disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
  transform: none !important;
  box-shadow: none !important;
}

.loading-button--block {
  width: 100%;
  display: flex;
}

.loading-button--rounded {
  border-radius: 20px;
}

.loading-button--with-progress {
  padding-bottom: 10px;
}

/* 加载动画 */
.loading-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-spinner--small {
  width: 12px;
  height: 12px;
  border-width: 1.5px;
}

.loading-spinner--medium {
  width: 14px;
  height: 14px;
  border-width: 2px;
}

.loading-spinner--large {
  width: 16px;
  height: 16px;
  border-width: 2px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 按钮内容 */
.button-icon {
  flex-shrink: 0;
  font-size: 1em;
}

.button-text {
  flex: 1;
  min-width: 0;
}

/* 进度条 */
.progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background: currentColor;
  transition: width 0.3s ease;
  opacity: 0.7;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .loading-button--small {
    padding: 8px 12px;
    min-height: 32px;
  }
  
  .loading-button--medium {
    padding: 10px 16px;
    min-height: 36px;
  }
  
  .loading-button--large {
    padding: 12px 20px;
    min-height: 44px;
  }
}

/* 特殊效果 */
.loading-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: none;
}

.loading-button--primary:active:not(:disabled) {
  background: #3db89a;
}

.loading-button--secondary:active:not(:disabled) {
  background: #2a2a2d;
}

.loading-button--danger:active:not(:disabled) {
  background: #e03e3e;
}

/* 焦点样式 */
.loading-button--primary:focus {
  box-shadow: 0 0 0 2px rgba(78, 201, 176, 0.3);
}

.loading-button--secondary:focus {
  box-shadow: 0 0 0 2px rgba(133, 133, 133, 0.3);
}

.loading-button--danger:focus {
  box-shadow: 0 0 0 2px rgba(241, 76, 76, 0.3);
}

.loading-button--warning:focus {
  box-shadow: 0 0 0 2px rgba(255, 204, 2, 0.3);
}

.loading-button--info:focus {
  box-shadow: 0 0 0 2px rgba(86, 156, 214, 0.3);
}

.loading-button--ghost:focus {
  box-shadow: 0 0 0 2px rgba(78, 201, 176, 0.3);
}
</style>
