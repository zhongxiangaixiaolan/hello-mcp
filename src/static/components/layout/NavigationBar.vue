<template>
  <div class="nav-tabs">
    <button
      class="nav-tab"
      :class="{ active: currentRoute === '/feedback' || currentRoute === '/' }"
      @click="switchTab('feedback')"
    >
      📋 反馈收集
    </button>
    <button
      class="nav-tab"
      :class="{ active: currentRoute === '/settings' }"
      @click="switchTab('settings')"
    >
      ⚙️ 设置
    </button>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

export default {
  name: 'NavigationBar',
  setup() {
    const router = useRouter()
    const route = useRoute()

    // 获取当前路由
    const currentRoute = computed(() => route.path)

    // 切换标签页
    const switchTab = (tab) => {
      // 路由跳转
      if (tab === 'feedback') {
        router.push('/feedback')
      } else if (tab === 'settings') {
        router.push('/settings')
      }
    }

    return {
      currentRoute,
      switchTab
    }
  }
}
</script>

<style scoped>
.nav-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  border-bottom: 1px solid #3e3e42;
  padding-bottom: 12px;
}

.nav-tab {
  background: #2d2d30;
  border: 1px solid #3e3e42;
  color: #cccccc;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.nav-tab:hover {
  background: #37373d;
  border-color: #4ec9b0;
  color: #ffffff;
}

.nav-tab.active {
  background: #0e639c;
  border-color: #007acc;
  color: #ffffff;
}

.nav-tab.active:hover {
  background: #1177bb;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .nav-tabs {
    flex-direction: column;
    gap: 4px;
  }
  
  .nav-tab {
    width: 100%;
    justify-content: center;
  }
}
</style>
