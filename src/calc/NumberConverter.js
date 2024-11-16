/* eslint-disable no-undef */
import { useState } from 'react';
// import BigInt;

const NumberConverter = () => {
  // eslint-disable-next-line no-undef
  const [value, setValue] = useState(BigInt(0));

  // 格式化函数：每4位添加空格
  const formatGroup = (str) => {
    return str.replace(/(.{4})/g, '$1 ').trim();
  };

  // 十进制数字转字符串，避免科学计数法
  const toDecimalString = (num) => {
    if (!num) return '';
    // 使用 BigInt 来处理大数字，确保不会使用科学计数法
    // eslint-disable-next-line no-undef
    return BigInt(num).toString();
  };

  const handleHexChange = (e) => {
    // 移除所有空格后处理
    const hex = e.target.value.replace(/\s/g, '');
    if (hex === '') {
      setValue(0);
      return;
    }
    if (/^[0-9A-Fa-f]+$/.test(hex)) {
      setValue(BigInt(hex, 16));
    }
  };

  const handleDecChange = (e) => {
    const dec = e.target.value.replace(/\s/g, '');
    if (dec === '') {
      setValue(0);
      return;
    }
    if (/^\d+$/.test(dec)) {
      setValue(BigInt(dec, 10));
    }
  };

  const handleBinChange = (e) => {
    const bin = e.target.value.replace(/\s/g, '');
    if (bin === '') {
      setValue(0);
      return;
    }
    if (/^[01]+$/.test(bin)) {
      setValue(BigInt(bin, 2));
    }
  };

  // 获取实际值函数（用于复制）
  const getRawValue = (base) => {
    if (!value) return '';
    return base === 10 ? toDecimalString(value) : value.toString(base);
  };

  return (
    <div className="w-full mx-auto bg-white rounded-xl border shadow-sm">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-center">数字进制转换器(不能用)</h2>
      </div>
      <div className="p-6 pt-0 space-y-4">
        <div className="space-y-2">
          <label htmlFor="hex" className="block text-sm font-medium text-gray-700">
            十六进制 (Hex)
          </label>
          <div className="relative">
            <input
              id="hex"
              type="text"
              value={value ? formatGroup(value.toString(16).toUpperCase()) : ''}
              onChange={handleHexChange}
              placeholder="输入十六进制数..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
            />
            <div 
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm"
              onClick={() => navigator.clipboard.writeText(getRawValue(16))}
            >
              <button className="hover:bg-gray-100 p-1 rounded">复制</button>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="decimal" className="block text-sm font-medium text-gray-700">
            十进制 (Decimal)
          </label>
          <div className="relative">
            <input
              id="decimal"
              type="text"
              value={value ? formatGroup(toDecimalString(value)) : ''}
              onChange={handleDecChange}
              placeholder="输入十进制数..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
            />
            <div 
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm"
              onClick={() => navigator.clipboard.writeText(getRawValue(10))}
            >
              <button className="hover:bg-gray-100 p-1 rounded">复制</button>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="binary" className="block text-sm font-medium text-gray-700">
            二进制 (Binary)
          </label>
          <div className="relative">
            <input
              id="binary"
              type="text"
              value={value ? formatGroup(value.toString(2)) : ''}
              onChange={handleBinChange}
              placeholder="输入二进制数..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
            />
            <div 
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm"
              onClick={() => navigator.clipboard.writeText(getRawValue(2))}
            >
              <button className="hover:bg-gray-100 p-1 rounded">复制</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NumberConverter;