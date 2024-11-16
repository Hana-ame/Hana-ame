import React, { useState, useEffect } from 'react';
import { fetchWithProxy } from '@/Tools/utils'

const JSONDisplay = ({ url }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetchWithProxy(url, {
                    method: 'GET',
                    mode: 'no-cors',
                });
                // if (!response.ok) {
                //     throw new Error('Network response was not ok'+response.statusText.toString());
                // }
                const jsonData = await response.text();
                setData(jsonData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [url]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h2>JSON Data:</h2>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
};

export default JSONDisplay;