import numpy as np
from .components import ComponentType

def movement_system(world, dt):
    # 获取所有有位置和速度的实体
    entities = world.component_manager.get_all_entities_with_components(
        ComponentType.POSITION, ComponentType.VELOCITY
    )
    for entity_id in entities:
        pos = world.component_manager.get_component(entity_id, ComponentType.POSITION)
        vel = world.component_manager.get_component(entity_id, ComponentType.VELOCITY)
        # 更新位置
        new_x = pos['x'] + vel['vx'] * dt
        new_y = pos['y'] + vel['vy'] * dt

        # 边界反弹（画布大小 800x600）
        if new_x < 0 or new_x > 800:
            vel['vx'] *= -1
            new_x = max(0, min(new_x, 800))
        if new_y < 0 or new_y > 600:
            vel['vy'] *= -1
            new_y = max(0, min(new_y, 600))

        pos['x'] = new_x
        pos['y'] = new_y

def input_system(world, dt):
    # 根据输入组件修改速度
    entities = world.component_manager.get_all_entities_with_components(
        ComponentType.VELOCITY, ComponentType.INPUT
    )
    for entity_id in entities:
        vel = world.component_manager.get_component(entity_id, ComponentType.VELOCITY)
        inp = world.component_manager.get_component(entity_id, ComponentType.INPUT)
        # 将输入方向归一化，然后乘以速度标量（这里简单设定为10）
        speed = 10.0
        dx, dy = inp['dx'], inp['dy']
        norm = np.sqrt(dx*dx + dy*dy)
        if norm > 0:
            vel['vx'] = dx / norm * speed
            vel['vy'] = dy / norm * speed
        else:
            vel['vx'] = 0
            vel['vy'] = 0