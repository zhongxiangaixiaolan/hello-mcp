import { createRouter, createWebHistory } from 'vue-router'
import FeedbackView from '../views/FeedbackView.vue'
import SettingsView from '../views/SettingsView.vue'

// 定义路由
const routes = [
  {
    path: '/',
    name: 'Feedback',
    component: FeedbackView
  },
  {
    path: '/feedback',
    name: 'FeedbackView',
    component: FeedbackView
  },
  {
    path: '/settings',
    name: 'SettingsView',
    component: SettingsView
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router