import numpy as np
from collections import defaultdict
from .components import ComponentType, COMPONENT_SCHEMAS

class EntityManager:
    def __init__(self, max_entities):
        self.max_entities = max_entities
        self.alive = np.zeros(max_entities, dtype=bool)
        self.free_ids = list(range(max_entities))  # 空闲ID池

    def create_entity(self):
        if not self.free_ids:
            raise Exception("No more entity IDs available")
        entity_id = self.free_ids.pop(0)
        self.alive[entity_id] = True
        return entity_id

    def destroy_entity(self, entity_id):
        if self.alive[entity_id]:
            self.alive[entity_id] = False
            self.free_ids.append(entity_id)
            # 同时需要移除该实体的所有组件，由ComponentManager处理
        else:
            raise ValueError(f"Entity {entity_id} is not alive")

    def is_alive(self, entity_id):
        return self.alive[entity_id]

class ComponentManager:
    def __init__(self, max_entities):
        self.max_entities = max_entities
        self.components = {}  # 组件类型 -> 数据数组
        self.masks = {}  # 组件类型 -> 布尔数组，表示该实体是否有此组件
        # 初始化每个组件类型的数组
        for ctype in ComponentType:
            schema = COMPONENT_SCHEMAS.get(ctype)
            if schema:
                # 创建结构化数组
                dtype = np.dtype(schema)
                self.components[ctype] = np.zeros(max_entities, dtype=dtype)
                self.masks[ctype] = np.zeros(max_entities, dtype=bool)
            else:
                # 如果没有定义schema，可以跳过或报错
                pass

    def add_component(self, entity_id, ctype, data):
        if entity_id < self.max_entities:
            self.components[ctype][entity_id] = data
            self.masks[ctype][entity_id] = True
        else:
            raise ValueError("Entity ID out of range")

    def remove_component(self, entity_id, ctype):
        if self.masks[ctype][entity_id]:
            self.masks[ctype][entity_id] = False
            # 数据可以不清零，但标记为不存在

    def has_component(self, entity_id, ctype):
        return self.masks[ctype][entity_id]

    def get_component(self, entity_id, ctype):
        if self.masks[ctype][entity_id]:
            return self.components[ctype][entity_id]
        else:
            return None

    def get_all_entities_with_components(self, *ctypes):
        # 返回同时拥有这些组件的实体ID列表
        if not ctypes:
            return []
        mask = self.masks[ctypes[0]].copy()
        for ctype in ctypes[1:]:
            mask &= self.masks[ctype]
        return np.where(mask)[0]

class World:
    def __init__(self, max_entities):
        self.entity_manager = EntityManager(max_entities)
        self.component_manager = ComponentManager(max_entities)
        self.systems = []

    def add_system(self, system):
        self.systems.append(system)

    def update(self, dt):
        for system in self.systems:
            system(self, dt)
