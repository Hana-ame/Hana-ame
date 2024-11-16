/* eslint-disable no-undef */
import { useState } from 'react';
import InputWithUnderline from './InputWithUnderline';
// import BigInt;

const NumberConverter = () => {
  

  return (       
     <div className="flex flex-col items-center">
        <input
            type="text"
            className={`border border-gray-300 p-2 rounded mb-2 w-full`} // 根据状态改变背景色
        />
        <InputWithUnderline value={"1123"} placeholder={213}/>
    </div>
  );
};

export default NumberConverter;