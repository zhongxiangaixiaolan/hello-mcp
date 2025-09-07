/**
 * 数据库服务类 - 提供数据库操作的高级接口
 */
import { DatabaseType, QueryResult, ExecuteResult, TableInfo, ColumnInfo, DatabaseInfo } from './types.js';
/**
 * 数据库服务类
 */
export declare class DatabaseService {
    private connectionManager;
    constructor();
    /**
     * 连接数据库
     */
    connect(params: {
        connectionId: string;
        type: DatabaseType;
        host: string;
        port: number;
        database: string;
        user: string;
        password: string;
        ssl?: boolean | undefined;
    }): Promise<void>;
    /**
     * 执行查询
     */
    query(connectionId: string, sql: string, params?: any[]): Promise<QueryResult>;
    /**
     * 执行MySQL查询
     */
    private queryMySQL;
    /**
     * 执行PostgreSQL查询
     */
    private queryPostgreSQL;
    /**
     * 执行命令（INSERT/UPDATE/DELETE）
     */
    execute(connectionId: string, sql: string, params?: any[]): Promise<ExecuteResult>;
    /**
     * 执行MySQL命令
     */
    private executeMySQL;
    /**
     * 执行PostgreSQL命令
     */
    private executePostgreSQL;
    /**
     * 列出数据库
     */
    listDatabases(connectionId: string): Promise<DatabaseInfo[]>;
    /**
     * 列出表
     */
    listTables(connectionId: string, schema?: string): Promise<TableInfo[]>;
    /**
     * 描述表结构
     */
    describeTable(connectionId: string, tableName: string, schema?: string): Promise<ColumnInfo[]>;
    /**
     * 断开连接
     */
    disconnect(connectionId: string): Promise<void>;
    /**
     * 获取连接状态
     */
    getConnectionStatus(): {
        id: string;
        type: DatabaseType;
        isConnected: boolean;
        lastUsed: Date;
    }[];
}
//# sourceMappingURL=database-service.d.ts.map