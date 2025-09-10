<template>
  <div class="countdown-timer" :class="timerClasses">
    <!-- 倒计时显示 -->
    <div class="countdown-display">
      <div v-if="showIcon" class="countdown-icon">
        {{ icon }}
      </div>
      
      <div class="countdown-content">
        <div v-if="title" class="countdown-title">{{ title }}</div>
        
        <div class="countdown-time">
          <template v-if="format === 'detailed'">
            <span v-if="timeLeft.days > 0" class="time-unit">
              <span class="time-value">{{ timeLeft.days }}</span>
              <span class="time-label">天</span>
            </span>
            <span v-if="timeLeft.hours > 0 || timeLeft.days > 0" class="time-unit">
              <span class="time-value">{{ String(timeLeft.hours).padStart(2, '0') }}</span>
              <span class="time-label">时</span>
            </span>
            <span class="time-unit">
              <span class="time-value">{{ String(timeLeft.minutes).padStart(2, '0') }}</span>
              <span class="time-label">分</span>
            </span>
            <span class="time-unit">
              <span class="time-value">{{ String(timeLeft.seconds).padStart(2, '0') }}</span>
              <span class="time-label">秒</span>
            </span>
          </template>
          
          <template v-else-if="format === 'simple'">
            {{ formattedTime }}
          </template>
          
          <template v-else>
            {{ customFormattedTime }}
          </template>
        </div>
        
        <div v-if="description" class="countdown-description">{{ description }}</div>
      </div>
    </div>
    
    <!-- 进度条 -->
    <div v-if="showProgress" class="countdown-progress">
      <div 
        class="progress-bar" 
        :style="{ width: `${progressPercentage}%` }"
      ></div>
    </div>
    
    <!-- 操作按钮 -->
    <div v-if="showControls" class="countdown-controls">
      <button 
        v-if="!isRunning && !isFinished"
        class="control-btn start-btn"
        @click="start"
        :disabled="disabled"
      >
        ▶️ 开始
      </button>
      
      <button 
        v-if="isRunning"
        class="control-btn pause-btn"
        @click="pause"
        :disabled="disabled"
      >
        ⏸️ 暂停
      </button>
      
      <button 
        v-if="!isRunning && !isFinished && currentTime < totalTime"
        class="control-btn resume-btn"
        @click="resume"
        :disabled="disabled"
      >
        ▶️ 继续
      </button>
      
      <button 
        class="control-btn reset-btn"
        @click="reset"
        :disabled="disabled"
      >
        🔄 重置
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

// Props
const props = defineProps({
  // 倒计时时间（秒）
  duration: {
    type: Number,
    required: true
  },
  
  // 自动开始
  autoStart: {
    type: Boolean,
    default: false
  },
  
  // 显示格式
  format: {
    type: String,
    default: 'simple',
    validator: (value) => ['simple', 'detailed', 'custom'].includes(value)
  },
  
  // 自定义格式化函数
  customFormatter: {
    type: Function,
    default: null
  },
  
  // 显示选项
  showProgress: {
    type: Boolean,
    default: false
  },
  showControls: {
    type: Boolean,
    default: false
  },
  showIcon: {
    type: Boolean,
    default: true
  },
  
  // 文本内容
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: '⏰'
  },
  
  // 样式
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'warning', 'danger', 'success'].includes(value)
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  
  // 其他选项
  disabled: {
    type: Boolean,
    default: false
  },
  warningThreshold: {
    type: Number,
    default: 10 // 剩余10秒时显示警告
  }
})

// Emits
const emit = defineEmits(['start', 'pause', 'resume', 'reset', 'finish', 'tick', 'warning'])

// 响应式数据
const currentTime = ref(props.duration)
const totalTime = ref(props.duration)
const isRunning = ref(false)
const timer = ref(null)
const hasWarned = ref(false)

// 计算属性
const isFinished = computed(() => currentTime.value <= 0)

const timeLeft = computed(() => {
  const time = Math.max(0, currentTime.value)
  return {
    days: Math.floor(time / 86400),
    hours: Math.floor((time % 86400) / 3600),
    minutes: Math.floor((time % 3600) / 60),
    seconds: Math.floor(time % 60)
  }
})

const formattedTime = computed(() => {
  const time = timeLeft.value
  if (time.days > 0) {
    return `${time.days}天 ${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}:${String(time.seconds).padStart(2, '0')}`
  } else if (time.hours > 0) {
    return `${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}:${String(time.seconds).padStart(2, '0')}`
  } else {
    return `${String(time.minutes).padStart(2, '0')}:${String(time.seconds).padStart(2, '0')}`
  }
})

const customFormattedTime = computed(() => {
  if (props.customFormatter && typeof props.customFormatter === 'function') {
    return props.customFormatter(currentTime.value, timeLeft.value)
  }
  return formattedTime.value
})

const progressPercentage = computed(() => {
  if (totalTime.value === 0) return 0
  return Math.max(0, Math.min(100, ((totalTime.value - currentTime.value) / totalTime.value) * 100))
})

const timerClasses = computed(() => [
  `countdown-timer--${props.variant}`,
  `countdown-timer--${props.size}`,
  {
    'countdown-timer--running': isRunning.value,
    'countdown-timer--finished': isFinished.value,
    'countdown-timer--warning': currentTime.value <= props.warningThreshold && currentTime.value > 0,
    'countdown-timer--disabled': props.disabled
  }
])

// 方法
const start = () => {
  if (props.disabled || isRunning.value) return
  
  isRunning.value = true
  hasWarned.value = false
  
  timer.value = setInterval(() => {
    currentTime.value = Math.max(0, currentTime.value - 1)
    emit('tick', currentTime.value)
    
    // 检查警告阈值
    if (!hasWarned.value && currentTime.value <= props.warningThreshold && currentTime.value > 0) {
      hasWarned.value = true
      emit('warning', currentTime.value)
    }
    
    // 检查是否结束
    if (currentTime.value <= 0) {
      finish()
    }
  }, 1000)
  
  emit('start')
}

const pause = () => {
  if (!isRunning.value) return
  
  isRunning.value = false
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
  
  emit('pause')
}

const resume = () => {
  if (isRunning.value || isFinished.value) return
  start()
  emit('resume')
}

const reset = () => {
  pause()
  currentTime.value = props.duration
  totalTime.value = props.duration
  hasWarned.value = false
  emit('reset')
}

const finish = () => {
  pause()
  emit('finish')
}

const setDuration = (newDuration) => {
  if (newDuration > 0) {
    totalTime.value = newDuration
    if (!isRunning.value) {
      currentTime.value = newDuration
    }
  }
}

// 监听duration变化
watch(() => props.duration, (newDuration) => {
  setDuration(newDuration)
})

// 生命周期
onMounted(() => {
  if (props.autoStart) {
    start()
  }
})

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
  }
})

// 暴露方法给父组件
defineExpose({
  start,
  pause,
  resume,
  reset,
  setDuration,
  getCurrentTime: () => currentTime.value,
  getTimeLeft: () => timeLeft.value,
  isRunning: () => isRunning.value,
  isFinished: () => isFinished.value
})
</script>

<style scoped>
.countdown-timer {
  background: #2d2d30;
  border: 1px solid #3e3e42;
  border-radius: 6px;
  padding: 16px;
  transition: all 0.2s ease;
}

/* 尺寸变体 */
.countdown-timer--small {
  padding: 12px;
  font-size: 12px;
}

.countdown-timer--medium {
  padding: 16px;
  font-size: 13px;
}

.countdown-timer--large {
  padding: 20px;
  font-size: 14px;
}

/* 颜色变体 */
.countdown-timer--default {
  border-color: #3e3e42;
}

.countdown-timer--warning {
  border-color: #ffcc02;
  background: linear-gradient(135deg, #2d2d30 0%, rgba(255, 204, 2, 0.1) 100%);
}

.countdown-timer--danger {
  border-color: #f14c4c;
  background: linear-gradient(135deg, #2d2d30 0%, rgba(241, 76, 76, 0.1) 100%);
}

.countdown-timer--success {
  border-color: #4ec9b0;
  background: linear-gradient(135deg, #2d2d30 0%, rgba(78, 201, 176, 0.1) 100%);
}

/* 状态样式 */
.countdown-timer--running {
  border-color: #4ec9b0;
  box-shadow: 0 0 8px rgba(78, 201, 176, 0.3);
}

.countdown-timer--finished {
  border-color: #858585;
  opacity: 0.8;
}

.countdown-timer--disabled {
  opacity: 0.6;
  pointer-events: none;
}

/* 倒计时显示 */
.countdown-display {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.countdown-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.countdown-timer--small .countdown-icon {
  font-size: 20px;
}

.countdown-timer--large .countdown-icon {
  font-size: 28px;
}

.countdown-content {
  flex: 1;
  min-width: 0;
}

.countdown-title {
  color: #ffffff;
  font-weight: 600;
  margin-bottom: 4px;
  font-size: 1.1em;
}

.countdown-time {
  display: flex;
  align-items: baseline;
  gap: 8px;
  color: #4ec9b0;
  font-weight: 600;
  font-size: 1.2em;
  font-family: 'Consolas', 'Monaco', monospace;
}

.countdown-timer--warning .countdown-time {
  color: #ffcc02;
}

.countdown-timer--danger .countdown-time {
  color: #f14c4c;
}

.time-unit {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.time-value {
  font-size: 1.2em;
  font-weight: 700;
}

.time-label {
  font-size: 0.8em;
  color: #cccccc;
  font-weight: 400;
}

.countdown-description {
  color: #cccccc;
  font-size: 0.9em;
  margin-top: 4px;
  opacity: 0.8;
}

/* 进度条 */
.countdown-progress {
  background: #1e1e1e;
  border-radius: 2px;
  height: 4px;
  margin-bottom: 12px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: #4ec9b0;
  transition: width 0.3s ease;
  border-radius: 2px;
}

.countdown-timer--warning .progress-bar {
  background: #ffcc02;
}

.countdown-timer--danger .progress-bar {
  background: #f14c4c;
}

/* 控制按钮 */
.countdown-controls {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.control-btn {
  background: #37373d;
  border: 1px solid #3e3e42;
  color: #cccccc;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.control-btn:hover:not(:disabled) {
  background: #4a4a4f;
  border-color: #569cd6;
  color: #ffffff;
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.start-btn:hover:not(:disabled),
.resume-btn:hover:not(:disabled) {
  border-color: #4ec9b0;
}

.pause-btn:hover:not(:disabled) {
  border-color: #ffcc02;
}

.reset-btn:hover:not(:disabled) {
  border-color: #f14c4c;
}

/* 动画效果 */
.countdown-timer--warning .countdown-time {
  animation: pulse 2s ease-in-out infinite;
}

.countdown-timer--danger .countdown-time {
  animation: blink 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0.5;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .countdown-display {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }
  
  .countdown-time {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .countdown-controls {
    flex-wrap: wrap;
    gap: 6px;
  }
  
  .control-btn {
    flex: 1;
    min-width: 80px;
    justify-content: center;
  }
}
</style>
