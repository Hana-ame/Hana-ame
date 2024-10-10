import React, { useState } from 'react';

function App() {
    const [csvData, setCsvData] = useState([]);
    const [columns, setColumns] = useState([]);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target.result;
                parseCSV(text);
            };
            reader.readAsText(file);
        }
    };

    const parseCSV = (text) => {
        const lines = text.split('\n');
        const result = lines.map(line => line.split(','));
        setCsvData(result);
        
        // 设置列名（第一行）
        if (result.length > 0) {
            setColumns(result[0]);
        }
    };

    const handleButtonClick = (column) => {
        alert(`You clicked on the column: ${column}`);
        // 在这里可以添加其他与列相关的逻辑
    };

    return (
        <div>
            <h1>CSV Reader</h1>
            <input type="file" accept=".csv" onChange={handleFileChange} />

            {/* 动态生成按钮 */}
            <div>
                {columns.map((column, index) => (
                    <button key={index} onClick={() => handleButtonClick(column)}>
                        {column}
                    </button>
                ))}
            </div>

            {/* 显示 CSV 数据 */}
            <table>
                <thead>
                    <tr>
                        {csvData[0] && csvData[0].map((header, index) => (
                            <th key={index}>{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {csvData.slice(1).map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {row.map((cell, cellIndex) => (
                                <td key={cellIndex}>{cell}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default App;