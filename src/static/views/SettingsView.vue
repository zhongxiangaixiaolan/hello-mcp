<template>
  <div class="settings-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-title">
          <h1>数据库连接管理</h1>
          <p class="subtitle">管理和配置数据库连接</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-primary" @click="saveSettings" :disabled="isLoading">
            {{ isLoading ? '保存中...' : '保存' }}
          </button>
          <button class="btn btn-secondary" @click="resetSettings" :disabled="isLoading">
            重置
          </button>
        </div>
      </div>
    </div>

    <!-- 设置内容 -->
    <div class="settings-content">

      <!-- 数据库连接管理 -->
      <div class="settings-section">
        <div class="section-header">
          <h2>数据库连接</h2>
          <p class="section-description">管理数据库连接配置</p>
          <div class="section-actions">
            <button class="btn btn-primary" @click="openConnectionModal">
              <span class="btn-icon">➕</span>
              管理连接
            </button>
          </div>
        </div>
        
        <!-- 连接统计 -->
        <div class="connection-stats">
          <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div class="stat-content">
              <span class="stat-number">{{ Object.keys(settings.databaseOperation.defaultConnections).length }}</span>
              <span class="stat-label">已配置连接</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🗄️</div>
            <div class="stat-content">
              <span class="stat-number">{{ mysqlCount }}</span>
              <span class="stat-label">MySQL</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🐘</div>
            <div class="stat-content">
              <span class="stat-number">{{ postgresCount }}</span>
              <span class="stat-label">PostgreSQL</span>
            </div>
          </div>
        </div>
        
        <!-- 连接列表 -->
        <div class="connection-list" v-if="Object.keys(settings.databaseOperation.defaultConnections).length > 0">
          <div 
            v-for="(connection, connectionId) in settings.databaseOperation.defaultConnections" 
            :key="connectionId" 
            class="connection-card"
            @click="editConnection(connectionId)"
          >
            <div class="connection-header">
              <div class="connection-icon">
                <span v-if="connection.type === 'mysql'">🗄️</span>
                <span v-else-if="connection.type === 'postgresql'">🐘</span>
                <span v-else>💾</span>
              </div>
              <div class="connection-info">
                <div class="connection-name">{{ connection.id }}</div>
                <div class="connection-type-badge">{{ connection.type.toUpperCase() }}</div>
              </div>
              <div class="connection-actions">
                <button 
                  type="button" 
                  class="edit-button" 
                  @click.stop="editConnection(connectionId)"
                  title="编辑连接"
                >
                  ✏️
                </button>
              </div>
            </div>
            <div class="connection-details">
              <div class="detail-item">
                <span class="detail-label">主机</span>
                <span class="detail-value">{{ connection.host }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">端口</span>
                <span class="detail-value">{{ connection.port }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">数据库</span>
                <span class="detail-value">{{ connection.database }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="empty-state">
          <div class="empty-illustration">
            <div class="empty-icon">🔌</div>
            <div class="empty-circle"></div>
          </div>
          <div class="empty-content">
            <div class="empty-title">暂无数据库连接</div>
            <div class="empty-description">添加数据库连接以开始使用数据库操作功能</div>
            <button type="button" class="btn btn-primary btn-large" @click="openConnectionModal">
              <span class="btn-icon">➕</span>
              添加第一个连接
            </button>
          </div>
        </div>
      </div>


    </div>

    <!-- 状态消息 -->
    <div v-if="statusMessage.text" :class="['status-message', statusMessage.type]">
      {{ statusMessage.text }}
    </div>

    <!-- 数据库连接管理弹窗 -->
    <DatabaseConnectionModal 
      v-if="showConnectionModal"
      :connections="settings.databaseOperation.defaultConnections"
      :editing-connection-id="editingConnectionId"
      @close="closeConnectionModal"
      @save="saveConnection"
      @delete="deleteConnection"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import DatabaseConnectionModal from '../components/database/DatabaseConnectionModal.vue'

// 响应式数据
const isLoading = ref(false)
const showConnectionModal = ref(false)
const editingConnectionId = ref(null)

const statusMessage = reactive({
  text: '',
  type: ''
})

// 设置数据 - 只保留数据库连接
const settings = reactive({
  databaseOperation: {
    defaultConnections: {}
  }
})

// 计算属性
const mysqlCount = computed(() => {
  return Object.values(settings.databaseOperation.defaultConnections).filter(conn => conn.type === 'mysql').length
})

const postgresCount = computed(() => {
  return Object.values(settings.databaseOperation.defaultConnections).filter(conn => conn.type === 'postgresql').length
})

// 方法
const showStatus = (message, type) => {
  statusMessage.text = message
  statusMessage.type = type

  if (type !== 'error') {
    setTimeout(() => {
      statusMessage.text = ''
      statusMessage.type = ''
    }, 3000)
  }
}


const openConnectionModal = () => {
  editingConnectionId.value = null
  showConnectionModal.value = true
}

const closeConnectionModal = () => {
  showConnectionModal.value = false
  editingConnectionId.value = null
}

const editConnection = (connectionId) => {
  editingConnectionId.value = connectionId
  showConnectionModal.value = true
}

const saveConnection = (connectionData) => {
  if (editingConnectionId.value) {
    // 编辑现有连接
    const oldId = editingConnectionId.value
    if (connectionData.id !== oldId) {
      // ID发生变化，需要删除旧的并创建新的
      delete settings.databaseOperation.defaultConnections[oldId]
    }
  }

  settings.databaseOperation.defaultConnections[connectionData.id] = connectionData
  closeConnectionModal()
  showStatus('连接配置已保存', 'success')
}

const deleteConnection = (connectionId) => {
  delete settings.databaseOperation.defaultConnections[connectionId]
  closeConnectionModal()
  showStatus('连接已删除', 'success')
}


const loadSettings = async () => {
  try {
    showStatus('正在加载设置...', 'info')

    const response = await fetch('/api/settings')
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const loadedSettings = await response.json()

    // 只加载数据库连接配置
    settings.databaseOperation.defaultConnections = loadedSettings.databaseOperation?.defaultConnections || {}

    showStatus('设置加载成功', 'success')
  } catch (error) {
    console.error('加载设置失败:', error)
    showStatus(`加载设置失败: ${error.message}`, 'error')
  }
}

const saveSettings = async () => {
  try {
    isLoading.value = true
    showStatus('正在保存设置...', 'info')

    const settingsToSave = {
      databaseOperation: {
        defaultConnections: settings.databaseOperation.defaultConnections
      }
    }

    const response = await fetch('/api/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(settingsToSave)
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    showStatus('设置保存成功！', 'success')
  } catch (error) {
    console.error('保存设置失败:', error)
    showStatus(`保存设置失败: ${error.message}`, 'error')
  } finally {
    isLoading.value = false
  }
}

const resetSettings = async () => {
  if (confirm('确定要重置所有设置为默认值吗？此操作无法撤销。')) {
    try {
      isLoading.value = true
      showStatus('正在重置设置...', 'info')

      const response = await fetch('/api/settings/reset', {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      await loadSettings()
      showStatus('设置已重置为默认值', 'success')
    } catch (error) {
      console.error('重置设置失败:', error)
      showStatus(`重置设置失败: ${error.message}`, 'error')
    } finally {
      isLoading.value = false
    }
  }
}

// 生命周期
onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
/* 苹果简约风格设置界面 */
.settings-view {
  min-height: calc(100vh - 200px);
  background: #f5f5f7;
  color: #1d1d1f;
  padding: 0;
}

/* 页面头部 */
.page-header {
  background: #ffffff;
  border-bottom: 1px solid #e5e5e7;
  padding: 24px 32px;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(20px);
}

.header-content {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.header-title h1 {
  font-size: 28px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 4px 0;
  letter-spacing: -0.5px;
}

.subtitle {
  font-size: 15px;
  color: #86868b;
  margin: 0;
  font-weight: 400;
}

.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* 设置内容 */
.settings-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

/* 设置分组 */
.settings-section {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e5e5e7;
  overflow: hidden;
}

.section-header {
  padding: 24px 24px 16px 24px;
  border-bottom: 1px solid #e5e5e7;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.section-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 4px 0;
  letter-spacing: -0.3px;
}

.section-description {
  font-size: 14px;
  color: #86868b;
  margin: 0;
  line-height: 1.4;
}

.section-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-shrink: 0;
}

.settings-group {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid #f2f2f7;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item.full-width {
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
}

.setting-label {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.label-text {
  font-size: 15px;
  font-weight: 500;
  color: #1d1d1f;
}

.label-detail {
  font-size: 13px;
  color: #86868b;
  font-weight: 400;
}

/* 输入框样式 */
.setting-input,
.setting-textarea {
  background: #f2f2f7;
  border: 1px solid #d1d1d6;
  border-radius: 8px;
  color: #1d1d1f;
  padding: 12px 16px;
  font-size: 15px;
  transition: all 0.2s ease;
  font-family: inherit;
  min-width: 120px;
}

.setting-input:focus,
.setting-textarea:focus {
  outline: none;
  border-color: #007aff;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.setting-textarea {
  resize: vertical;
  min-height: 80px;
  width: 100%;
}

/* 开关样式 */
.toggle-switch {
  position: relative;
  display: inline-block;
}

.toggle-input {
  display: none;
}

.toggle-label {
  display: block;
  width: 44px;
  height: 26px;
  background: #d1d1d6;
  border-radius: 13px;
  position: relative;
  cursor: pointer;
  transition: background 0.2s ease;
}

.toggle-label::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 22px;
  height: 22px;
  background: #ffffff;
  border-radius: 50%;
  transition: transform 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toggle-input:checked + .toggle-label {
  background: #007aff;
}

.toggle-input:checked + .toggle-label::after {
  transform: translateX(18px);
}

/* 按钮样式 */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  min-height: 32px;
}

.btn-primary {
  background: #007aff;
  color: #ffffff;
}

.btn-primary:hover {
  background: #0056cc;
}

.btn-secondary {
  background: #f2f2f7;
  color: #1d1d1f;
  border: 1px solid #d1d1d6;
}

.btn-secondary:hover {
  background: #e5e5e7;
}

.btn-outline {
  background: transparent;
  color: #007aff;
  border: 1px solid #007aff;
}

.btn-outline:hover {
  background: #007aff;
  color: #ffffff;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 按钮图标样式 */
.btn-icon {
  margin-right: 6px;
  font-size: 14px;
}

.btn-large {
  padding: 12px 24px;
  font-size: 16px;
  min-height: 44px;
}

/* 连接统计卡片样式 */
.connection-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  padding: 24px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #e5e5e7;
}

.stat-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  border: 1px solid #f1f3f5;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  font-size: 24px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #007aff, #5ac8fa);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.2);
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #1d1d1f;
  line-height: 1;
}

.stat-label {
  font-size: 13px;
  color: #86868b;
  font-weight: 500;
  letter-spacing: 0.2px;
}

.connection-list {
  padding: 16px 24px 24px 24px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.connection-card {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e5e5e7;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.connection-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: #007aff;
}

.connection-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 20px 16px 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
}

.connection-icon {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #007aff, #5ac8fa);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.2);
}

.connection-info {
  flex: 1;
}

.connection-name {
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 4px;
  letter-spacing: -0.2px;
}

.connection-type-badge {
  display: inline-block;
  background: linear-gradient(135deg, #007aff, #5ac8fa);
  color: #ffffff;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.connection-actions {
  display: flex;
  gap: 8px;
}

.edit-button {
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid #e5e5e7;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.edit-button:hover {
  background: #f8f9fa;
  border-color: #007aff;
}

.connection-details {
  padding: 0 20px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.detail-label {
  font-size: 12px;
  font-weight: 500;
  color: #86868b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 14px;
  font-weight: 500;
  color: #1d1d1f;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
}

/* 空状态样式 */
.empty-state {
  text-align: center;
  padding: 60px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.empty-illustration {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-icon {
  font-size: 64px;
  position: relative;
  z-index: 2;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

.empty-circle {
  position: absolute;
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, rgba(0, 122, 255, 0.1), rgba(90, 200, 250, 0.1));
  border-radius: 50%;
  z-index: 1;
  animation: pulse-circle 2s infinite;
}

@keyframes pulse-circle {
  0%, 100% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.4;
  }
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  max-width: 400px;
}

.empty-title {
  font-size: 22px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0;
  letter-spacing: -0.3px;
}

.empty-description {
  font-size: 16px;
  color: #86868b;
  line-height: 1.5;
  margin: 0;
}

/* 状态消息样式 */
.status-message {
  margin: 16px 32px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  animation: slideIn 0.3s ease;
}

.status-message.success {
  background: #d1f7c4;
  color: #1d4ed8;
  border: 1px solid #86efac;
}

.status-message.error {
  background: #fecaca;
  color: #dc2626;
  border: 1px solid #f87171;
}

.status-message.warning {
  background: #fef3c7;
  color: #d97706;
  border: 1px solid #fbbf24;
}

.status-message.info {
  background: #dbeafe;
  color: #2563eb;
  border: 1px solid #93c5fd;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .connection-list {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
  
  .connection-stats {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }
}

@media (max-width: 768px) {
  .settings-view {
    padding: 0;
    background: #ffffff;
  }

  .page-header {
    padding: 20px 16px;
    background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 20px;
  }

  .header-title h1 {
    font-size: 24px;
  }

  .header-actions {
    justify-content: stretch;
  }

  .header-actions .btn {
    flex: 1;
    justify-content: center;
  }

  .settings-content {
    padding: 16px;
    gap: 20px;
  }

  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    padding: 20px 16px 16px 16px;
  }

  .section-actions {
    justify-content: stretch;
  }

  .section-actions .btn {
    flex: 1;
    justify-content: center;
  }

  .connection-stats {
    grid-template-columns: 1fr;
    padding: 16px;
    gap: 12px;
  }

  .stat-card {
    padding: 16px;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }

  .stat-number {
    font-size: 20px;
  }

  .connection-list {
    grid-template-columns: 1fr;
    padding: 16px;
    gap: 12px;
  }

  .connection-card {
    border-radius: 12px;
  }

  .connection-header {
    padding: 16px 16px 12px 16px;
  }

  .connection-icon {
    width: 36px;
    height: 36px;
    font-size: 18px;
  }

  .connection-name {
    font-size: 15px;
  }

  .connection-details {
    padding: 0 16px 16px 16px;
    gap: 8px;
  }

  .detail-item {
    padding: 6px 10px;
  }

  .detail-label {
    font-size: 11px;
  }

  .detail-value {
    font-size: 13px;
  }

  .empty-state {
    padding: 40px 16px;
    gap: 20px;
  }

  .empty-icon {
    font-size: 48px;
  }

  .empty-circle {
    width: 100px;
    height: 100px;
  }

  .empty-title {
    font-size: 20px;
  }

  .empty-description {
    font-size: 15px;
  }

  .status-message {
    margin: 12px 16px;
    padding: 10px 14px;
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .header-title h1 {
    font-size: 22px;
  }

  .subtitle {
    font-size: 14px;
  }

  .connection-stats {
    gap: 8px;
    padding: 12px;
  }

  .stat-card {
    padding: 12px;
    gap: 12px;
  }

  .stat-icon {
    width: 32px;
    height: 32px;
    font-size: 16px;
  }

  .stat-number {
    font-size: 18px;
  }

  .stat-label {
    font-size: 12px;
  }

  .connection-list {
    padding: 12px;
    gap: 8px;
  }

  .connection-header {
    padding: 12px 12px 8px 12px;
    gap: 8px;
  }

  .connection-icon {
    width: 32px;
    height: 32px;
    font-size: 16px;
  }

  .connection-name {
    font-size: 14px;
  }

  .connection-type-badge {
    font-size: 10px;
    padding: 3px 6px;
  }

  .edit-button {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }

  .connection-details {
    padding: 0 12px 12px 12px;
  }

  .empty-state {
    padding: 32px 12px;
  }

  .empty-icon {
    font-size: 40px;
  }

  .empty-circle {
    width: 80px;
    height: 80px;
  }

  .empty-title {
    font-size: 18px;
  }

  .empty-description {
    font-size: 14px;
  }

  .btn-large {
    padding: 10px 20px;
    font-size: 15px;
    min-height: 40px;
  }
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .settings-view {
    background: #1e1e1e;
    color: #ffffff;
  }

  .page-header {
    background: #2d2d30;
    border-bottom-color: #3e3e42;
  }

  .settings-section {
    background: #252526;
    border-color: #3e3e42;
  }

  .section-header {
    background: #2d2d30;
    border-bottom-color: #3e3e42;
  }

  .connection-stats {
    background: linear-gradient(135deg, #2d2d30 0%, #252526 100%);
  }

  .stat-card {
    background: #1e1e1e;
    border-color: #3e3e42;
  }

  .connection-card {
    background: #1e1e1e;
    border-color: #3e3e42;
  }

  .connection-card:hover {
    border-color: #007acc;
  }

  .connection-header {
    background: linear-gradient(135deg, #2d2d30 0%, #1e1e1e 100%);
  }

  .detail-item {
    background: #2d2d30;
  }

  .empty-circle {
    background: linear-gradient(135deg, rgba(0, 122, 204, 0.1), rgba(90, 200, 250, 0.1));
  }
}





</style>
