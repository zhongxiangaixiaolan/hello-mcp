<template>
  <div class="app-container">
    <!-- 连接状态显示 -->
    <ConnectionStatus />
    
    <!-- 页面标题 -->
    <header class="page-header">
      <h1 class="page-title">
        <span>📝</span>
        MCP Feedback Collector
      </h1>
      <p class="page-subtitle">专业的反馈收集和数据库管理工具</p>
    </header>

    <!-- 导航标签 -->
    <nav class="navigation">
      <NavigationBar />
    </nav>

    <!-- 状态消息区域 -->
    <div id="status-messages"></div>

    <!-- 超时倒计时显示 -->
    <div id="timeout-countdown" class="timeout-countdown" style="display: none;"></div>

    <!-- 主要内容区域 -->
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script>
import ConnectionStatus from './components/common/ConnectionStatus.vue'
import NavigationBar from './components/layout/NavigationBar.vue'

export default {
  name: 'App',
  components: {
    ConnectionStatus,
    NavigationBar
  },
  setup() {
    // 应用级别的状态和方法可以在这里定义
    
    return {
      // 返回需要在模板中使用的数据和方法
    }
  }
}
</script>

<style>
/* VS Code 风格的深色主题 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: "Segoe UI", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif;
  background: #1e1e1e;
  color: #cccccc;
  font-size: 13px;
  line-height: 1.5;
  padding: 20px;
}

/* 主容器 */
.app-container {
  max-width: 800px;
  margin: 0 auto;
}

/* 页面标题 */
.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-subtitle {
  font-size: 14px;
  color: #969696;
}

/* 其他全局样式可以在这里添加 */
</style>