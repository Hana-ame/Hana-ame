/* eslint-disable no-undef */
import { useState } from 'react';
import InputWithUnderline from './InputWithUnderline';
import { BigIntWithBase, myFormat, myStrip } from './utils.ts';
// import BigInt;

const NumberConverter = () => {
  const [value, setValue] = useState("")
  const [hexValue, setHexValue] = useState("")
  const [decValue, setDecValue] = useState("")
  const [binValue, setBinValue] = useState("")
  const [base, setBase] = useState(10); // 存储当前选择的进制


  const handleChange = (e) => {
    try {
      const raw = myStrip(e.target.value);
      const bn = BigIntWithBase(raw, base);
      
      setValue(e.target.value);

      setHexValue((bn.toString(16)));
      setBinValue((bn.toString(2)));
      setDecValue((bn.toString(10)));
    } catch (error) {
      // console.log("输入无效:", error); // 打印错误信息
    }
  }

  const handleBase = (b) => {
    setBase(b)
    const raw = myStrip(value);
    const bn = BigIntWithBase(raw, base);
    setValue(myFormat(bn.toString(b)));
  };

  return (       
     <div className="flex flex-col items-center">
        <input
            type="text"
            value={value} // 将输入框的值绑定到状态
            onChange={handleChange} // 更新状态
            className={`border border-gray-300 p-2 rounded mb-2 w-full`} // 根据状态改变背景色
        />
      <div className="flex space-x-2 mb-2">
        <button 
          onClick={() => handleBase(16)} 
          className={`border border-gray-300 p-2 rounded ${base === 16 ? 'bg-blue-500 text-white' : ''}`}>
          Hex
        </button>
        <button 
          onClick={() => handleBase(10)} 
          className={`border border-gray-300 p-2 rounded ${base === 10 ? 'bg-blue-500 text-white' : ''}`}>
          Dec
        </button>
        <button 
          onClick={() => handleBase(2)} 
          className={`border border-gray-300 p-2 rounded ${base === 2 ? 'bg-blue-500 text-white' : ''}`}>
          Bin
        </button>
      </div>
        <InputWithUnderline value={hexValue} placeholder="hex" />
        <InputWithUnderline value={decValue} placeholder="dec" />
        <InputWithUnderline value={binValue} placeholder="bin" />
    </div>
  );
};

export default NumberConverter;