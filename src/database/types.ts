/**
 * 数据库MCP工具 - 类型定义
 */

// 支持的数据库类型
export type DatabaseType = 'mysql' | 'postgresql' | 'sqlite';

// 数据库连接配置
export interface DatabaseConfig {
  id: string; // 连接标识符
  type: DatabaseType;
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean | object | undefined;
  // 连接池配置
  pool?: {
    min?: number;
    max?: number;
    idleTimeoutMillis?: number;
    connectionTimeoutMillis?: number;
  };
}

// 数据库连接状态
export interface DatabaseConnection {
  id: string;
  type: DatabaseType;
  config: DatabaseConfig;
  connection: any; // 实际的数据库连接对象
  isConnected: boolean;
  lastUsed: Date;
}

// 查询结果
export interface QueryResult {
  rows: any[];
  fields?: any[];
  rowCount: number;
  command?: string;
}

// 执行结果
export interface ExecuteResult {
  affectedRows: number;
  insertId?: number;
  command: string;
}

// 表信息
export interface TableInfo {
  name: string;
  schema?: string;
  type: 'table' | 'view';
  comment?: string;
}

// 列信息
export interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: any;
  isPrimaryKey: boolean;
  isAutoIncrement: boolean;
  comment?: string;
}

// 数据库信息
export interface DatabaseInfo {
  name: string;
  charset?: string;
  collation?: string;
}

// 统一数据库操作类型
export type DatabaseOperationType =
  | 'connect'
  | 'query'
  | 'execute'
  | 'list_databases'
  | 'list_tables'
  | 'describe_table'
  | 'disconnect'
  | 'status';

// 连接配置类型
export interface DatabaseConnectionConfig {
  type: DatabaseType;
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean | undefined;
}

// 统一数据库操作参数
export interface DatabaseOperationParams {
  operation: DatabaseOperationType;
  connectionId: string;

  // 连接操作专用参数
  connectionConfig?: DatabaseConnectionConfig;

  // SQL操作参数
  sql?: string;
  params?: any[];

  // 表/数据库查询参数
  tableName?: string;
  schema?: string;

  // 额外选项
  options?: {
    timeout?: number;
    maxRows?: number;
    [key: string]: any;
  };
}

// 统一响应类型
export interface DatabaseOperationResponse {
  success: boolean;
  operation: DatabaseOperationType;
  connectionId: string;

  // 查询结果
  rows?: any[];
  rowCount?: number;

  // 执行结果
  affectedRows?: number;
  insertId?: any;

  // 列表结果
  databases?: string[];
  tables?: string[];

  // 表结构
  columns?: Array<{
    name: string;
    type: string;
    nullable?: boolean;
    default?: any;
    key?: string;
    extra?: string;
  }>;

  // 连接状态
  connections?: Array<{
    id: string;
    type: DatabaseType;
    host: string;
    database: string;
    status: 'connected' | 'disconnected' | 'error';
    lastUsed?: Date;
  }>;

  // 错误信息
  error?: string;
  code?: string;

  // 元数据
  executionTime?: number;
  timestamp?: Date;
}



// 错误类型
export class DatabaseError extends Error {
  constructor(
    message: string,
    public code: string,
    public connectionId?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}
