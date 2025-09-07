/**
 * 统一数据库MCP工具实现
 * 将所有数据库操作合并为一个强大的工具
 */

import { z } from 'zod';
import { DatabaseService } from './database-service.js';
import { logger } from '../utils/logger.js';
import {
  DatabaseOperationParams,
  DatabaseOperationResponse,
  DatabaseError
} from './types.js';

/**
 * 统一数据库工具类
 */
export class UnifiedDatabaseTools {
  private databaseService: DatabaseService;

  constructor() {
    this.databaseService = new DatabaseService();
  }

  /**
   * 获取统一数据库工具定义
   */
  getTool() {
    return {
      name: 'database_operation',
      description: `
        Universal database operation tool that supports all database operations through a single interface.
        This tool allows AI to perform comprehensive database operations using native SQL syntax.

        SUPPORTED OPERATIONS:

        1. CONNECT - Establish database connection
        2. QUERY - Execute SELECT statements (read operations)
        3. EXECUTE - Execute INSERT/UPDATE/DELETE statements (write operations)
        4. LIST_DATABASES - Show all databases on server
        5. LIST_TABLES - Show all tables in database
        6. DESCRIBE_TABLE - Get table structure and column information
        7. DISCONNECT - Close database connection
        8. STATUS - Check connection status

        NATIVE SQL SYNTAX EXAMPLES:

        === MySQL Examples ===

        Connect to MySQL:
        {
          "operation": "connect",
          "connectionId": "mysql-prod",
          "connectionConfig": {
            "type": "mysql",
            "host": "localhost",
            "port": 3306,
            "database": "ecommerce",
            "user": "app_user",
            "password": "secure_password",
            "ssl": false
          }
        }

        Create table:
        {
          "operation": "execute",
          "connectionId": "mysql-prod",
          "sql": "CREATE TABLE users (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL, email VARCHAR(255) UNIQUE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"
        }

        Insert with parameters (prevents SQL injection):
        {
          "operation": "execute",
          "connectionId": "mysql-prod",
          "sql": "INSERT INTO users (name, email) VALUES (?, ?)",
          "params": ["John Doe", "john@example.com"]
        }

        Complex SELECT query:
        {
          "operation": "query",
          "connectionId": "mysql-prod",
          "sql": "SELECT u.id, u.name, u.email, COUNT(o.id) as order_count FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.created_at >= ? GROUP BY u.id HAVING order_count > ? ORDER BY order_count DESC LIMIT ?",
          "params": ["2024-01-01", 5, 10]
        }

        Update with JOIN:
        {
          "operation": "execute",
          "connectionId": "mysql-prod",
          "sql": "UPDATE users u JOIN user_profiles p ON u.id = p.user_id SET u.last_login = NOW(), p.login_count = p.login_count + 1 WHERE u.email = ?",
          "params": ["john@example.com"]
        }

        === PostgreSQL Examples ===

        Connect to PostgreSQL:
        {
          "operation": "connect",
          "connectionId": "pg-analytics",
          "connectionConfig": {
            "type": "postgresql",
            "host": "localhost",
            "port": 5432,
            "database": "analytics",
            "user": "postgres",
            "password": "pg_password",
            "ssl": true
          }
        }

        Create table with PostgreSQL-specific features:
        {
          "operation": "execute",
          "connectionId": "pg-analytics",
          "sql": "CREATE TABLE events (id SERIAL PRIMARY KEY, event_type VARCHAR(50) NOT NULL, user_id INTEGER REFERENCES users(id), data JSONB, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW())"
        }

        Insert JSONB data:
        {
          "operation": "execute",
          "connectionId": "pg-analytics",
          "sql": "INSERT INTO events (event_type, user_id, data) VALUES ($1, $2, $3)",
          "params": ["page_view", 123, {"page": "/products", "referrer": "google.com", "duration": 45}]
        }

        Query with JSONB operations:
        {
          "operation": "query",
          "connectionId": "pg-analytics",
          "sql": "SELECT event_type, COUNT(*) as count, AVG((data->>'duration')::int) as avg_duration FROM events WHERE data->>'page' LIKE $1 AND created_at >= $2 GROUP BY event_type ORDER BY count DESC",
          "params": ["/products%", "2024-01-01"]
        }

        Window functions:
        {
          "operation": "query",
          "connectionId": "pg-analytics",
          "sql": "SELECT user_id, event_type, created_at, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as event_rank FROM events WHERE created_at >= $1",
          "params": ["2024-01-01"]
        }

        === Database Management ===

        List all databases:
        {
          "operation": "list_databases",
          "connectionId": "mysql-prod"
        }

        List tables in current database:
        {
          "operation": "list_tables",
          "connectionId": "mysql-prod"
        }

        List tables in specific schema (PostgreSQL):
        {
          "operation": "list_tables",
          "connectionId": "pg-analytics",
          "schema": "public"
        }

        Get table structure:
        {
          "operation": "describe_table",
          "connectionId": "mysql-prod",
          "tableName": "users"
        }

        Check connection status:
        {
          "operation": "status",
          "connectionId": "mysql-prod"
        }

        Close connection:
        {
          "operation": "disconnect",
          "connectionId": "mysql-prod"
        }

        === Advanced SQL Examples ===

        Common Table Expressions (CTE):
        {
          "operation": "query",
          "connectionId": "pg-analytics",
          "sql": "WITH monthly_sales AS (SELECT DATE_TRUNC('month', created_at) as month, SUM(amount) as total FROM orders WHERE created_at >= $1 GROUP BY month) SELECT month, total, LAG(total) OVER (ORDER BY month) as prev_month FROM monthly_sales ORDER BY month",
          "params": ["2024-01-01"]
        }

        Recursive query (PostgreSQL):
        {
          "operation": "query",
          "connectionId": "pg-analytics",
          "sql": "WITH RECURSIVE category_tree AS (SELECT id, name, parent_id, 0 as level FROM categories WHERE parent_id IS NULL UNION ALL SELECT c.id, c.name, c.parent_id, ct.level + 1 FROM categories c JOIN category_tree ct ON c.parent_id = ct.id) SELECT * FROM category_tree ORDER BY level, name"
        }

        Full-text search (MySQL):
        {
          "operation": "query",
          "connectionId": "mysql-prod",
          "sql": "SELECT id, title, MATCH(title, content) AGAINST(? IN NATURAL LANGUAGE MODE) as relevance FROM articles WHERE MATCH(title, content) AGAINST(? IN NATURAL LANGUAGE MODE) ORDER BY relevance DESC",
          "params": ["database optimization", "database optimization"]
        }

        IMPORTANT NOTES:
        - Always use parameterized queries (? for MySQL, $1,$2,... for PostgreSQL) to prevent SQL injection
        - Use appropriate data types for each database system
        - MySQL uses AUTO_INCREMENT, PostgreSQL uses SERIAL for auto-incrementing IDs
        - PostgreSQL parameter placeholders are $1, $2, etc. MySQL uses ?
        - PostgreSQL supports advanced features like JSONB, arrays, window functions
        - Always close connections when done to free resources
        - Check connection status before performing operations
        - Use transactions for multiple related operations (wrap in BEGIN/COMMIT)
      `,
      inputSchema: z.object({
        operation: z.enum([
          'connect',
          'query', 
          'execute',
          'list_databases',
          'list_tables',
          'describe_table',
          'disconnect',
          'status'
        ]).describe('Type of database operation to perform'),
        
        connectionId: z.string().describe('Unique identifier for the database connection'),
        
        // 连接配置（仅用于connect操作）
        connectionConfig: z.object({
          type: z.enum(['mysql', 'postgresql']).describe('Database type'),
          host: z.string().describe('Database host address'),
          port: z.number().describe('Database port number'),
          database: z.string().describe('Database name'),
          user: z.string().describe('Database username'),
          password: z.string().describe('Database password'),
          ssl: z.boolean().optional().describe('Enable SSL connection (optional)')
        }).optional().describe('Database connection configuration (required for connect operation)'),
        
        // SQL语句（用于query和execute操作）
        sql: z.string().optional().describe('SQL statement to execute (required for query and execute operations)'),
        
        // SQL参数（用于参数化查询）
        params: z.array(z.any()).optional().describe('Parameters for parameterized SQL queries (optional)'),
        
        // 表名（用于describe_table操作）
        tableName: z.string().optional().describe('Table name (required for describe_table operation)'),
        
        // 模式名（主要用于PostgreSQL）
        schema: z.string().optional().describe('Schema name (optional, mainly for PostgreSQL)'),
        
        // 额外选项
        options: z.object({
          timeout: z.number().optional().describe('Query timeout in milliseconds'),
          maxRows: z.number().optional().describe('Maximum number of rows to return'),
        }).optional().describe('Additional options for the operation')
      })
    };
  }

  /**
   * 执行数据库操作
   */
  async executeDatabaseOperation(params: DatabaseOperationParams): Promise<DatabaseOperationResponse> {
    const startTime = Date.now();
    
    try {
      logger.info(`Executing database operation: ${params.operation} on connection: ${params.connectionId}`);
      
      let result: DatabaseOperationResponse;
      
      switch (params.operation) {
        case 'connect':
          result = await this.handleConnect(params);
          break;
          
        case 'query':
          result = await this.handleQuery(params);
          break;
          
        case 'execute':
          result = await this.handleExecute(params);
          break;
          
        case 'list_databases':
          result = await this.handleListDatabases(params);
          break;
          
        case 'list_tables':
          result = await this.handleListTables(params);
          break;
          
        case 'describe_table':
          result = await this.handleDescribeTable(params);
          break;
          
        case 'disconnect':
          result = await this.handleDisconnect(params);
          break;
          
        case 'status':
          result = await this.handleStatus(params);
          break;
          
        default:
          throw new DatabaseError(`Unsupported operation: ${params.operation}`, 'INVALID_OPERATION');
      }
      
      // 添加执行时间和时间戳
      result.executionTime = Date.now() - startTime;
      result.timestamp = new Date();
      
      logger.info(`Database operation completed successfully in ${result.executionTime}ms`);
      return result;
      
    } catch (error) {
      const executionTime = Date.now() - startTime;
      logger.error(`Database operation failed after ${executionTime}ms:`, error);
      
      if (error instanceof DatabaseError) {
        return {
          success: false,
          operation: params.operation,
          connectionId: params.connectionId,
          error: error.message,
          code: error.code,
          executionTime,
          timestamp: new Date()
        };
      }
      
      return {
        success: false,
        operation: params.operation,
        connectionId: params.connectionId,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'UNKNOWN_ERROR',
        executionTime,
        timestamp: new Date()
      };
    }
  }

  /**
   * 处理连接操作
   */
  private async handleConnect(params: DatabaseOperationParams): Promise<DatabaseOperationResponse> {
    if (!params.connectionConfig) {
      throw new DatabaseError('Connection configuration is required for connect operation', 'MISSING_CONFIG');
    }
    
    await this.databaseService.connect({
      connectionId: params.connectionId,
      type: params.connectionConfig.type,
      host: params.connectionConfig.host,
      port: params.connectionConfig.port,
      database: params.connectionConfig.database,
      user: params.connectionConfig.user,
      password: params.connectionConfig.password,
      ssl: params.connectionConfig.ssl
    });
    
    return {
      success: true,
      operation: 'connect',
      connectionId: params.connectionId
    };
  }

  /**
   * 处理查询操作
   */
  private async handleQuery(params: DatabaseOperationParams): Promise<DatabaseOperationResponse> {
    if (!params.sql) {
      throw new DatabaseError('SQL statement is required for query operation', 'MISSING_SQL');
    }
    
    const result = await this.databaseService.query(
      params.connectionId,
      params.sql,
      params.params
    );
    
    return {
      success: true,
      operation: 'query',
      connectionId: params.connectionId,
      rows: result.rows,
      rowCount: result.rowCount
    };
  }

  /**
   * 处理执行操作
   */
  private async handleExecute(params: DatabaseOperationParams): Promise<DatabaseOperationResponse> {
    if (!params.sql) {
      throw new DatabaseError('SQL statement is required for execute operation', 'MISSING_SQL');
    }
    
    const result = await this.databaseService.execute(
      params.connectionId,
      params.sql,
      params.params
    );
    
    return {
      success: true,
      operation: 'execute',
      connectionId: params.connectionId,
      affectedRows: result.affectedRows,
      insertId: result.insertId
    };
  }

  /**
   * 处理列出数据库操作
   */
  private async handleListDatabases(params: DatabaseOperationParams): Promise<DatabaseOperationResponse> {
    const databases = await this.databaseService.listDatabases(params.connectionId);
    
    return {
      success: true,
      operation: 'list_databases',
      connectionId: params.connectionId,
      databases: databases.map(db => typeof db === 'string' ? db : db.name)
    };
  }

  /**
   * 处理列出表操作
   */
  private async handleListTables(params: DatabaseOperationParams): Promise<DatabaseOperationResponse> {
    const tables = await this.databaseService.listTables(params.connectionId, params.schema);
    
    return {
      success: true,
      operation: 'list_tables',
      connectionId: params.connectionId,
      tables: tables.map(table => typeof table === 'string' ? table : table.name)
    };
  }

  /**
   * 处理描述表操作
   */
  private async handleDescribeTable(params: DatabaseOperationParams): Promise<DatabaseOperationResponse> {
    if (!params.tableName) {
      throw new DatabaseError('Table name is required for describe_table operation', 'MISSING_TABLE_NAME');
    }
    
    const columns = await this.databaseService.describeTable(
      params.connectionId,
      params.tableName,
      params.schema
    );
    
    return {
      success: true,
      operation: 'describe_table',
      connectionId: params.connectionId,
      columns
    };
  }

  /**
   * 处理断开连接操作
   */
  private async handleDisconnect(params: DatabaseOperationParams): Promise<DatabaseOperationResponse> {
    await this.databaseService.disconnect(params.connectionId);
    
    return {
      success: true,
      operation: 'disconnect',
      connectionId: params.connectionId
    };
  }

  /**
   * 处理状态查询操作
   */
  private async handleStatus(params: DatabaseOperationParams): Promise<DatabaseOperationResponse> {
    const connections = this.databaseService.getConnectionStatus();

    return {
      success: true,
      operation: 'status',
      connectionId: params.connectionId,
      connections: connections.map(conn => ({
        id: conn.id,
        type: conn.type,
        host: 'unknown', // 需要从连接管理器获取
        database: 'unknown', // 需要从连接管理器获取
        status: conn.isConnected ? 'connected' : 'disconnected',
        lastUsed: conn.lastUsed
      }))
    };
  }
}
