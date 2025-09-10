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
import { ref } from 'vue'
import { useStore } from 'vuex'
import WorkSummaryCard from '../components/feedback/WorkSummaryCard.vue'
import FeedbackForm from '../components/feedback/FeedbackForm.vue'
import LoadingButton from '../components/common/LoadingButton.vue'

// Vuex store
const store = useStore()

// 响应式数据
const showConfirmDialog = ref(false)
const isSubmitting = ref(false)
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

    const feedbackData = {
      text: confirmDialogData.value.text,
      images: confirmDialogData.value.images,
      sessionId: store.getters.feedbackSessionId,
      timestamp: Date.now()
    }

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
