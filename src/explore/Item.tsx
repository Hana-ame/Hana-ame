import { useEffect, useState } from "react";
import { useParams } from "react-router"; // Use react-router-dom for useParams
import type { Owner, Post } from "../utils/type";
// Assume these functions exist in your dapp utility
import { getPost, getOwner, buyPost, patchPost } from "../utils/dapp.ts";
import { getCookie } from "../utils/getCookie.ts";

// --- Placeholder ---
// Replace this with your actual logic to get the connected user's address/ID
// const getCurrentUserAddress = (): string | null => {
// Example: return connectedWalletAddress;
// For testing, you can hardcode an address:
// return "0x1234567890abcdef1234567890abcdef12345678";
// Or return null if no user is connected
// return "YOUR_CONNECTED_WALLET_ADDRESS"; // !! IMPORTANT: Replace this !!
// };
// --- End Placeholder ---

export default function Item() {
    const { id } = useParams<{ id: string }>(); // Ensure id is typed
    const [post, setPost] = useState<Post>();
    const [ownerInfo, setOwnerInfo] = useState<Owner>(); // Renamed for clarity
    const [isLoading, setIsLoading] = useState<boolean>(true); // Combined loading state
    const [isPurchasing, setIsPurchasing] = useState<boolean>(false);
    const [isUpdating, setIsUpdating] = useState<boolean>(false); // Loading state for owner updates

    // State for owner edits
    const [editPrice, setEditPrice] = useState<string>("");
    const [editOnSale, setEditOnSale] = useState<boolean>(false);

    // const currentUserAddress = getCurrentUserAddress();
    const isOwner = () => ownerInfo?.owner === getCookie("username")

    // Fetch initial data
    useEffect(() => {
        if (!id) return; // Ensure id exists

        setIsLoading(true);
        Promise.all([getPost(id), getOwner(id)])
            .then(([postData, ownerData]) => {
                setPost(postData);
                setOwnerInfo(ownerData);
                // Initialize edit form state if owner data is available
                if (ownerData) {
                    setEditPrice(ownerData.price);
                    setEditOnSale(ownerData.onsale);
                }
            })
            .catch(error => {
                console.error("Error fetching post or owner data:", error);
                // Handle error display if needed
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [id]);

    // Handler for purchasing (non-owner)
    const handlePurchase = async () => {
        if (!id || !ownerInfo || !ownerInfo.onsale || isOwner()) return; // Add safety checks

        setIsPurchasing(true);
        try {
            // Assuming buyPost might return the new owner info or confirms transaction
            // Adjust based on what buyPost actually returns
            const result = await buyPost(id); // Pass price if needed by buyPost
            console.log("Purchase successful:", result);
            // Re-fetch owner data to reflect the change
            const updatedOwner = await getOwner(id);
            setOwnerInfo(updatedOwner);
            // You might want to navigate away or show a success message
        } catch (error) {
            console.error("Purchase failed:", error);
            // Show error to user
        } finally {
            setIsPurchasing(false);
        }
    };

    // Handler for updating listing (owner)
    const handleUpdateListing = async () => {
        if (!id || !isOwner) return;

        setIsUpdating(true);
        try {
            // Assume updateListing exists and handles the blockchain interaction
            const updatedOwner = await patchPost(id, editPrice, editOnSale);
            setOwnerInfo({
                ...ownerInfo,
                ...updatedOwner,
            }); // Update local state with response
            // Maybe show a success message
            console.log("Listing updated successfully");
        } catch (error) {
            console.error("Failed to update listing:", error);
            // Show error to user
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) {
        return <div className="text-center p-10">Loading...</div>;
    }

    if (!post) {
        return <div className="text-center p-10 text-red-500">Post not found.</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Content Area */}
            <div className="grid md:grid-cols-2 gap-8">
                {/* Image Display */}
                <div className="bg-gray-100 rounded-xl overflow-hidden aspect-square">
                    <img
                        src={post?.url}
                        alt={post?.content}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Text Information */}
                <div className="space-y-4 flex flex-col">
                    <h1 className="text-3xl font-bold">{post?.content}</h1>
                    <p className="text-lg text-gray-700">
                        <span>作者：</span>@{post?.username}
                    </p>
                    {ownerInfo && (
                        <p className="text-lg text-gray-700">
                            <span>所有人：</span>@{ownerInfo.owner}
                            {isOwner() && <span className="ml-2 text-sm font-semibold text-green-600">(You)</span>}
                        </p>
                    )}

                    {/* Price Display */}
                    {ownerInfo && (
                        <p className="text-xl">
                            <span className="text-gray-500">售价:</span>
                            {ownerInfo.onsale ? (
                                <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-md font-bold">
                                    ${ownerInfo.price} {/* Display current price */}
                                </span>
                            ) : (
                                <span className="ml-2 px-3 py-1 bg-gray-200 text-gray-600 rounded-md font-semibold">
                                    Not for Sale
                                </span>
                            )}
                        </p>
                    )}

                    {/* Action Buttons / Owner Controls */}
                    <div className="mt-auto pt-4"> {/* Push controls to bottom */}
                        {isOwner() ? (
                            // --- Owner Controls ---
                            <div className="p-4 border border-green-300 rounded-lg bg-green-50 space-y-3">
                                <h3 className="text-lg font-semibold text-green-800">Manage Listing</h3>
                                <div>
                                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                                        Set Price ($)
                                    </label>
                                    <input
                                        type="number" // Use number for price input
                                        id="price"
                                        min="0" // Prevent negative prices
                                        step="0.01" // Allow decimals if needed
                                        value={editPrice}
                                        onChange={(e) => setEditPrice(e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        disabled={isUpdating}
                                    />
                                </div>
                                <div className="flex items-center">
                                    <input
                                        id="onsale"
                                        type="checkbox"
                                        checked={editOnSale}
                                        onChange={(e) => setEditOnSale(e.target.checked)}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        disabled={isUpdating}
                                    />
                                    <label htmlFor="onsale" className="ml-2 block text-sm text-gray-900">
                                        List for Sale
                                    </label>
                                </div>
                                <button
                                    className={`w-full bg-green-600 text-white px-6 py-2 rounded-lg 
                                        hover:bg-green-700 transition-colors
                                        ${isUpdating ? 'opacity-75 cursor-not-allowed' : ''}`}
                                    onClick={handleUpdateListing}
                                    disabled={isUpdating}
                                >
                                    {isUpdating ? 'Updating...' : 'Update Listing'}
                                </button>
                            </div>
                        ) : (
                            // --- Non-Owner Actions ---
                            <div className="flex items-center space-x-2">
                                {/* Keep Like/Collect if they are generic actions */}
                                <button className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors">
                                    喜欢 ❤️
                                </button>
                                <button className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition-colors">
                                    收藏 ⭐
                                </button>
                                {/* Purchase Button */}
                                {getCookie("username") && ownerInfo && ( // Only show purchase button if ownerInfo is loaded
                                    <button
                                        className={`bg-blue-600 text-white px-6 py-2 rounded-lg
                                            hover:bg-blue-700 transition-colors
                                            ${isPurchasing || !ownerInfo?.onsale ? 'opacity-75 cursor-not-allowed' : ''}`}
                                        onClick={handlePurchase}
                                        disabled={isPurchasing || !ownerInfo?.onsale}
                                    >
                                        {(ownerInfo?.onsale
                                            ? (isPurchasing ? '购买中...' : '立即购买')
                                            : '未上架')}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <p className="text-gray-600 mt-4">
                        {/* Placeholder description */}
                    </p>
                </div>
            </div>
        </div>
    );
}