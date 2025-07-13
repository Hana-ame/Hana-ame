import React, { useState, useCallback, memo } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    Pressable,
    FlatList,
    SafeAreaView,
    Modal,
    Alert,
    Keyboard,
} from 'react-native';

// 预定义的按钮数据
const PRESET_BUTTONS = [
    { id: 'A', label: '操作 A', description: '执行了操作A', price: 10.5 },
    { id: 'B', label: '操作 B', description: '执行了操作B', price: 25.0 },
    { id: 'C', label: '操作 C', description: '执行了操作C', price: 99.9 },
    { id: 'D', label: '清空日志', description: 'Clear', price: 0 }, // 增加一个清空按钮便于测试
];

// 单条Log的显示组件 (使用 memo 优化性能)
const LogItem = memo(({ item }) => (
    <View style={styles.logItem}>
        <Text style={styles.logText}>时间: {item.timestamp}</Text>
        <Text style={styles.logText}>No: <Text style={{ fontWeight: 'bold' }}>{item.sequence}</Text></Text>
        <Text style={styles.logText}>描述: {item.description}</Text>
        <Text style={styles.logText}>价格: ¥{item.price.toFixed(2)}</Text>
    </View>
));

// 自定义按钮组件
const AppButton = ({ title, onPress, style, textStyle }) => (
    <Pressable
        onPress={onPress}
        // 按下时改变透明度提供反馈
        style={({ pressed }) => [
            styles.buttonBase,
            style,
            { opacity: pressed ? 0.6 : 1.0 },
        ]}
    >
        <Text style={[styles.buttonTextBase, textStyle]}>{title}</Text>
    </Pressable>
);


export default function App() {
    // --- State ---
    const [sequenceNumber, setSequenceNumber] = useState(1);
    const [logs, setLogs] = useState([]); // 日志数组 {id, timestamp, sequence, description, price}
    const [modalVisible, setModalVisible] = useState(false);
    const [customDescription, setCustomDescription] = useState('');
    const [customPrice, setCustomPrice] = useState('');
    const [inputError, setInputError] = useState('');


    // --- Handlers ---

    // 核心：添加日志逻辑
    const addLog = useCallback((description, price) => {
        const now = new Date();
        const priceNum = parseFloat(price) || 0; // 确保价格是数字
        const newLog = {
            id: Date.now().toString() + Math.random().toString(), // 确保ID唯一
            // 格式化时间戳，包含毫秒
            timestamp: `${now.toLocaleDateString()} ${now.toLocaleTimeString()}.${String(now.getMilliseconds()).padStart(3, '0')}`,
            sequence: sequenceNumber, // 使用当前的序列号
            description: description,
            price: priceNum,
        };
        // 最新日志放在数组最前面，FlatList 就会显示在最顶部
        setLogs(prevLogs => [newLog, ...prevLogs]);
        // 添加日志后，序列号自动+1
        setSequenceNumber(prev => prev + 1);
    }, [sequenceNumber]); // 依赖 sequenceNumber

    // 减少序列号
    const handleDecrement = () => {
        // 确保序列号不小于0
        setSequenceNumber(prev => Math.max(0, prev - 1));
    };
    // 增加序列号
    const handleIncrement = () => {
        setSequenceNumber(prev => prev + 1);
    };

    // 处理序列号输入框变化
    const handleSequenceInputChange = (text) => {
        // 只允许输入数字
        if (text === '') {
            setSequenceNumber(0); // 或者设为空，但显示时需要处理
            return;
        }
        const num = parseInt(text, 10);
        if (!isNaN(num) && num >= 0) {
            setSequenceNumber(num);
        }
        // 非数字输入将被忽略
    };

    // 打开自定义输入弹窗
    const openCustomModal = () => {
        // 清空上次输入和错误信息
        setCustomDescription('');
        setCustomPrice('');
        setInputError('');
        setModalVisible(true);
    }

    // 确认自定义输入
    const handleConfirmCustom = () => {
        Keyboard.dismiss(); // 收起键盘
        const priceNum = parseFloat(customPrice);

        if (isNaN(priceNum) || customPrice.trim() === '') {
            setInputError("请输入有效的价格数字");
            // Alert.alert("错误","请输入有效的价格数字");
            return;
        }
        // 添加日志
        addLog(customDescription, priceNum);
        // 关闭弹窗
        setModalVisible(false);
        setInputError('');
    };

    // 取消自定义输入
    const handleCancelCustom = () => {
        Keyboard.dismiss();
        setModalVisible(false);
        setInputError('');
    }

    // 清空日志
    const handleClearLogs = () => {
        console.log(">>> handleClearLogs called! Is Modal Visible? :", modalVisible);

        alert(
            "清空确认",
            "确定要清空所有日志记录吗?",
            [
                { text: "取消", style: "cancel" },
                { text: "确定", onPress: () => setLogs([]), style: 'destructive' }
            ]);
    }


    // FlatList 的 renderItem 函数
    const renderLogEntry = useCallback(({ item }) => <LogItem item={item} />, []);

    // --- Render ---
    return (
        <SafeAreaView style={styles.safeContainer}>
            {/* --- 自定义输入弹窗 Modal --- */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={handleCancelCustom} // Android back button
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>自定义输入</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="输入描述"
                            value={customDescription}
                            onChangeText={setCustomDescription}
                            maxLength={50}
                        />
                        <TextInput
                            style={styles.modalInput}
                            placeholder="输入价格"
                            value={customPrice}
                            onChangeText={setCustomPrice}
                            keyboardType="decimal-pad" // 数字键盘带小数点
                            maxLength={10}
                        />
                        {inputError ? <Text style={styles.errorText}>{inputError}</Text> : null}
                        <View style={styles.modalButtonRow}>
                            <AppButton title="取消" onPress={handleCancelCustom} style={styles.modalButtonCancel} />
                            <AppButton title="确定" onPress={handleConfirmCustom} style={styles.modalButtonConfirm} />
                        </View>
                    </View>
                </View>
            </Modal>

            {/* --- 顶部序列号控制区 --- */}
            <View style={styles.topControlContainer}>
                <Text style={styles.seqLabel}>序列号:</Text>
                <AppButton title="-" onPress={handleDecrement} style={styles.incDecButton} textStyle={styles.incDecText} />
                <TextInput
                    style={styles.sequenceInput}
                    value={String(sequenceNumber)} // TextInput value 必须是 string
                    onChangeText={handleSequenceInputChange}
                    keyboardType="number-pad" // 纯数字键盘
                    textAlign='center'
                    maxLength={8}
                />
                <AppButton title="+" onPress={handleIncrement} style={styles.incDecButton} textStyle={styles.incDecText} />
            </View>

            {/* --- 主内容区 (左右布局) --- */}
            <View style={styles.mainContent}>

                {/* 左侧按钮区 */}
                <View style={styles.leftPanel}>
                    {PRESET_BUTTONS.map(btn => (
                        <AppButton
                            key={btn.id}
                            title={btn.label}
                            // 特殊处理清空按钮
                            onPress={btn.id === 'D' ? handleClearLogs : () => addLog(btn.description, btn.price)}
                            style={btn.id === 'D' ? styles.clearButton : styles.actionButton}
                        />
                    ))}
                    {/* 自定义输入按钮 */}
                    <AppButton
                        title="自定义输入"
                        onPress={openCustomModal}
                        style={[styles.actionButton, styles.customButton]}
                    />
                </View>

                {/* 右侧日志区 (独立滚动) */}
                <View style={styles.rightPanel}>
                    <Text style={styles.logHeader}>操作日志 ▼</Text>
                    <FlatList
                        data={logs}
                        renderItem={renderLogEntry}
                        keyExtractor={item => item.id}
                        style={styles.logList}
                        contentContainerStyle={{ paddingBottom: 10 }} // 底部留白
                        ListEmptyComponent={<Text style={styles.emptyLog}>暂无日志记录</Text>} //没有日志时显示
                    // inverted // 如果想让最新日志在底部并自动上滚，可以开启这个，同时 setLogs 改为 [...prevLogs, newLog]
                    />
                </View>

            </View>
        </SafeAreaView>
    );
}

// --- 样式 ---
const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
        backgroundColor: '#f0f0f0',
    },
    // 顶部控制
    topControlContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        height: 60,
    },
    seqLabel: {
        marginRight: 15,
        fontSize: 16,
    },
    sequenceInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        paddingVertical: 5,
        paddingHorizontal: 10,
        marginHorizontal: 8,
        fontSize: 18,
        minWidth: 80,
        borderRadius: 4,
        backgroundColor: '#fff',
    },
    incDecButton: {
        width: 40,
        height: 40,
        paddingVertical: 0,
        paddingHorizontal: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#007AFF',
        borderRadius: 20, // 圆形
    },
    incDecText: {
        fontSize: 24,
        fontWeight: 'bold',
        lineHeight: 28, // 调整垂直居中
    },
    // 主内容
    mainContent: {
        flex: 1, // 占据剩余空间
        flexDirection: 'row', // 关键：水平布局左右两栏
    },
    // 左侧
    leftPanel: {
        flex: 2, // 占比 2/5
        borderRightWidth: 1,
        borderRightColor: '#ccc',
        padding: 10,
        backgroundColor: '#e9e9e9',
        justifyContent: 'flex-start', // 按钮从顶部开始排
        alignItems: 'stretch', // 按钮拉伸
    },
    // 右侧
    rightPanel: {
        flex: 3, // 占比 3/5
        padding: 5,
        backgroundColor: '#fff',
    },
    logHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 5,
        color: '#555',
    },
    logList: {
        flex: 1,
    },
    emptyLog: {
        textAlign: 'center',
        marginTop: 20,
        color: '#888',
        fontStyle: 'italic',
    },
    // 按钮通用样式
    buttonBase: {
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginVertical: 5,
    },
    buttonTextBase: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '500',
    },
    actionButton: {
        backgroundColor: '#007AFF', // iOS blue
    },
    customButton: {
        backgroundColor: '#4CD964', // Green
        marginTop: 15,
    },
    clearButton: {
        backgroundColor: '#FF3B30', // Red
        marginTop: 20,
    },
    // 单条 Log 样式 (方框)
    logItem: {
        borderWidth: 1,
        borderColor: '#c0c0c0',
        backgroundColor: '#f9f9f9',
        padding: 8,
        marginVertical: 4,
        marginHorizontal: 5,
        borderRadius: 4,
        shadowColor: "#000", // 添加一点阴影
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 1, // Android shadow
    },
    logText: {
        fontSize: 13,
        color: '#333',
        marginBottom: 2,
    },
    // Modal 样式
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // 半透明背景
    },
    modalContent: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '85%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    modalInput: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 10,
        marginBottom: 10,
        fontSize: 16,
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginBottom: 10,
    },
    modalButtonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 10,
    },
    modalButtonCancel: {
        backgroundColor: '#aaa',
        flex: 1,
        marginHorizontal: 5,
    },
    modalButtonConfirm: {
        backgroundColor: '#007AFF',
        flex: 1,
        marginHorizontal: 5,
    },
});
