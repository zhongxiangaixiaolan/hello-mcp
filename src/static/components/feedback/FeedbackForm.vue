<template>
  <div class="feedback-form-card">
    <div class="feedback-header">
      <div class="feedback-title">
        <span>💬</span>
        您的反馈
      </div>
    </div>
    
    <div class="feedback-body">
      <form @submit.prevent="handleSubmit">
        <!-- 反馈文本输入 -->
        <div class="form-group">
          <label class="form-label">反馈内容</label>
          <textarea
            v-model="localFeedbackText"
            class="form-textarea"
            placeholder="请输入您对本次工作的反馈和建议..."
            rows="6"
            :disabled="isSubmitting"
          ></textarea>

          <!-- 快捷语选项 -->
          <div class="quick-phrase-option">
            <label class="checkbox-label">
              <input type="checkbox" v-model="addQuickPhrase" :disabled="isSubmitting">
              <span class="checkbox-custom"></span>
              <span class="checkbox-text">附加快捷语（推荐）</span>
            </label>
            <div class="quick-phrase-hint">
              自动附加MCP反馈收集提示词，提升AI响应质量
            </div>
          </div>
        </div>

        <!-- 图片上传区域 -->
        <div class="form-group">
          <label class="form-label">图片附件</label>
          <ImageUpload
            v-model="localSelectedImages"
            :disabled="isSubmitting"
            @error="handleImageError"
          />
        </div>

        <!-- 提交按钮 -->
        <div class="form-actions">
          <button
            type="submit"
            class="submit-btn"
            :disabled="!canSubmit || isSubmitting"
          >
            <span v-if="!isSubmitting">提交反馈</span>
            <span v-else>提交中...</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import ImageUpload from './ImageUpload.vue'

// Props
const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['submit', 'error'])

// Vuex store
const store = useStore()

// 响应式数据
const addQuickPhrase = ref(true)
const isSubmitting = ref(false)

// 快捷语常量
const QUICK_PHRASE = '\n\n---\n\n请基于以上反馈，继续优化和改进工作。如有需要，请提供具体的改进建议或下一步行动计划。'

// 本地状态（与Vuex同步）
const localFeedbackText = computed({
  get: () => store.getters.feedbackText,
  set: (value) => store.dispatch('updateFeedbackText', value)
})

const localSelectedImages = computed({
  get: () => store.getters.selectedImages,
  set: (value) => store.commit('SET_SELECTED_IMAGES', value)
})

// 计算属性
const isConnected = computed(() => store.getters.connectionStatus.isConnected)
const feedbackSessionId = computed(() => store.getters.feedbackSessionId)

const canSubmit = computed(() => {
  return (
    (localFeedbackText.value.trim() || localSelectedImages.value.length > 0) &&
    isConnected.value &&
    !props.disabled &&
    !isSubmitting.value
  )
})

const previewText = computed(() => {
  let text = localFeedbackText.value
  if (addQuickPhrase.value && text.trim()) {
    text += QUICK_PHRASE
  }
  return text
})

// 方法
const handleSubmit = async () => {
  if (!canSubmit.value) return

  // 基础验证
  if (!localFeedbackText.value.trim() && localSelectedImages.value.length === 0) {
    emit('error', new Error('请输入反馈内容或选择图片'))
    return
  }

  if (!isConnected.value) {
    emit('error', new Error('连接已断开，请刷新页面重试'))
    return
  }

  // 验证反馈会话
  if (!feedbackSessionId.value) {
    // 演示模式处理
    console.log('演示模式 - 反馈内容:', {
      text: previewText.value,
      images: localSelectedImages.value.length,
      timestamp: new Date().toLocaleString()
    })

    emit('error', new Error('当前为演示模式，请通过MCP工具函数调用来创建正式的反馈会话'))

    // 显示演示反馈信息
    store.dispatch('addStatusMessage', {
      type: 'info',
      text: '演示反馈已记录到控制台，请查看浏览器开发者工具'
    })

    // 清空表单
    await store.dispatch('clearFeedbackForm')
    addQuickPhrase.value = true
    return
  }

  isSubmitting.value = true

  try {
    const feedbackData = {
      text: previewText.value,
      images: localSelectedImages.value.map(img => ({
        name: img.name,
        data: img.data,
        size: img.size,
        type: img.type
      })),
      timestamp: Date.now(),
      sessionId: feedbackSessionId.value
    }

    console.log('提交反馈:', {
      text: feedbackData.text.length > 0,
      images: feedbackData.images.length,
      session: feedbackData.sessionId,
      connected: isConnected.value
    })

    emit('submit', feedbackData)

  } catch (error) {
    console.error('提交反馈失败:', error)
    emit('error', error)
    isSubmitting.value = false
  }
}

const handleImageError = (error) => {
  console.error('图片处理错误:', error)
  emit('error', error)
}

const clearForm = async () => {
  await store.dispatch('clearFeedbackForm')
  addQuickPhrase.value = true
}

const validateForm = () => {
  const errors = []

  if (!localFeedbackText.value.trim() && localSelectedImages.value.length === 0) {
    errors.push('请输入反馈内容或选择图片')
  }

  if (!isConnected.value) {
    errors.push('连接已断开，请刷新页面重试')
  }

  return errors
}

// 暴露方法给父组件
defineExpose({
  submit: handleSubmit,
  clear: clearForm,
  validate: validateForm,
  getPreviewText: () => previewText.value,
  isSubmitting: () => isSubmitting.value
})
</script>

<style scoped>
.feedback-form-card {
  background: #252526;
  border: 1px solid #3e3e42;
  border-radius: 6px;
  overflow: hidden;
}

.feedback-header {
  background: #2d2d30;
  border-bottom: 1px solid #3e3e42;
  padding: 12px 16px;
}

.feedback-title {
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.feedback-body {
  padding: 20px;
}

/* 表单样式 */
.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  color: #cccccc;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 8px;
}

.form-textarea {
  width: 100%;
  background: #1e1e1e;
  border: 1px solid #3e3e42;
  border-radius: 4px;
  color: #cccccc;
  padding: 12px;
  font-size: 13px;
  font-family: inherit;
  line-height: 1.5;
  resize: vertical;
  min-height: 120px;
  transition: all 0.2s ease;
}

.form-textarea:focus {
  outline: none;
  border-color: #007acc;
  box-shadow: 0 0 0 1px #007acc;
}

.form-textarea::placeholder {
  color: #858585;
}

.form-textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 快捷语选项 */
.quick-phrase-option {
  margin-top: 12px;
  padding: 12px;
  background: #2d2d30;
  border: 1px solid #3e3e42;
  border-radius: 4px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #cccccc;
  font-size: 13px;
}

.checkbox-label input[type="checkbox"] {
  display: none;
}

.checkbox-custom {
  width: 16px;
  height: 16px;
  border: 1px solid #3e3e42;
  border-radius: 3px;
  background: #1e1e1e;
  position: relative;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.checkbox-label input[type="checkbox"]:checked + .checkbox-custom {
  background: #007acc;
  border-color: #007acc;
}

.checkbox-label input[type="checkbox"]:checked + .checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #ffffff;
  font-size: 12px;
  font-weight: bold;
}

.checkbox-label input[type="checkbox"]:disabled + .checkbox-custom {
  opacity: 0.6;
  cursor: not-allowed;
}

.quick-phrase-hint {
  color: #858585;
  font-size: 11px;
  margin-top: 4px;
  margin-left: 24px;
  line-height: 1.4;
}

/* 表单操作 */
.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}

.submit-btn {
  background: #4ec9b0;
  border: 1px solid #4ec9b0;
  color: #1e1e1e;
  padding: 10px 24px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s ease;
  min-width: 100px;
}

.submit-btn:hover:not(:disabled) {
  background: #5dd4b8;
  border-color: #5dd4b8;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(78, 201, 176, 0.3);
}

.submit-btn:disabled {
  background: #858585;
  border-color: #858585;
  cursor: not-allowed;
  opacity: 0.6;
  transform: none;
  box-shadow: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .feedback-body {
    padding: 16px;
  }
  
  .form-actions {
    justify-content: stretch;
  }
  
  .submit-btn {
    width: 100%;
  }
  
  .quick-phrase-hint {
    margin-left: 0;
    margin-top: 8px;
  }
  
  .checkbox-label {
    align-items: flex-start;
  }
}
</style>
