/**
 * MCP工具设置页面交互逻辑
 */
declare class SettingsManager {
    init(): Promise<void>;
    bindEvents(): void;
    loadSettings(): Promise<void>;
    populateForm(settings: any): void;
    populateConnections(connections: any): void;
    addConnection(connectionId?: string, config?: {}): void;
    saveSettings(): Promise<void>;
    collectFormData(): {
        collectFeedback: {
            dialogTimeout: number;
            autoOpenBrowser: any;
            defaultWorkSummary: any;
        };
        databaseOperation: {
            defaultConnections: {};
            defaultTimeout: number;
            defaultMaxRows: number;
            defaultSchema: any;
        };
    };
    resetSettings(): Promise<void>;
    testSettings(): Promise<void>;
    showStatus(message: any, type: any): void;
    clearStatus(): void;
}
//# sourceMappingURL=settings.d.ts.map