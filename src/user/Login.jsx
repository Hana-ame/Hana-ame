import { useState } from 'react'
import { LockClosedIcon, UserIcon } from '@heroicons/react/24/outline'
import { NavLink, useNavigate } from 'react-router'
import { setCookie, setCrossDomainCookie } from '../utils/getCookie';

function Login() {

  const navitage = useNavigate()

  // 状态管理改用username[4,6](@ref)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    // 用户名非空验证[3](@ref)
    if (!username.trim()) {
      setError('用户名不能为空')
      return
    }

    console.log(username);
    // 保持密码长度验证[9](@ref)
    // if (password.length < 6) {
    //   setError('密码至少需要6位')
    //   return
    // }
    // 模拟登录逻辑[1](@ref)

    const body = username;
    fetch("https://chat.moonchan.xyz/dapp/login", {
      method: "POST",
      credentials: 'include',
      headers: {
        // 'Content-Type': 'text/plain' // 明确声明 body 是纯文本
        'Dapp-Username': username,
      },
      // body: body,
    }).then(r => r.json()).then(r => {
      if ((r.error || "") !== "") location.reload(true);  // 强制从服务器刷新
      else {
        setCookie("username", r.username)
        setCrossDomainCookie("username", r.username, 30, "chat.moonchan.xyz")
        navitage("/profile")
      }
    })

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

            {/* 用户名输入区块[8](@ref) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                用户名
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <UserIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"  // 改为普通文本输入
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                  placeholder="请输入用户名"
                  autoComplete="username" // 添加自动填充标识[9](@ref)
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