/**
 * 数据库MCP工具 - 类型定义
 */
export type DatabaseType = 'mysql' | 'postgresql' | 'sqlite';
export interface DatabaseConfig {
    id: string;
    type: DatabaseType;
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    ssl?: boolean | object | undefined;
    pool?: {
        min?: number;
        max?: number;
        idleTimeoutMillis?: number;
        connectionTimeoutMillis?: number;
    };
}
export interface DatabaseConnection {
    id: string;
    type: DatabaseType;
    config: DatabaseConfig;
    connection: any;
    isConnected: boolean;
    lastUsed: Date;
}
export interface QueryResult {
    rows: any[];
    fields?: any[];
    rowCount: number;
    command?: string;
}
export interface ExecuteResult {
    affectedRows: number;
    insertId?: number;
    command: string;
}
export interface TableInfo {
    name: string;
    schema?: string;
    type: 'table' | 'view';
    comment?: string;
}
export interface ColumnInfo {
    name: string;
    type: string;
    nullable: boolean;
    defaultValue?: any;
    isPrimaryKey: boolean;
    isAutoIncrement: boolean;
    comment?: string;
}
export interface DatabaseInfo {
    name: string;
    charset?: string;
    collation?: string;
}
export type DatabaseOperationType = 'connect' | 'query' | 'execute' | 'list_databases' | 'list_tables' | 'describe_table' | 'disconnect' | 'status';
export interface DatabaseConnectionConfig {
    type: DatabaseType;
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    ssl?: boolean | undefined;
}
export interface DatabaseOperationParams {
    operation: DatabaseOperationType;
    connectionId: string;
    connectionConfig?: DatabaseConnectionConfig;
    sql?: string;
    params?: any[];
    tableName?: string;
    schema?: string;
    options?: {
        timeout?: number;
        maxRows?: number;
        [key: string]: any;
    };
}
export interface DatabaseOperationResponse {
    success: boolean;
    operation: DatabaseOperationType;
    connectionId: string;
    rows?: any[];
    rowCount?: number;
    affectedRows?: number;
    insertId?: any;
    databases?: string[];
    tables?: string[];
    columns?: Array<{
        name: string;
        type: string;
        nullable?: boolean;
        default?: any;
        key?: string;
        extra?: string;
    }>;
    connections?: Array<{
        id: string;
        type: DatabaseType;
        host: string;
        database: string;
        status: 'connected' | 'disconnected' | 'error' | 'pre-configured';
        lastUsed?: Date;
    }>;
    error?: string;
    code?: string;
    executionTime?: number;
    timestamp?: Date;
}
export declare class DatabaseError extends Error {
    code: string;
    connectionId?: string | undefined;
    details?: unknown | undefined;
    constructor(message: string, code: string, connectionId?: string | undefined, details?: unknown | undefined);
}
//# sourceMappingURL=types.d.ts.map