import { useState } from 'react'
import { LockClosedIcon, EnvelopeIcon } from '@heroicons/react/24/outline'
import { NavLink, useNavigate  } from 'react-router'
// import { getCookie } from '../Tools/getCookie';

function Login() {


  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email.includes('@')) {
      setError('请输入有效的邮箱地址')
      return
    }
    if (password.length < 6) {
      setError('密码至少需要6位')
      return
    }
    // 这里添加实际登录逻辑
    console.log('Login attempt:', { email, password })
    setError('')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          用户登录
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* 错误提示 */}
            {error && (
              <div className="text-red-600 text-sm text-center mb-4">
                {error}
              </div>
            )}

            {/* 邮箱输入 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                邮箱
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <EnvelopeIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {/* 密码输入 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                密码
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <LockClosedIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* 提交按钮 */}
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              立即登录
            </button>

            {/* 辅助链接 */}
            <div className="text-center text-sm mt-4">
              <span className="text-gray-600">没有账号？</span>
              <NavLink
                to="/register"
                className="font-medium text-blue-600 hover:text-blue-500 ml-2"
              >
                立即注册
              </NavLink>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login