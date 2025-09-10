# MCP Feedback Collector - Vue3 重构项目结构

```
src/
├── main.ts                          # 应用入口文件 (TypeScript)
├── App.vue                          # 根组件
├── env.d.ts                         # 环境变量类型声明
├── vite-env.d.ts                    # Vite 类型声明
├── assets/                          # 静态资源
│   ├── icons/                       # 图标文件
│   ├── images/                      # 图片资源
│   └── styles/                      # 全局样式
│       ├── index.scss               # 样式入口
│       ├── variables.scss           # CSS 变量
│       ├── mixins.scss              # 样式混入
│       └── themes/                  # 主题样式
│           └── vscode-dark.scss     # VS Code 深色主题
├── components/                      # 全局通用组件
│   ├── common/                      # 基础公共组件
│   │   ├── AppButton/              # 按钮组件
│   │   │   ├── index.vue
│   │   │   └── types.ts
│   │   ├── AppLoading/             # 加载组件
│   │   │   ├── index.vue
│   │   │   └── types.ts
│   │   ├── CountdownTimer/         # 倒计时组件
│   │   │   ├── index.vue
│   │   │   └── types.ts
│   │   └── StatusMessage/          # 状态消息组件
│   │       ├── index.vue
│   │       └── types.ts
│   ├── business/                    # 业务公共组件
│   │   ├── ConnectionStatus/       # 连接状态组件
│   │   │   ├── index.vue
│   │   │   └── types.ts
│   │   ├── FeedbackForm/           # 反馈表单组件
│   │   │   ├── index.vue
│   │   │   └── types.ts
│   │   ├── ImageUpload/            # 图片上传组件
│   │   │   ├── index.vue
│   │   │   └── types.ts
│   │   └── WorkSummaryCard/        # 工作汇报卡片组件
│   │       ├── index.vue
│   │       └── types.ts
│   └── layout/                      # 布局组件
│       ├── AppHeader/              # 页面头部
│       │   ├── index.vue
│       │   └── types.ts
│       ├── AppNavigation/          # 导航组件
│       │   ├── index.vue
│       │   └── types.ts
│       └── AppLayout/              # 主布局
│           ├── index.vue
│           └── types.ts
├── composables/                     # 组合式函数 (Composables)
│   ├── useSocket.ts                # WebSocket 相关逻辑
│   ├── useFeedback.ts              # 反馈表单逻辑
│   ├── useImageUpload.ts           # 图片上传逻辑
│   ├── useWorkSummary.ts           # 工作汇报逻辑
│   ├── useCountdown.ts             # 倒计时逻辑
│   ├── useStatusMessage.ts         # 状态消息逻辑
│   └── useTheme.ts                 # 主题切换逻辑
├── stores/                          # Pinia 状态管理
│   ├── index.ts                    # Store 入口
│   ├── modules/                    # 状态模块
│   │   ├── connection.ts           # 连接状态管理
│   │   ├── feedback.ts             # 反馈数据管理
│   │   ├── workSummary.ts          # 工作汇报管理
│   │   ├── settings.ts             # 设置管理
│   │   └── ui.ts                   # UI 状态管理
│   └── types/                      # Store 类型定义
│       ├── connection.ts
│       ├── feedback.ts
│       ├── workSummary.ts
│       ├── settings.ts
│       └── ui.ts
├── services/                        # API 服务
│   ├── index.ts                    # 服务入口
│   ├── http.ts                     # HTTP 客户端配置
│   ├── socket.ts                   # WebSocket 服务
│   └── api/                        # API 接口定义
│       ├── feedback.ts             # 反馈相关 API
│       ├── settings.ts             # 设置相关 API
│       └── workSummary.ts          # 工作汇报 API
├── router/                          # Vue Router 配置
│   ├── index.ts                    # 路由入口
│   ├── routes.ts                   # 路由定义
│   ├── guards.ts                   # 路由守卫
│   └── types.ts                    # 路由类型定义
├── types/                           # 全局类型定义
│   ├── index.ts                    # 类型入口
│   ├── api.ts                      # API 类型
│   ├── common.ts                   # 通用类型
│   ├── feedback.ts                 # 反馈相关类型
│   ├── socket.ts                   # WebSocket 类型
│   └── ui.ts                       # UI 相关类型
├── utils/                           # 工具函数
│   ├── index.ts                    # 工具函数入口
│   ├── common.ts                   # 通用工具函数
│   ├── format.ts                   # 格式化工具
│   ├── validation.ts               # 验证工具
│   ├── storage.ts                  # 存储工具
│   └── constants.ts                # 常量定义
├── views/                           # 页面组件
│   ├── FeedbackView/               # 反馈页面
│   │   ├── index.vue
│   │   ├── components/             # 页面私有组件
│   │   └── types.ts
│   ├── SettingsView/               # 设置页面
│   │   ├── index.vue
│   │   ├── components/
│   │   └── types.ts
│   └── NotFoundView/               # 404 页面
│       ├── index.vue
│       └── types.ts
├── plugins/                         # 插件配置
│   ├── index.ts                    # 插件入口
│   ├── pinia.ts                    # Pinia 配置
│   ├── router.ts                   # Router 配置
│   └── global-components.ts        # 全局组件注册
└── tests/                          # 测试文件
    ├── unit/                       # 单元测试
    ├── integration/                # 集成测试
    └── __mocks__/                  # 测试模拟
```

## 主要改进点

### 1. 技术栈升级
- **状态管理**: Vuex → Pinia (Vue3 官方推荐)
- **类型安全**: JavaScript → TypeScript
- **组合式 API**: 全面使用 Composition API
- **代码组织**: 使用 Composables 模式

### 2. 项目结构优化
- **模块化设计**: 每个功能模块独立，便于维护
- **类型定义**: 统一的类型定义和接口规范
- **代码复用**: Composables 实现逻辑复用
- **组件封装**: 更细粒度的组件拆分

### 3. 开发体验提升
- **TypeScript 支持**: 完整的类型推导和检查
- **自动导入**: 支持组件和工具函数自动导入
- **代码规范**: ESLint + Prettier 配置
- **开发工具**: 更好的 IDE 支持和调试体验

### 4. 性能优化
- **按需加载**: 路由和组件的懒加载
- **响应式优化**: 合理使用 ref、reactive 和 computed
- **内存管理**: 更好的组件生命周期管理
- **打包优化**: Vite 构建优化配置