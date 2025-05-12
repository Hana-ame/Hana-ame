import ImageUploadBox from '../components/ImageUploadBox.jsx'
import { createUploadFile } from '../utils/dapp.js'


export default function UploadPicture() {
    const onUpload = (url = "") => {
        createUploadFile(url=url);
    }
    return (<ImageUploadBox handleUploadURL={onUpload} />)
}