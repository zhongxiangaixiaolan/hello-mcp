/**
 * 统一数据库MCP工具实现
 */
import { z } from 'zod';
import { DatabaseConnectParams, DatabaseQueryParams, DatabaseExecuteParams, DatabaseListTablesParams, DatabaseDescribeTableParams, DatabaseDisconnectParams } from './types.js';
/**
 * 数据库工具类
 */
export declare class DatabaseTools {
    private databaseService;
    constructor();
    /**
     * 获取所有数据库工具定义
     */
    getToolDefinitions(): {
        database_connect: {
            description: string;
            inputSchema: {
                connectionId: z.ZodString;
                type: z.ZodEnum<["mysql", "postgresql"]>;
                host: z.ZodString;
                port: z.ZodNumber;
                database: z.ZodString;
                user: z.ZodString;
                password: z.ZodString;
                ssl: z.ZodOptional<z.ZodBoolean>;
            };
        };
        database_query: {
            description: string;
            inputSchema: {
                connectionId: z.ZodString;
                sql: z.ZodString;
                params: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
            };
        };
        database_execute: {
            description: string;
            inputSchema: {
                connectionId: z.ZodString;
                sql: z.ZodString;
                params: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
            };
        };
        database_list_databases: {
            description: string;
            inputSchema: {
                connectionId: z.ZodString;
            };
        };
        database_list_tables: {
            description: string;
            inputSchema: {
                connectionId: z.ZodString;
                schema: z.ZodOptional<z.ZodString>;
            };
        };
        database_describe_table: {
            description: string;
            inputSchema: {
                connectionId: z.ZodString;
                tableName: z.ZodString;
                schema: z.ZodOptional<z.ZodString>;
            };
        };
        database_disconnect: {
            description: string;
            inputSchema: {
                connectionId: z.ZodString;
            };
        };
        database_status: {
            description: string;
            inputSchema: {};
        };
    };
    /**
     * 连接数据库
     */
    connectDatabase(params: DatabaseConnectParams): Promise<{
        success: boolean;
        message: string;
        connectionId: string;
        type: import("./types.js").DatabaseType;
        host: string;
        database: string;
        error?: never;
        code?: never;
    } | {
        success: boolean;
        error: string;
        code: string;
        connectionId: string | undefined;
        message?: never;
        type?: never;
        host?: never;
        database?: never;
    } | {
        success: boolean;
        error: string;
        connectionId: string;
        message?: never;
        type?: never;
        host?: never;
        database?: never;
        code?: never;
    }>;
    /**
     * 执行查询
     */
    queryDatabase(params: DatabaseQueryParams): Promise<{
        success: boolean;
        connectionId: string;
        sql: string;
        rowCount: number;
        rows: any[];
        fields: any[] | undefined;
        error?: never;
        code?: never;
    } | {
        success: boolean;
        error: string;
        code: string;
        connectionId: string | undefined;
        sql: string;
        rowCount?: never;
        rows?: never;
        fields?: never;
    } | {
        success: boolean;
        error: string;
        connectionId: string;
        sql: string;
        rowCount?: never;
        rows?: never;
        fields?: never;
        code?: never;
    }>;
    /**
     * 执行命令
     */
    executeDatabase(params: DatabaseExecuteParams): Promise<{
        success: boolean;
        connectionId: string;
        sql: string;
        affectedRows: number;
        insertId: number | undefined;
        command: string;
        error?: never;
        code?: never;
    } | {
        success: boolean;
        error: string;
        code: string;
        connectionId: string | undefined;
        sql: string;
        affectedRows?: never;
        insertId?: never;
        command?: never;
    } | {
        success: boolean;
        error: string;
        connectionId: string;
        sql: string;
        affectedRows?: never;
        insertId?: never;
        command?: never;
        code?: never;
    }>;
    /**
     * 列出数据库
     */
    listDatabases(params: {
        connectionId: string;
    }): Promise<{
        success: boolean;
        connectionId: string;
        databases: import("./types.js").DatabaseInfo[];
        error?: never;
        code?: never;
    } | {
        success: boolean;
        error: string;
        code: string;
        connectionId: string | undefined;
        databases?: never;
    } | {
        success: boolean;
        error: string;
        connectionId: string;
        databases?: never;
        code?: never;
    }>;
    /**
     * 列出表
     */
    listTables(params: DatabaseListTablesParams): Promise<{
        success: boolean;
        connectionId: string;
        schema: string | undefined;
        tables: import("./types.js").TableInfo[];
        error?: never;
        code?: never;
    } | {
        success: boolean;
        error: string;
        code: string;
        connectionId: string | undefined;
        schema?: never;
        tables?: never;
    } | {
        success: boolean;
        error: string;
        connectionId: string;
        schema?: never;
        tables?: never;
        code?: never;
    }>;
    /**
     * 描述表结构
     */
    describeTable(params: DatabaseDescribeTableParams): Promise<{
        success: boolean;
        connectionId: string;
        tableName: string;
        schema: string | undefined;
        columns: import("./types.js").ColumnInfo[];
        error?: never;
        code?: never;
    } | {
        success: boolean;
        error: string;
        code: string;
        connectionId: string | undefined;
        tableName?: never;
        schema?: never;
        columns?: never;
    } | {
        success: boolean;
        error: string;
        connectionId: string;
        tableName: string;
        schema?: never;
        columns?: never;
        code?: never;
    }>;
    /**
     * 断开连接
     */
    disconnectDatabase(params: DatabaseDisconnectParams): Promise<{
        success: boolean;
        message: string;
        connectionId: string;
        error?: never;
        code?: never;
    } | {
        success: boolean;
        error: string;
        code: string;
        connectionId: string | undefined;
        message?: never;
    } | {
        success: boolean;
        error: string;
        connectionId: string;
        message?: never;
        code?: never;
    }>;
    /**
     * 获取连接状态
     */
    getDatabaseStatus(): Promise<{
        success: boolean;
        connections: {
            id: string;
            type: import("./types.js").DatabaseType;
            isConnected: boolean;
            lastUsed: Date;
        }[];
        error?: never;
    } | {
        success: boolean;
        error: string;
        connections?: never;
    }>;
}
//# sourceMappingURL=database-tools.d.ts.map