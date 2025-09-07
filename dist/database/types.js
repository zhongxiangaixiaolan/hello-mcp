/**
 * 数据库MCP工具 - 类型定义
 */
// 错误类型
export class DatabaseError extends Error {
    code;
    connectionId;
    details;
    constructor(message, code, connectionId, details) {
        super(message);
        this.code = code;
        this.connectionId = connectionId;
        this.details = details;
        this.name = 'DatabaseError';
    }
}
//# sourceMappingURL=types.js.map