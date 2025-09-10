<template>
  <div class="status-messages-container">
    <transition-group name="status-message" tag="div">
      <div
        v-for="message in visibleMessages"
        :key="message.id"
        class="status-message"
        :class="[`status-${message.type}`, { 'status-dismissible': message.dismissible }]"
        @click="handleMessageClick(message)"
      >
        <div class="status-icon">
          {{ getMessageIcon(message.type) }}
        </div>
        
        <div class="status-content">
          <div class="status-text">{{ message.text }}</div>
          <div v-if="message.details" class="status-details">{{ message.details }}</div>
        </div>
        
        <button
          v-if="message.dismissible !== false"
          class="status-close"
          @click.stop="dismissMessage(message.id)"
          title="关闭"
        >
          ×
        </button>
        
        <!-- 自动消失倒计时 -->
        <div
          v-if="message.autoHide && message.remainingTime"
          class="status-countdown"
          :style="{ width: `${(message.remainingTime / message.duration) * 100}%` }"
        ></div>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'

// Props
const props = defineProps({
  maxMessages: {
    type: Number,
    default: 5
  },
  position: {
    type: String,
    default: 'top-right',
    validator: (value) => ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'top-center'].includes(value)
  },
  defaultDuration: {
    type: Number,
    default: 5000 // 5秒
  }
})

// Emits
const emit = defineEmits(['message-click', 'message-dismiss'])

// Vuex store
const store = useStore()

// 响应式数据
const timers = ref(new Map())

// 计算属性
const allMessages = computed(() => store.getters.statusMessages || [])
const visibleMessages = computed(() => allMessages.value.slice(-props.maxMessages))

// 方法
const getMessageIcon = (type) => {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
    loading: '⏳'
  }
  return icons[type] || 'ℹ️'
}

const addMessage = (message) => {
  const messageWithDefaults = {
    id: Date.now() + Math.random(),
    type: 'info',
    dismissible: true,
    autoHide: true,
    duration: props.defaultDuration,
    ...message,
    timestamp: Date.now()
  }

  store.commit('ADD_STATUS_MESSAGE', messageWithDefaults)

  // 设置自动隐藏
  if (messageWithDefaults.autoHide && messageWithDefaults.duration > 0) {
    setupAutoHide(messageWithDefaults)
  }

  return messageWithDefaults.id
}

const setupAutoHide = (message) => {
  const startTime = Date.now()
  message.remainingTime = message.duration

  const timer = setInterval(() => {
    const elapsed = Date.now() - startTime
    message.remainingTime = Math.max(0, message.duration - elapsed)

    if (elapsed >= message.duration) {
      dismissMessage(message.id)
    }
  }, 100)

  timers.value.set(message.id, timer)
}

const dismissMessage = (id) => {
  // 清除定时器
  if (timers.value.has(id)) {
    clearInterval(timers.value.get(id))
    timers.value.delete(id)
  }

  store.commit('REMOVE_STATUS_MESSAGE', id)
  emit('message-dismiss', id)
}

const handleMessageClick = (message) => {
  emit('message-click', message)
  
  // 如果消息可点击关闭
  if (message.clickToDismiss) {
    dismissMessage(message.id)
  }
}

const clearAllMessages = () => {
  // 清除所有定时器
  timers.value.forEach(timer => clearInterval(timer))
  timers.value.clear()
  
  store.commit('CLEAR_STATUS_MESSAGES')
}

// 生命周期
onMounted(() => {
  // 为现有消息设置自动隐藏
  allMessages.value.forEach(message => {
    if (message.autoHide && message.duration > 0 && !timers.value.has(message.id)) {
      setupAutoHide(message)
    }
  })
})

onUnmounted(() => {
  // 清除所有定时器
  timers.value.forEach(timer => clearInterval(timer))
  timers.value.clear()
})

// 暴露方法给父组件
defineExpose({
  addMessage,
  dismissMessage,
  clearAllMessages,
  // 便捷方法
  success: (text, options = {}) => addMessage({ type: 'success', text, ...options }),
  error: (text, options = {}) => addMessage({ type: 'error', text, autoHide: false, ...options }),
  warning: (text, options = {}) => addMessage({ type: 'warning', text, ...options }),
  info: (text, options = {}) => addMessage({ type: 'info', text, ...options }),
  loading: (text, options = {}) => addMessage({ type: 'loading', text, autoHide: false, dismissible: false, ...options })
})
</script>

<style scoped>
.status-messages-container {
  position: fixed;
  z-index: 1500;
  pointer-events: none;
  max-width: 400px;
}

/* 位置样式 */
.status-messages-container {
  top: 20px;
  right: 20px;
}

/* 可以通过CSS变量或类名来调整位置 */
.status-messages-container.top-left {
  top: 20px;
  left: 20px;
  right: auto;
}

.status-messages-container.top-center {
  top: 20px;
  left: 50%;
  right: auto;
  transform: translateX(-50%);
}

.status-messages-container.bottom-left {
  bottom: 20px;
  left: 20px;
  top: auto;
  right: auto;
}

.status-messages-container.bottom-right {
  bottom: 20px;
  right: 20px;
  top: auto;
}

.status-message {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 16px;
  margin-bottom: 8px;
  border-radius: 6px;
  border-left: 4px solid;
  background: #2d2d30;
  border: 1px solid #3e3e42;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  pointer-events: auto;
  cursor: default;
  transition: all 0.2s ease;
  overflow: hidden;
}

.status-message:hover {
  transform: translateX(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}

.status-message.status-dismissible {
  cursor: pointer;
}

/* 消息类型样式 */
.status-success {
  border-left-color: #4ec9b0;
  background: linear-gradient(135deg, #2d2d30 0%, rgba(78, 201, 176, 0.1) 100%);
}

.status-error {
  border-left-color: #f14c4c;
  background: linear-gradient(135deg, #2d2d30 0%, rgba(241, 76, 76, 0.1) 100%);
}

.status-warning {
  border-left-color: #ffcc02;
  background: linear-gradient(135deg, #2d2d30 0%, rgba(255, 204, 2, 0.1) 100%);
}

.status-info {
  border-left-color: #569cd6;
  background: linear-gradient(135deg, #2d2d30 0%, rgba(86, 156, 214, 0.1) 100%);
}

.status-loading {
  border-left-color: #c586c0;
  background: linear-gradient(135deg, #2d2d30 0%, rgba(197, 134, 192, 0.1) 100%);
}

.status-icon {
  font-size: 16px;
  flex-shrink: 0;
  margin-top: 1px;
}

.status-success .status-icon {
  color: #4ec9b0;
}

.status-error .status-icon {
  color: #f14c4c;
}

.status-warning .status-icon {
  color: #ffcc02;
}

.status-info .status-icon {
  color: #569cd6;
}

.status-loading .status-icon {
  color: #c586c0;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.status-content {
  flex: 1;
  min-width: 0;
}

.status-text {
  color: #ffffff;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.4;
  margin-bottom: 2px;
}

.status-details {
  color: #cccccc;
  font-size: 11px;
  line-height: 1.3;
  opacity: 0.8;
}

.status-close {
  background: none;
  border: none;
  color: #858585;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.status-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  transform: scale(1.1);
}

.status-countdown {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background: currentColor;
  transition: width 0.1s linear;
  opacity: 0.6;
}

.status-success .status-countdown {
  background: #4ec9b0;
}

.status-error .status-countdown {
  background: #f14c4c;
}

.status-warning .status-countdown {
  background: #ffcc02;
}

.status-info .status-countdown {
  background: #569cd6;
}

.status-loading .status-countdown {
  background: #c586c0;
}

/* 动画效果 */
.status-message-enter-active {
  transition: all 0.3s ease-out;
}

.status-message-leave-active {
  transition: all 0.2s ease-in;
}

.status-message-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.status-message-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.status-message-move {
  transition: transform 0.3s ease;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .status-messages-container {
    left: 10px;
    right: 10px;
    top: 10px;
    max-width: none;
  }
  
  .status-messages-container.top-center {
    transform: none;
    left: 10px;
  }
  
  .status-messages-container.bottom-left,
  .status-messages-container.bottom-right {
    left: 10px;
    right: 10px;
    bottom: 10px;
  }
  
  .status-message {
    padding: 10px 12px;
    margin-bottom: 6px;
  }
  
  .status-text {
    font-size: 12px;
  }
  
  .status-details {
    font-size: 10px;
  }
  
  .status-icon {
    font-size: 14px;
  }
  
  .status-close {
    width: 18px;
    height: 18px;
    font-size: 16px;
  }
}

/* 暗色主题优化 */
@media (prefers-color-scheme: dark) {
  .status-message {
    background: #1e1e1e;
    border-color: #3e3e42;
  }
  
  .status-text {
    color: #cccccc;
  }
  
  .status-details {
    color: #858585;
  }
}
</style>
