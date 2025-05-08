import {
    useState,
    useEffect
} from 'react'
import { getPosts } from '../utils/dapp'
// import LoadingSpinner from '../components/LoadingSpinner'
import FourColumns from '../components/FourColumns';
// import { NavLink } from 'react-router';
import type { Post } from '../utils/type';

export default function ExploreIndex() {
    // get items
    // const [loading, setLoading] = useState(true);
    const [list, setList] = useState<Post[]>([]);
    useEffect(() => {
        getPosts().then(r => {
            console.log(r);
            setList(r || []);
            // setLoading(false);
        })

    }, [])
    // if (loading) return <LoadingSpinner />


    return <FourColumns>
        {list.map((item, index) => (
            <a href={`/explore/item/${item.id}`} target="_blank">
                <div
                    key={index}
                    className="relative rounded-lg transition-transform background-green"
                >
                    <img
                        src={item.url}
                        alt={item.content}
                        className="w-full h-full aspect-square object-cover rounded-lg"
                    />
                </div>
            </a>
        ))}
    </FourColumns >
}