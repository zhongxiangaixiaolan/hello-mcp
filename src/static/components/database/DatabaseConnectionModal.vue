<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h2>
          <span class="modal-icon">🔗</span>
          {{ editingConnectionId ? '编辑数据库连接' : '数据库连接管理' }}
        </h2>
        <button type="button" class="modal-close" @click="$emit('close')">
          <span>✕</span>
        </button>
      </div>

      <div class="modal-body">
        <!-- 连接列表视图 -->
        <div v-if="!editingConnectionId && !showAddForm" class="connections-list-view">
          <div class="list-header">
            <div class="list-title">
              <span>已配置的连接 ({{ Object.keys(connections).length }})</span>
            </div>
            <button type="button" class="btn btn-primary btn-sm" @click="showAddForm = true">
              <span class="btn-icon">➕</span>
              添加连接
            </button>
          </div>

          <div v-if="Object.keys(connections).length === 0" class="empty-state">
            <div class="empty-icon">🔌</div>
            <div class="empty-title">暂无数据库连接</div>
            <div class="empty-text">点击上方按钮添加您的第一个数据库连接</div>
          </div>

          <div v-else class="connections-grid">
            <div 
              v-for="(connection, connectionId) in connections" 
              :key="connectionId" 
              class="connection-item"
            >
              <div class="connection-header">
                <div class="connection-title">
                  <span class="db-type-icon" :class="connection.type">
                    <span v-if="connection.type === 'mysql'">🐬</span>
                    <span v-else-if="connection.type === 'postgresql'">🐘</span>
                    <span v-else>🗄️</span>
                  </span>
                  <span class="connection-name">{{ connection.id }}</span>
                </div>
                <div class="connection-actions">
                  <button 
                    type="button" 
                    class="btn-icon-small" 
                    @click="$emit('test', connectionId)"
                    title="测试连接"
                  >
                    🧪
                  </button>
                  <button 
                    type="button" 
                    class="btn-icon-small" 
                    @click="editConnection(connectionId)"
                    title="编辑连接"
                  >
                    ✏️
                  </button>
                  <button 
                    type="button" 
                    class="btn-icon-small danger" 
                    @click="confirmDelete(connectionId)"
                    title="删除连接"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div class="connection-details">
                <div class="detail-item">
                  <span class="detail-label">类型:</span>
                  <span class="detail-value">{{ connection.type.toUpperCase() }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">地址:</span>
                  <span class="detail-value">{{ connection.host }}:{{ connection.port }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">数据库:</span>
                  <span class="detail-value">{{ connection.database }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">用户:</span>
                  <span class="detail-value">{{ connection.user }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 连接表单视图 -->
        <div v-else class="connection-form-view">
          <div class="form-header">
            <button type="button" class="btn btn-secondary btn-sm" @click="backToList">
              <span class="btn-icon">←</span>
              返回列表
            </button>
            <h3>{{ editingConnectionId ? '编辑连接' : '添加新连接' }}</h3>
          </div>

          <form @submit.prevent="handleSubmit" class="connection-form">
            <div class="form-grid">
              <div class="form-group">
                <label for="connectionId">连接ID *</label>
                <input 
                  type="text" 
                  id="connectionId"
                  v-model="formData.id" 
                  placeholder="例如：main-db" 
                  required
                  class="form-input"
                  :disabled="!!editingConnectionId"
                >
                <small class="form-hint">唯一标识符，用于引用此连接</small>
              </div>
              
              <div class="form-group">
                <label for="connectionType">数据库类型 *</label>
                <select 
                  id="connectionType"
                  v-model="formData.type" 
                  required 
                  @change="updateDefaultPort"
                  class="form-select"
                >
                  <option value="mysql">MySQL</option>
                  <option value="postgresql">PostgreSQL</option>
                </select>
              </div>

              <div class="form-group">
                <label for="host">主机地址 *</label>
                <input 
                  type="text" 
                  id="host"
                  v-model="formData.host" 
                  placeholder="localhost" 
                  required
                  class="form-input"
                >
              </div>
              
              <div class="form-group">
                <label for="port">端口 *</label>
                <input 
                  type="number" 
                  id="port"
                  v-model.number="formData.port" 
                  min="1" 
                  max="65535" 
                  required
                  class="form-input"
                >
              </div>

              <div class="form-group">
                <label for="database">数据库名 *</label>
                <input 
                  type="text" 
                  id="database"
                  v-model="formData.database" 
                  placeholder="数据库名" 
                  required
                  class="form-input"
                >
              </div>
              
              <div class="form-group">
                <label for="user">用户名 *</label>
                <input 
                  type="text" 
                  id="user"
                  v-model="formData.user" 
                  placeholder="用户名" 
                  required
                  class="form-input"
                >
              </div>

              <div class="form-group">
                <label for="password">密码 *</label>
                <input 
                  type="password" 
                  id="password"
                  v-model="formData.password" 
                  placeholder="密码" 
                  required
                  class="form-input"
                >
              </div>
              
              <div class="form-group">
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    v-model="formData.ssl"
                    class="form-checkbox"
                  >
                  <span class="checkbox-custom"></span>
                  启用SSL连接
                </label>
                <small class="form-hint">推荐在生产环境中启用</small>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-secondary" @click="backToList">
                取消
              </button>
              <button type="button" class="btn btn-info" @click="testCurrentConnection" :disabled="!isFormValid">
                <span class="btn-icon">🧪</span>
                测试连接
              </button>
              <button type="submit" class="btn btn-primary" :disabled="!isFormValid">
                <span class="btn-icon">💾</span>
                {{ editingConnectionId ? '更新连接' : '保存连接' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <div v-if="showDeleteConfirm" class="confirm-overlay" @click="cancelDelete">
      <div class="confirm-dialog" @click.stop>
        <div class="confirm-header">
          <span class="confirm-icon">⚠️</span>
          <h3>确认删除</h3>
        </div>
        <div class="confirm-body">
          <p>确定要删除连接 <strong>{{ deleteConnectionId }}</strong> 吗？</p>
          <p class="confirm-warning">此操作无法撤销。</p>
        </div>
        <div class="confirm-actions">
          <button type="button" class="btn btn-secondary" @click="cancelDelete">
            取消
          </button>
          <button type="button" class="btn btn-danger" @click="confirmDeleteConnection">
            <span class="btn-icon">🗑️</span>
            删除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'

const props = defineProps({
  connections: {
    type: Object,
    default: () => ({})
  },
  editingConnectionId: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['close', 'save', 'delete', 'test'])

// 响应式数据
const showAddForm = ref(false)
const showDeleteConfirm = ref(false)
const deleteConnectionId = ref(null)

const formData = reactive({
  id: '',
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  database: '',
  user: '',
  password: '',
  ssl: false
})

// 计算属性
const isFormValid = computed(() => {
  return formData.id && formData.type && formData.host && 
         formData.port && formData.database && formData.user && formData.password
})

// 监听编辑连接ID变化
watch(() => props.editingConnectionId, (newId) => {
  if (newId && props.connections[newId]) {
    const connection = props.connections[newId]
    Object.assign(formData, connection)
    showAddForm.value = true
  } else {
    resetForm()
    showAddForm.value = false
  }
}, { immediate: true })

// 方法
const resetForm = () => {
  Object.assign(formData, {
    id: '',
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    database: '',
    user: '',
    password: '',
    ssl: false
  })
}

const updateDefaultPort = () => {
  if (formData.type === 'mysql') {
    formData.port = 3306
  } else if (formData.type === 'postgresql') {
    formData.port = 5432
  }
}

const backToList = () => {
  showAddForm.value = false
  resetForm()
}

const editConnection = (connectionId) => {
  const connection = props.connections[connectionId]
  Object.assign(formData, connection)
  showAddForm.value = true
}

const handleSubmit = () => {
  if (isFormValid.value) {
    emit('save', { ...formData })
    resetForm()
    showAddForm.value = false
  }
}

const testCurrentConnection = () => {
  if (isFormValid.value) {
    emit('test', formData.id, { ...formData })
  }
}

const confirmDelete = (connectionId) => {
  deleteConnectionId.value = connectionId
  showDeleteConfirm.value = true
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
  deleteConnectionId.value = null
}

const confirmDeleteConnection = () => {
  if (deleteConnectionId.value) {
    emit('delete', deleteConnectionId.value)
    cancelDelete()
  }
}

const handleOverlayClick = () => {
  emit('close')
}
</script>

<style scoped>
/* 弹窗样式 */
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
  backdrop-filter: blur(4px);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-container {
  background: #252526;
  border: 1px solid #3e3e42;
  border-radius: 12px;
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  background: linear-gradient(135deg, #2d2d30, #3e3e42);
  border-bottom: 1px solid #4e4e52;
  padding: 25px 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.modal-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #4ec9b0, #569cd6, #c586c0);
}

.modal-header h2 {
  font-size: 22px;
  font-weight: 600;
  color: #4ec9b0;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-icon {
  font-size: 24px;
}

.modal-close {
  background: transparent;
  border: 1px solid #3e3e42;
  border-radius: 6px;
  color: #cccccc;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 16px;
  font-weight: bold;
}

.modal-close:hover {
  background: #f44747;
  border-color: #f44747;
  color: white;
}

.modal-body {
  padding: 30px;
  max-height: calc(90vh - 120px);
  overflow-y: auto;
}

/* 连接列表视图样式 */
.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid #3e3e42;
}

.list-title {
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
}

.btn-sm {
  padding: 8px 16px;
  font-size: 13px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999999;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 20px;
  opacity: 0.6;
}

.empty-title {
  font-size: 20px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 10px;
}

.empty-text {
  font-size: 14px;
  line-height: 1.5;
}

.connections-grid {
  display: grid;
  gap: 20px;
}

.connection-item {
  background: linear-gradient(135deg, #1e1e1e, #252526);
  border: 2px solid #3e3e42;
  border-radius: 10px;
  padding: 20px;
  transition: all 0.3s ease;
}

.connection-item:hover {
  border-color: #4ec9b0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.connection-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
}

.connection-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.db-type-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.db-type-icon.mysql {
  background: linear-gradient(135deg, #4479a1, #00758f);
}

.db-type-icon.postgresql {
  background: linear-gradient(135deg, #336791, #4169e1);
}

.connection-name {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
}

.connection-actions {
  display: flex;
  gap: 8px;
}

.btn-icon-small {
  background: transparent;
  border: 1px solid #3e3e42;
  border-radius: 6px;
  color: #cccccc;
  padding: 6px 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.btn-icon-small:hover {
  background: #3e3e42;
  border-color: #4e4e52;
}

.btn-icon-small.danger:hover {
  background: #f44747;
  border-color: #f44747;
  color: white;
}

.connection-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #2d2d30;
  border-radius: 6px;
  border: 1px solid #3e3e42;
}

.detail-label {
  font-size: 12px;
  color: #999999;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 13px;
  color: #cccccc;
  font-weight: 500;
}

/* 连接表单视图样式 */
.form-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 2px solid #3e3e42;
}

.form-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: #4ec9b0;
  margin: 0;
}

.connection-form {
  max-width: 800px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #ffffff;
  font-size: 14px;
}

.form-input,
.form-select {
  background: #2d2d30;
  border: 2px solid #3e3e42;
  border-radius: 8px;
  color: #cccccc;
  padding: 12px 16px;
  font-size: 14px;
  transition: all 0.3s ease;
  font-family: inherit;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #4ec9b0;
  box-shadow: 0 0 0 3px rgba(78, 201, 176, 0.1);
  background: #1e1e1e;
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-hint {
  color: #999999;
  font-size: 12px;
  font-style: italic;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-weight: 500;
  color: #ffffff;
}

.form-checkbox {
  display: none;
}

.checkbox-custom {
  width: 20px;
  height: 20px;
  border: 2px solid #3e3e42;
  border-radius: 4px;
  background: #2d2d30;
  position: relative;
  transition: all 0.3s ease;
}

.form-checkbox:checked + .checkbox-custom {
  background: #4ec9b0;
  border-color: #4ec9b0;
}

.form-checkbox:checked + .checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid #3e3e42;
}

/* 按钮样式 */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.btn-primary {
  background: linear-gradient(135deg, #4ec9b0, #569cd6);
  color: white;
  box-shadow: 0 4px 12px rgba(78, 201, 176, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(78, 201, 176, 0.4);
}

.btn-secondary {
  background: #3e3e42;
  color: #cccccc;
  border: 1px solid #4e4e52;
}

.btn-secondary:hover {
  background: #4e4e52;
  color: #ffffff;
}

.btn-info {
  background: linear-gradient(135deg, #569cd6, #4ec9b0);
  color: white;
  box-shadow: 0 4px 12px rgba(86, 156, 214, 0.3);
}

.btn-info:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(86, 156, 214, 0.4);
}

.btn-danger {
  background: linear-gradient(135deg, #f44747, #d73a49);
  color: white;
  box-shadow: 0 4px 12px rgba(244, 71, 71, 0.3);
}

.btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(244, 71, 71, 0.4);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.btn-icon {
  font-size: 16px;
}

/* 删除确认弹窗样式 */
.confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  animation: fadeIn 0.3s ease;
}

.confirm-dialog {
  background: #252526;
  border: 1px solid #3e3e42;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
  animation: slideIn 0.3s ease;
}

.confirm-header {
  background: linear-gradient(135deg, #2d2d30, #3e3e42);
  border-bottom: 1px solid #4e4e52;
  padding: 20px 25px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.confirm-icon {
  font-size: 24px;
}

.confirm-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #f44747;
  margin: 0;
}

.confirm-body {
  padding: 25px;
}

.confirm-body p {
  margin: 0 0 15px 0;
  color: #cccccc;
  line-height: 1.5;
}

.confirm-warning {
  color: #ffcc02;
  font-size: 13px;
  font-style: italic;
}

.confirm-actions {
  padding: 20px 25px;
  border-top: 1px solid #3e3e42;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .modal-container {
    width: 95%;
    max-height: 95vh;
  }

  .modal-header {
    padding: 20px;
  }

  .modal-body {
    padding: 20px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .connection-details {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }

  .confirm-actions {
    flex-direction: column;
  }
}
</style>
