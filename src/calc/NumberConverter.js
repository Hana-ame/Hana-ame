import { useState } from 'react';

const NumberConverter = () => {
  const [value, setValue] = useState(0);

  const handleHexChange = (e) => {
    const hex = e.target.value;
    if (hex === '') {
      setValue(0);
      return;
    }
    if (/^[0-9A-Fa-f]+$/.test(hex)) {
      setValue(parseInt(hex, 16));
    }
  };

  const handleDecChange = (e) => {
    const dec = e.target.value;
    if (dec === '') {
      setValue(0);
      return;
    }
    if (/^\d+$/.test(dec)) {
      setValue(parseInt(dec, 10));
    }
  };

  const handleBinChange = (e) => {
    const bin = e.target.value;
    if (bin === '') {
      setValue(0);
      return;
    }
    if (/^[01]+$/.test(bin)) {
      setValue(parseInt(bin, 2));
    }
  };

  return (
    <div className="w-full mx-auto bg-white rounded-xl border shadow-sm">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-center">数字进制转换器</h2>
      </div>
      <div className="p-6 pt-0 space-y-4">
        <div className="space-y-2">
          <label htmlFor="hex" className="block text-sm font-medium text-gray-700">
            十六进制 (Hex)
          </label>
          <input
            id="hex"
            type="text"
            value={value ? value.toString(16).toUpperCase() : ''}
            onChange={handleHexChange}
            placeholder="输入十六进制数..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="decimal" className="block text-sm font-medium text-gray-700">
            十进制 (Decimal)
          </label>
          <input
            id="decimal"
            type="text"
            value={value ? value.toString(10) : ''}
            onChange={handleDecChange}
            placeholder="输入十进制数..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="binary" className="block text-sm font-medium text-gray-700">
            二进制 (Binary)
          </label>
          <input
            id="binary"
            type="text"
            value={value ? value.toString(2) : ''}
            onChange={handleBinChange}
            placeholder="输入二进制数..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
          />
        </div>
      </div>
    </div>
  );
};

export default NumberConverter;