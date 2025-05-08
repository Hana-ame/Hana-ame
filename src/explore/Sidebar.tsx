import { NavLink, Outlet } from 'react-router';
import {
    MagnifyingGlassIcon,
    PencilSquareIcon,
    ChartBarIcon,       // 推荐用于"Top"
    EllipsisHorizontalIcon,  // 推荐用于"More"
  
} from '@heroicons/react/24/outline'

const LayoutWithSidebar = () => {

    return (<div className="h-screen flex">
        {/* <!-- 左列 --> */}
        <div className="w-64 flex flex-col">
            <div className="h-16 bg-gray-100">左列顶部固定区域</div>
            <div className="flex-1 relative overflow-hidden">
                <aside className="absolute inset-0 overflow-y-auto">
                    <div className="w-full bg-white flex flex-col">

                        <a href="/explore" className="flex items-center px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                            <MagnifyingGlassIcon className="w-5 h-5 mr-3" />
                            Explore
                        </a>
                        <NavLink to="/create" className="flex items-center px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                            <PencilSquareIcon className="w-5 h-5 mr-3" />
                            Create
                        </NavLink>

                        <NavLink to="/explore/artists" className="flex items-center px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                            <PencilSquareIcon className="w-5 h-5 mr-3" />
                            Artists
                        </NavLink>

                        <hr  className="text-gray-300 h-2"/>

                        <NavLink to="/explore/test" className="flex items-center px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                            <MagnifyingGlassIcon className="w-5 h-5 mr-3" />
                            test
                        </NavLink>

                        <a href="/explore" className="flex items-center px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                            <ChartBarIcon className="w-5 h-5 mr-3" />
                            Top
                        </a>
                        <a href="/explore" className="flex items-center px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                            <EllipsisHorizontalIcon className="w-5 h-5 mr-3" />
                            More
                        </a>
                    </div>
                </aside>

            </div>
        </div>

        {/* <!-- 右列 --> */}
        <div className="flex-1 flex flex-col">
            <div className="h-16 bg-gray-200">右列顶部固定区域</div>
            <Outlet />
            {/* <Contents></Contents> */}
        </div>
    </div>
    );
};

export default LayoutWithSidebar;
