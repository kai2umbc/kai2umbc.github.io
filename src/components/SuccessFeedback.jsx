import React, {useEffect, useState} from 'react';
import {CheckCircle} from 'lucide-react';

const SuccessFeedback = ({message, duration = 3000}) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
        }, duration);
        return () => clearTimeout(timer);
    }, [duration]);

    if (!visible) return null;

    return (
        <div
            className="fixed bottom-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg animate-in slide-in-from-right duration-300">
            <div className="flex items-center gap-2">
                <CheckCircle className="text-green-500 w-5 h-5"/>
                <span className="text-green-800">{message}</span>
            </div>
        </div>
    );
};

export default SuccessFeedback;