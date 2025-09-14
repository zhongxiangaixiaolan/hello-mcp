# 🎯 Hello MCP
基于Node.js的MCP工具，支持AI工作汇报、用户反馈收集和数据库操作。

## 🚀 快速开始

### 安装和运行

```bash
# 直接运行（推荐）
npx hello-mcp

# 或者全局安装
npm install -g hello-mcp
hello-mcp
```

### MCP配置

在Claude Desktop配置文件中添加：

```json
{
  "mcpServers": {
    "hello-mcp": {
      "command": "npx",
      "args": ["hello-mcp"],
      "env": {
        "MCP_WEB_PORT": "5000",
        "MCP_DIALOG_TIMEOUT": "999"
      }
    }
  }
}
```

## ✨ 功能特性

- 🎯 **AI工作汇报收集** - 通过Web界面收集用户对AI工作的反馈
- 🗄️ **数据库操作** - 支持MySQL和PostgreSQL数据库的连接和操作
- 🖼️ **图片支持** - 支持上传和处理图片反馈
- 🔄 **实时通信** - 基于Socket.IO的实时数据传输
- 🛡️ **安全可靠** - 内置安全措施和错误处理
- 📱 **响应式设计** - 适配各种设备和屏幕尺寸
- 🎨 **现代UI** - 简洁美观的用户界面
- 🔧 **易于配置** - 灵活的配置选项和环境变量支持

## 🏗️ 项目架构

### 前端架构 (src/static/)
```
src/static/
├── index.html                    # 入口HTML文件
├── main.js                       # 应用入口文件
├── App.vue                       # 根组件
├── vite.config.js               # Vite构建配置
├── components/                  # 组件目录
│   ├── common/                  # 通用组件
│   │   ├── Collapse.vue         # 折叠面板
│   │   ├── ConnectionStatus.vue # 连接状态
│   │   ├── CountdownTimer.vue   # 倒计时器
│   │   ├── LoadingButton.vue    # 加载按钮
│   │   ├── Modal.vue            # 模态框
│   │   └── StatusMessage.vue    # 状态消息
│   ├── database/                # 数据库相关组件
│   │   └── DatabaseConnectionModal.vue # 数据库连接管理
│   ├── feedback/                # 反馈相关组件
│   │   ├── FeedbackForm.vue     # 反馈表单
│   │   ├── ImageUpload.vue      # 图片上传
│   │   └── WorkSummaryCard.vue  # 工作汇报卡片
│   ├── layout/                  # 布局组件
│   │   └── NavigationBar.vue    # 导航栏
│   └── settings/                # 设置相关组件
│       ├── AdvancedSettings.vue # 高级设置
│       └── SettingsCard.vue     # 设置卡片
├── router/                      # 路由配置
│   └── index.js                 # 路由定义
├── store/                       # Vuex状态管理
│   └── index.js                 # 状态管理配置
└── views/                       # 页面组件
    ├── FeedbackView.vue         # 反馈页面
    └── SettingsView.vue         # 设置页面
```

**技术栈**: Vue 3 + Vite 5.0 + Vuex 4.1 + Vue Router 4.2 + Socket.IO Client

### 后端架构 (src/)
```
src/
├── cli.ts                       # CLI入口文件
├── index.ts                     # 主入口文件
├── config/                      # 配置管理
│   ├── index.ts                 # 配置创建和验证
│   └── settings-storage.ts      # 设置存储
├── database/                    # 数据库模块
│   ├── connection-manager.ts    # 连接管理器
│   ├── database-service.ts      # 数据库服务
│   ├── unified-database-tools.ts # 统一数据库工具
│   ├── types.ts                 # 数据库类型定义
│   └── index.ts                 # 模块导出
├── server/                      # 服务器模块
│   ├── mcp-server.ts           # MCP服务器实现
│   └── web-server.ts           # Web服务器实现
├── types/                       # 类型定义
│   └── index.ts                 # 全局类型定义
├── utils/                       # 工具函数
│   ├── image-processor.ts       # 图片处理工具
│   ├── image-to-text-service.ts # 图片转文字服务
│   ├── logger.ts               # 日志工具
│   ├── performance-monitor.ts   # 性能监控
│   ├── port-manager.ts         # 端口管理
│   ├── process-manager.ts      # 进程管理
│   └── session-storage.ts      # 会话存储
└── __tests__/                   # 测试文件
    ├── basic.test.ts           # 基础测试
    ├── config.test.ts          # 配置测试
    ├── image-processor.test.ts # 图片处理测试
    ├── integration.test.ts     # 集成测试
    └── port-manager.test.ts    # 端口管理测试
```

**技术栈**: Node.js + TypeScript + Express + Socket.IO + MCP SDK

## 🗄️ 数据库工具

### 支持的数据库
- **MySQL** - 高性能关系型数据库
- **PostgreSQL** - 功能丰富的开源数据库

### 统一工具：database_operation
通过单一工具支持所有数据库操作：
- `connect` - 连接数据库
- `query` - 执行SELECT查询
- `execute` - 执行INSERT/UPDATE/DELETE命令
- `list_databases` - 列出数据库
- `list_tables` - 列出表
- `describe_table` - 获取表结构
- `disconnect` - 断开连接
- `status` - 获取连接状态

### 连接示例
```json
{
  "operation": "connect",
  "connectionId": "my-db",
  "connectionConfig": {
    "type": "mysql",
    "host": "localhost",
    "port": 3306,
    "database": "testdb",
    "user": "root",
    "password": "password"
  }
}
```

### 查询示例
```json
{
  "operation": "query",
  "connectionId": "my-db",
  "sql": "SELECT * FROM users WHERE age > ?",
  "params": [18]
}
```

## ⚙️ 配置参数

### 环境变量配置
- `MCP_WEB_PORT` - Web服务端口 (默认: 5000)
- `MCP_DIALOG_TIMEOUT` - 对话超时时间 (默认: 60000ms)
- `MCP_API_BASE_URL` - API基础URL (默认: https://api.ssopen.top)
- `MCP_DEFAULT_MODEL` - 默认AI模型 (默认: gpt-4o-mini)
- `MCP_ENABLE_DATABASE_TOOLS` - 启用数据库工具 (默认: true)
- `MCP_ENABLE_IMAGE_TO_TEXT` - 启用图片转文字 (默认: true)
- `MCP_MAX_FILE_SIZE` - 最大文件大小 (默认: 10MB)
- `LOG_LEVEL` - 日志级别 (默认: info)

### Web界面配置参数详细列表

#### 反馈收集设置
- **超时时间** (dialogTimeout)
  - 类型: 数字 (秒)
  - 范围: 10-3600秒
  - 默认值: 60秒
  - 说明: 反馈收集的超时时间

- **自动打开浏览器** (autoOpenBrowser)
  - 类型: 布尔值 (开关)
  - 默认值: true
  - 说明: 是否在启动时自动打开浏览器

- **工作汇报模板** (defaultWorkSummary)
  - 类型: 文本 (多行)
  - 默认值: 空
  - 说明: 默认的工作汇报内容模板

#### 数据库操作设置
- **查询超时** (defaultTimeout)
  - 类型: 数字 (毫秒)
  - 范围: 1000-300000毫秒
  - 默认值: 30000毫秒 (30秒)
  - 说明: 数据库查询的超时时间

- **最大行数** (defaultMaxRows)
  - 类型: 数字
  - 范围: 1-100000行
  - 默认值: 1000行
  - 说明: 查询结果最大返回行数

- **默认模式** (defaultSchema)
  - 类型: 文本
  - 默认值: 空 (PostgreSQL使用)
  - 说明: PostgreSQL数据库的默认模式名称

#### 数据库连接管理
每个数据库连接包含以下配置参数：

- **连接ID** (id)
  - 类型: 文本 (必填)
  - 说明: 连接的唯一标识符
  - 示例: "main-db", "analytics-db"

- **数据库类型** (type)
  - 类型: 选择 (必填)
  - 选项: MySQL, PostgreSQL
  - 说明: 数据库服务器类型

- **主机地址** (host)
  - 类型: 文本 (必填)
  - 默认值: localhost
  - 说明: 数据库服务器地址

- **端口** (port)
  - 类型: 数字 (必填)
  - 范围: 1-65535
  - 默认值: MySQL=3306, PostgreSQL=5432
  - 说明: 数据库服务器端口

- **数据库名** (database)
  - 类型: 文本 (必填)
  - 说明: 要连接的数据库名称

- **用户名** (user)
  - 类型: 文本 (必填)
  - 说明: 数据库用户名

- **密码** (password)
  - 类型: 密码 (必填)
  - 说明: 数据库密码

- **SSL连接** (ssl)
  - 类型: 布尔值 (开关)
  - 默认值: false
  - 说明: 是否启用SSL安全连接

#### 连接管理功能
- **连接测试** - 测试单个或所有数据库连接
- **连接状态监控** - 实时显示连接状态 (已连接/错误/测试中/未知)
- **连接统计** - 显示已配置、活跃、MySQL、PostgreSQL连接数量
- **连接编辑** - 修改现有连接配置
- **连接删除** - 删除不需要的连接 (需确认)

## 🔧 本地开发

### 构建运行
```bash
git clone <repository-url>
cd mcp-feedback-collector-web
npm install
npm run build
```

### 开发模式
```bash
npm run dev        # 后端开发模式
npm run dev-vue    # 前端开发模式
```

## 📄 许可证

MIT License - 作者：Aqing
