import { NavLink, Outlet } from 'react-router';
import {
    MagnifyingGlassIcon,
    PencilSquareIcon,
    HashtagIcon,

} from '@heroicons/react/24/outline'

import { useLocation } from 'react-router';
import ContentWrapper from './ContentWrapper';

const Sidebar = () => {

    const { pathname } = useLocation();
    const pathnameArray = pathname.split("/");
    const prefix = pathnameArray[1];
    function pathnameTo(catagory: "create" | "explore") {
        pathnameArray[1] = catagory
        if (pathnameArray.length > 2 && pathnameArray[2] === "item") return "/" + catagory;
        return pathnameArray.join("/")
    }

    return (<div className="h-screen flex flex-col">
        {/* <!-- 左列 --> */}
        <div className="fixed z-40 w-64 mt-16 flex flex-col h-screen overflow-hidden">
            <div className="flex-1 relative h-screen">
                <aside className="absolute inset-0 overflow-y-auto">
                    <div className="w-full bg-white flex flex-col">

                        <NavLink
                            to={pathnameTo("explore")}
                            className="flex items-center px-4 py-3 
                                        mt-4 ml-4 mr-4 mb-1
                                        rounded-full  
                                        bg-gray-200 hover:bg-gray-300  
                                        text-gray-700 hover:text-gray-900
                                        transition-colors duration-200
                                        group"
                        >
                            <MagnifyingGlassIcon className="w-5 h-5" />
                            <span className="ml-3">Explore</span>
                        </NavLink>


                        <NavLink
                            to={pathnameTo("create")}
                            className="flex items-center px-4 py-3 
                                        rounded-full  
                                        mt-1 ml-4 mr-4 mb-4
                                        bg-gray-200 hover:bg-gray-300  
                                        text-gray-700 hover:text-gray-900
                                        transition-colors duration-200
                                        group"
                        >
                            <PencilSquareIcon className="w-5 h-5" />
                            <span className="ml-3">Create</span>
                        </NavLink>

                        <hr className="text-gray-300 h-2" />

                        <NavLink to={`/${prefix}/upload`} className="flex items-center px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                            <HashtagIcon className="w-5 h-5 mr-3" />
                            upload
                        </NavLink>

                        <NavLink to={`/${prefix}/text2pic`} className="flex items-center px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                            <HashtagIcon className="w-5 h-5 mr-3" />
                            text2pic
                        </NavLink>

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
