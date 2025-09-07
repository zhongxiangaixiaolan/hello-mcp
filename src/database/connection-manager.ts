/**
 * 数据库连接管理器
 */

import mysql from 'mysql2/promise';
import { Client as PgClient, Pool as PgPool } from 'pg';
import { logger } from '../utils/logger.js';
import {
  DatabaseType,
  DatabaseConfig,
  DatabaseConnection,
  DatabaseError
} from './types.js';

/**
 * 数据库连接管理器类
 */
export class DatabaseConnectionManager {
  private connections: Map<string, DatabaseConnection> = new Map();
  private pools: Map<string, any> = new Map();

  /**
   * 连接到数据库
   */
  async connect(config: DatabaseConfig): Promise<void> {
    try {
      logger.info(`连接数据库: ${config.id} (${config.type})`);

      let connection: any;
      let pool: any;

      switch (config.type) {
        case 'mysql':
          connection = await this.connectMySQL(config);
          pool = this.createMySQLPool(config);
          break;
        case 'postgresql':
          connection = await this.connectPostgreSQL(config);
          pool = this.createPostgreSQLPool(config);
          break;
        default:
          throw new DatabaseError(
            `不支持的数据库类型: ${config.type}`,
            'UNSUPPORTED_DATABASE_TYPE',
            config.id
          );
      }

      const dbConnection: DatabaseConnection = {
        id: config.id,
        type: config.type,
        config,
        connection,
        isConnected: true,
        lastUsed: new Date()
      };

      this.connections.set(config.id, dbConnection);
      this.pools.set(config.id, pool);

      logger.info(`数据库连接成功: ${config.id}`);
    } catch (error) {
      logger.error(`数据库连接失败: ${config.id}`, error);
      throw new DatabaseError(
        `连接数据库失败: ${error instanceof Error ? error.message : String(error)}`,
        'CONNECTION_FAILED',
        config.id,
        error
      );
    }
  }

  /**
   * 连接MySQL数据库
   */
  private async connectMySQL(config: DatabaseConfig): Promise<mysql.Connection> {
    const connectionOptions: any = {
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database
    };

    if (config.ssl !== undefined) {
      connectionOptions.ssl = config.ssl;
    }

    const connection = await mysql.createConnection(connectionOptions);

    // 测试连接
    await connection.ping();
    return connection;
  }

  /**
   * 创建MySQL连接池
   */
  private createMySQLPool(config: DatabaseConfig): mysql.Pool {
    const poolOptions: any = {
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      waitForConnections: true,
      connectionLimit: config.pool?.max || 10,
      queueLimit: 0,
      idleTimeout: config.pool?.idleTimeoutMillis || 60000,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    };

    if (config.ssl !== undefined) {
      poolOptions.ssl = config.ssl;
    }

    return mysql.createPool(poolOptions);
  }

  /**
   * 连接PostgreSQL数据库
   */
  private async connectPostgreSQL(config: DatabaseConfig): Promise<PgClient> {
    const clientOptions: any = {
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database
    };

    if (config.ssl !== undefined) {
      clientOptions.ssl = config.ssl;
    }

    const client = new PgClient(clientOptions);
    await client.connect();
    return client;
  }

  /**
   * 创建PostgreSQL连接池
   */
  private createPostgreSQLPool(config: DatabaseConfig): PgPool {
    const poolOptions: any = {
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      min: config.pool?.min || 0,
      max: config.pool?.max || 10,
      idleTimeoutMillis: config.pool?.idleTimeoutMillis || 60000,
      connectionTimeoutMillis: config.pool?.connectionTimeoutMillis || 30000
    };

    if (config.ssl !== undefined) {
      poolOptions.ssl = config.ssl;
    }

    return new PgPool(poolOptions);
  }

  /**
   * 获取连接
   */
  getConnection(connectionId: string): DatabaseConnection {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      throw new DatabaseError(
        `连接不存在: ${connectionId}`,
        'CONNECTION_NOT_FOUND',
        connectionId
      );
    }

    if (!connection.isConnected) {
      throw new DatabaseError(
        `连接已断开: ${connectionId}`,
        'CONNECTION_DISCONNECTED',
        connectionId
      );
    }

    // 更新最后使用时间
    connection.lastUsed = new Date();
    return connection;
  }

  /**
   * 获取连接池
   */
  getPool(connectionId: string): any {
    const pool = this.pools.get(connectionId);
    if (!pool) {
      throw new DatabaseError(
        `连接池不存在: ${connectionId}`,
        'POOL_NOT_FOUND',
        connectionId
      );
    }
    return pool;
  }

  /**
   * 断开连接
   */
  async disconnect(connectionId: string): Promise<void> {
    try {
      const connection = this.connections.get(connectionId);
      const pool = this.pools.get(connectionId);

      if (connection) {
        if (connection.type === 'mysql') {
          await connection.connection.end();
        } else if (connection.type === 'postgresql') {
          await connection.connection.end();
        }

        connection.isConnected = false;
        this.connections.delete(connectionId);
      }

      if (pool) {
        if (connection?.type === 'mysql') {
          await pool.end();
        } else if (connection?.type === 'postgresql') {
          await pool.end();
        }
        this.pools.delete(connectionId);
      }

      logger.info(`数据库连接已断开: ${connectionId}`);
    } catch (error) {
      logger.error(`断开数据库连接失败: ${connectionId}`, error);
      throw new DatabaseError(
        `断开连接失败: ${error instanceof Error ? error.message : String(error)}`,
        'DISCONNECT_FAILED',
        connectionId,
        error
      );
    }
  }

  /**
   * 断开所有连接
   */
  async disconnectAll(): Promise<void> {
    const connectionIds = Array.from(this.connections.keys());
    await Promise.all(connectionIds.map(id => this.disconnect(id)));
  }

  /**
   * 获取所有连接状态
   */
  getConnectionStatus(): Array<{
    id: string;
    type: DatabaseType;
    isConnected: boolean;
    lastUsed: Date;
  }> {
    return Array.from(this.connections.values()).map(conn => ({
      id: conn.id,
      type: conn.type,
      isConnected: conn.isConnected,
      lastUsed: conn.lastUsed
    }));
  }
}
