import sys
import os
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from server.ecs import World
from server.components import ComponentType
from server.systems import movement_system, input_system

def test_ecs():
    world = World(max_entities=10)
    
    # 创建实体
    e1 = world.entity_manager.create_entity()
    e2 = world.entity_manager.create_entity()
    
    # 添加组件
    world.component_manager.add_component(e1, ComponentType.POSITION, (0.0, 0.0))
    world.component_manager.add_component(e1, ComponentType.VELOCITY, (1.0, 0.0))
    world.component_manager.add_component(e2, ComponentType.POSITION, (5.0, 5.0))
    world.component_manager.add_component(e2, ComponentType.VELOCITY, (0.0, -1.0))
    
    # 添加系统
    world.add_system(movement_system)
    
    # 更新
    world.update(dt=1.0)
    
    # 检查位置
    pos1 = world.component_manager.get_component(e1, ComponentType.POSITION)
    pos2 = world.component_manager.get_component(e2, ComponentType.POSITION)
    assert pos1['x'] == 1.0 and pos1['y'] == 0.0, f"Position1 wrong: {pos1}"
    assert pos2['x'] == 5.0 and pos2['y'] == 4.0, f"Position2 wrong: {pos2}"
    
    # 测试input_system
    # 创建新实体，带速度和输入
    e3 = world.entity_manager.create_entity()
    world.component_manager.add_component(e3, ComponentType.VELOCITY, (0.0, 0.0))
    world.component_manager.add_component(e3, ComponentType.INPUT, (1.0, 1.0))
    world.add_system(input_system)
    world.update(dt=1.0)
    vel3 = world.component_manager.get_component(e3, ComponentType.VELOCITY)
    # 输入(1,1)归一化后乘以10，期望速度约为(7.0710678118654755, 7.0710678118654755)
    expected = 10 / np.sqrt(2)
    assert abs(vel3['vx'] - expected) < 1e-5 and abs(vel3['vy'] - expected) < 1e-5, f"Velocity wrong: {vel3}"
    
    print("All tests passed!")

if __name__ == "__main__":
    test_ecs()