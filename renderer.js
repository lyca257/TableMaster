// 渲染进程的主要逻辑

// DOM元素加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    // 初始化应用
    initializeApp();
});

function initializeApp() {
    // 设置版本信息
    const version = '1.0.0';
    document.title = `TableMaster v${version}`;

    // 后续将在这里添加：
    // 1. 表格组件的初始化
    // 2. 文件操作功能
    // 3. 与主进程的IPC通信
    // 4. AI助手功能的集成
}