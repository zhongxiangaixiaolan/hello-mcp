import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// 创建Vue应用实例
const app = createApp(App)

// 注册路由和状态管理
app.use(router)
app.use(store)

// 挂载应用到DOM
app.mount('#app')