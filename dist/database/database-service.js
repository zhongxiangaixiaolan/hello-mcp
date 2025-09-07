/**
 * 数据库服务类 - 提供数据库操作的高级接口
 */
import { DatabaseConnectionManager } from './connection-manager.js';
import { logger } from '../utils/logger.js';
import { DatabaseError } from './types.js';
/**
 * 数据库服务类
 */
export class DatabaseService {
    connectionManager;
    constructor() {
        this.connectionManager = new DatabaseConnectionManager();
    }
    /**
     * 连接数据库
     */
    async connect(params) {
        await this.connectionManager.connect({
            id: params.connectionId,
            type: params.type,
            host: params.host,
            port: params.port,
            database: params.database,
            user: params.user,
            password: params.password,
            ssl: params.ssl
        });
    }
    /**
     * 执行查询
     */
    async query(connectionId, sql, params) {
        try {
            const connection = this.connectionManager.getConnection(connectionId);
            const pool = this.connectionManager.getPool(connectionId);
            logger.info(`执行查询: ${connectionId}`, { sql, params });
            let result;
            switch (connection.type) {
                case 'mysql':
                    result = await this.queryMySQL(pool, sql, params);
                    break;
                case 'postgresql':
                    result = await this.queryPostgreSQL(pool, sql, params);
                    break;
                default:
                    throw new DatabaseError(`不支持的数据库类型: ${connection.type}`, 'UNSUPPORTED_DATABASE_TYPE', connectionId);
            }
            logger.info(`查询完成: ${connectionId}`, { rowCount: result.rowCount });
            return result;
        }
        catch (error) {
            logger.error(`查询失败: ${connectionId}`, error);
            throw new DatabaseError(`查询失败: ${error instanceof Error ? error.message : String(error)}`, 'QUERY_FAILED', connectionId, error);
        }
    }
    /**
     * 执行MySQL查询
     */
    async queryMySQL(pool, sql, params) {
        const [rows, fields] = await pool.execute(sql, params || []);
        return {
            rows: Array.isArray(rows) ? rows : [],
            fields,
            rowCount: Array.isArray(rows) ? rows.length : 0
        };
    }
    /**
     * 执行PostgreSQL查询
     */
    async queryPostgreSQL(pool, sql, params) {
        const result = await pool.query(sql, params || []);
        return {
            rows: result.rows || [],
            fields: result.fields,
            rowCount: result.rowCount || 0,
            command: result.command
        };
    }
    /**
     * 执行命令（INSERT/UPDATE/DELETE）
     */
    async execute(connectionId, sql, params) {
        try {
            const connection = this.connectionManager.getConnection(connectionId);
            const pool = this.connectionManager.getPool(connectionId);
            logger.info(`执行命令: ${connectionId}`, { sql, params });
            let result;
            switch (connection.type) {
                case 'mysql':
                    result = await this.executeMySQL(pool, sql, params);
                    break;
                case 'postgresql':
                    result = await this.executePostgreSQL(pool, sql, params);
                    break;
                default:
                    throw new DatabaseError(`不支持的数据库类型: ${connection.type}`, 'UNSUPPORTED_DATABASE_TYPE', connectionId);
            }
            logger.info(`命令执行完成: ${connectionId}`, { affectedRows: result.affectedRows });
            return result;
        }
        catch (error) {
            logger.error(`命令执行失败: ${connectionId}`, error);
            throw new DatabaseError(`命令执行失败: ${error instanceof Error ? error.message : String(error)}`, 'EXECUTE_FAILED', connectionId, error);
        }
    }
    /**
     * 执行MySQL命令
     */
    async executeMySQL(pool, sql, params) {
        const [result] = await pool.execute(sql, params || []);
        return {
            affectedRows: result.affectedRows || 0,
            insertId: result.insertId,
            command: 'EXECUTE'
        };
    }
    /**
     * 执行PostgreSQL命令
     */
    async executePostgreSQL(pool, sql, params) {
        const result = await pool.query(sql, params || []);
        return {
            affectedRows: result.rowCount || 0,
            command: result.command || 'EXECUTE'
        };
    }
    /**
     * 列出数据库
     */
    async listDatabases(connectionId) {
        try {
            const connection = this.connectionManager.getConnection(connectionId);
            let sql;
            switch (connection.type) {
                case 'mysql':
                    sql = 'SHOW DATABASES';
                    break;
                case 'postgresql':
                    sql = 'SELECT datname as name FROM pg_database WHERE datistemplate = false';
                    break;
                default:
                    throw new DatabaseError(`不支持的数据库类型: ${connection.type}`, 'UNSUPPORTED_DATABASE_TYPE', connectionId);
            }
            const result = await this.query(connectionId, sql);
            if (connection.type === 'mysql') {
                return result.rows.map((row) => ({
                    name: row.Database || row.database
                }));
            }
            else {
                return result.rows.map((row) => ({
                    name: row.name
                }));
            }
        }
        catch (error) {
            logger.error(`列出数据库失败: ${connectionId}`, error);
            throw new DatabaseError(`列出数据库失败: ${error instanceof Error ? error.message : String(error)}`, 'LIST_DATABASES_FAILED', connectionId, error);
        }
    }
    /**
     * 列出表
     */
    async listTables(connectionId, schema) {
        try {
            const connection = this.connectionManager.getConnection(connectionId);
            let sql;
            let params = [];
            switch (connection.type) {
                case 'mysql':
                    sql = 'SHOW TABLES';
                    break;
                case 'postgresql':
                    if (schema) {
                        sql = 'SELECT tablename as name, schemaname as schema, \'table\' as type FROM pg_tables WHERE schemaname = $1';
                        params = [schema];
                    }
                    else {
                        sql = 'SELECT tablename as name, schemaname as schema, \'table\' as type FROM pg_tables WHERE schemaname NOT IN (\'information_schema\', \'pg_catalog\')';
                    }
                    break;
                default:
                    throw new DatabaseError(`不支持的数据库类型: ${connection.type}`, 'UNSUPPORTED_DATABASE_TYPE', connectionId);
            }
            const result = await this.query(connectionId, sql, params);
            if (connection.type === 'mysql') {
                const dbName = connection.config.database;
                return result.rows.map((row) => ({
                    name: row[`Tables_in_${dbName}`] || Object.values(row)[0],
                    type: 'table'
                }));
            }
            else {
                return result.rows.map((row) => ({
                    name: row.name,
                    schema: row.schema,
                    type: row.type
                }));
            }
        }
        catch (error) {
            logger.error(`列出表失败: ${connectionId}`, error);
            throw new DatabaseError(`列出表失败: ${error instanceof Error ? error.message : String(error)}`, 'LIST_TABLES_FAILED', connectionId, error);
        }
    }
    /**
     * 描述表结构
     */
    async describeTable(connectionId, tableName, schema) {
        try {
            const connection = this.connectionManager.getConnection(connectionId);
            let sql;
            let params = [];
            switch (connection.type) {
                case 'mysql':
                    sql = 'DESCRIBE ??';
                    params = [tableName];
                    break;
                case 'postgresql':
                    const fullTableName = schema ? `${schema}.${tableName}` : tableName;
                    sql = `
            SELECT 
              column_name as name,
              data_type as type,
              is_nullable = 'YES' as nullable,
              column_default as default_value,
              CASE WHEN column_name IN (
                SELECT column_name FROM information_schema.key_column_usage 
                WHERE table_name = $1 AND constraint_name LIKE '%_pkey'
              ) THEN true ELSE false END as is_primary_key
            FROM information_schema.columns 
            WHERE table_name = $1
            ORDER BY ordinal_position
          `;
                    params = [tableName];
                    break;
                default:
                    throw new DatabaseError(`不支持的数据库类型: ${connection.type}`, 'UNSUPPORTED_DATABASE_TYPE', connectionId);
            }
            const result = await this.query(connectionId, sql, params);
            if (connection.type === 'mysql') {
                return result.rows.map((row) => ({
                    name: row.Field,
                    type: row.Type,
                    nullable: row.Null === 'YES',
                    defaultValue: row.Default,
                    isPrimaryKey: row.Key === 'PRI',
                    isAutoIncrement: row.Extra === 'auto_increment'
                }));
            }
            else {
                return result.rows.map((row) => ({
                    name: row.name,
                    type: row.type,
                    nullable: row.nullable,
                    defaultValue: row.default_value,
                    isPrimaryKey: row.is_primary_key,
                    isAutoIncrement: false // PostgreSQL需要额外查询
                }));
            }
        }
        catch (error) {
            logger.error(`描述表结构失败: ${connectionId}`, error);
            throw new DatabaseError(`描述表结构失败: ${error instanceof Error ? error.message : String(error)}`, 'DESCRIBE_TABLE_FAILED', connectionId, error);
        }
    }
    /**
     * 断开连接
     */
    async disconnect(connectionId) {
        await this.connectionManager.disconnect(connectionId);
    }
    /**
     * 获取连接状态
     */
    getConnectionStatus() {
        return this.connectionManager.getConnectionStatus();
    }
    /**
     * 获取连接对象
     */
    getConnection(connectionId) {
        return this.connectionManager.getConnection(connectionId);
    }
}
//# sourceMappingURL=database-service.js.map