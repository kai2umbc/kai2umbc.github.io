import React, {useState} from 'react';
import {Award, ChevronDown, FileText, Filter, Search, Shield, Zap} from 'lucide-react';

export default function Grants() {
    // Sample grants data
    const grantsData = [
        {
            title: "USISTEF Award",
            project: "Hyper local air quality - AI-enabled context-aware content system",
            type: "Research",
            amount: "", // Placeholder amount
            status: "Active",
            year: "2024",
            description: "This project focuses on developing AI-enabled systems for monitoring and reporting hyper-local air quality, providing context-aware information to communities.",
            team: ["Dr. Manas Gaur", "KAI2-Lab Team"],
            icon: "environment"
        },
        {
            title: "UMBC Cybersecurity Institute Grant",
            project: "MetamorphicLLM: Robust Understanding of Metamorphic Malware through Attacks and Defenses using Neurosymbolic Large Language Models",
            type: "Cybersecurity",
            amount: "$75,000", // Placeholder amount
            status: "Active",
            year: "2024",
            description: "This research explores novel approaches to detect and defend against metamorphic malware using neurosymbolic large language models, combining symbolic reasoning with neural networks.",
            team: ["Dr. Manas Gaur", "Cybersecurity Research Team"],
            icon: "security"
        },
        {
            title: "UMBC SURF Award",
            project: "SAFEX: SAFe and EXplainable Question Generation in Depression-related Conversations",
            type: "Health",
            amount: "$25,000", // Placeholder amount
            status: "Active",
            year: "2024",
            description: "This project develops safe and explainable AI systems for generating appropriate questions in mental health conversations, specifically focused on depression support.",
            team: ["Mental Health AI Team", "KAI2-Lab Researchers"],
            icon: "health"
        }
    ];

    // State for filter
    const [selectedType, setSelectedType] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Get all unique grant types for the dropdown
    const grantTypes = ["All", ...new Set(grantsData.map(item => item.type))];

    // Filter grants based on type and search query
    const filteredGrants = grantsData.filter(grant => {
        const matchesType = selectedType === "All" || grant.type === selectedType;
        const matchesSearch = searchQuery === "" ||
            grant.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            grant.project.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesSearch;
    });

    // Toggle dropdown
    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    // Select filter type
    const selectType = (type) => {
        setSelectedType(type);
        setIsDropdownOpen(false);
    };

    // Function to get icon based on grant type
    const getIcon = (iconType) => {
        switch (iconType.toLowerCase()) {
            case 'environment':
                return <Zap className="w-8 h-8 text-green-600"/>;
            case 'security':
                return <Shield className="w-8 h-8 text-blue-600"/>;
            case 'health':
                return <FileText className="w-8 h-8 text-purple-600"/>;
            default:
                return <Award className="w-8 h-8 text-gray-600"/>;
        }
    };

    // Function to get color based on grant type
    const getTypeColor = (type) => {
        switch (type.toLowerCase()) {
            case 'research':
                return 'bg-green-100 text-green-800';
            case 'cybersecurity':
                return 'bg-blue-100 text-blue-800';
            case 'health':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen">
            {/* Header section with gradient background */}
            <div
                className="bg-gradient-to-r from-[#091c22] to-[#1a3a47] h-[30vh] flex flex-col justify-center items-center">
                <div className="flex flex-col items-center">
                    <h1 className="text-white text-5xl font-bold tracking-tight">Research Grants</h1>
                    <p className="text-gray-300 mt-4 text-xl">Funding our innovative research initiatives</p>
                    <div className="w-32 h-1 bg-white mt-6 rounded-full"></div>
                </div>
            </div>

            {/* Filter and search section */}
            <div className="container mx-auto px-6 -mt-8 z-10 relative">
                <div className="bg-white rounded-lg shadow-md p-4 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <div className="flex items-center">
                            <Filter className="w-5 h-5 mr-2 text-gray-700"/>
                            <h3 className="text-lg font-medium text-gray-700">Filter Grants</h3>
                        </div>

                        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
                            {/* Search input */}
                            <div className="relative w-full md:w-64">
                                <input
                                    type="text"
                                    placeholder="Search grants..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"/>
                            </div>

                            {/* Type dropdown */}
                            <div className="relative w-full md:w-auto">
                                <button
                                    onClick={toggleDropdown}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 w-full md:w-auto justify-between"
                                >
                                    <span>Type: {selectedType}</span>
                                    <ChevronDown className="ml-2 h-4 w-4"/>
                                </button>

                                {isDropdownOpen && (
                                    <div
                                        className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                                        <div className="py-1" role="menu" aria-orientation="vertical">
                                            {grantTypes.map((type) => (
                                                <button
                                                    key={type}
                                                    onClick={() => selectType(type)}
                                                    className={`block px-4 py-2 text-sm w-full text-left ${selectedType === type ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}
                                                    role="menuitem"
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content section */}
            <div className="container mx-auto px-6 py-4 -mt-4">
                <div className="grid grid-cols-1 gap-8">
                    {filteredGrants.length > 0 ? (
                        filteredGrants.map((grant, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:shadow-xl hover:-translate-y-1"
                            >
                                <div className="p-6">
                                    <div
                                        className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                                        <div className="flex items-center space-x-4">
                                            <div className="bg-gray-100 p-3 rounded-full">
                                                {getIcon(grant.icon)}
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-gray-800">{grant.title}</h2>
                                                <div className="flex items-center mt-1">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(grant.type)}`}>
                                                        {grant.type}
                                                    </span>
                                                    <span className="ml-2 text-gray-500 text-sm">{grant.year}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <h3 className="text-xl font-semibold text-gray-700 mb-3">Project</h3>
                                        <p className="text-gray-800">{grant.project}</p>
                                    </div>

                                    <div className="mb-4">
                                        <h3 className="text-xl font-semibold text-gray-700 mb-2">Description</h3>
                                        <p className="text-gray-600">{grant.description}</p>
                                    </div>

                                    <div className="flex items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-700 mb-2">Team</h3>
                                            <p className="text-gray-600">
                                                {grant.team.join(", ")}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="h-2 mt-4"></div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-lg text-gray-600">No grants found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}