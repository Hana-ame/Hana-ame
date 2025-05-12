import { NavLink, Outlet } from 'react-router';
import {
    MagnifyingGlassIcon,
    PencilSquareIcon,
    HashtagIcon,
  
} from '@heroicons/react/24/outline'

import { useLocation } from 'react-router';
import ContentWrapper from './ContentWrapper';

const Sidebar = () => {

    const {pathname} = useLocation();
    const prefix = pathname.split("/")[1];

    return (<div className="h-screen flex flex-col">
        {/* <!-- 左列 --> */}
        <div className="fixed z-40 w-64 flex flex-col h-screen overflow-hidden">
            <div className="h-16 bg-gray-100">左列顶部固定区域</div>
            <div className="flex-1 relative h-screen">
                <aside className="absolute inset-0 overflow-y-auto">
                    <div className="w-full bg-white flex flex-col">

                        <NavLink to="/explore" className="flex items-center px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                            <MagnifyingGlassIcon className="w-5 h-5 mr-3" />
                            Explore
                        </NavLink>
                        <NavLink to="/create" className="flex items-center px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                            <PencilSquareIcon className="w-5 h-5 mr-3" />
                            Create
                        </NavLink>

                        <hr className="text-gray-300 h-2"/>

                        {/* <NavLink to={`/${prefix}/artists`} className="flex items-center px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                            <HashtagIcon className="w-5 h-5 mr-3" />
                            Artists
                        </NavLink> */}

                        <NavLink to={`/${prefix}/pic2pic`} className="flex items-center px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                            <HashtagIcon className="w-5 h-5 mr-3" />
                            pic2pic
                        </NavLink>

                        {/* <NavLink to={`/${prefix}/test`} className="flex items-center px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                            <HashtagIcon className="w-5 h-5 mr-3" />
                            test
                        </NavLink> */}
                    </div>
                </aside>

            </div>
        </div>

        {/* <!-- 右列 --> */}
        <ContentWrapper>
            <Outlet />
        </ContentWrapper>
    </div>
    );
};

export default Sidebar;
