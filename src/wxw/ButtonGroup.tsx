import React from 'react';

interface ButtonGroupProps<T> {
    buttons: { label: string; value: T }[];
    value: T;
    setValue: (value: T) => void;
}


const ButtonGroup = <T,>({ buttons, value, setValue }: ButtonGroupProps<T>) => {
    return (
        <div
            className="flex w-full rounded-lg overflow-hidden border border-gray-200 shadow-sm"
            role="group"
        >
            {buttons.map((button) => (
                <button
                    key={button.label}
                    className={`flex-1 py-2 px-4 text-sm font-medium transition-colors duration-200
                        ${value === button.value
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'}
                        focus:outline-none focus:ring-2 focus:ring-blue-300
                    `}
                    onClick={() => setValue(button.value)}
                    aria-pressed={value === button.value}
                >
                    {button.label}
                </button>
            ))}
        </div>
    );
};

export default ButtonGroup;
