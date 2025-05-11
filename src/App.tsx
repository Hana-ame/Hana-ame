import './App.css'
import { UserIcon } from '@heroicons/react/24/outline'
import { Outlet, NavLink } from 'react-router'

function App() {

  return (

    <div className="bg-white">
      <nav className="fixed bg-white shadow-sm w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* 左侧导航项 */}
            <div className="flex space-x-8">
              <NavLink to="/" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900">
                Home
              </NavLink>
              <NavLink to="/explore" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-700">
                Explore
              </NavLink>
              <NavLink to="/create" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-700">
                Create
              </NavLink>
              <NavLink to="/fortune" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-700">
                占卜
              </NavLink>
            </div>

            {/* 右侧用户信息 */}
            <NavLink to="/profile" className="flex items-center hover:cursor-pointer">
              <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 hover:cursor-pointer">
                <UserIcon className="h-6 w-6" />
              </button>
            </NavLink>
          </div>
        </div>
      </nav>

      {/* 主内容区 - 使用Outlet渲染子路由 */}
      {/* <div className='h-16'></div> */}
      <Outlet />
    </div>

  )
}

export default App
