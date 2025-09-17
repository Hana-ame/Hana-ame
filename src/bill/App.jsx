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
    { id: 'A', label: '操作 A', description: '执行了操作A', price: 10.5 },
    { id: 'A', label: '操作 A', description: '执行了操作A', price: 10.5 },
    { id: 'A', label: '操作 A', description: '执行了操作A', price: 10.5 },
    { id: 'A', label: '操作 A', description: '执行了操作A', price: 10.5 },
    { id: 'A', label: '操作 A', description: '执行了操作A', price: 10.5 },
    { id: 'A', label: '操作 A', description: '执行了操作A', price: 10.5 },
    { id: 'A', label: '操作 A', description: '执行了操作A', price: 10.5 },
    { id: 'A', label: '操作 A', description: '执行了操作A', price: 10.5 },
    { id: 'A', label: '操作 A', description: '执行了操作A', price: 10.5 },
    { id: 'A', label: '操作 A', description: '执行了操作A', price: 10.5 },
    { id: 'A', label: '操作 A', description: '执行了操作A', price: 10.5 },
    { id: 'A', label: '操作 A', description: '执行了操作A', price: 10.5 },
    { id: 'A', label: '操作 A', description: '执行了操作A', price: 10.5 },
    { id: 'A', label: '操作 A', description: '执行了操作A', price: 10.5 },
    { id: 'A', label: '操作 A', description: '执行了操作A', price: 10.5 },
    { id: 'A', label: '操作 A', description: '执行了操作A', price: 10.5 },
    { id: 'A', label: '操作 A', description: '执行了操作A', price: 10.5 },
    { id: 'A', label: '操作 A', description: '执行了操作A', price: 10.5 },
    { id: 'A', label: '操作 A', description: '执行了操作A', price: 10.5 },
    { id: 'A', label: '操作 A', description: '执行了操作A', price: 10.5 },
    { id: 'A', label: '操作 A', description: '执行了操作A', price: 10.5 },
    { id: 'A', label: '操作 A', description: '执行了操作A', price: 10.5 },
    { id: 'B', label: '操作 B', description: '执行了操作B', price: 25.0 },
    { id: 'C', label: '操作 C', description: '执行了操作C', price: 99.9 },
    // 清空按钮在下面单独处理
];

// 单条Log的显示组件 (使用 memo 优化性能)
const LogItem = memo(({ item, onDelete, onEdit }) => (
    <View style={styles.logItem}>
        <View style={styles.logContent}>
            <Text style={styles.logText}>时间: {item.timestamp}</Text>
            <Text style={styles.logText}>No: <Text style={{ fontWeight: 'bold' }}>{item.sequence}</Text></Text>
            <Text style={styles.logText}>描述: {item.description}</Text>
            <Text style={styles.logText}>价格: ¥{item.price.toFixed(2)}</Text>
        </View>
        <View style={styles.logActions}>
            <AppButton
                title="编辑"
                onPress={() => onEdit(item)}
                style={styles.logActionButtonEdit}
                textStyle={styles.logActionButtonText}
            />
            <AppButton
                title="删除"
                onPress={() => onDelete(item.id)}
                style={styles.logActionButtonDelete}
                textStyle={styles.logActionButtonText}
            />
        </View>
    </View>
));

// 自定义按钮组件
const AppButton = ({ title, onPress, style, textStyle, disabled }) => (
    <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
            styles.buttonBase,
            style,
            { opacity: disabled ? 0.5 : (pressed ? 0.6 : 1.0) },
        ]}
    >
        <Text style={[styles.buttonTextBase, textStyle]}>{title}</Text>
    </Pressable>
);


export default function App() {
    // --- State ---
    const [sequenceNumber, setSequenceNumber] = useState(1);
    const [lastLogs, setLastLogs] = useState([]); // 日志数组 {id, timestamp, sequence, description, price}
    const [logs, setLogs] = useState([]); // 日志数组 {id, timestamp, sequence, description, price}
    const [lastDeletedLog, setLastDeletedLog] = useState(null); // 用于撤销删除

    // Add Modal State
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [customDescription, setCustomDescription] = useState('');
    const [customPrice, setCustomPrice] = useState('');
    const [addInputError, setAddInputError] = useState('');

    // Edit Modal State
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [logToEdit, setLogToEdit] = useState(null);
    const [editDescription, setEditDescription] = useState('');
    const [editPrice, setEditPrice] = useState('');
    const [editInputError, setEditInputError] = useState('');


    // --- Handlers ---

    // 核心：添加日志逻辑
    const addLog = useCallback((description, price) => {
        const now = new Date();
        const priceNum = parseFloat(price) || 0;
        const newLog = {
            id: Date.now().toString() + Math.random().toString(),
            timestamp: `${now.toLocaleDateString()} ${now.toLocaleTimeString()}.${String(now.getMilliseconds()).padStart(3, '0')}`,
            sequence: sequenceNumber,
            description: description,
            price: priceNum,
        };
        setLogs(prevLogs => [newLog, ...prevLogs]);
        setSequenceNumber(prev => prev + 1);
        setLastDeletedLog(null); // Clear undo state on new add
    }, [sequenceNumber]);

    // 减少序列号
    const handleDecrement = () => {
        setSequenceNumber(prev => Math.max(0, prev - 1));
    };
    // 增加序列号
    const handleIncrement = () => {
        setSequenceNumber(prev => prev + 1);
    };

    // 处理序列号输入框变化
    const handleSequenceInputChange = (text) => {
        if (text === '') {
            setSequenceNumber(0);
            return;
        }
        const num = parseInt(text, 10);
        if (!isNaN(num) && num >= 0) {
            setSequenceNumber(num);
        }
    };

    // 打开自定义输入弹窗 (Add Modal)
    const openAddModal = () => {
        setCustomDescription('');
        setCustomPrice('');
        setAddInputError('');
        setAddModalVisible(true);
    }

    // 确认自定义输入 (Add Modal)
    const handleConfirmAdd = () => {
        Keyboard.dismiss();
        const priceNum = parseFloat(customPrice);

        if (customDescription.trim() === '') {
            setAddInputError("描述不能为空");
            return;
        }
        if (isNaN(priceNum) || customPrice.trim() === '') {
            setAddInputError("请输入有效的价格数字");
            return;
        }
        addLog(customDescription, priceNum);
        setAddModalVisible(false);
        setAddInputError('');
    };

    // 取消自定义输入 (Add Modal)
    const handleCancelAdd = () => {
        Keyboard.dismiss();
        setAddModalVisible(false);
        setAddInputError('');
    }

    // 清空日志
    const handleClearLogs = useCallback(() => {
        if (logs.length === 0) {
            setLogs(lastLogs); // No logs to clear
            setLastLogs(logs);
        } else {
            setLastLogs(logs);
            setLogs([]);
        }
    }, [logs, lastLogs]); // Recreate if logs.length changes to avoid stale closure on empty check

    // 删除单条日志
    const handleDeleteLog = useCallback((logId) => {
        const logToDelete = logs.find(log => log.id === logId);
        if (logToDelete) {
            setLastDeletedLog(logToDelete); // Save for potential undo
            setLogs(prevLogs => prevLogs.filter(log => log.id !== logId));
        }
    }, [logs]); // Dependency on logs needed to find the correct log

    // 撤销删除
    const handleUndoDelete = useCallback(() => {
        if (lastDeletedLog) {
            // Add back to the list, perhaps sort later if original order is critical
            setLogs(prevLogs => [lastDeletedLog, ...prevLogs]);
            setLastDeletedLog(null);
        }
    }, [lastDeletedLog]);

    // 打开编辑弹窗
    const handleOpenEditModal = useCallback((logItem) => {
        setLogToEdit(logItem);
        setEditDescription(logItem.description);
        setEditPrice(String(logItem.price)); // TextInput needs string
        setEditInputError('');
        setEditModalVisible(true);
    }, []);

    // 确认编辑
    const handleConfirmEdit = useCallback(() => {
        Keyboard.dismiss();
        const priceNum = parseFloat(editPrice);

        if (editDescription.trim() === '') {
            setEditInputError("描述不能为空");
            return;
        }
        if (isNaN(priceNum) || editPrice.trim() === '') {
            setEditInputError("请输入有效的价格数字");
            return;
        }

        if (logToEdit) {
            setLogs(prevLogs =>
                prevLogs.map(log =>
                    log.id === logToEdit.id
                        ? { ...log, description: editDescription, price: priceNum }
                        : log
                )
            );
            setEditModalVisible(false);
            setLogToEdit(null);
            setEditInputError('');
            setLastDeletedLog(null); // Clear undo state on edit
        }
    }, [logToEdit, editDescription, editPrice]);

    // 取消编辑
    const handleCancelEdit = useCallback(() => {
        Keyboard.dismiss();
        setEditModalVisible(false);
        setLogToEdit(null);
        setEditInputError('');
    }, []);


    // FlatList 的 renderItem 函数
    const renderLogEntry = useCallback(({ item }) => (
        <LogItem
            item={item}
            onDelete={handleDeleteLog}
            onEdit={handleOpenEditModal}
        />
    ), [handleDeleteLog, handleOpenEditModal]); // Add dependencies

    // --- Render ---
    return (
        <SafeAreaView style={styles.safeContainer}>
            {/* --- Add Custom Log Modal --- */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={addModalVisible}
                onRequestClose={handleCancelAdd}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>自定义输入</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="输入描述 (必填)"
                            value={customDescription}
                            onChangeText={setCustomDescription}
                            maxLength={50}
                        />
                        <TextInput
                            style={styles.modalInput}
                            placeholder="输入价格 (必填)"
                            value={customPrice}
                            onChangeText={setCustomPrice}
                            keyboardType="decimal-pad"
                            maxLength={10}
                        />
                        {addInputError ? <Text style={styles.errorText}>{addInputError}</Text> : null}
                        <View style={styles.modalButtonRow}>
                            <AppButton title="取消" onPress={handleCancelAdd} style={styles.modalButtonCancel} />
                            <AppButton title="确定" onPress={handleConfirmAdd} style={styles.modalButtonConfirm} />
                        </View>
                    </View>
                </View>
            </Modal>

            {/* --- Edit Log Modal --- */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={editModalVisible}
                onRequestClose={handleCancelEdit}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>编辑日志</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="输入描述 (必填)"
                            value={editDescription}
                            onChangeText={setEditDescription}
                            maxLength={50}
                        />
                        <TextInput
                            style={styles.modalInput}
                            placeholder="输入价格 (必填)"
                            value={editPrice}
                            onChangeText={setEditPrice}
                            keyboardType="decimal-pad"
                            maxLength={10}
                        />
                        {editInputError ? <Text style={styles.errorText}>{editInputError}</Text> : null}
                        <View style={styles.modalButtonRow}>
                            <AppButton title="取消" onPress={handleCancelEdit} style={styles.modalButtonCancel} />
                            <AppButton title="确定" onPress={handleConfirmEdit} style={styles.modalButtonConfirm} />
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
                    value={String(sequenceNumber)}
                    onChangeText={handleSequenceInputChange}
                    keyboardType="number-pad"
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
                            onPress={() => addLog(btn.description, btn.price)}
                            style={styles.actionButton}
                        />
                    ))}
                    <AppButton
                        title="自定义输入"
                        onPress={openAddModal}
                        style={[styles.actionButton, styles.customButton]}
                    />
                    <AppButton
                        title="清空日志"
                        onPress={handleClearLogs}
                        style={styles.clearButton} // Kept distinct style
                    />
                    {lastDeletedLog && ( // Conditionally render Undo button
                        <AppButton
                            title="撤销删除"
                            onPress={handleUndoDelete}
                            style={styles.undoButton}
                        />
                    )}
                </View>

                {/* 右侧日志区 (独立滚动) */}
                <View style={styles.rightPanel}>
                    <Text style={styles.logHeader}>操作日志 ▼</Text>
                    <FlatList
                        data={logs}
                        renderItem={renderLogEntry}
                        keyExtractor={item => item.id}
                        style={styles.logList}
                        contentContainerStyle={{ paddingBottom: 10 }}
                        ListEmptyComponent={<Text style={styles.emptyLog}>暂无日志记录</Text>}
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
        borderRadius: 20,
    },
    incDecText: {
        fontSize: 24,
        fontWeight: 'bold',
        lineHeight: 28,
    },
    mainContent: {
        flex: 1,
        flexDirection: 'row',
        maxHeight: '100%',
    },
    leftPanel: {
        flex: 2,
        borderRightWidth: 1,
        borderRightColor: '#ccc',
        padding: 10,
        backgroundColor: '#e9e9e9',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        overflow: 'scroll',
        maxHeight: '100vh',
    },
    rightPanel: {
        flex: 3,
        padding: 5,
        backgroundColor: '#fff',
        overflow: 'scroll',
        maxHeight: '100vh',
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
        backgroundColor: '#007AFF',
    },
    customButton: {
        backgroundColor: '#4CD964',
        marginTop: 10, // Adjusted margin
    },
    clearButton: {
        backgroundColor: '#FF3B30',
        marginTop: 10, // Adjusted margin
    },
    undoButton: {
        backgroundColor: '#FF9500', // Orange for undo
        marginTop: 10,
    },
    // LogItem styles
    logItem: {
        borderWidth: 1,
        borderColor: '#c0c0c0',
        backgroundColor: '#f9f9f9',
        padding: 8,
        marginVertical: 4,
        marginHorizontal: 5,
        borderRadius: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 1,
        flexDirection: 'row', // For content and actions side-by-side
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logContent: {
        flex: 1, // Take available space
    },
    logActions: {
        flexDirection: 'column', // Stack edit/delete vertically
        marginLeft: 8,
    },
    logActionButtonEdit: {
        backgroundColor: '#5AC8FA', // Light blue for edit
        paddingVertical: 5,
        paddingHorizontal: 8,
        marginBottom: 4,
        borderRadius: 3,
    },
    logActionButtonDelete: {
        backgroundColor: '#FF6B6B', // Light red for delete
        paddingVertical: 5,
        paddingHorizontal: 8,
        borderRadius: 3,
    },
    logActionButtonText: {
        fontSize: 12,
        color: 'white',
    },
    logText: {
        fontSize: 13,
        color: '#333',
        marginBottom: 2,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
        alignSelf: 'flex-start', // Align to left under inputs
        marginBottom: 10,
        marginLeft: 5, // Small indent
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