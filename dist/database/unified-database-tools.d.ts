/**
 * 统一数据库MCP工具实现
 * 将所有数据库操作合并为一个强大的工具
 */
import { z } from 'zod';
import { DatabaseOperationParams, DatabaseOperationResponse } from './types.js';
/**
 * 统一数据库工具类
 */
export declare class UnifiedDatabaseTools {
    private databaseService;
    constructor();
    /**
     * 获取统一数据库工具定义
     */
    getTool(): {
        name: string;
        description: string;
        inputSchema: z.ZodObject<{
            operation: z.ZodEnum<["connect", "query", "execute", "list_databases", "list_tables", "describe_table", "disconnect", "status"]>;
            connectionId: z.ZodString;
            connectionConfig: z.ZodOptional<z.ZodObject<{
                type: z.ZodEnum<["mysql", "postgresql"]>;
                host: z.ZodString;
                port: z.ZodNumber;
                database: z.ZodString;
                user: z.ZodString;
                password: z.ZodString;
                ssl: z.ZodOptional<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                port: number;
                type: "mysql" | "postgresql";
                user: string;
                host: string;
                database: string;
                password: string;
                ssl?: boolean | undefined;
            }, {
                port: number;
                type: "mysql" | "postgresql";
                user: string;
                host: string;
                database: string;
                password: string;
                ssl?: boolean | undefined;
            }>>;
            sql: z.ZodOptional<z.ZodString>;
            params: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
            tableName: z.ZodOptional<z.ZodString>;
            schema: z.ZodOptional<z.ZodString>;
            options: z.ZodOptional<z.ZodObject<{
                timeout: z.ZodOptional<z.ZodNumber>;
                maxRows: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                timeout?: number | undefined;
                maxRows?: number | undefined;
            }, {
                timeout?: number | undefined;
                maxRows?: number | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            connectionId: string;
            operation: "disconnect" | "connect" | "query" | "execute" | "list_databases" | "list_tables" | "describe_table" | "status";
            options?: {
                timeout?: number | undefined;
                maxRows?: number | undefined;
            } | undefined;
            params?: any[] | undefined;
            connectionConfig?: {
                port: number;
                type: "mysql" | "postgresql";
                user: string;
                host: string;
                database: string;
                password: string;
                ssl?: boolean | undefined;
            } | undefined;
            sql?: string | undefined;
            tableName?: string | undefined;
            schema?: string | undefined;
        }, {
            connectionId: string;
            operation: "disconnect" | "connect" | "query" | "execute" | "list_databases" | "list_tables" | "describe_table" | "status";
            options?: {
                timeout?: number | undefined;
                maxRows?: number | undefined;
            } | undefined;
            params?: any[] | undefined;
            connectionConfig?: {
                port: number;
                type: "mysql" | "postgresql";
                user: string;
                host: string;
                database: string;
                password: string;
                ssl?: boolean | undefined;
            } | undefined;
            sql?: string | undefined;
            tableName?: string | undefined;
            schema?: string | undefined;
        }>;
    };
    /**
     * 执行数据库操作
     */
    executeDatabaseOperation(params: DatabaseOperationParams): Promise<DatabaseOperationResponse>;
    /**
     * 处理连接操作
     */
    private handleConnect;
    /**
     * 处理查询操作
     */
    private handleQuery;
    /**
     * 处理执行操作
     */
    private handleExecute;
    /**
     * 处理列出数据库操作
     */
    private handleListDatabases;
    /**
     * 处理列出表操作
     */
    private handleListTables;
    /**
     * 处理描述表操作
     */
    private handleDescribeTable;
    /**
     * 处理断开连接操作
     */
    private handleDisconnect;
    /**
     * 处理状态查询操作
     */
    private handleStatus;
}
//# sourceMappingURL=unified-database-tools.d.ts.map