<template>
  <div class="image-upload-component">
    <!-- 上传按钮区域 -->
    <div class="upload-area">
      <div class="upload-buttons">
        <button 
          type="button" 
          class="upload-btn" 
          @click="selectImages"
          :disabled="disabled"
        >
          📷 选择图片
        </button>
        <button 
          type="button" 
          class="upload-btn" 
          @click="pasteImage"
          :disabled="disabled"
        >
          📋 粘贴图片
        </button>
      </div>
      
      <!-- 拖拽上传区域 -->
      <div 
        class="drop-zone"
        :class="{ 'drag-over': isDragOver, 'disabled': disabled }"
        @dragover.prevent="handleDragOver"
        @dragleave.prevent="handleDragLeave"
        @drop.prevent="handleDrop"
      >
        <div class="drop-zone-content">
          <div class="drop-icon">📁</div>
          <div class="drop-text">
            <p>拖拽图片到此处上传</p>
            <p class="drop-hint">支持 JPG、PNG、GIF 格式，单个文件不超过 10MB</p>
          </div>
        </div>
      </div>
      
      <!-- 隐藏的文件输入 -->
      <input
        ref="fileInput"
        type="file"
        multiple
        accept="image/*"
        style="display: none"
        @change="handleFileSelect"
      >
    </div>

    <!-- 图片预览区域 -->
    <div v-if="modelValue.length > 0" class="image-previews">
      <div class="previews-header">
        <span class="previews-title">已选择图片 ({{ modelValue.length }})</span>
        <button 
          type="button" 
          class="clear-all-btn" 
          @click="clearAllImages"
          :disabled="disabled"
        >
          清空全部
        </button>
      </div>
      
      <div class="previews-grid">
        <div
          v-for="(image, index) in modelValue"
          :key="index"
          class="image-preview"
        >
          <div class="image-container">
            <img :src="image.data" :alt="image.name" @click="previewImage(image)" />
            <div class="image-overlay">
              <button
                type="button"
                class="preview-btn"
                @click="previewImage(image)"
                title="预览图片"
              >
                👁️
              </button>
              <button
                type="button"
                class="remove-btn"
                @click="removeImage(index)"
                :disabled="disabled"
                title="移除图片"
              >
                🗑️
              </button>
            </div>
          </div>
          
          <div class="image-info">
            <div class="image-name" :title="image.name">{{ image.name }}</div>
            <div class="image-size">{{ formatFileSize(image.size) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 图片预览模态框 -->
    <div v-if="previewImageData" class="image-preview-modal" @click="closePreview">
      <div class="preview-container" @click.stop>
        <img :src="previewImageData.data" :alt="previewImageData.name" />
        <div class="preview-info">
          <span class="preview-name">{{ previewImageData.name }}</span>
          <span class="preview-size">{{ formatFileSize(previewImageData.size) }}</span>
        </div>
        <button class="close-preview-btn" @click="closePreview">×</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Props
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  disabled: {
    type: Boolean,
    default: false
  },
  maxFiles: {
    type: Number,
    default: 10
  },
  maxFileSize: {
    type: Number,
    default: 10 * 1024 * 1024 // 10MB
  },
  acceptedTypes: {
    type: Array,
    default: () => ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'error'])

// 响应式数据
const fileInput = ref(null)
const isDragOver = ref(false)
const previewImageData = ref(null)

// 方法
const selectImages = () => {
  if (props.disabled) return
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  processFiles(files)
  // 清空input值，允许重复选择同一文件
  event.target.value = ''
}

const handleDragOver = (event) => {
  if (props.disabled) return
  isDragOver.value = true
}

const handleDragLeave = (event) => {
  isDragOver.value = false
}

const handleDrop = (event) => {
  if (props.disabled) return
  isDragOver.value = false
  
  const files = Array.from(event.dataTransfer.files)
  processFiles(files)
}

const processFiles = (files) => {
  const validFiles = files.filter(file => {
    // 检查文件类型
    if (!props.acceptedTypes.includes(file.type)) {
      emit('error', new Error(`不支持的文件类型: ${file.type}`))
      return false
    }
    
    // 检查文件大小
    if (file.size > props.maxFileSize) {
      emit('error', new Error(`文件过大: ${file.name} (${formatFileSize(file.size)})`))
      return false
    }
    
    return true
  })
  
  // 检查文件数量限制
  if (props.modelValue.length + validFiles.length > props.maxFiles) {
    emit('error', new Error(`最多只能上传 ${props.maxFiles} 个文件`))
    return
  }
  
  // 处理有效文件
  validFiles.forEach(file => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageData = {
        name: file.name,
        size: file.size,
        type: file.type,
        data: e.target.result,
        lastModified: file.lastModified
      }
      
      const newImages = [...props.modelValue, imageData]
      emit('update:modelValue', newImages)
    }
    reader.onerror = () => {
      emit('error', new Error(`读取文件失败: ${file.name}`))
    }
    reader.readAsDataURL(file)
  })
}

const pasteImage = async () => {
  if (props.disabled) return
  
  try {
    const clipboardItems = await navigator.clipboard.read()
    
    for (const clipboardItem of clipboardItems) {
      for (const type of clipboardItem.types) {
        if (type.startsWith('image/')) {
          const blob = await clipboardItem.getType(type)
          
          // 检查文件大小
          if (blob.size > props.maxFileSize) {
            emit('error', new Error(`粘贴的图片过大 (${formatFileSize(blob.size)})`))
            continue
          }
          
          // 检查文件数量限制
          if (props.modelValue.length >= props.maxFiles) {
            emit('error', new Error(`最多只能上传 ${props.maxFiles} 个文件`))
            return
          }
          
          const reader = new FileReader()
          reader.onload = (e) => {
            const imageData = {
              name: `粘贴图片_${Date.now()}.${type.split('/')[1]}`,
              size: blob.size,
              type: blob.type,
              data: e.target.result,
              lastModified: Date.now()
            }
            
            const newImages = [...props.modelValue, imageData]
            emit('update:modelValue', newImages)
          }
          reader.onerror = () => {
            emit('error', new Error('读取粘贴的图片失败'))
          }
          reader.readAsDataURL(blob)
        }
      }
    }
  } catch (error) {
    emit('error', new Error('粘贴图片失败，请检查剪贴板权限'))
  }
}

const removeImage = (index) => {
  if (props.disabled) return
  
  const newImages = [...props.modelValue]
  newImages.splice(index, 1)
  emit('update:modelValue', newImages)
}

const clearAllImages = () => {
  if (props.disabled) return
  
  if (confirm('确定要清空所有图片吗？')) {
    emit('update:modelValue', [])
  }
}

const previewImage = (image) => {
  previewImageData.value = image
}

const closePreview = () => {
  previewImageData.value = null
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped>
.image-upload-component {
  width: 100%;
}

/* 上传区域 */
.upload-area {
  margin-bottom: 16px;
}

.upload-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.upload-btn {
  background: #2d2d30;
  border: 1px solid #3e3e42;
  color: #cccccc;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.upload-btn:hover:not(:disabled) {
  background: #37373d;
  border-color: #4ec9b0;
  color: #ffffff;
}

.upload-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 拖拽区域 */
.drop-zone {
  border: 2px dashed #3e3e42;
  border-radius: 6px;
  padding: 24px;
  text-align: center;
  transition: all 0.2s ease;
  background: #1e1e1e;
}

.drop-zone:not(.disabled):hover,
.drop-zone.drag-over {
  border-color: #4ec9b0;
  background: #252526;
}

.drop-zone.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.drop-zone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.drop-icon {
  font-size: 32px;
  opacity: 0.6;
}

.drop-text p {
  margin: 0;
  color: #cccccc;
  font-size: 13px;
}

.drop-hint {
  color: #858585 !important;
  font-size: 11px !important;
}

/* 预览区域 */
.image-previews {
  border: 1px solid #3e3e42;
  border-radius: 6px;
  overflow: hidden;
}

.previews-header {
  background: #2d2d30;
  padding: 8px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #3e3e42;
}

.previews-title {
  color: #cccccc;
  font-size: 12px;
  font-weight: 500;
}

.clear-all-btn {
  background: #f14c4c;
  border: 1px solid #f14c4c;
  color: #ffffff;
  padding: 4px 8px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 11px;
  transition: all 0.2s ease;
}

.clear-all-btn:hover:not(:disabled) {
  background: #ff5555;
}

.clear-all-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.previews-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
  padding: 12px;
  background: #1e1e1e;
}

.image-preview {
  background: #2d2d30;
  border: 1px solid #3e3e42;
  border-radius: 6px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.image-preview:hover {
  border-color: #4ec9b0;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.image-container {
  position: relative;
  height: 100px;
  overflow: hidden;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.image-container:hover .image-overlay {
  opacity: 1;
}

.preview-btn,
.remove-btn {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.preview-btn:hover {
  background: #4ec9b0;
  color: #ffffff;
}

.remove-btn:hover {
  background: #f14c4c;
  color: #ffffff;
}

.image-info {
  padding: 8px;
}

.image-name {
  color: #cccccc;
  font-size: 11px;
  font-weight: 500;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.image-size {
  color: #858585;
  font-size: 10px;
}

/* 预览模态框 */
.image-preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.preview-container {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.preview-container img {
  max-width: 100%;
  max-height: calc(90vh - 60px);
  object-fit: contain;
  border-radius: 4px;
}

.preview-info {
  background: rgba(0, 0, 0, 0.8);
  color: #ffffff;
  padding: 8px 16px;
  border-radius: 4px;
  margin-top: 12px;
  display: flex;
  gap: 16px;
  font-size: 12px;
}

.preview-name {
  font-weight: 500;
}

.preview-size {
  color: #cccccc;
}

.close-preview-btn {
  position: absolute;
  top: -40px;
  right: 0;
  width: 32px;
  height: 32px;
  background: rgba(244, 76, 76, 0.9);
  border: none;
  border-radius: 50%;
  color: #ffffff;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-preview-btn:hover {
  background: rgba(244, 76, 76, 1);
  transform: scale(1.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .upload-buttons {
    flex-direction: column;
  }
  
  .previews-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 8px;
    padding: 8px;
  }
  
  .image-container {
    height: 80px;
  }
  
  .drop-zone {
    padding: 16px;
  }
  
  .drop-icon {
    font-size: 24px;
  }
  
  .preview-container {
    max-width: 95vw;
    max-height: 95vh;
  }
  
  .close-preview-btn {
    top: -30px;
    right: -10px;
  }
}
</style>
