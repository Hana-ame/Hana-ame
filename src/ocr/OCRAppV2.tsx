import React, { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';

// ===== 自定义组件系统 =====
interface ThemeContextType {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
}

const ThemeContext = createContext<ThemeContextType>({
  primaryColor: '#1890ff',
  secondaryColor: '#52c41a',
  backgroundColor: '#ffffff',
  textColor: '#000000',
  borderColor: '#d9d9d9'
});

// 自定义Button组件
interface ButtonProps {
  children: React.ReactNode;
  type?: 'primary' | 'default' | 'dashed' | 'danger';
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  type = 'default',
  size = 'medium',
  onClick,
  disabled = false,
  loading = false,
  icon
}) => {
  const theme = useContext(ThemeContext);

  const getButtonStyle = () => {
    const baseStyle = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      border: '1px solid',
      borderRadius: '6px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.6 : 1,
      transition: 'all 0.3s ease',
      fontFamily: 'inherit'
    };

    const sizeStyles = {
      small: { padding: '4px 8px', fontSize: '12px' },
      medium: { padding: '8px 16px', fontSize: '14px' },
      large: { padding: '12px 24px', fontSize: '16px' }
    };

    const typeStyles = {
      primary: {
        backgroundColor: theme.primaryColor,
        borderColor: theme.primaryColor,
        color: '#ffffff'
      },
      default: {
        backgroundColor: theme.backgroundColor,
        borderColor: theme.borderColor,
        color: theme.textColor
      },
      dashed: {
        backgroundColor: theme.backgroundColor,
        borderColor: theme.borderColor,
        borderStyle: 'dashed',
        color: theme.textColor
      },
      danger: {
        backgroundColor: '#ff4d4f',
        borderColor: '#ff4d4f',
        color: '#ffffff'
      }
    };

    return { ...baseStyle, ...sizeStyles[size], ...typeStyles[type] };
  };

  return (
    <button
      style={getButtonStyle()}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {loading && <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>}
      {icon}
      {children}
    </button>
  );
};

// 自定义Card组件
interface CardProps {
  title?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const Card: React.FC<CardProps> = ({ title, children, style }) => {
  const theme = useContext(ThemeContext);

  const cardStyle: React.CSSProperties = {
    backgroundColor: theme.backgroundColor,
    border: `1px solid ${theme.borderColor}`,
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    ...style
  };

  return (
    <div style={cardStyle}>
      {title && (
        <h3 style={{
          margin: '0 0 12px 0',
          color: theme.textColor,
          fontSize: '16px',
          fontWeight: '600'
        }}>
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};

// 自定义Radio组组件 - 修改为水平排列
interface RadioGroupProps {
  value: number;
  onChange: (value: number) => void;
  children: React.ReactNode;
}

const RadioGroup: React.FC<RadioGroupProps> = ({ value, onChange, children }) => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'row', 
      gap: '12px',
      flexWrap: 'wrap',
      marginBottom: '16px'
    }}>
      {React.Children.map(children, (child, index) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<any>, {
            checked: value === index,
            onChange: () => onChange(index)
          })
          : child
      )}
    </div>
  );
};

// 自定义Radio组件 - 调整以适应水平排列
interface RadioProps {
  checked?: boolean;
  onChange?: () => void;
  children: React.ReactNode;
}

const Radio: React.FC<RadioProps> = ({ checked = false, onChange, children }) => {
  const theme = useContext(ThemeContext);

  return (
    <label style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      cursor: 'pointer',
      padding: '6px 10px',
      borderRadius: '4px',
      border: `1px solid ${checked ? theme.primaryColor : theme.borderColor}`,
      backgroundColor: checked ? `${theme.primaryColor}15` : 'transparent',
      transition: 'all 0.3s ease',
      fontSize: '14px'
    }}
      onClick={onChange}>
      <div
        style={{
          width: '14px',
          height: '14px',
          borderRadius: '50%',
          border: `2px solid ${checked ? theme.primaryColor : theme.borderColor}`,
          backgroundColor: checked ? theme.primaryColor : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease'
        }}
      >
        {checked && (
          <div style={{
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            backgroundColor: '#fff'
          }} />
        )}
      </div>
      <span style={{ color: theme.textColor, fontSize: '14px' }}>{children}</span>
    </label>
  );
};

// 自定义Switch组件
interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children?: React.ReactNode;
}

const Switch: React.FC<SwitchProps> = ({ checked, onChange, children }) => {
  const theme = useContext(ThemeContext);

  const switchStyle: React.CSSProperties = {
    width: '40px',
    height: '20px',
    borderRadius: '10px',
    backgroundColor: checked ? theme.primaryColor : '#ccc',
    position: 'relative',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  };

  const knobStyle: React.CSSProperties = {
    position: 'absolute',
    top: '2px',
    left: checked ? '22px' : '2px',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    backgroundColor: '#fff',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
  };

  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
      <div style={switchStyle} onClick={() => onChange(!checked)}>
        <div style={knobStyle} />
      </div>
      {children && <span style={{ color: theme.textColor, fontSize: '14px' }}>{children}</span>}
    </label>
  );
};

// 自定义Input组件
interface InputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'textarea';
  rows?: number;
}

const Input: React.FC<InputProps> = ({ value, onChange, placeholder, type = 'text', rows = 3 }) => {
  const theme = useContext(ThemeContext);

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '6px 10px',
    border: `1px solid ${theme.borderColor}`,
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'inherit',
    backgroundColor: theme.backgroundColor,
    color: theme.textColor
  };

  if (type === 'textarea') {
    return (
      <textarea
        style={{ ...inputStyle, minHeight: `${rows * 20}px`, resize: 'vertical' }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
      />
    );
  }

  return (
    <input
      type="text"
      style={inputStyle}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
};

// 自定义Upload组件 - 缩小尺寸
interface UploadProps {
  onFileUpload: (file: File) => void;
  children: React.ReactNode;
}

const Upload: React.FC<UploadProps> = ({ onFileUpload, children }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const theme = useContext(ThemeContext);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFileUpload(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileUpload(files[0]);
    }
  };

  // 缩小上传区域尺寸
  const uploadAreaStyle: React.CSSProperties = {
    border: `2px dashed ${isDragging ? theme.primaryColor : theme.borderColor}`,
    borderRadius: '6px',
    padding: '20px',
    textAlign: 'center' as const,
    cursor: 'pointer',
    backgroundColor: isDragging ? '#f0f8ff' : theme.backgroundColor,
    transition: 'all 0.3s ease',
    color: theme.textColor,
    minHeight: '60px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  };

  return (
    <div>
      <div
        style={uploadAreaStyle}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {children}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileInput}
        accept="image/*"
      />
    </div>
  );
};

// 自定义Message组件（简单替代antd的message）
export const useMessage = () => {
  const showMessage = (content: string, type: 'success' | 'error' | 'warning' = 'success') => {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 10px 16px;
      border-radius: 4px;
      color: white;
      font-weight: 500;
      z-index: 1000;
      transition: all 0.3s ease;
      background-color: ${type === 'success' ? '#52c41a' : type === 'error' ? '#ff4d4f' : '#faad14'};
      font-size: 14px;
    `;
    messageDiv.textContent = content;
    document.body.appendChild(messageDiv);

    setTimeout(() => {
      messageDiv.remove();
    }, 3000);
  };

  return { showMessage };
};

// ===== 主组件 =====
interface ImageProcessorState {
  imageDataUrl: string;
  selectedOption: number;
  customPrompt: string;
  ocrResult: string;
  translateEnabled: boolean;
  translationResult: string;
  loading: boolean;
  translateLoading: boolean;
}

const ImageProcessor: React.FC = () => {
  const { showMessage } = useMessage();
  const [state, setState] = useState<ImageProcessorState>({
    imageDataUrl: '',
    selectedOption: 0,
    customPrompt: '',
    ocrResult: '',
    translateEnabled: false,
    translationResult: '',
    loading: false,
    translateLoading: false
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 新增一个useEffect，用于在选项或图片变化时自动处理
  useEffect(() => {
    // 检查是否有上传的图片，避免在无图片时发起请求
    if (state.imageDataUrl) {
      // 调用现有的处理函数
      handleOCRProcess();
    }
    // 依赖项数组：当 imageDataUrl 或 selectedOption 改变时，此 effect 会重新执行
  }, [state.imageDataUrl, state.selectedOption]); // 请根据您的实际状态结构调整，这里假设状态在一个名为state的对象中

  

  // 处理选项配置
  const options = [
    { label: '文档转Markdown', value: '<image>\n<|grounding|>Convert the document to markdown.' },
    { label: '通用OCR', value: '<image>\n<|grounding|>OCR this image.' },
    { label: '无布局提取', value: '<image>\nFree OCR.' },
    { label: '图表解析', value: '<image>\nParse the figure.' },
    { label: '图像描述', value: '<image>\nDescribe this image in detail.' },
    { label: '文本定位', value: '<image>\nLocate <|ref|>特定文字<|/ref|> in the image.' }
  ];

  // 图片转换为DataURL
  const convertToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // 处理文件上传
  const handleFileUpload = async (file: File) => {
    try {
      const dataUrl = await convertToDataURL(file);
      setState(prev => ({ ...prev, imageDataUrl: dataUrl }));
      showMessage('图片上传成功', 'success');
    } catch (error) {
      showMessage('图片转换失败', 'error');
    }
  };

  // 处理URL输入
  const handleUrlSubmit = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], 'image.jpg', { type: blob.type });
      await handleFileUpload(file);
    } catch (error) {
      showMessage('图片URL加载失败', 'error');
    }
  };

  // 处理粘贴事件
  const handlePaste = useCallback((event: React.ClipboardEvent) => {
    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) {
          handleFileUpload(file);
          break;
        }
      }
    }
  }, []);

  // OCR处理函数
  const handleOCRProcess = async () => {
    if (!state.imageDataUrl) {
      showMessage('请先上传图片', 'warning');
      return;
    }

    setState(prev => ({ ...prev, loading: true }));

    try {
      const prompt = state.customPrompt || options[state.selectedOption].value;

      // 模拟API调用
      const resp = await fetch("https://chat.moonchan.xyz/siliconflow/deepseek-ocr", {
        method: 'POST',
        body: JSON.stringify({
          image_url: state.imageDataUrl,
          text: prompt
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(res => res.json());

      const mockOCRResult = resp.choices![0].message.content;

      setState(prev => ({
        ...prev,
        ocrResult: mockOCRResult,
        loading: false
      }));

      // 如果翻译开关开启，自动翻译结果
      if (state.translateEnabled) {
        handleTranslation(mockOCRResult);
      }
    } catch (error) {
      showMessage('OCR处理失败', 'error');
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  // 翻译处理函数
  const handleTranslation = async (text: string) => {
    setState(prev => ({ ...prev, translateLoading: true }));

    try {
      const resp = await fetch("https://chat.moonchan.xyz/siliconflow/qwen2.5-7b-Instruct/translate", {
        method: 'POST',
        body: text
      }).then(res => res.json());

      // 模拟翻译结果
      const mockTranslation = resp.choices![0].message.content;

      setState(prev => ({
        ...prev,
        translationResult: mockTranslation,
        translateLoading: false
      }));
    } catch (error) {
      showMessage('翻译失败', 'error');
      setState(prev => ({ ...prev, translateLoading: false }));
    }
  };

  // 更新状态辅助函数
  const updateState = (updates: Partial<ImageProcessorState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const theme: ThemeContextType = {
    primaryColor: '#1890ff',
    secondaryColor: '#52c41a',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    borderColor: '#d9d9d9'
  };

  return (
    <ThemeContext.Provider value={theme}>
      <div
        style={{
          padding: '20px',
          maxWidth: '1200px',
          margin: '0 auto',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          backgroundColor: '#f5f5f5',
          minHeight: '100vh'
        }}
        onPaste={handlePaste}
      >
        <h1 style={{
          textAlign: 'center',
          marginBottom: '24px',
          color: theme.textColor,
          fontSize: '24px'
        }}>
          图片处理工具
        </h1>

        {/* 第一部分: 图片上传和预览 */}
        <Card title="图片上传">
          <Upload onFileUpload={handleFileUpload}>
            <div style={{ padding: '10px' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📁</div>
              <p style={{ marginBottom: '4px', fontWeight: 'bold', fontSize: '14px' }}>点击上传或拖拽图片</p>
              <p style={{ fontSize: '12px', color: '#666' }}>
                支持 JPG, PNG, GIF 等格式，或直接粘贴图片
              </p>
            </div>
          </Upload>

          {/* URL输入区域 */}
          <div style={{ marginTop: '12px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <Input
                placeholder="输入图片URL链接"
                value=""
                onChange={(value) => {
                  // URL输入处理
                  const input = document.querySelector('input[placeholder*="URL链接"]') as HTMLInputElement;
                  if (input) handleUrlSubmit(value);
                }}
              />
              <Button
                type="primary"
                size="small"
                onClick={() => {
                  const input = document.querySelector('input[placeholder*="URL链接"]') as HTMLInputElement;
                  if (input && input.value) handleUrlSubmit(input.value);
                }}
              >
                加载URL
              </Button>
            </div>
            <p style={{ fontSize: '11px', color: '#666', margin: 0 }}>
              或者直接在此页面使用 Ctrl+V 粘贴图片
            </p>
          </div>

          {/* 图片预览 */}
          {state.imageDataUrl && (
            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <img
                src={state.imageDataUrl}
                alt="预览"
                style={{
                  maxWidth: '100%',
                  maxHeight: '200px',
                  border: `1px solid ${theme.borderColor}`,
                  borderRadius: '4px'
                }}
              />
            </div>
          )}
        </Card>

        {/* 第二部分: 处理选项 - 水平排列 */}
        <Card title="处理功能选择">
          <RadioGroup value={state.selectedOption} onChange={(value) => updateState({ selectedOption: value })}>
            {options.map((option, index) => (
              <Radio key={index}>{option.label}</Radio>
            ))}
          </RadioGroup>

          {/* 自定义提示输入 */}
          <div style={{ marginBottom: '12px' }}>
            <Input
              type="textarea"
              placeholder="或输入自定义提示语"
              value={state.customPrompt}
              onChange={(value) => updateState({ customPrompt: value })}
              rows={2}
            />
          </div>

          {/* 处理按钮 */}
          <div style={{ textAlign: 'center' }}>
            <Button
              type="primary"
              size="medium"
              onClick={handleOCRProcess}
              loading={state.loading}
              disabled={!state.imageDataUrl}
            >
              {state.loading ? '处理中...' : '开始处理'}
            </Button>
          </div>
        </Card>

        {/* 第三部分: 结果区域 - 两列布局 */}
        <div style={{ 
          display: 'flex', 
          gap: '16px',
          flexDirection: window.innerWidth < 768 ? 'column' : 'row' // 响应式设计
        }}>
          {/* OCR结果列 */}
          <Card title="处理结果" style={{ flex: 1 }}>
            <Input
              type="textarea"
              value={state.ocrResult}
              onChange={(value) => updateState({ ocrResult: value })}
              placeholder="OCR结果将显示在这里..."
              rows={8}
            />
          </Card>

          {/* 翻译列 */}
          <Card title="翻译选项" style={{ flex: 1 }}>
            <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Switch
                checked={state.translateEnabled}
                onChange={(checked) => {
                  updateState({ translateEnabled: checked });
                  if (checked && state.ocrResult) {
                    handleTranslation(state.ocrResult);
                  }
                }}
              />
              <span style={{ fontSize: '14px' }}>启用翻译</span>
            </div>

            {state.translateEnabled && (
              <Input
                type="textarea"
                value={state.translationResult}
                onChange={(value) => updateState({ translationResult: value })}
                placeholder="翻译结果将显示在这里..."
                rows={6}
              />
            )}
          </Card>
        </div>

        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            
            /* 响应式设计 */
            @media (max-width: 768px) {
              .results-container {
                flex-direction: column;
              }
            }
          `}
        </style>
      </div>
    </ThemeContext.Provider>
  );
};

export default ImageProcessor;