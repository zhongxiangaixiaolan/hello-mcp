<template>
  <div class="feedback-view">
    <!-- 工作汇报显示区域 -->
    <WorkSummaryCard
      :auto-refresh="true"
      :refresh-interval="10"
      @refresh="handleWorkSummaryRefresh"
      @error="handleError"
    />

    <!-- 反馈表单 -->
    <FeedbackForm
      @submit="handleFeedbackSubmit"
      @error="handleError"
    />

    <!-- 提交确认对话框 -->
    <div v-if="showConfirmDialog" class="modal-overlay" @click="closeConfirmDialog">
      <div class="confirm-dialog" @click.stop>
        <div class="dialog-header">
          <h3>确认提交反馈</h3>
        </div>
        <div class="dialog-body">
          <p>您即将提交以下反馈内容：</p>
          <div class="feedback-preview">{{ confirmDialogData.text }}</div>
          <div v-if="confirmDialogData.images && confirmDialogData.images.length > 0" class="images-count">
            包含 {{ confirmDialogData.images.length }} 张图片
          </div>
          
          <!-- 提交后操作选择 -->
          <div class="window-control-section">
            <label class="form-label">提交后操作</label>
            <div class="window-control-options">
              <label class="radio-label">
                <input type="radio" v-model="windowAction" value="keep-open" :disabled="isSubmitting">
                <span class="radio-custom"></span>
                <span class="radio-text">保持窗口打开（推荐）</span>
              </label>
              <label class="radio-label">
                <input type="radio" v-model="windowAction" value="close" :disabled="isSubmitting">
                <span class="radio-custom"></span>
                <span class="radio-text">提交后关闭窗口</span>
              </label>
            </div>
            <div class="window-control-hint">
              选择"保持窗口打开"可以继续查看AI的后续工作汇报
            </div>
          </div>
        </div>
        <div class="dialog-actions">
          <LoadingButton
            variant="secondary"
            @click="closeConfirmDialog"
            :disabled="isSubmitting"
          >
            取消
          </LoadingButton>
          <LoadingButton
            variant="primary"
            :loading="isSubmitting"
            loading-text="提交中..."
            @click="confirmSubmit"
          >
            确认提交
          </LoadingButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import WorkSummaryCard from '../components/feedback/WorkSummaryCard.vue'
import FeedbackForm from '../components/feedback/FeedbackForm.vue'
import LoadingButton from '../components/common/LoadingButton.vue'

// Vuex store
const store = useStore()

// 响应式数据
const showConfirmDialog = ref(false)
const isSubmitting = ref(false)
const windowAction = ref('keep-open') // 默认保持窗口打开
const confirmDialogData = ref({
  text: '',
  images: []
})

// 方法
const handleWorkSummaryRefresh = () => {
  // 工作汇报刷新由WorkSummaryCard组件处理
  console.log('工作汇报已刷新')
}

const handleFeedbackSubmit = (feedbackData) => {
  // 显示确认对话框
  confirmDialogData.value = feedbackData
  showConfirmDialog.value = true
}

const handleError = (error) => {
  console.error('操作失败:', error)
  // 可以在这里添加错误提示
}

const closeConfirmDialog = () => {
  showConfirmDialog.value = false
  confirmDialogData.value = { text: '', images: [] }
}

const confirmSubmit = async () => {
  if (isSubmitting.value) return

  try {
    isSubmitting.value = true

    // 🔧 修复：保留原始feedbackData的所有参数，并添加窗口操作参数
    const feedbackData = {
      ...confirmDialogData.value, // 保留所有原始参数
      sessionId: store.getters.feedbackSessionId,
      timestamp: Date.now(),
      shouldCloseAfterSubmit: windowAction.value === 'close' // 添加窗口控制参数
    }

    console.log('确认提交反馈，包含窗口控制参数:', {
      shouldCloseAfterSubmit: feedbackData.shouldCloseAfterSubmit,
      textLength: feedbackData.text?.length || 0,
      imageCount: feedbackData.images?.length || 0
    })

    await store.dispatch('submitFeedback', feedbackData)

    // 提交成功后清空表单
    store.dispatch('clearFeedbackForm')
    showConfirmDialog.value = false
    confirmDialogData.value = { text: '', images: [] }

  } catch (error) {
    console.error('提交反馈失败:', error)
    handleError(error)
  } finally {
    isSubmitting.value = false
  }
}

// 生命周期钩子
onMounted(() => {
  // 监听提交状态重置事件
  const handleResetSubmission = () => {
    console.log('FeedbackView收到重置提交状态事件')
    isSubmitting.value = false
  }

  window.addEventListener('resetSubmissionState', handleResetSubmission)

  onUnmounted(() => {
    window.removeEventListener('resetSubmissionState', handleResetSubmission)
  })
})
</script>

<style scoped>
.feedback-view {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 模态对话框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.confirm-dialog {
  background: #252526;
  border: 1px solid #3e3e42;
  border-radius: 6px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
}

.dialog-header {
  background: #2d2d30;
  border-bottom: 1px solid #3e3e42;
  padding: 16px 20px;
}

.dialog-header h3 {
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.dialog-body {
  padding: 20px;
  color: #cccccc;
}

.dialog-body p {
  margin: 0 0 12px 0;
  font-size: 13px;
}

.feedback-preview {
  background: #1e1e1e;
  border: 1px solid #3e3e42;
  border-radius: 4px;
  padding: 12px;
  margin: 12px 0;
  max-height: 200px;
  overflow-y: auto;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
}

.images-count {
  color: #4ec9b0;
  font-size: 12px;
  font-weight: 500;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 20px;
  background: #2d2d30;
  border-top: 1px solid #3e3e42;
}

/* 窗口控制选择样式 */
.window-control-section {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #3e3e42;
}

.form-label {
  display: block;
  color: #cccccc;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 8px;
}

.window-control-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #cccccc;
  font-size: 13px;
  padding: 4px 0;
}

.radio-label:hover {
  color: #ffffff;
}

.radio-label input[type="radio"] {
  display: none;
}

.radio-custom {
  width: 16px;
  height: 16px;
  border: 2px solid #3e3e42;
  border-radius: 50%;
  background: #1e1e1e;
  position: relative;
  transition: all 0.2s ease;
}

.radio-label input[type="radio"]:checked + .radio-custom {
  border-color: #007acc;
  background: #007acc;
}

.radio-label input[type="radio"]:checked + .radio-custom::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 6px;
  height: 6px;
  background: #ffffff;
  border-radius: 50%;
}

.radio-label input[type="radio"]:disabled + .radio-custom {
  opacity: 0.5;
  cursor: not-allowed;
}

.radio-text {
  flex: 1;
}

.window-control-hint {
  color: #858585;
  font-size: 11px;
  margin-top: 4px;
  line-height: 1.4;
}



/* 响应式设计 */
@media (max-width: 768px) {
  .feedback-view {
    padding: 0 16px;
  }



  .confirm-dialog {
    width: 95%;
    margin: 20px;
  }

  .dialog-actions {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
