import React from 'react';

const BaseSelector = ({ base, handleBase }) => {
  return (
    <div className="flex space-x-2">
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
  );
};

export default BaseSelector;