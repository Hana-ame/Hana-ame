import React, { useState, useEffect } from 'react';
import { BigIntWithBase } from './utils';
import InputWithUnderline from './InputWithUnderline'

const BitExtractor = ({ value }) => {

    const [highBit, setHighBit] = useState(0);
    const [lowBit, setLowBit] = useState(0);
    const [bigint, setBigint] = useState(BigIntWithBase(value));

    useEffect(() => {
        const handleExtractBits = () => {
            if (highBit < lowBit || highBit < 0 || lowBit < 0) {
                //   alert("高位必须大于等于低位，并且不能为负数");
                return;
            }

            const mask = (BigIntWithBase(1) << BigIntWithBase(highBit + 1)) - BigIntWithBase(1);
            const extractedBits = (BigIntWithBase(value) & mask) >> BigIntWithBase(lowBit);

            setBigint(extractedBits);
        };
        handleExtractBits()
    }, [highBit, lowBit, value])

    return (
        <div className="flex gap-4 w-full">
            {/* 前两个窄输入框，每个只有3个字符宽 */}
            <input
                type="text"
                className="w-12 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={e => setHighBit(Number(e.target.value))}
                value={highBit}
                maxLength="3"
            />
            <input
                type="text"
                className="w-12 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={e => setLowBit(Number(e.target.value))}
                value={lowBit}
                maxLength="3"
            />

            <div className="flex gap-4 w-full">

                {/* 中间两个常规输入框 */}
                <div className="w-1/4">
                    <InputWithUnderline value={bigint.toString(16).padStart(Math.ceil((highBit - lowBit + 1) / 4), '0')} placeholder="hex" />
                </div>
                <div className="w-1/4">
                    <InputWithUnderline value={bigint.toString(10)} placeholder="dec" />
                </div>


                {/* 最后一个占据屏幕一半的输入框 */}
                <div className="w-1/2">
                    <InputWithUnderline value={bigint.toString(2).padStart(Math.ceil((highBit - lowBit + 1)), '0')} placeholder="bin" />
                </div>
            </div>

        </div>
    );
};

export default BitExtractor;