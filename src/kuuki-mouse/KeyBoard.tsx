import React, { useState } from 'react';

// 定义组件Props接口
interface QwertyKeyboardProps {
  onKeyPress?: (key: string) => void;
}

// 定义键盘按键组件Props接口
interface KeyButtonProps {
  value: string;
  onClick: () => void;
  className?: string;
}

// 键盘按键组件
const KeyButton: React.FC<KeyButtonProps> = ({ value, onClick, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center justify-center 
        bg-white text-gray-800 font-medium
        border border-gray-300 
        rounded-lg 
        shadow-sm 
        hover:bg-gray-50 
        active:bg-gray-200 
        active:scale-95
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 
        transition-all duration-150 
        select-none
        touch-manipulation
        ${className}
      `}
      aria-label={`按键 ${value}`}
    >
      {value}
    </button>
  );
};

const QwertyKeyboard: React.FC<QwertyKeyboardProps> = ({ onKeyPress }) => {
  const [isShiftActive, setIsShiftActive] = useState<boolean>(false);
  const [showSpecialChars, setShowSpecialChars] = useState<boolean>(false);
  
  // QWERTY键盘布局 - 包含所有0-9数字和a-z字母
  const keyboardLayout: string[][] = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
    [' '] // 空格键
  ];

  // 第一排特殊符号（常用符号）
  const specialSymbolsRow1: string[] = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')'];
  
  // 第二排特殊符号（数学和货币符号）
  const specialSymbolsRow2: string[] = ['-', '_', '+', '=', '{', '}', '[', ']', ':', '"'];
  
  // 第三排特殊符号（其他符号）
  const specialSymbolsRow3: string[] = ['|', '\\', ';', "'", '<', '>', ',', '.', '?', '/'];

  // 特殊功能键
  const specialKeys = {
    shift: '⇧',
    backspace: '⌫',
    enter: '↩',
    symbols: '☆#&'
  };

  const handleKeyClick = (key: string): void => {
    if (key === 'shift') {
      setIsShiftActive(prev => !prev);
      return;
    }
    
    if (key === 'symbols') {
      setShowSpecialChars(prev => !prev);
      return;
    }
    
    let outputKey: string = key;
    if (isShiftActive && key.length === 1 && key.match(/[a-z]/)) {
      outputKey = key.toUpperCase();
      setIsShiftActive(false); // 输入后自动关闭Shift
    }
    
    if (onKeyPress) {
      onKeyPress(outputKey);
    }
  };

  const handleBackspace = (): void => {
    if (onKeyPress) {
      onKeyPress('backspace');
    }
  };

  const handleEnter = (): void => {
    if (onKeyPress) {
      onKeyPress('enter');
    }
  };

  // 渲染特殊符号键盘
  const renderSpecialSymbols = () => {
    if (!showSpecialChars) return null;

    return (
      <>
        {/* 第一排特殊符号 */}
        <div className="flex justify-center space-x-1">
          {specialSymbolsRow1.map((symbol, index) => (
            <KeyButton 
              key={index} 
              value={symbol}
              onClick={() => handleKeyClick(symbol)}
              className="w-8 h-10 text-sm bg-yellow-100 hover:bg-yellow-200"
            />
          ))}
        </div>

        {/* 第二排特殊符号 */}
        <div className="flex justify-center space-x-1">
          {specialSymbolsRow2.map((symbol, index) => (
            <KeyButton 
              key={index} 
              value={symbol}
              onClick={() => handleKeyClick(symbol)}
              className="w-8 h-10 text-sm bg-yellow-100 hover:bg-yellow-200"
            />
          ))}
        </div>

        {/* 第三排特殊符号 */}
        <div className="flex justify-center space-x-1">
          {specialSymbolsRow3.map((symbol, index) => (
            <KeyButton 
              key={index} 
              value={symbol}
              onClick={() => handleKeyClick(symbol)}
              className="w-8 h-10 text-sm bg-yellow-100 hover:bg-yellow-200"
            />
          ))}
          <KeyButton 
            value="←"
            onClick={() => setShowSpecialChars(false)}
            className="w-10 h-10 text-sm bg-red-100 hover:bg-red-200"
          />
        </div>
      </>
    );
  };

  // 渲染标准键盘
  const renderStandardKeyboard = () => {
    if (showSpecialChars) return null;

    return (
      <>
        {/* 数字行 */}
        <div className="flex justify-center space-x-1">
          {keyboardLayout[0].map((key, index) => (
            <KeyButton 
              key={index} 
              value={key}
              onClick={() => handleKeyClick(key)}
              className="w-8 h-10 text-sm"
            />
          ))}
          <KeyButton 
            value={specialKeys.backspace}
            onClick={handleBackspace}
            className="w-12 h-10 text-sm bg-red-100 hover:bg-red-200"
          />
        </div>

        {/* 字母行1 */}
        <div className="flex justify-center space-x-1">
          {keyboardLayout[1].map((key, index) => (
            <KeyButton 
              key={index} 
              value={key}
              onClick={() => handleKeyClick(key)}
              className="w-8 h-10 text-sm"
            />
          ))}
        </div>

        {/* 字母行2 */}
        <div className="flex justify-center space-x-1">
          <KeyButton 
            value={specialKeys.shift}
            onClick={() => handleKeyClick('shift')}
            className={`w-10 h-10 text-sm ${isShiftActive ? 'bg-blue-200' : 'bg-gray-200'}`}
          />
          {keyboardLayout[2].map((key, index) => (
            <KeyButton 
              key={index} 
              value={key}
              onClick={() => handleKeyClick(key)}
              className="w-8 h-10 text-sm"
            />
          ))}
          <KeyButton 
            value={specialKeys.enter}
            onClick={handleEnter}
            className="w-10 h-10 text-sm bg-green-100 hover:bg-green-200"
          />
        </div>

        {/* 字母行3 */}
        <div className="flex justify-center space-x-1">
          <KeyButton 
            value={specialKeys.symbols}
            onClick={() => handleKeyClick('symbols')}
            className="w-10 h-10 text-sm bg-purple-100 hover:bg-purple-200"
          />
          {keyboardLayout[3].map((key, index) => (
            <KeyButton 
              key={index} 
              value={key}
              onClick={() => handleKeyClick(key)}
              className="w-8 h-10 text-sm"
            />
          ))}
          <KeyButton 
            value={specialKeys.symbols}
            onClick={() => handleKeyClick('symbols')}
            className="w-10 h-10 text-sm bg-purple-100 hover:bg-purple-200"
          />
        </div>

        {/* 空格行 */}
        <div className="flex justify-center">
          <KeyButton 
            value="空格"
            onClick={() => handleKeyClick(' ')}
            className="w-64 h-10 text-sm"
          />
        </div>
      </>
    );
  };

  return (
    <div className="w-full max-w-md mx-auto bg-gray-100 rounded-xl shadow-lg p-3 safe-area-padding">
      {/* 键盘主体 */}
      <div className="flex flex-col space-y-2">
        {renderSpecialSymbols()}
        {renderStandardKeyboard()}
      </div>
    </div>
  );
};

export default QwertyKeyboard;