import Helmet from "react-helmet";
import { useParams } from "react-router";



export default function Home() {

    const { id } = useParams();
    return (
        <div className="grid grid-cols-3 gap-4">
            <Helmet>
                <title>{`用户 ${id} 的个人主页`}</title>
                <meta name="description" content={`用户 ${id} 的个人主页`} />
            </Helmet>
            <p className="text-gray-600">用户{id}主页内容区域，可展示个人简介、特色内容等</p>
            <p className="text-gray-600">用户{id}主页内容区域，可展示个人简介、特色内容等</p>
            <p className="text-gray-600">用户{id}主页内容区域，可展示个人简介、特色内容等</p>
            <p className="text-gray-600">用户{id}主页内容区域，可展示个人简介、特色内容等</p>
            <p className="text-gray-600">用户{id}主页内容区域，可展示个人简介、特色内容等</p>
            <p className="text-gray-600">用户{id}主页内容区域，可展示个人简介、特色内容等</p>
            <p className="text-gray-600">用户{id}主页内容区域，可展示个人简介、特色内容等</p>
            <p className="text-gray-600">用户{id}主页内容区域，可展示个人简介、特色内容等</p>
            <p className="text-gray-600">用户{id}主页内容区域，可展示个人简介、特色内容等</p>
            <p className="text-gray-600">用户{id}主页内容区域，可展示个人简介、特色内容等</p>
            <p className="text-gray-600">用户{id}主页内容区域，可展示个人简介、特色内容等</p>
            <p className="text-gray-600">用户{id}主页内容区域，可展示个人简介、特色内容等</p>
            <p className="text-gray-600">用户{id}主页内容区域，可展示个人简介、特色内容等</p>
            <p className="text-gray-600">用户{id}主页内容区域，可展示个人简介、特色内容等</p>
            <p className="text-gray-600">用户{id}主页内容区域，可展示个人简介、特色内容等</p>
            <p className="text-gray-600">用户{id}主页内容区域，可展示个人简介、特色内容等</p>
            <p className="text-gray-600">用户{id}主页内容区域，可展示个人简介、特色内容等</p>
            <p className="text-gray-600">用户{id}主页内容区域，可展示个人简介、特色内容等</p>
            <p className="text-gray-600">用户{id}主页内容区域，可展示个人简介、特色内容等</p>
            <p className="text-gray-600">用户{id}主页内容区域，可展示个人简介、特色内容等</p>
            <p className="text-gray-600">用户{id}主页内容区域，可展示个人简介、特色内容等</p>
            <p className="text-gray-600">用户{id}主页内容区域，可展示个人简介、特色内容等</p>
        </div>
    )
}
