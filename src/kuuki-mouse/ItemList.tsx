export default function ItemList({ 
  items, 
  onItemClick, 
  onDeleteItem 
}: { 
  items: string[]; 
  onItemClick?: (item: string) => void;
  onDeleteItem?: (index: number) => void;
}) {
  return (
    <ul className="space-y-3"> {/* 列表项之间添加垂直间距 */}
      {items.map((item, index) => (
        <li 
          key={index} 
          className="flex justify-between items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-default"
        >
          {/* 可点击的文本区域，点击时触发 onItemClick 并传入当前项目标题 */}
          <span 
            className="flex-1 cursor-pointer text-gray-800 hover:text-blue-600 transition-colors duration-150"
            onClick={() => onItemClick?.(item)} // 使用可选链操作符防止未定义错误
          >
            {item}
          </span>
          {/* 删除按钮，点击时触发 onDeleteItem 并传入当前索引 */}
          <button 
            className="ml-4 bg-red-500 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded-md transition-colors duration-150"
            onClick={() => onDeleteItem?.(index)} // 使用可选链操作符防止未定义错误
            aria-label="删除项目"
          >
            ×
          </button>
        </li>
      ))}
    </ul>
  );
}