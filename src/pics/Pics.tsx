import React from "react";
import { WaterfallData } from "../@types/Waterfall";
import { data } from "./testdata";

const WaterfallCSS = ({ data }: { data: WaterfallData[] }) => {
    return (
        <div style={{
            columnCount: 4,      // 默认4列
            columnGap: '20px',   // 列间距
            padding: '20px'
        }}>
            {data.map(item => (
                <div key={item.id}
                    style={{
                        breakInside: 'avoid', // 防止内容截断
                        marginBottom: '20px',
                        background: '#f5f5f5',
                        borderRadius: '8px'
                    }}>
                    <img
                        src={item.url}
                        alt={item.title}
                        style={{
                            width: '100%',
                            height: 'auto',
                            borderRadius: '6px 6px 0 0'
                        }} />
                    <div style={{ padding: '12px' }}>
                        <h3>{item.title}</h3>
                        <p>{item.description}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}


export default function Pics() {

    return <WaterfallCSS data={data} />;
};