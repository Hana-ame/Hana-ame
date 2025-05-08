// Removed getPosts as we are using a fixed list now
// Removed LoadingSpinner as no async loading is happening here
import FourColumns from '../components/FourColumns';
import { NavLink } from 'react-router';
// Removed Post type as we are no longer displaying Post data

// Import icons from @heroicons/react/24/outline
import {
    ArrowUpTrayIcon, // Icon for upload
    PhotoIcon, // Icon for text to pic (represents an image)
    ArrowsRightLeftIcon, // Icon for pic to pic (represents transformation/exchange)
} from '@heroicons/react/24/outline'; // Using the outline variant of 24x24 icons

export default function CreateIndex() {

    // Define the fixed list of options
    const list = [{
        id: 'upload', // Unique ID for key prop
        label: 'Upload File', // Text to display
        url: '/create/upload', // URL to navigate to
        // Use the Heroicon component. Heroicons typically use Tailwind classes for sizing.
        // h-10 and w-10 correspond to 40px, similar to the previous example size.
        icon: <ArrowUpTrayIcon className="h-10 w-10" />,
    }, {
        id: 'text2pic',
        label: 'Text to Pic',
        url: '/create/text2pic',
        icon: <PhotoIcon className="h-10 w-10" />, // Represents an image output
    }, {
        id: 'pic2pic',
        label: 'Pic to Pic',
        url: '/create/pic2pic',
        icon: <ArrowsRightLeftIcon className="h-10 w-10" />, // Represents transformation or exchange
    },];

    // Removed the original list definition and any useEffect/useState related to fetching posts

    return <FourColumns> {
        list.map((item) => (
            // Using <a> tag for navigation as in the original structure
            // target="_blank" is unusual for internal links, removed it. Use standard navigation.
            // If you need SPA navigation, consider using <Link> from react-router-dom instead of <a>
            <NavLink to={item.url}
                key={item.id} >
                <div
                    // Keep original classes, add flexbox for centering content
                    className="relative rounded-lg transition-transform flex flex-col items-center justify-center p-4 bg-gray-200 text-gray-700" // Added flex, padding, text-white for contrast
                >
                    { /* Icon */} {
                        item.icon
                    }
                    { /* Label */}
                    <div className="mt-2 text-lg font-semibold text-center" > { /* Added text-center */} {
                        item.label
                    } </div>
                </div >
            </NavLink>
        ))
    } </FourColumns>
}

// Note on Icons:
// - This example uses '@heroicons/react/24/outline'. Make sure you have it installed: npm install @heroicons/react
// - Heroicons are typically sized using CSS classes like h-10 w-10 (assuming you are using Tailwind CSS).
//   If not using Tailwind, you might need to set height and width via style prop:
//   e.g., <ArrowUpTrayIcon style={{ height: '40px', width: '40px' }} />

// Note on Styling:
// - Added 'text-center' to the label div to ensure the text is centered below the icon.
// - Other styling considerations remain the same as the previous version.

// Note on Navigation:
// - Using <a> tags will cause a full page reload.
// - If you want SPA navigation, use <Link> from 'react-router-dom'.