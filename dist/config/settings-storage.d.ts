/**
 * 设置存储管理器
 * 负责工具默认参数的持久化存储
 */
import { Config, ToolDefaultsConfig } from '../types/index.js';
/**
 * 设置存储类
 */
export declare class SettingsStorage {
    private static instance;
    private settings;
    private isInitialized;
    private constructor();
    /**
     * 获取单例实例
     */
    static getInstance(): SettingsStorage;
    /**
     * 初始化设置存储（确保设置被加载）
     */
    initialize(): Promise<void>;
    /**
     * 加载设置
     */
    loadSettings(): Promise<ToolDefaultsConfig>;
    /**
     * 保存设置
     */
    saveSettings(settings: ToolDefaultsConfig): Promise<void>;
    /**
     * 获取当前设置
     */
    getSettings(): ToolDefaultsConfig;
    /**
     * 更新部分设置
     */
    updateSettings(partialSettings: Partial<ToolDefaultsConfig>): Promise<void>;
    /**
     * 重置设置为默认值
     */
    resetSettings(): Promise<void>;
    /**
     * 合并设置到配置对象
     */
    mergeWithConfig(config: Config): Config;
    /**
     * 获取collect_feedback工具的默认参数
     */
    getCollectFeedbackDefaults(): {
        dialogTimeout?: number;
        autoOpenBrowser?: boolean;
        defaultWorkSummary?: string | undefined;
    };
    /**
     * 获取database_operation工具的默认参数
     */
    getDatabaseOperationDefaults(): {
        defaultConnections?: {
            [connectionId: string]: {
                type: "mysql" | "postgresql";
                host: string;
                port: number;
                database: string;
                user: string;
                password: string;
                ssl?: boolean;
            };
        };
        defaultTimeout?: number;
        defaultMaxRows?: number;
        defaultSchema?: string | undefined;
    };
    /**
     * 检查设置文件是否存在
     */
    settingsFileExists(): Promise<boolean>;
}
/**
 * 获取设置存储实例
 */
export declare const settingsStorage: SettingsStorage;
//# sourceMappingURL=settings-storage.d.ts.map