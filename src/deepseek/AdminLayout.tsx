import React from 'react'
import { NavLink, Outlet } from 'react-router'
import { Cog6ToothIcon } from '@heroicons/react/24/outline'
function AdminLayout() {
    return (
        <div className="bg-white min-h-screen">
            <div className="h-16 bg-gray-100 text-white">顶部固定区域</div>

            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        {/* 左侧管理导航 */}
                        <div className="flex space-x-8">
                            <NavLink
                                to="/admin"
                                className={({ isActive }) =>
                                    `px-1 pt-1 text-sm font-medium ${isActive ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
                                    }`
                                }
                            >
                                用户列表
                            </NavLink>
                            <NavLink
                                to="/admin/avatar"
                                className={({ isActive }) =>
                                    `px-1 pt-1 text-sm font-medium ${isActive ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
                                    }`
                                }
                            >
                                头像设置
                            </NavLink>
                            <NavLink
                                to="/admin/header"
                                className={({ isActive }) =>
                                    `px-1 pt-1 text-sm font-medium ${isActive ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
                                    }`
                                }
                            >
                                头部设置
                            </NavLink>
                        </div>

                        {/* 右侧操作区 */}
                        <div className="flex items-center space-x-4">
                            <button className="p-2 hover:bg-gray-100 rounded-lg">
                                <Cog6ToothIcon className="h-5 w-5 text-gray-600" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </div>
        </div>
    )
}

export default AdminLayout;