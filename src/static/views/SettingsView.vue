<template>
  <div class="settings-view">
    <div class="container">
      <header>
        <h1>🛠️ MCP工具设置</h1>
        <p class="subtitle">配置 collect_feedback 和 database_operation 工具的默认参数</p>
      </header>

      <div class="settings-content">
        <!-- collect_feedback 工具设置 -->
        <section class="tool-section">
          <h2>📝 collect_feedback 工具设置</h2>
          <div class="form-group">
            <label for="dialogTimeout">默认超时时间（秒）：</label>
            <input 
              type="number" 
              id="dialogTimeout" 
              v-model.number="settings.collectFeedback.dialogTimeout" 
              min="10" 
              max="3600" 
              step="1"
            >
            <small>反馈收集的超时时间，超时后自动关闭</small>
          </div>
          
          <div class="form-group">
            <label for="autoOpenBrowser">自动打开浏览器：</label>
            <input 
              type="checkbox" 
              id="autoOpenBrowser" 
              v-model="settings.collectFeedback.autoOpenBrowser"
            >
            <small>收集反馈时是否自动打开浏览器</small>
          </div>
          
          <div class="form-group">
            <label for="defaultWorkSummary">默认工作汇报模板：</label>
            <textarea 
              id="defaultWorkSummary" 
              v-model="settings.collectFeedback.defaultWorkSummary" 
              rows="3" 
              placeholder="可选：设置默认的工作汇报模板"
            ></textarea>
            <small>可选：为工作汇报设置默认模板</small>
          </div>
        </section>

        <!-- database_operation 工具设置 -->
        <section class="tool-section">
          <h2>🗄️ database_operation 工具设置</h2>
          
          <div class="form-group">
            <label for="defaultTimeout">默认查询超时（毫秒）：</label>
            <input 
              type="number" 
              id="defaultTimeout" 
              v-model.number="settings.databaseOperation.defaultTimeout" 
              min="1000" 
              max="300000" 
              step="1000"
            >
            <small>数据库查询的默认超时时间</small>
          </div>
          
          <div class="form-group">
            <label for="defaultMaxRows">默认最大行数：</label>
            <input 
              type="number" 
              id="defaultMaxRows" 
              v-model.number="settings.databaseOperation.defaultMaxRows" 
              min="1" 
              max="100000" 
              step="1"
            >
            <small>查询结果的默认最大行数限制</small>
          </div>
          
          <div class="form-group">
            <label for="defaultSchema">默认模式名：</label>
            <input 
              type="text" 
              id="defaultSchema" 
              v-model="settings.databaseOperation.defaultSchema" 
              placeholder="可选：PostgreSQL默认模式"
            >
            <small>可选：PostgreSQL数据库的默认模式名</small>
          </div>

          <h3>🔗 默认数据库连接</h3>
          <div id="connections-container">
            <div class="connections-list">
              <!-- 数据库连接列表 -->
              <div 
                v-for="(connection, connectionId) in settings.databaseOperation.defaultConnections" 
                :key="connectionId" 
                class="connection-item"
              >
                <div class="connection-header">
                  <h4>数据库连接</h4>
                  <button 
                    type="button" 
                    class="remove-connection" 
                    @click="removeConnection(connectionId)"
                  >
                    ❌
                  </button>
                </div>
                <div class="connection-form">
                  <div class="form-row">
                    <div class="form-group">
                      <label>连接ID：</label>
                      <input 
                        type="text" 
                        v-model="connection.id" 
                        placeholder="例如：main-db" 
                        required
                        @input="updateConnectionId(connectionId, $event.target.value)"
                      >
                    </div>
                    <div class="form-group">
                      <label>数据库类型：</label>
                      <select v-model="connection.type" required @change="updateDefaultPort(connection)">
                        <option value="mysql">MySQL</option>
                        <option value="postgresql">PostgreSQL</option>
                      </select>
                    </div>
                  </div>
                  <div class="form-row">
                    <div class="form-group">
                      <label>主机：</label>
                      <input type="text" v-model="connection.host" placeholder="localhost" required>
                    </div>
                    <div class="form-group">
                      <label>端口：</label>
                      <input type="number" v-model.number="connection.port" placeholder="3306" min="1" max="65535" required>
                    </div>
                  </div>
                  <div class="form-row">
                    <div class="form-group">
                      <label>数据库名：</label>
                      <input type="text" v-model="connection.database" placeholder="数据库名" required>
                    </div>
                    <div class="form-group">
                      <label>用户名：</label>
                      <input type="text" v-model="connection.user" placeholder="用户名" required>
                    </div>
                  </div>
                  <div class="form-row">
                    <div class="form-group">
                      <label>密码：</label>
                      <input type="password" v-model="connection.password" placeholder="密码" required>
                    </div>
                    <div class="form-group">
                      <label>启用SSL：</label>
                      <input type="checkbox" v-model="connection.ssl">
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <button type="button" class="btn btn-secondary" @click="addConnection">➕ 添加连接</button>
          </div>
        </section>
      </div>

      <div class="actions">
        <button class="btn btn-primary" @click="saveSettings" :disabled="isLoading">
          {{ isLoading ? '保存中...' : '💾 保存设置' }}
        </button>
        <button class="btn btn-warning" @click="resetSettings" :disabled="isLoading">🔄 重置为默认</button>
        <button class="btn btn-info" @click="testSettings" :disabled="isLoading">🧪 测试配置</button>
      </div>

      <div v-if="statusMessage.text" :class="['status-message', statusMessage.type]">
        {{ statusMessage.text }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'

// 响应式数据
const isLoading = ref(false)
const statusMessage = reactive({
  text: '',
  type: ''
})

// 设置数据
const settings = reactive({
  collectFeedback: {
    dialogTimeout: 60,
    autoOpenBrowser: true,
    defaultWorkSummary: ''
  },
  databaseOperation: {
    defaultTimeout: 30000,
    defaultMaxRows: 1000,
    defaultSchema: '',
    defaultConnections: {}
  }
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

const loadSettings = async () => {
  try {
    showStatus('正在加载设置...', 'info')
    
    const response = await fetch('/api/settings')
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const loadedSettings = await response.json()
    
    // 更新设置数据
    settings.collectFeedback.dialogTimeout = Math.floor((loadedSettings.collectFeedback?.dialogTimeout || 60000) / 1000)
    settings.collectFeedback.autoOpenBrowser = loadedSettings.collectFeedback?.autoOpenBrowser !== false
    settings.collectFeedback.defaultWorkSummary = loadedSettings.collectFeedback?.defaultWorkSummary || ''
    
    settings.databaseOperation.defaultTimeout = loadedSettings.databaseOperation?.defaultTimeout || 30000
    settings.databaseOperation.defaultMaxRows = loadedSettings.databaseOperation?.defaultMaxRows || 1000
    settings.databaseOperation.defaultSchema = loadedSettings.databaseOperation?.defaultSchema || ''
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
      collectFeedback: {
        dialogTimeout: settings.collectFeedback.dialogTimeout * 1000,
        autoOpenBrowser: settings.collectFeedback.autoOpenBrowser,
        defaultWorkSummary: settings.collectFeedback.defaultWorkSummary || undefined
      },
      databaseOperation: {
        defaultConnections: settings.databaseOperation.defaultConnections,
        defaultTimeout: settings.databaseOperation.defaultTimeout,
        defaultMaxRows: settings.databaseOperation.defaultMaxRows,
        defaultSchema: settings.databaseOperation.defaultSchema || undefined
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
      const error = await response.json()
      throw new Error(error.message || `HTTP ${response.status}`)
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
  if (!confirm('确定要重置所有设置为默认值吗？此操作不可撤销。')) {
    return
  }

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

const testSettings = async () => {
  try {
    isLoading.value = true
    showStatus('正在测试配置...', 'info')
    
    const settingsToTest = {
      collectFeedback: {
        dialogTimeout: settings.collectFeedback.dialogTimeout * 1000,
        autoOpenBrowser: settings.collectFeedback.autoOpenBrowser,
        defaultWorkSummary: settings.collectFeedback.defaultWorkSummary || undefined
      },
      databaseOperation: {
        defaultConnections: settings.databaseOperation.defaultConnections,
        defaultTimeout: settings.databaseOperation.defaultTimeout,
        defaultMaxRows: settings.databaseOperation.defaultMaxRows,
        defaultSchema: settings.databaseOperation.defaultSchema || undefined
      }
    }
    
    const response = await fetch('/api/settings/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(settingsToTest)
    })

    const result = await response.json()
    
    if (result.success) {
      showStatus('配置测试通过！', 'success')
    } else {
      showStatus(`配置测试失败: ${result.message}`, 'error')
    }
  } catch (error) {
    console.error('测试配置失败:', error)
    showStatus(`测试配置失败: ${error.message}`, 'error')
  } finally {
    isLoading.value = false
  }
}

const addConnection = () => {
  const newConnectionId = `connection-${Date.now()}`
  settings.databaseOperation.defaultConnections[newConnectionId] = {
    id: newConnectionId,
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    database: '',
    user: '',
    password: '',
    ssl: false
  }
}

const removeConnection = (connectionId) => {
  delete settings.databaseOperation.defaultConnections[connectionId]
}

const updateConnectionId = (oldId, newId) => {
  if (newId && newId !== oldId) {
    const connection = settings.databaseOperation.defaultConnections[oldId]
    connection.id = newId
    settings.databaseOperation.defaultConnections[newId] = connection
    delete settings.databaseOperation.defaultConnections[oldId]
  }
}

const updateDefaultPort = (connection) => {
  if (connection.type === 'mysql') {
    connection.port = 3306
  } else if (connection.type === 'postgresql') {
    connection.port = 5432
  }
}

// 生命周期
onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
/* VS Code 风格的深色主题设置页面 */
.settings-view {
  min-height: calc(100vh - 200px);
  background: #1e1e1e;
  color: #cccccc;
  padding: 20px;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  background: #252526;
  border: 1px solid #3e3e42;
  border-radius: 6px;
  overflow: hidden;
}

header {
  background: #2d2d30;
  border-bottom: 1px solid #3e3e42;
  color: #ffffff;
  padding: 30px;
  text-align: center;
}

header h1 {
  font-size: 24px;
  margin-bottom: 10px;
  font-weight: 600;
  color: #4ec9b0;
}

.subtitle {
  font-size: 14px;
  color: #cccccc;
  opacity: 0.9;
}

.settings-content {
  padding: 30px;
}

.tool-section {
  margin-bottom: 40px;
  border: 1px solid #3e3e42;
  border-radius: 6px;
  padding: 25px;
  background: #1e1e1e;
}

.tool-section h2 {
  color: #4ec9b0;
  margin-bottom: 20px;
  font-size: 18px;
  border-bottom: 2px solid #4ec9b0;
  padding-bottom: 10px;
}

.tool-section h3 {
  color: #569cd6;
  margin: 25px 0 15px 0;
  font-size: 16px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #cccccc;
  font-size: 13px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px 12px;
  background: #37373d;
  border: 1px solid #3e3e42;
  border-radius: 4px;
  color: #cccccc;
  font-size: 13px;
  font-family: inherit;
  transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #007acc;
  box-shadow: 0 0 0 1px #007acc;
}

.form-group input[type="checkbox"] {
  width: auto;
  margin-right: 8px;
}

.form-group small {
  display: block;
  margin-top: 5px;
  color: #858585;
  font-size: 11px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 15px;
}

.connections-list {
  margin-bottom: 20px;
}

.connection-item {
  border: 1px solid #3e3e42;
  border-radius: 6px;
  margin-bottom: 20px;
  background: #252526;
}

.connection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #2d2d30;
  border-bottom: 1px solid #3e3e42;
}

.connection-header h4 {
  color: #cccccc;
  margin: 0;
  font-size: 14px;
}

.connection-form {
  padding: 20px;
}

.remove-connection {
  background: #f14c4c;
  color: #ffffff;
  border: none;
  padding: 4px 8px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.2s ease;
}

.remove-connection:hover {
  background: #ff5555;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-right: 10px;
  text-transform: none;
  letter-spacing: normal;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #4ec9b0;
  color: #1e1e1e;
}

.btn-primary:hover:not(:disabled) {
  background: #5dd4b8;
}

.btn-secondary {
  background: #37373d;
  color: #cccccc;
  border: 1px solid #3e3e42;
}

.btn-secondary:hover:not(:disabled) {
  background: #4a4a4f;
  border-color: #569cd6;
}

.btn-warning {
  background: #f9c74f;
  color: #1e1e1e;
}

.btn-warning:hover:not(:disabled) {
  background: #f8d866;
}

.btn-info {
  background: #569cd6;
  color: #ffffff;
}

.btn-info:hover:not(:disabled) {
  background: #6bb6ff;
}

.actions {
  padding: 30px;
  background: #2d2d30;
  border-top: 1px solid #3e3e42;
  text-align: center;
}

.status-message {
  padding: 15px 30px;
  margin: 0;
  text-align: center;
  font-weight: 500;
  font-size: 13px;
  transition: all 0.3s ease;
}

.status-message.success {
  background: #1e3a1e;
  color: #4ec9b0;
  border-top: 3px solid #4ec9b0;
}

.status-message.error {
  background: #3e1e1e;
  color: #f14c4c;
  border-top: 3px solid #f14c4c;
}

.status-message.info {
  background: #1e2a3e;
  color: #569cd6;
  border-top: 3px solid #569cd6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .settings-view {
    padding: 10px;
  }

  .container {
    margin: 0;
    border-radius: 4px;
  }

  header {
    padding: 20px;
  }

  header h1 {
    font-size: 20px;
  }

  .settings-content {
    padding: 20px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .actions {
    padding: 20px;
  }

  .btn {
    display: block;
    width: 100%;
    margin: 5px 0;
  }
}
</style>
