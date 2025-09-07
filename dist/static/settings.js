/**
 * MCP工具设置页面交互逻辑
 */

class SettingsManager {
    constructor() {
        this.init();
    }

    async init() {
        this.bindEvents();
        await this.loadSettings();
    }

    bindEvents() {
        // 保存设置
        document.getElementById('save-settings').addEventListener('click', () => {
            this.saveSettings();
        });

        // 重置设置
        document.getElementById('reset-settings').addEventListener('click', () => {
            this.resetSettings();
        });

        // 测试配置
        document.getElementById('test-settings').addEventListener('click', () => {
            this.testSettings();
        });

        // 添加数据库连接
        document.getElementById('add-connection').addEventListener('click', () => {
            this.addConnection();
        });

        // 数据库类型变化时更新默认端口
        document.addEventListener('change', (e) => {
            if (e.target.name === 'type') {
                const portInput = e.target.closest('.connection-form').querySelector('input[name="port"]');
                if (e.target.value === 'mysql') {
                    portInput.value = '3306';
                } else if (e.target.value === 'postgresql') {
                    portInput.value = '5432';
                }
            }
        });
    }

    async loadSettings() {
        try {
            this.showStatus('正在加载设置...', 'info');
            
            const response = await fetch('/api/settings');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const settings = await response.json();
            this.populateForm(settings);
            this.showStatus('设置加载成功', 'success');
            
            setTimeout(() => this.clearStatus(), 3000);
        } catch (error) {
            console.error('加载设置失败:', error);
            this.showStatus(`加载设置失败: ${error.message}`, 'error');
        }
    }

    populateForm(settings) {
        // collect_feedback 设置
        const feedback = settings.collectFeedback || {};
        document.getElementById('dialogTimeout').value = Math.floor((feedback.dialogTimeout || 60000) / 1000);
        document.getElementById('autoOpenBrowser').checked = feedback.autoOpenBrowser !== false;
        document.getElementById('defaultWorkSummary').value = feedback.defaultWorkSummary || '';

        // database_operation 设置
        const database = settings.databaseOperation || {};
        document.getElementById('defaultTimeout').value = database.defaultTimeout || 30000;
        document.getElementById('defaultMaxRows').value = database.defaultMaxRows || 1000;
        document.getElementById('defaultSchema').value = database.defaultSchema || '';

        // 数据库连接
        this.populateConnections(database.defaultConnections || {});
    }

    populateConnections(connections) {
        const container = document.getElementById('connections-list');
        container.innerHTML = '';

        Object.entries(connections).forEach(([connectionId, config]) => {
            this.addConnection(connectionId, config);
        });
    }

    addConnection(connectionId = '', config = {}) {
        const template = document.getElementById('connection-template');
        const clone = template.content.cloneNode(true);
        
        // 填充数据
        if (connectionId) {
            clone.querySelector('input[name="connectionId"]').value = connectionId;
        }
        clone.querySelector('select[name="type"]').value = config.type || 'mysql';
        clone.querySelector('input[name="host"]').value = config.host || 'localhost';
        clone.querySelector('input[name="port"]').value = config.port || (config.type === 'postgresql' ? 5432 : 3306);
        clone.querySelector('input[name="database"]').value = config.database || '';
        clone.querySelector('input[name="user"]').value = config.user || '';
        clone.querySelector('input[name="password"]').value = config.password || '';
        clone.querySelector('input[name="ssl"]').checked = config.ssl || false;

        // 绑定删除事件
        clone.querySelector('.remove-connection').addEventListener('click', (e) => {
            e.target.closest('.connection-item').remove();
        });

        document.getElementById('connections-list').appendChild(clone);
    }

    async saveSettings() {
        try {
            this.showStatus('正在保存设置...', 'info');
            
            const settings = this.collectFormData();
            
            const response = await fetch('/api/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settings)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || `HTTP ${response.status}`);
            }

            this.showStatus('设置保存成功！', 'success');
            setTimeout(() => this.clearStatus(), 3000);
        } catch (error) {
            console.error('保存设置失败:', error);
            this.showStatus(`保存设置失败: ${error.message}`, 'error');
        }
    }

    collectFormData() {
        // collect_feedback 设置
        const dialogTimeout = parseInt(document.getElementById('dialogTimeout').value) * 1000;
        const autoOpenBrowser = document.getElementById('autoOpenBrowser').checked;
        const defaultWorkSummary = document.getElementById('defaultWorkSummary').value.trim() || undefined;

        // database_operation 设置
        const defaultTimeout = parseInt(document.getElementById('defaultTimeout').value);
        const defaultMaxRows = parseInt(document.getElementById('defaultMaxRows').value);
        const defaultSchema = document.getElementById('defaultSchema').value.trim() || undefined;

        // 收集数据库连接
        const connections = {};
        document.querySelectorAll('.connection-item').forEach(item => {
            const connectionId = item.querySelector('input[name="connectionId"]').value.trim();
            if (connectionId) {
                connections[connectionId] = {
                    type: item.querySelector('select[name="type"]').value,
                    host: item.querySelector('input[name="host"]').value.trim(),
                    port: parseInt(item.querySelector('input[name="port"]').value),
                    database: item.querySelector('input[name="database"]').value.trim(),
                    user: item.querySelector('input[name="user"]').value.trim(),
                    password: item.querySelector('input[name="password"]').value,
                    ssl: item.querySelector('input[name="ssl"]').checked
                };
            }
        });

        return {
            collectFeedback: {
                dialogTimeout,
                autoOpenBrowser,
                defaultWorkSummary
            },
            databaseOperation: {
                defaultConnections: connections,
                defaultTimeout,
                defaultMaxRows,
                defaultSchema
            }
        };
    }

    async resetSettings() {
        if (!confirm('确定要重置所有设置为默认值吗？此操作不可撤销。')) {
            return;
        }

        try {
            this.showStatus('正在重置设置...', 'info');
            
            const response = await fetch('/api/settings/reset', {
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            await this.loadSettings();
            this.showStatus('设置已重置为默认值', 'success');
        } catch (error) {
            console.error('重置设置失败:', error);
            this.showStatus(`重置设置失败: ${error.message}`, 'error');
        }
    }

    async testSettings() {
        try {
            this.showStatus('正在测试配置...', 'info');
            
            const settings = this.collectFormData();
            
            const response = await fetch('/api/settings/test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settings)
            });

            const result = await response.json();
            
            if (result.success) {
                this.showStatus('配置测试通过！', 'success');
            } else {
                this.showStatus(`配置测试失败: ${result.message}`, 'error');
            }
        } catch (error) {
            console.error('测试配置失败:', error);
            this.showStatus(`测试配置失败: ${error.message}`, 'error');
        }
    }

    showStatus(message, type) {
        const statusEl = document.getElementById('status-message');
        statusEl.textContent = message;
        statusEl.className = `status-message ${type}`;
    }

    clearStatus() {
        const statusEl = document.getElementById('status-message');
        statusEl.textContent = '';
        statusEl.className = 'status-message';
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new SettingsManager();
});
