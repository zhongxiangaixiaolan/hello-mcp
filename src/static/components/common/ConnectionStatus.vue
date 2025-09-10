<template>
  <div class="connection-status" :class="connectionStatus.status">
    {{ connectionStatus.text }}
  </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'ConnectionStatus',
  setup() {
    const store = useStore()
    
    // 从Vuex获取连接状态
    const connectionStatus = computed(() => store.getters.connectionStatus)
    
    return {
      connectionStatus
    }
  }
}
</script>

<style scoped>
.connection-status {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.connection-status.connected {
  background: #4ec9b0;
  color: #1e1e1e;
}

.connection-status.disconnected {
  background: #f14c4c;
  color: white;
}
</style>