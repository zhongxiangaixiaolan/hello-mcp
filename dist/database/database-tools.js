/**
 * 统一数据库MCP工具实现
 */
import { z } from 'zod';
import { DatabaseService } from './database-service.js';
import { logger } from '../utils/logger.js';
import { DatabaseError } from './types.js';
/**
 * 数据库工具类
 */
export class DatabaseTools {
    databaseService;
    constructor() {
        this.databaseService = new DatabaseService();
    }
    /**
     * 获取所有数据库工具定义
     */
    getToolDefinitions() {
        return {
            // 连接数据库
            database_connect: {
                description: 'Connect to a database (MySQL, PostgreSQL). Establishes a connection that can be used for subsequent operations.',
                inputSchema: {
                    connectionId: z.string().describe('Unique identifier for this database connection'),
                    type: z.enum(['mysql', 'postgresql']).describe('Database type'),
                    host: z.string().describe('Database host address'),
                    port: z.number().describe('Database port number'),
                    database: z.string().describe('Database name'),
                    user: z.string().describe('Database username'),
                    password: z.string().describe('Database password'),
                    ssl: z.boolean().optional().describe('Enable SSL connection (optional)')
                }
            },
            // 执行查询
            database_query: {
                description: 'Execute a SELECT query on the connected database. Returns the query results.',
                inputSchema: {
                    connectionId: z.string().describe('Database connection identifier'),
                    sql: z.string().describe('SQL SELECT query to execute'),
                    params: z.array(z.any()).optional().describe('Query parameters for prepared statements (optional)')
                }
            },
            // 执行命令
            database_execute: {
                description: 'Execute an INSERT, UPDATE, or DELETE command on the connected database. Returns execution results.',
                inputSchema: {
                    connectionId: z.string().describe('Database connection identifier'),
                    sql: z.string().describe('SQL command to execute (INSERT, UPDATE, DELETE)'),
                    params: z.array(z.any()).optional().describe('Command parameters for prepared statements (optional)')
                }
            },
            // 列出数据库
            database_list_databases: {
                description: 'List all databases available on the connected database server.',
                inputSchema: {
                    connectionId: z.string().describe('Database connection identifier')
                }
            },
            // 列出表
            database_list_tables: {
                description: 'List all tables in the connected database or specified schema.',
                inputSchema: {
                    connectionId: z.string().describe('Database connection identifier'),
                    schema: z.string().optional().describe('Schema name (optional, mainly for PostgreSQL)')
                }
            },
            // 描述表结构
            database_describe_table: {
                description: 'Get detailed information about table structure including columns, types, and constraints.',
                inputSchema: {
                    connectionId: z.string().describe('Database connection identifier'),
                    tableName: z.string().describe('Name of the table to describe'),
                    schema: z.string().optional().describe('Schema name (optional, mainly for PostgreSQL)')
                }
            },
            // 断开连接
            database_disconnect: {
                description: 'Disconnect from the database and clean up resources.',
                inputSchema: {
                    connectionId: z.string().describe('Database connection identifier')
                }
            },
            // 获取连接状态
            database_status: {
                description: 'Get the status of all database connections.',
                inputSchema: {}
            }
        };
    }
    /**
     * 连接数据库
     */
    async connectDatabase(params) {
        try {
            await this.databaseService.connect(params);
            return {
                success: true,
                message: `Successfully connected to ${params.type} database: ${params.connectionId}`,
                connectionId: params.connectionId,
                type: params.type,
                host: params.host,
                database: params.database
            };
        }
        catch (error) {
            logger.error('Database connection failed', error);
            if (error instanceof DatabaseError) {
                return {
                    success: false,
                    error: error.message,
                    code: error.code,
                    connectionId: error.connectionId
                };
            }
            return {
                success: false,
                error: `Connection failed: ${error instanceof Error ? error.message : String(error)}`,
                connectionId: params.connectionId
            };
        }
    }
    /**
     * 执行查询
     */
    async queryDatabase(params) {
        try {
            const result = await this.databaseService.query(params.connectionId, params.sql, params.params);
            return {
                success: true,
                connectionId: params.connectionId,
                sql: params.sql,
                rowCount: result.rowCount,
                rows: result.rows,
                fields: result.fields
            };
        }
        catch (error) {
            logger.error('Database query failed', error);
            if (error instanceof DatabaseError) {
                return {
                    success: false,
                    error: error.message,
                    code: error.code,
                    connectionId: error.connectionId,
                    sql: params.sql
                };
            }
            return {
                success: false,
                error: `Query failed: ${error instanceof Error ? error.message : String(error)}`,
                connectionId: params.connectionId,
                sql: params.sql
            };
        }
    }
    /**
     * 执行命令
     */
    async executeDatabase(params) {
        try {
            const result = await this.databaseService.execute(params.connectionId, params.sql, params.params);
            return {
                success: true,
                connectionId: params.connectionId,
                sql: params.sql,
                affectedRows: result.affectedRows,
                insertId: result.insertId,
                command: result.command
            };
        }
        catch (error) {
            logger.error('Database execute failed', error);
            if (error instanceof DatabaseError) {
                return {
                    success: false,
                    error: error.message,
                    code: error.code,
                    connectionId: error.connectionId,
                    sql: params.sql
                };
            }
            return {
                success: false,
                error: `Execute failed: ${error instanceof Error ? error.message : String(error)}`,
                connectionId: params.connectionId,
                sql: params.sql
            };
        }
    }
    /**
     * 列出数据库
     */
    async listDatabases(params) {
        try {
            const databases = await this.databaseService.listDatabases(params.connectionId);
            return {
                success: true,
                connectionId: params.connectionId,
                databases: databases
            };
        }
        catch (error) {
            logger.error('List databases failed', error);
            if (error instanceof DatabaseError) {
                return {
                    success: false,
                    error: error.message,
                    code: error.code,
                    connectionId: error.connectionId
                };
            }
            return {
                success: false,
                error: `List databases failed: ${error instanceof Error ? error.message : String(error)}`,
                connectionId: params.connectionId
            };
        }
    }
    /**
     * 列出表
     */
    async listTables(params) {
        try {
            const tables = await this.databaseService.listTables(params.connectionId, params.schema);
            return {
                success: true,
                connectionId: params.connectionId,
                schema: params.schema,
                tables: tables
            };
        }
        catch (error) {
            logger.error('List tables failed', error);
            if (error instanceof DatabaseError) {
                return {
                    success: false,
                    error: error.message,
                    code: error.code,
                    connectionId: error.connectionId
                };
            }
            return {
                success: false,
                error: `List tables failed: ${error instanceof Error ? error.message : String(error)}`,
                connectionId: params.connectionId
            };
        }
    }
    /**
     * 描述表结构
     */
    async describeTable(params) {
        try {
            const columns = await this.databaseService.describeTable(params.connectionId, params.tableName, params.schema);
            return {
                success: true,
                connectionId: params.connectionId,
                tableName: params.tableName,
                schema: params.schema,
                columns: columns
            };
        }
        catch (error) {
            logger.error('Describe table failed', error);
            if (error instanceof DatabaseError) {
                return {
                    success: false,
                    error: error.message,
                    code: error.code,
                    connectionId: error.connectionId
                };
            }
            return {
                success: false,
                error: `Describe table failed: ${error instanceof Error ? error.message : String(error)}`,
                connectionId: params.connectionId,
                tableName: params.tableName
            };
        }
    }
    /**
     * 断开连接
     */
    async disconnectDatabase(params) {
        try {
            await this.databaseService.disconnect(params.connectionId);
            return {
                success: true,
                message: `Successfully disconnected from database: ${params.connectionId}`,
                connectionId: params.connectionId
            };
        }
        catch (error) {
            logger.error('Database disconnect failed', error);
            if (error instanceof DatabaseError) {
                return {
                    success: false,
                    error: error.message,
                    code: error.code,
                    connectionId: error.connectionId
                };
            }
            return {
                success: false,
                error: `Disconnect failed: ${error instanceof Error ? error.message : String(error)}`,
                connectionId: params.connectionId
            };
        }
    }
    /**
     * 获取连接状态
     */
    async getDatabaseStatus() {
        try {
            const status = this.databaseService.getConnectionStatus();
            return {
                success: true,
                connections: status
            };
        }
        catch (error) {
            logger.error('Get database status failed', error);
            return {
                success: false,
                error: `Get status failed: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
}
//# sourceMappingURL=database-tools.js.map