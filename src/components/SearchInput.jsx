import React, {useState} from 'react';
import {Input} from "@/components/ui/input";
import {Search, X} from 'lucide-react';

const SearchInput = ({value, onChange}) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className={`relative mb-6 transition-all duration-300 ${isFocused ? 'scale-105' : ''}`}>
            <Search
                className={`absolute left-2 top-2.5 h-4 w-4 transition-colors duration-300 ${isFocused ? 'text-blue-500' : 'text-muted-foreground'}`}/>
            <Input
                type="text"
                placeholder="Search by title or author..."
                value={value}
                onChange={onChange}
                className={`pl-8 transition-shadow duration-300 ${isFocused ? 'shadow-md border-blue-300' : ''}`}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
            />
            {value && (
                <button
                    onClick={() => onChange({target: {value: ''}})}
                    className="absolute right-2 top-2.5"
                >
                    <X className="h-4 w-4 text-gray-400 hover:text-gray-600"/>
                </button>
            )}
        </div>
    );
};

export default SearchInput;