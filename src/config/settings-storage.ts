/**
 * 设置存储管理器
 * 负责工具默认参数的持久化存储
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Config, ToolDefaultsConfig } from '../types/index.js';
import { logger } from '../utils/logger.js';

// 获取当前文件目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 设置文件路径
const SETTINGS_FILE = path.resolve(__dirname, '../../settings.json');

/**
 * 设置存储类
 */
export class SettingsStorage {
  private static instance: SettingsStorage;
  private settings: ToolDefaultsConfig = {};
  private isInitialized = false;

  private constructor() {}

  /**
   * 获取单例实例
   */
  static getInstance(): SettingsStorage {
    if (!SettingsStorage.instance) {
      SettingsStorage.instance = new SettingsStorage();
    }
    return SettingsStorage.instance;
  }

  /**
   * 初始化设置存储（确保设置被加载）
   */
  async initialize(): Promise<void> {
    if (!this.isInitialized) {
      await this.loadSettings();
      this.isInitialized = true;
      logger.info('设置存储初始化完成');
    }
  }

  /**
   * 加载设置
   */
  async loadSettings(): Promise<ToolDefaultsConfig> {
    try {
      const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
      this.settings = JSON.parse(data);
      logger.info(`设置加载成功，文件路径: ${SETTINGS_FILE}`);
      return this.settings;
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        logger.info(`设置文件不存在: ${SETTINGS_FILE}，使用默认设置`);
        // 初始化为默认设置
        this.settings = {
          collectFeedback: {
            dialogTimeout: 60000,
            autoOpenBrowser: true,
            defaultWorkSummary: undefined
          },
          databaseOperation: {
            defaultConnections: {},
            defaultTimeout: 30000,
            defaultMaxRows: 1000,
            defaultSchema: undefined
          }
        };
        return this.settings;
      }
      logger.error('加载设置失败:', error);
      return this.settings;
    }
  }

  /**
   * 保存设置
   */
  async saveSettings(settings: ToolDefaultsConfig): Promise<void> {
    try {
      this.settings = { ...settings };
      await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
      logger.info('设置保存成功');
    } catch (error) {
      logger.error('保存设置失败:', error);
      throw new Error(`保存设置失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 获取当前设置
   */
  getSettings(): ToolDefaultsConfig {
    return { ...this.settings };
  }

  /**
   * 更新部分设置
   */
  async updateSettings(partialSettings: Partial<ToolDefaultsConfig>): Promise<void> {
    const newSettings = {
      ...this.settings,
      ...partialSettings
    };
    await this.saveSettings(newSettings);
  }

  /**
   * 重置设置为默认值
   */
  async resetSettings(): Promise<void> {
    const defaultSettings: ToolDefaultsConfig = {
      collectFeedback: {
        dialogTimeout: 60000,
        autoOpenBrowser: true,
        defaultWorkSummary: undefined
      },
      databaseOperation: {
        defaultConnections: {},
        defaultTimeout: 30000,
        defaultMaxRows: 1000,
        defaultSchema: undefined
      }
    };
    await this.saveSettings(defaultSettings);
  }

  /**
   * 合并设置到配置对象
   */
  mergeWithConfig(config: Config): Config {
    const settings = this.getSettings();
    return {
      ...config,
      toolDefaults: {
        ...config.toolDefaults,
        ...settings
      }
    };
  }

  /**
   * 获取collect_feedback工具的默认参数
   */
  getCollectFeedbackDefaults() {
    return this.settings.collectFeedback || {};
  }

  /**
   * 获取database_operation工具的默认参数
   */
  getDatabaseOperationDefaults() {
    return this.settings.databaseOperation || {};
  }

  /**
   * 检查设置文件是否存在
   */
  async settingsFileExists(): Promise<boolean> {
    try {
      await fs.access(SETTINGS_FILE);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * 获取设置存储实例
 */
export const settingsStorage = SettingsStorage.getInstance();
