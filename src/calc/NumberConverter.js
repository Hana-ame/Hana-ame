/* eslint-disable no-undef */
import { useState } from 'react';
import InputWithUnderline from './InputWithUnderline';
import BitExtractor from './BitExtractor.js'
import BaseSelector from './BaseSelector.js';
import { BigIntWithBase, myFormat, myStrip } from './utils.ts';
// import BigInt;

const NumberConverter = () => {
  const [value, setValue] = useState("")
  const [hexValue, setHexValue] = useState("")
  const [decValue, setDecValue] = useState("")
  const [binValue, setBinValue] = useState("")
  const [base, setBase] = useState(10); // 存储当前选择的进制
  const [count, setCount] = useState(3);


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


  // 增加计数器数量
  const addCounter = () => {
    setCount(prev => prev + 1);
  };

  // 减少计数器数量
  const removeCounter = () => {
    if (count > 1) {
      setCount(prev => prev - 1);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <input
        type="text"
        value={value} // 将输入框的值绑定到状态
        onChange={handleChange} // 更新状态
        className={`border border-gray-300 p-2 rounded mb-2 w-full`} // 根据状态改变背景色
      />
      <div className="flex justify-between w-full mb-2">
        <BaseSelector base={base} handleBase={handleBase} ></BaseSelector>
        <BaseSelector base={base} handleBase={handleBase} ></BaseSelector>
        <BaseSelector base={base} handleBase={handleBase} ></BaseSelector>
        <BaseSelector base={base} handleBase={handleBase} ></BaseSelector>
        <BaseSelector base={base} handleBase={handleBase} ></BaseSelector>
      </div>
      <InputWithUnderline value={hexValue} placeholder="hex" />
      <InputWithUnderline value={decValue} placeholder="dec" />
      <InputWithUnderline value={binValue} placeholder="bin" />

      <div className="flex gap-4 items-center">
        <button
          onClick={removeCounter}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none disabled:opacity-50"
          disabled={count <= 1}
        >
          减少
        </button>
        <span className="font-medium">当前计数器数量: {count}</span>
        <button
          onClick={addCounter}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
        >
          增加
        </button>
      </div>

        {Array.from({ length: count }).map(() => (
          <BitExtractor value={decValue}></BitExtractor>
        ))}
    </div>
  );
};

export default NumberConverter;