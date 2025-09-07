# Cursor MCP 配置指南

## 概述

这个指南将帮助你在 Cursor IDE 中配置 Hello MCP 数据库工具，让你可以通过 AI 助手直接操作数据库。

## 前置要求

1. **Node.js 18+** - 确保已安装 Node.js 18 或更高版本
2. **Cursor IDE** - 确保已安装最新版本的 Cursor
3. **Hello MCP 项目** - 已构建的 Hello MCP 项目

## 配置步骤

### 1. 准备项目

确保你的 Hello MCP 项目已经构建：

```bash
cd /path/to/hello-mcp-project
npm install
npm run build
```

### 2. 配置 Cursor MCP

在 Cursor 中，打开设置并找到 MCP 配置部分，添加以下配置：

```json
{
  "mcpServers": {
    "hello-mcp-database": {
      "command": "node",
      "args": [
        "dist/cli.js",
        "start",
        "--stdio"
      ],
      "cwd": "/absolute/path/to/your/hello-mcp-project",
      "env": {
        "MCP_ENABLE_DATABASE_TOOLS": "true",
        "MCP_DEFAULT_DB_CONNECTION": "main-db",
        "NODE_ENV": "production"
      }
    }
  }
}
```

**重要提示：** 请将 `cwd` 路径替换为你的 Hello MCP 项目的绝对路径。

### 3. 环境变量配置（可选）

你可以通过环境变量进一步配置工具：

```json
{
  "mcpServers": {
    "hello-mcp-database": {
      "command": "node",
      "args": [
        "dist/cli.js",
        "start",
        "--stdio"
      ],
      "cwd": "/absolute/path/to/your/hello-mcp-project",
      "env": {
        "MCP_ENABLE_DATABASE_TOOLS": "true",
        "MCP_DEFAULT_DB_CONNECTION": "main-db",
        "NODE_ENV": "production",
        "LOG_LEVEL": "info",
        "MCP_WEB_PORT": "5000"
      }
    }
  }
}
```

### 4. 验证配置

重启 Cursor 后，你应该能够在 AI 助手中使用以下工具：

1. **database_operation** - 统一的数据库操作工具
2. **collect_feedback** - 用户反馈收集工具

## 使用示例

配置完成后，你可以在 Cursor 中向 AI 助手发送如下请求：

### 连接数据库

```
请帮我连接到 MySQL 数据库：
- 主机：localhost
- 端口：3306
- 数据库：myapp
- 用户：root
- 密码：password123
```

### 查询数据

```
请查询 users 表中年龄大于 18 岁的所有用户信息
```

### 创建表

```
请创建一个产品表，包含以下字段：
- id（自增主键）
- name（产品名称，不能为空）
- price（价格，小数类型）
- created_at（创建时间，默认当前时间）
```

## 故障排除

### 常见问题

1. **工具未加载**
   - 检查路径是否正确（必须是绝对路径）
   - 确保项目已正确构建（存在 `dist/cli.js` 文件）
   - 重启 Cursor IDE

2. **权限错误**
   - 确保 Node.js 有执行权限
   - 检查项目目录的读写权限

3. **连接失败**
   - 检查数据库服务是否运行
   - 验证数据库连接参数
   - 检查防火墙设置

### 调试模式

如需调试，可以将日志级别设置为 debug：

```json
{
  "env": {
    "LOG_LEVEL": "debug",
    "MCP_ENABLE_DATABASE_TOOLS": "true"
  }
}
```

## 支持的数据库

- **MySQL** (5.7+)
- **PostgreSQL** (10+)

## 安全注意事项

1. **不要在配置中硬编码数据库密码**
2. **使用环境变量或配置文件存储敏感信息**
3. **确保数据库用户只有必要的权限**
4. **在生产环境中启用 SSL 连接**

## 更多信息

- 查看 `DATABASE_TOOLS.md` 了解详细的工具使用说明
- 查看 `README.md` 了解项目概述
- 访问项目仓库获取最新更新

## 技术支持

如果遇到问题，请：
1. 检查 Cursor 的 MCP 日志
2. 查看项目的错误日志
3. 确认所有依赖已正确安装
4. 验证配置文件格式正确
