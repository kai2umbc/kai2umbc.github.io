import React from 'react';

const PublicationSkeleton = () => {
    return (
        <div className="space-y-4 mb-8">
            {[1, 2, 3, 4].map((item) => (
                <div key={item} className="border rounded-lg p-4 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="flex gap-2 mt-3">
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PublicationSkeleton;