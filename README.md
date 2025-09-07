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

## 🗄️ 数据库工具

Hello MCP 现在集成了强大的数据库工具，支持以下功能：

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

### 使用示例
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

详细使用说明请参考 [DATABASE_TOOLS.md](./DATABASE_TOOLS.md)

## 📄 许可证

MIT License - 作者：Aqing

## 🔧 本地开发模式配置

### 方式一：构建后运行（推荐）

1. 克隆项目并安装依赖：
```bash
git clone <repository-url>
cd mcp-feedback-collector-web
npm install
```

2. 构建项目：
```bash
npm run build
```

3. 在Claude Desktop配置文件中添加：
```json
{
  "mcpServers": {
    "hello-mcp": {
      "command": "node",
      "args": ["F:/mcp/feedback/mcp-feedback-collector-web/dist/cli.js"],
      "env": {
        "MCP_WEB_PORT": "5000",
        "MCP_DIALOG_TIMEOUT": "60000"
      }
    }
  }
}
```

### 方式二：开发模式（直接运行TypeScript）

适合开发调试，无需每次构建：

```json
{
  "mcpServers": {
    "hello-mcp": {
      "command": "npx",
      "args": ["tsx", "F:/mcp/feedback/mcp-feedback-collector-web/src/cli.ts"],
      "env": {
        "MCP_WEB_PORT": "5050",
        "MCP_DIALOG_TIMEOUT": "60000",
        "NODE_ENV": "development"
      }
    }
  }
}
```

**注意**：
- 将路径替换为您的实际项目路径
- 使用绝对路径以确保正确运行
- 开发模式启动稍慢但支持热重载
