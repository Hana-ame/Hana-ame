import { MastodonMediaResponse } from "./app"
export default function Image({ data, onClick }: { data: MastodonMediaResponse, onClick?: (data: MastodonMediaResponse) => void }) {

    return <div className="relative" onClick={() => { if (onClick) onClick(data) }}>
        <img src={data.preview_url} alt={`${data.id}`} className="w-auto h-auto rounded-lg" />
        <button onClick={() => { if (onClick) onClick(data) }}
            className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 
                hidden">
            删除
        </button>
    </div>
}   