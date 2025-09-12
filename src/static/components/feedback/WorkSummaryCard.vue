<template>
  <div class="work-summary-card">
    <div class="work-summary-header">
      <div class="work-summary-title">
        <span>📊</span>
        AI工作汇报
      </div>
      <div class="work-summary-actions">
        <button 
          class="refresh-btn" 
          @click="handleRefresh" 
          :disabled="isRefreshing"
          title="刷新最新工作汇报"
        >
          <span v-if="!isRefreshing">🔄</span>
          <span v-else>⏳</span>
        </button>
      </div>
    </div>
    
    <div class="work-summary-body">
      <div v-if="workSummary" class="work-summary-content" v-html="renderedContent"></div>
      <div v-else class="work-summary-placeholder">
        <div class="placeholder-icon">📝</div>
        <div class="placeholder-text">
          <h3>暂无工作汇报数据</h3>
          <p>请点击刷新按钮获取最新的AI工作汇报内容</p>
        </div>
      </div>
    </div>
    
    <!-- 自动刷新状态 -->
    <div v-if="showAutoRefreshStatus" class="auto-refresh-status">
      <span class="status-text">下次自动刷新：</span>
      <span class="countdown">{{ autoRefreshCountdown }}</span>
      <span class="status-text">秒后</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { marked } from 'marked'

// Props
const props = defineProps({
  autoRefresh: {
    type: Boolean,
    default: true
  },
  refreshInterval: {
    type: Number,
    default: 10 // 秒
  }
})

// Emits
const emit = defineEmits(['refresh', 'error'])

// Vuex store
const store = useStore()

// 响应式数据
const isRefreshing = ref(false)
const autoRefreshTimer = ref(null)
const autoRefreshCountdown = ref(props.refreshInterval)

// 计算属性
const workSummary = computed(() => store.getters.workSummary)
const showAutoRefreshStatus = computed(() => props.autoRefresh && workSummary.value)

// 渲染的Markdown内容
const renderedContent = computed(() => {
  if (!workSummary.value) return ''
  
  try {
    // 配置marked选项
    marked.setOptions({
      breaks: true,
      gfm: true,
      sanitize: false
    })
    
    return marked(workSummary.value)
  } catch (error) {
    console.error('Markdown渲染失败:', error)
    return `<pre>${workSummary.value}</pre>`
  }
})

// 方法
const handleRefresh = async () => {
  if (isRefreshing.value) return

  isRefreshing.value = true

  try {
    emit('refresh')

    // 检查Socket连接状态
    const socket = store.getters.socket
    const connectionStatus = store.getters.connectionStatus
    const feedbackSessionId = store.getters.feedbackSessionId

    // 如果没有Socket实例，等待连接建立
    if (!socket) {
      console.log('Socket未初始化，等待连接建立...')
      await new Promise(resolve => setTimeout(resolve, 2000))

      // 重新获取Socket实例
      const newSocket = store.getters.socket
      const newConnectionStatus = store.getters.connectionStatus

      if (!newSocket || !newConnectionStatus.isConnected) {
        throw new Error('Socket连接未建立，请稍后重试')
      }
    }

    // 再次检查连接状态
    const finalSocket = store.getters.socket
    const finalConnectionStatus = store.getters.connectionStatus

    if (!finalSocket) {
      throw new Error('Socket连接不可用')
    }

    if (feedbackSessionId && finalConnectionStatus.isConnected) {
      // 有会话ID，请求工作汇报数据
      console.log('请求会话工作汇报:', feedbackSessionId)
      finalSocket.emit('get_work_summary', { feedback_session_id: feedbackSessionId })

      // 等待响应或超时
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('获取工作汇报超时'))
        }, 5000)

        const handleWorkSummary = (data) => {
          clearTimeout(timeout)
          finalSocket.off('work_summary_data', handleWorkSummary)
          finalSocket.off('feedback_error', handleError)
          console.log('收到工作汇报数据:', data)
          resolve(data)
        }

        const handleError = (error) => {
          clearTimeout(timeout)
          finalSocket.off('work_summary_data', handleWorkSummary)
          finalSocket.off('feedback_error', handleError)
          reject(new Error(error.error || '获取工作汇报失败'))
        }

        finalSocket.on('work_summary_data', handleWorkSummary)
        finalSocket.on('feedback_error', handleError)
      })
    } else if (finalConnectionStatus.isConnected) {
      // 没有会话ID，请求最新工作汇报
      console.log('请求最新工作汇报')
      store.dispatch('requestLatestSummary')
      await new Promise(resolve => setTimeout(resolve, 1000))
    } else {
      // 连接状态不佳，尝试重新连接
      console.log('连接状态不佳，尝试重新初始化Socket连接')
      store.dispatch('initializeSocket')
      throw new Error('连接状态不稳定，已尝试重新连接，请稍后重试')
    }

  } catch (error) {
    console.error('刷新工作汇报失败:', error)
    emit('error', error)

    // 显示错误消息
    store.dispatch('addStatusMessage', {
      type: 'error',
      text: error.message || '刷新工作汇报失败'
    })
  } finally {
    isRefreshing.value = false

    // 重置自动刷新计时器
    if (props.autoRefresh) {
      resetAutoRefreshTimer()
    }
  }
}

const startAutoRefreshTimer = () => {
  if (!props.autoRefresh) return
  
  autoRefreshCountdown.value = props.refreshInterval
  
  autoRefreshTimer.value = setInterval(() => {
    autoRefreshCountdown.value--
    
    if (autoRefreshCountdown.value <= 0) {
      handleRefresh()
    }
  }, 1000)
}

const resetAutoRefreshTimer = () => {
  if (autoRefreshTimer.value) {
    clearInterval(autoRefreshTimer.value)
    autoRefreshTimer.value = null
  }
  
  if (props.autoRefresh) {
    startAutoRefreshTimer()
  }
}

const stopAutoRefreshTimer = () => {
  if (autoRefreshTimer.value) {
    clearInterval(autoRefreshTimer.value)
    autoRefreshTimer.value = null
  }
}

// 生命周期
onMounted(() => {
  // 延迟一下，等待Socket连接建立
  setTimeout(() => {
    // 如果没有工作汇报数据，自动刷新一次
    if (!workSummary.value) {
      handleRefresh()
    } else if (props.autoRefresh) {
      startAutoRefreshTimer()
    }
  }, 1000) // 等待1秒让Socket连接建立

  // 监听停止自动刷新事件
  const handleStopAutoRefresh = () => {
    console.log('收到停止自动刷新事件')
    stopAutoRefreshTimer()
  }

  window.addEventListener('stopAutoRefresh', handleStopAutoRefresh)

  // 清理事件监听器
  onUnmounted(() => {
    window.removeEventListener('stopAutoRefresh', handleStopAutoRefresh)
  })
})

onUnmounted(() => {
  stopAutoRefreshTimer()
})

// 暴露方法给父组件
defineExpose({
  refresh: handleRefresh,
  startAutoRefresh: startAutoRefreshTimer,
  stopAutoRefresh: stopAutoRefreshTimer
})
</script>

<style scoped>
.work-summary-card {
  background: #252526;
  border: 1px solid #3e3e42;
  border-radius: 6px;
  margin-bottom: 24px;
  overflow: hidden;
}

.work-summary-header {
  background: #2d2d30;
  border-bottom: 1px solid #3e3e42;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.work-summary-title {
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.work-summary-actions {
  display: flex;
  gap: 8px;
}

.refresh-btn {
  background: #0e639c;
  border: 1px solid #007acc;
  color: #ffffff;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 28px;
}

.refresh-btn:hover:not(:disabled) {
  background: #1177bb;
  transform: scale(1.05);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.work-summary-body {
  padding: 16px;
  min-height: 120px;
}

.work-summary-content {
  color: #cccccc;
  line-height: 1.6;
  font-size: 13px;
}

/* Markdown样式 */
.work-summary-content :deep(h1),
.work-summary-content :deep(h2),
.work-summary-content :deep(h3),
.work-summary-content :deep(h4),
.work-summary-content :deep(h5),
.work-summary-content :deep(h6) {
  color: #ffffff;
  margin: 16px 0 8px 0;
  font-weight: 600;
}

.work-summary-content :deep(h1) { font-size: 18px; }
.work-summary-content :deep(h2) { font-size: 16px; }
.work-summary-content :deep(h3) { font-size: 14px; }

.work-summary-content :deep(p) {
  margin: 8px 0;
}

.work-summary-content :deep(ul),
.work-summary-content :deep(ol) {
  margin: 8px 0;
  padding-left: 20px;
}

.work-summary-content :deep(li) {
  margin: 4px 0;
}

.work-summary-content :deep(blockquote) {
  border-left: 3px solid #4ec9b0;
  margin: 12px 0;
  padding: 8px 12px;
  background: #2d2d30;
  border-radius: 0 4px 4px 0;
}

.work-summary-content :deep(code) {
  background: #1e1e1e;
  color: #4ec9b0;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 12px;
}

.work-summary-content :deep(pre) {
  background: #1e1e1e;
  border: 1px solid #3e3e42;
  border-radius: 4px;
  padding: 12px;
  overflow-x: auto;
  margin: 12px 0;
}

.work-summary-content :deep(pre code) {
  background: none;
  padding: 0;
  color: #cccccc;
}

.work-summary-content :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 12px 0;
}

.work-summary-content :deep(th),
.work-summary-content :deep(td) {
  border: 1px solid #3e3e42;
  padding: 8px 12px;
  text-align: left;
}

.work-summary-content :deep(th) {
  background: #2d2d30;
  font-weight: 600;
}

.work-summary-content :deep(a) {
  color: #569cd6;
  text-decoration: none;
}

.work-summary-content :deep(a:hover) {
  text-decoration: underline;
}

/* 占位符样式 */
.work-summary-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.placeholder-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.placeholder-text h3 {
  color: #cccccc;
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 8px 0;
}

.placeholder-text p {
  color: #858585;
  font-size: 13px;
  margin: 0;
  line-height: 1.5;
}

/* 自动刷新状态 */
.auto-refresh-status {
  background: #2d2d30;
  border-top: 1px solid #3e3e42;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 12px;
}

.status-text {
  color: #858585;
}

.countdown {
  color: #4ec9b0;
  font-weight: 600;
  min-width: 20px;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .work-summary-header {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }
  
  .work-summary-body {
    padding: 12px;
  }
  
  .placeholder-icon {
    font-size: 36px;
  }
  
  .placeholder-text h3 {
    font-size: 14px;
  }
  
  .placeholder-text p {
    font-size: 12px;
  }
}
</style>
