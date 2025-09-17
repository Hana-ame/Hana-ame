import { useState } from "react";

import InputBar from "./InputBar";
import ItemList from "./ItemList";
import Websocket from "./Websocket";
import App from "./App";
import useLocalStorage from "../Tools/localstorage/useLocalStorageStatus";

export default function KuukiMouse() {
    const [item, setItem] = useState<string>("");
    const [items, setItems] = useLocalStorage("kuuki-mouse", ["ws://127.0.0.1:8765"])

    const onSubmit = (url: string) => {
        setItems((prevItems: string[]) => [...prevItems, url]);
    }
    const onDeleteItem = (index: number) => {
        setItems((prevItems: string[]) => prevItems.filter((_, i) => i !== index));
    }
    const onItemClick = (item: string) => {
        setItem(item);
    }

    if (item !== "") {
        return <main>
            <App url={item} />
        </main>
    }

    return <main>
        <InputBar onSubmit={onSubmit} />
        <ItemList items={items} onItemClick={onItemClick} onDeleteItem={onDeleteItem} />
    </main>
}