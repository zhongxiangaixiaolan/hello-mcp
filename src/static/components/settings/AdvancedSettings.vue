<template>
  <div class="settings-section">
    <div class="section-header">
      <h2>高级设置</h2>
      <p class="section-description">配置高级功能和性能选项</p>
    </div>
    
    <div class="settings-group">
      <!-- 性能设置 -->
      <div class="setting-item">
        <label class="setting-label">
          <span class="label-text">缓存大小</span>
          <span class="label-detail">MB</span>
        </label>
        <div class="range-container">
          <input 
            type="range" 
            v-model.number="settings.cacheSize"
            min="64" 
            max="1024" 
            step="64"
            class="setting-range"
          >
          <span class="range-value">{{ settings.cacheSize }}</span>
        </div>
      </div>
      
      <div class="setting-item">
        <label class="setting-label">
          <span class="label-text">并发连接数</span>
        </label>
        <input 
          type="number" 
          v-model.number="settings.maxConnections"
          min="1" 
          max="50" 
          class="setting-input"
        >
      </div>

      <!-- 日志设置 -->
      <div class="setting-item">
        <label class="setting-label">
          <span class="label-text">启用调试日志</span>
        </label>
        <div class="toggle-switch">
          <input 
            type="checkbox" 
            v-model="settings.enableDebugLog"
            class="toggle-input"
          >
          <label class="toggle-label"></label>
        </div>
      </div>
      
      <div class="setting-item">
        <label class="setting-label">
          <span class="label-text">日志级别</span>
        </label>
        <select v-model="settings.logLevel" class="setting-select">
          <option value="error">错误</option>
          <option value="warn">警告</option>
          <option value="info">信息</option>
          <option value="debug">调试</option>
        </select>
      </div>
      
      <div class="setting-item">
        <label class="setting-label">
          <span class="label-text">日志保留天数</span>
        </label>
        <input 
          type="number" 
          v-model.number="settings.logRetentionDays"
          min="1" 
          max="365" 
          class="setting-input"
        >
      </div>

      <!-- 安全设置 -->
      <div class="setting-item">
        <label class="setting-label">
          <span class="label-text">强制使用 SSL</span>
        </label>
        <div class="toggle-switch">
          <input 
            type="checkbox" 
            v-model="settings.enableSSL"
            class="toggle-input"
          >
          <label class="toggle-label"></label>
        </div>
      </div>
      
      <div class="setting-item">
        <label class="setting-label">
          <span class="label-text">会话超时</span>
          <span class="label-detail">分钟</span>
        </label>
        <input 
          type="number" 
          v-model.number="settings.sessionTimeout"
          min="5" 
          max="1440" 
          class="setting-input"
        >
      </div>
      
      <div class="setting-item">
        <label class="setting-label">
          <span class="label-text">最大重试次数</span>
        </label>
        <input 
          type="number" 
          v-model.number="settings.maxRetries"
          min="1" 
          max="10" 
          class="setting-input"
        >
      </div>

      <!-- 实验性功能 -->
      <div class="setting-item">
        <label class="setting-label">
          <span class="label-text">启用 Beta 功能</span>
          <span class="label-warning">可能不稳定</span>
        </label>
        <div class="toggle-switch">
          <input 
            type="checkbox" 
            v-model="settings.enableBetaFeatures"
            class="toggle-input"
          >
          <label class="toggle-label"></label>
        </div>
      </div>
      
      <div class="setting-item">
        <label class="setting-label">
          <span class="label-text">启用使用分析</span>
        </label>
        <div class="toggle-switch">
          <input 
            type="checkbox" 
            v-model="settings.enableAnalytics"
            class="toggle-input"
          >
          <label class="toggle-label"></label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const settings = reactive({
  cacheSize: 256,
  maxConnections: 10,
  enableDebugLog: false,
  logLevel: 'info',
  logRetentionDays: 30,
  enableSSL: true,
  sessionTimeout: 60,
  maxRetries: 3,
  enableBetaFeatures: false,
  enableAnalytics: true
})
</script>

<style scoped>
/* 苹果简约风格 */
.settings-section {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e5e5e7;
  overflow: hidden;
}

.section-header {
  padding: 24px 24px 16px 24px;
  border-bottom: 1px solid #e5e5e7;
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

.label-warning {
  font-size: 12px;
  color: #ff9500;
  font-weight: 500;
}

.setting-input,
.setting-select {
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
.setting-select:focus {
  outline: none;
  border-color: #007aff;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.range-container {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 200px;
}

.setting-range {
  flex: 1;
  height: 6px;
  background: #d1d1d6;
  border-radius: 3px;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
}

.setting-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  background: #007aff;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.setting-range::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: #007aff;
  border-radius: 50%;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.range-value {
  font-size: 14px;
  color: #007aff;
  font-weight: 600;
  min-width: 40px;
  text-align: center;
}

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

/* 响应式设计 */
@media (max-width: 768px) {
  .section-header {
    padding: 20px 16px 12px 16px;
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

  .range-container {
    min-width: auto;
  }
}
</style>
