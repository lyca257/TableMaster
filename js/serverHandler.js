class ServerHandler {
    constructor() {
        this.baseUrl = 'http://localhost:3000';
        this.connected = false;
    }

    async connect(config) {
        try {
            const response = await fetch(`${this.baseUrl}/connect`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(config)
            });

            if (!response.ok) {
                throw new Error('连接服务器失败');
            }

            const data = await response.json();
            this.connected = true;
            return data;
        } catch (error) {
            throw new Error(`服务器连接错误: ${error.message}`);
        }
    }

    async disconnect() {
        if (!this.connected) {
            return;
        }

        try {
            await fetch(`${this.baseUrl}/disconnect`, {
                method: 'POST'
            });
            this.connected = false;
        } catch (error) {
            console.error('断开连接失败:', error);
        }
    }

    async askAI(question, tableData) {
        if (!this.connected) {
            throw new Error('请先连接服务器');
        }

        try {
            const response = await fetch(`${this.baseUrl}/ai/ask`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    question,
                    tableData
                })
            });

            if (!response.ok) {
                throw new Error('AI请求失败');
            }

            return await response.json();
        } catch (error) {
            throw new Error(`AI助手错误: ${error.message}`);
        }
    }

    isConnected() {
        return this.connected;
    }
}

export default ServerHandler;