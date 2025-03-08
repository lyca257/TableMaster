class FileHandler {
    constructor() {
        this.supportedFormats = ['.xlsx', '.xls', '.sql', '.jql'];
    }

    async readFile(file) {
        const extension = this.getFileExtension(file.name).toLowerCase();
        if (!this.supportedFormats.includes(extension)) {
            throw new Error('不支持的文件格式');
        }

        switch (extension) {
            case '.xlsx':
            case '.xls':
                return await this.readExcelFile(file);
            case '.sql':
                return await this.readSqlFile(file);
            case '.jql':
                return await this.readJqlFile(file);
            default:
                throw new Error('未知的文件格式');
        }
    }

    async readExcelFile(file) {
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.onload = async (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                    
                    // 转换为表格数据格式
                    const headers = jsonData[0];
                    const rows = jsonData.slice(1).map(row => {
                        const obj = {};
                        headers.forEach((header, index) => {
                            obj[header] = row[index];
                        });
                        return obj;
                    });

                    resolve({
                        columns: headers.map(h => ({ prop: h, label: h })),
                        data: rows
                    });
                } catch (error) {
                    reject(new Error('Excel文件解析失败：' + error.message));
                }
            };
            reader.onerror = () => reject(new Error('文件读取失败'));
            reader.readAsArrayBuffer(file);
        });
    }

    async readSqlFile(file) {
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.onload = (e) => {
                try {
                    const content = e.target.result;
                    // 简单的SQL解析示例
                    const lines = content.split('\n')
                        .map(line => line.trim())
                        .filter(line => line && !line.startsWith('--'));
                    
                    resolve({
                        type: 'sql',
                        content: lines.join('\n')
                    });
                } catch (error) {
                    reject(new Error('SQL文件解析失败：' + error.message));
                }
            };
            reader.onerror = () => reject(new Error('文件读取失败'));
            reader.readAsText(file);
        });
    }

    async readJqlFile(file) {
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.onload = (e) => {
                try {
                    const content = e.target.result;
                    // JQL解析逻辑
                    resolve({
                        type: 'jql',
                        content: content.trim()
                    });
                } catch (error) {
                    reject(new Error('JQL文件解析失败：' + error.message));
                }
            };
            reader.onerror = () => reject(new Error('文件读取失败'));
            reader.readAsText(file);
        });
    }

    getFileExtension(filename) {
        return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 1);
    }
}

// 导出FileHandler类
export default FileHandler;