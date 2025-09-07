# 统一数据库工具文档

## 概述

Hello MCP 现在集成了强大的统一数据库工具，支持 MySQL 和 PostgreSQL 数据库的连接和操作。通过单一的 `database_operation` 工具，AI 助手可以直接与数据库交互，执行查询、更新数据、管理表结构等所有操作。

## 支持的数据库

- **MySQL** - 使用 mysql2 驱动
- **PostgreSQL** - 使用 pg 驱动

## 统一工具：database_operation

### 工具概述

`database_operation` 是一个强大的统一工具，通过 `operation` 参数支持所有数据库操作类型：

- `connect` - 连接到数据库服务器
- `query` - 执行 SELECT 查询
- `execute` - 执行 INSERT、UPDATE、DELETE 命令
- `list_databases` - 列出服务器上的所有数据库
- `list_tables` - 列出数据库中的所有表
- `describe_table` - 获取表的详细结构信息
- `disconnect` - 断开数据库连接
- `status` - 获取所有数据库连接的状态

### 通用参数结构

```json
{
  "operation": "操作类型",
  "connectionId": "连接标识符",
  "connectionConfig": { /* 连接配置，仅用于connect操作 */ },
  "sql": "SQL语句",
  "params": [/* SQL参数 */],
  "tableName": "表名",
  "schema": "模式名",
  "options": { /* 额外选项 */ }
}
```

## 操作示例

### 1. 连接数据库 (connect)

**MySQL 连接：**
```json
{
  "operation": "connect",
  "connectionId": "my-mysql-db",
  "connectionConfig": {
    "type": "mysql",
    "host": "localhost",
    "port": 3306,
    "database": "testdb",
    "user": "root",
    "password": "password123",
    "ssl": false
  }
}
```

**PostgreSQL 连接：**
```json
{
  "operation": "connect",
  "connectionId": "my-pg-db",
  "connectionConfig": {
    "type": "postgresql",
    "host": "localhost",
    "port": 5432,
    "database": "testdb",
    "user": "postgres",
    "password": "password123",
    "ssl": true
  }
}
```

### 2. 执行查询 (query)

**简单查询：**
```json
{
  "operation": "query",
  "connectionId": "my-mysql-db",
  "sql": "SELECT * FROM users"
}
```

**参数化查询：**
```json
{
  "operation": "query",
  "connectionId": "my-mysql-db",
  "sql": "SELECT * FROM users WHERE age > ? AND city = ?",
  "params": [18, "Beijing"]
}
```

**带选项的查询：**
```json
{
  "operation": "query",
  "connectionId": "my-mysql-db",
  "sql": "SELECT * FROM users ORDER BY created_at DESC",
  "options": {
    "maxRows": 100,
    "timeout": 30000
  }
}
```

### 3. 执行命令 (execute)

**插入数据：**
```json
{
  "operation": "execute",
  "connectionId": "my-mysql-db",
  "sql": "INSERT INTO users (name, email, age) VALUES (?, ?, ?)",
  "params": ["张三", "zhangsan@example.com", 25]
}
```

**更新数据：**
```json
{
  "operation": "execute",
  "connectionId": "my-mysql-db",
  "sql": "UPDATE users SET age = ? WHERE id = ?",
  "params": [26, 1]
}
```

**删除数据：**
```json
{
  "operation": "execute",
  "connectionId": "my-mysql-db",
  "sql": "DELETE FROM users WHERE age < ?",
  "params": [18]
}
```

### 4. 列出数据库 (list_databases)

```json
{
  "operation": "list_databases",
  "connectionId": "my-mysql-db"
}
```

### 5. 列出表 (list_tables)

**MySQL：**
```json
{
  "operation": "list_tables",
  "connectionId": "my-mysql-db"
}
```

**PostgreSQL（指定模式）：**
```json
{
  "operation": "list_tables",
  "connectionId": "my-pg-db",
  "schema": "public"
}
```

### 6. 描述表结构 (describe_table)

```json
{
  "operation": "describe_table",
  "connectionId": "my-mysql-db",
  "tableName": "users"
}
```

### 7. 断开连接 (disconnect)

```json
{
  "operation": "disconnect",
  "connectionId": "my-mysql-db"
}
```

### 8. 获取连接状态 (status)

```json
{
  "operation": "status",
  "connectionId": "any-connection-id"
}
```

## 响应格式

所有操作都会返回统一的响应格式：

```json
{
  "success": true,
  "operation": "query",
  "connectionId": "my-mysql-db",
  "rows": [...],
  "rowCount": 5,
  "executionTime": 150,
  "timestamp": "2025-09-07T15:30:00.000Z"
}
```

### 响应字段说明

- `success` (boolean): 操作是否成功
- `operation` (string): 执行的操作类型
- `connectionId` (string): 连接标识符
- `rows` (array): 查询结果行（仅用于query操作）
- `rowCount` (number): 影响的行数
- `affectedRows` (number): 受影响的行数（仅用于execute操作）
- `insertId` (any): 插入的ID（仅用于INSERT操作）
- `databases` (array): 数据库列表（仅用于list_databases操作）
- `tables` (array): 表列表（仅用于list_tables操作）
- `columns` (array): 列信息（仅用于describe_table操作）
- `connections` (array): 连接状态列表（仅用于status操作）
- `error` (string): 错误信息（仅在失败时）
- `code` (string): 错误代码（仅在失败时）
- `executionTime` (number): 执行时间（毫秒）
- `timestamp` (Date): 操作时间戳

## 环境变量配置

可以通过以下环境变量配置数据库工具：

```bash
# 启用数据库工具（默认：true）
MCP_ENABLE_DATABASE_TOOLS=true

# 默认数据库连接ID（可选）
MCP_DEFAULT_DB_CONNECTION=main-db
```

## 安全注意事项

1. **参数化查询**：始终使用参数化查询来防止 SQL 注入攻击
2. **连接管理**：及时断开不需要的数据库连接
3. **权限控制**：确保数据库用户只有必要的权限
4. **敏感信息**：不要在日志中记录密码等敏感信息
5. **SSL连接**：在生产环境中启用SSL连接

## 完整使用示例

### 完整的数据库操作流程

```json
// 1. 连接数据库
{
  "operation": "connect",
  "connectionId": "main-db",
  "connectionConfig": {
    "type": "mysql",
    "host": "localhost",
    "port": 3306,
    "database": "myapp",
    "user": "app_user",
    "password": "secure_password"
  }
}

// 2. 查看数据库中的表
{
  "operation": "list_tables",
  "connectionId": "main-db"
}

// 3. 查看表结构
{
  "operation": "describe_table",
  "connectionId": "main-db",
  "tableName": "users"
}

// 4. 查询数据
{
  "operation": "query",
  "connectionId": "main-db",
  "sql": "SELECT id, name, email FROM users WHERE status = ?",
  "params": ["active"]
}

// 5. 插入新数据
{
  "operation": "execute",
  "connectionId": "main-db",
  "sql": "INSERT INTO users (name, email, status) VALUES (?, ?, ?)",
  "params": ["新用户", "newuser@example.com", "active"]
}

// 6. 断开连接
{
  "operation": "disconnect",
  "connectionId": "main-db"
}
```

## 最佳实践

1. **连接复用**：为同一个数据库使用相同的 connectionId 来复用连接
2. **连接池**：工具内部使用连接池来提高性能
3. **参数化查询**：始终使用参数化查询防止SQL注入
4. **错误处理**：检查响应中的 `success` 字段
5. **连接管理**：操作完成后及时断开连接
6. **性能优化**：使用适当的索引和查询优化技术
7. **监控**：定期检查连接状态和性能指标

## 故障排除

### 常见问题

1. **连接超时**：检查网络连接和防火墙设置
2. **认证失败**：验证用户名和密码是否正确
3. **权限不足**：确保数据库用户有足够的权限
4. **SSL 连接问题**：检查 SSL 配置和证书
5. **SQL语法错误**：检查SQL语句的语法正确性

### 调试技巧

1. 启用详细日志记录
2. 使用 `status` 操作检查连接状态
3. 测试简单的查询来验证连接
4. 检查数据库服务器日志
5. 验证参数类型和格式

## 更新日志

- **v2.2.0**: 统一数据库工具版本
  - 将8个分散工具合并为1个统一工具
  - 支持通过JSON参数指定操作类型
  - 改进的错误处理和响应格式
  - 更好的参数验证和类型安全
  - 统一的执行时间和时间戳记录

- **v2.1.3**: 初始版本，支持 MySQL 和 PostgreSQL
  - 基本的 CRUD 操作
  - 连接池管理
  - 参数化查询支持
  - 表结构查询功能
