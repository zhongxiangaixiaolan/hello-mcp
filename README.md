# 🎯 Hello MCP
基于Node.js的MCP工具，支持AI工作汇报和用户反馈收集。

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
