import numpy as np
from enum import Enum

# 定义组件类型ID，方便系统识别
class ComponentType(Enum):
    POSITION = 1
    VELOCITY = 2
    INPUT = 3   # 控制输入，例如目标方向
    HEALTH = 4  # 生命值

# 每个组件的数据结构定义
COMPONENT_SCHEMAS = {
    ComponentType.POSITION: [('x', 'f4'), ('y', 'f4')],
    ComponentType.VELOCITY: [('vx', 'f4'), ('vy', 'f4')],
    ComponentType.INPUT: [('dx', 'f4'), ('dy', 'f4')],  # 输入方向，归一化后乘以速度
    ComponentType.HEALTH: [('hp', 'f4'), ('max_hp', 'f4')],
}
