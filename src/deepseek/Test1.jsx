import Test2 from './Test2.jsx'

export default function Test() {
    const log = (url = "a") => { console.log("2123123", url, "123213") }
    return (<main>
        <Test2 f={log}></Test2>
    </main>)
}
