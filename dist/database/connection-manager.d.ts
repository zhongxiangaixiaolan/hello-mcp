/**
 * 数据库连接管理器
 */
import { DatabaseType, DatabaseConfig, DatabaseConnection } from './types.js';
/**
 * 数据库连接管理器类
 */
export declare class DatabaseConnectionManager {
    private connections;
    private pools;
    /**
     * 连接到数据库
     */
    connect(config: DatabaseConfig): Promise<void>;
    /**
     * 连接MySQL数据库
     */
    private connectMySQL;
    /**
     * 创建MySQL连接池
     */
    private createMySQLPool;
    /**
     * 连接PostgreSQL数据库
     */
    private connectPostgreSQL;
    /**
     * 创建PostgreSQL连接池
     */
    private createPostgreSQLPool;
    /**
     * 获取连接
     */
    getConnection(connectionId: string): DatabaseConnection;
    /**
     * 获取连接池
     */
    getPool(connectionId: string): any;
    /**
     * 断开连接
     */
    disconnect(connectionId: string): Promise<void>;
    /**
     * 断开所有连接
     */
    disconnectAll(): Promise<void>;
    /**
     * 获取所有连接状态
     */
    getConnectionStatus(): Array<{
        id: string;
        type: DatabaseType;
        isConnected: boolean;
        lastUsed: Date;
    }>;
}
//# sourceMappingURL=connection-manager.d.ts.map