from grpc_remote_control import controller

controller = controller.Controller()
print(controller.get_mouse_position())
controller.move_mouse(100, 200) # 相对移动.
print(controller.get_mouse_position())
