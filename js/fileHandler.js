class FileHandler {
    constructor() {
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.supportedTypes = [
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/csv'
        ];
    }

    async readFile(file) {
        if (!this.validateFile(file)) {
            throw new Error('文件验证失败');
        }

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = this.parseFileData(e.target.result, file.type);
                    resolve(data);
                } catch (error) {
                    reject(new Error('文件解析失败：' + error.message));
                }
            };
            reader.onerror = () => reject(new Error('文件读取失败'));
            reader.readAsBinaryString(file);
        });
    }

    validateFile(file) {
        if (file.size > this.maxFileSize) {
            throw new Error(`文件大小不能超过${this.maxFileSize / 1024 / 1024}MB`);
        }
        if (!this.supportedTypes.includes(file.type)) {
            throw new Error('不支持的文件类型，请上传Excel或CSV文件');
        }
        return true;
    }

    parseFileData(data, fileType) {
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length < 2) {
            throw new Error('文件内容为空或格式不正确');
        }

        const headers = jsonData[0];
        const rows = jsonData.slice(1);

        return rows.map(row => {
            const rowData = {};
            headers.forEach((header, index) => {
                rowData[header] = row[index] || '';
            });
            return rowData;
        });
    }

    async saveToExcel(data, columns) {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `表格数据_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
