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
            <button class="btn btn-outline" @click="openConnectionModal">
              管理连接
            </button>
            <button class="btn btn-outline" @click="testAllConnections" :disabled="isLoading">
              测试所有
            </button>
          </div>
        </div>
        
        <!-- 连接统计 -->
        <div class="connection-stats">
          <div class="stat-item">
            <span class="stat-number">{{ Object.keys(settings.databaseOperation.defaultConnections).length }}</span>
            <span class="stat-label">已配置</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ connectedCount }}</span>
            <span class="stat-label">活跃</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ mysqlCount }}</span>
            <span class="stat-label">MySQL</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ postgresCount }}</span>
            <span class="stat-label">PostgreSQL</span>
          </div>
        </div>
        
        <!-- 连接列表 -->
        <div class="connection-list" v-if="Object.keys(settings.databaseOperation.defaultConnections).length > 0">
          <div 
            v-for="(connection, connectionId) in settings.databaseOperation.defaultConnections" 
            :key="connectionId" 
            class="connection-item"
            @click="editConnection(connectionId)"
          >
            <div class="connection-info">
              <div class="connection-name">{{ connection.id }}</div>
              <div class="connection-details">{{ connection.host }}:{{ connection.port }}/{{ connection.database }}</div>
            </div>
            <div class="connection-meta">
              <span class="connection-type">{{ connection.type.toUpperCase() }}</span>
              <div class="connection-status">
                <span :class="['status-indicator', getConnectionStatus(connectionId)]"></span>
              </div>
            </div>
            <button 
              type="button" 
              class="test-button" 
              @click.stop="testConnection(connectionId)"
              :disabled="isLoading"
            >
              测试
            </button>
          </div>
        </div>
        
        <div v-else class="empty-state">
          <div class="empty-icon">🔌</div>
          <div class="empty-title">暂无数据库连接</div>
          <div class="empty-description">添加数据库连接以开始使用数据库操作功能</div>
          <button type="button" class="btn btn-primary" @click="openConnectionModal">
            添加连接
          </button>
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
      @test="testConnection"
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
const connectionStatuses = reactive({})

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
const connectedCount = computed(() => {
  return Object.keys(connectionStatuses).filter(id => connectionStatuses[id] === 'connected').length
})

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

const getConnectionStatus = (connectionId) => {
  return connectionStatuses[connectionId] || 'unknown'
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
  delete connectionStatuses[connectionId]
  closeConnectionModal()
  showStatus('连接已删除', 'success')
}

const testConnection = async (connectionId) => {
  try {
    isLoading.value = true
    connectionStatuses[connectionId] = 'testing'

    const connection = settings.databaseOperation.defaultConnections[connectionId]
    const response = await fetch('/api/database/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(connection)
    })

    const result = await response.json()

    if (result.success) {
      connectionStatuses[connectionId] = 'connected'
      showStatus(`连接 ${connectionId} 测试成功`, 'success')
    } else {
      connectionStatuses[connectionId] = 'error'
      showStatus(`连接 ${connectionId} 测试失败: ${result.message}`, 'error')
    }
  } catch (error) {
    connectionStatuses[connectionId] = 'error'
    showStatus(`连接 ${connectionId} 测试失败: ${error.message}`, 'error')
  } finally {
    isLoading.value = false
  }
}

const testAllConnections = async () => {
  const connections = Object.keys(settings.databaseOperation.defaultConnections)
  if (connections.length === 0) {
    showStatus('没有可测试的连接', 'warning')
    return
  }

  showStatus('正在测试所有连接...', 'info')

  for (const connectionId of connections) {
    await testConnection(connectionId)
  }

  showStatus('所有连接测试完成', 'success')
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

/* 连接管理样式 */
.connection-stats {
  display: flex;
  gap: 24px;
  padding: 20px 24px;
  background: #f8f9fa;
  border-bottom: 1px solid #e5e5e7;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-number {
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
}

.stat-label {
  font-size: 12px;
  color: #86868b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.connection-list {
  padding: 0;
}

.connection-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid #f2f2f7;
  cursor: pointer;
  transition: background 0.2s ease;
}

.connection-item:hover {
  background: #f8f9fa;
}

.connection-item:last-child {
  border-bottom: none;
}

.connection-info {
  flex: 1;
}

.connection-name {
  font-size: 15px;
  font-weight: 500;
  color: #1d1d1f;
  margin-bottom: 2px;
}

.connection-details {
  font-size: 13px;
  color: #86868b;
}

.connection-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-right: 12px;
}

.connection-type {
  font-size: 12px;
  color: #86868b;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.status-indicator.connected {
  background: #30d158;
}

.status-indicator.error {
  background: #ff3b30;
}

.status-indicator.testing {
  background: #ff9500;
  animation: pulse 1.5s infinite;
}

.status-indicator.unknown {
  background: #d1d1d6;
}

.test-button {
  background: transparent;
  color: #007aff;
  border: 1px solid #007aff;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.test-button:hover {
  background: #007aff;
  color: #ffffff;
}

.test-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* 空状态样式 */
.empty-state {
  text-align: center;
  padding: 48px 24px;
  color: #86868b;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.6;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 8px;
}

.empty-description {
  font-size: 14px;
  margin-bottom: 24px;
  line-height: 1.4;
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
@media (max-width: 768px) {
  .settings-view {
    padding: 0;
  }

  .page-header {
    padding: 20px 16px;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .header-actions {
    justify-content: center;
  }

  .settings-content {
    padding: 16px;
    gap: 24px;
  }

  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    padding: 20px 16px 12px 16px;
  }

  .section-actions {
    justify-content: center;
  }

  .settings-group {
    padding: 16px;
    gap: 16px;
  }

  .setting-item {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    padding: 12px 0;
  }

  .connection-stats {
    flex-wrap: wrap;
    gap: 16px;
    padding: 16px;
  }

  .connection-item {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    padding: 16px;
  }

  .connection-meta {
    justify-content: space-between;
    margin-right: 0;
  }

  .test-button {
    align-self: flex-end;
  }

  .status-message {
    margin: 12px 16px;
  }
}

@media (max-width: 480px) {
  .connection-stats {
    grid-template-columns: repeat(2, 1fr);
    display: grid;
  }

  .stat-item {
    text-align: center;
  }
}





</style>
