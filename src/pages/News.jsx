import React, {useEffect, useState} from 'react';
import {Award, Calendar, ChevronDown, FileText, Filter, Gift, MapPin, Presentation, Users} from 'lucide-react';

export default function News() {
    // Sample news data with dates as Date objects for easier sorting
    const newsItemsData = [
        {
            type: "Presentation",
            name: "Trustworthy Generative AI: The Hybridization of Large Language Models with NeuroSymbolic AI",
            event: "National Faculty Development Programme (FDP) on \"Reinventing Pedagogy in the Age of AI: Methods, Approaches, and Perspectives\"",
            location: "Maitreyi College",
            date: new Date(2024, 0, 10),
            team: ["Manas Gaur"],
            links: [
                {label: "Presentation", url: "https://www.youtube.com/watch?v=s1mk2tIi5VI"},
            ]
        },
        {
            type: "Tutorial",
            name: "Neurosymbolic AI for Explainability, Grounding, and Instructibility",
            event: "AAAI 2025",
            location: "Washington D.C., USA",
            date: new Date(2025, 1, 15),
            team: ["Deepa Tilwani", "Ali Mohammadi", "Edward Raff", "Aman Chadha"],
            links: [
                {label: "Tutorial Page", url: "https://nesy-egi.github.io/"},
                {
                    label: "Slides",
                    url: "https://docs.google.com/presentation/d/1cw2RqVvkIGFNyHZxhO_F1DUPdTYTQ13a/edit?usp=sharing&ouid=115373182588084065297&rtpof=true&sd=true"
                },
                {label: "Conference", url: "https://aaai.org/conference/aaai/aaai-25/"}
            ]
        },
        {
            type: "Presentation",
            name: "Knowledge-infused Copilots for Mental Health",
            event: "UG Consortium",
            location: "Virtual Event",
            date: new Date(2025, 0, 28),
            team: ["Gerald Ndawula"],
            links: [
                {
                    label: "Paper",
                    url: "https://drive.google.com/file/d/1Xrgc-N04IZA079P2ZgIsVO8DK5zlyTSb/view?usp=sharing"
                }
            ]
        },
        {
            type: "Publication",
            name: "The MAD Dataset for Code Obfuscation",
            event: "AAAI 2025 Main Track",
            location: "Washington D.C., USA",
            date: new Date(2025, 1, 16),
            team: ["Seyedreza Mohseni", "Ali Mohammadi"],
            links: [
                {label: "Paper", url: "https://arxiv.org/pdf/2412.16135"},
            ]
        },
        {
            type: "Presentation",
            name: "COBIAS Presentation",
            event: "ACM Web Science Conference",
            location: "Glasgow, UK",
            date: new Date(2025, 2, 5),
            team: ["Priyanshul Govil"],
            links: [
                {label: "Paper", url: "https://arxiv.org/abs/2402.14889"},
                {label: "Conference", url: "https://www.websci25.org/"}
            ]
        },
        {
            type: "Publication",
            name: "Book Chapter On NeuroSymbolic Legal",
            event: "Academic Publication",
            location: "N/A",
            date: new Date(2025, 0, 15), // Estimated date since not specified
            team: ["UMBC KAI2-Lab"],
            links: []
        },
        {
            type: "Award",
            name: (<>
                    LocalIntel: Generating Organizational Threat Intelligence from Global and Local Cyber Knowledge -
                    <span className="italic font-serif"><div></div>Best Paper Award</span>
                </>
            ),
            event: "17th International Symposium on Foundations & Practice of Security (FPS – 2024)",
            location: "FPS 2024",
            date: new Date(2024, 11, 10), // Estimated date since only year was provided
            team: ["Shaswata Mitra", "Subash Neupane", "Trisha Chakraborty", "Sudip Mittal", "Aritran Piplai", "Manas Gaur", "Shahram Rahimi"],
            links: [
                {label: "Paper", url: "https://arxiv.org/abs/2401.10036"},
                {label: "Award Details", url: "https://fps-2024.hec.ca/cfp/accepted-papers/"}
            ]
        },
        {
            type: "Collaboration",
            name: "UMBC KAI2-Lab Launched a Collaborative Project with PAQS.biz",
            event: "Industry Collaboration",
            location: "UMBC",
            date: new Date(2024, 11, 1), // Estimated date since not specified
            team: ["UMBC KAI2-Lab", "A. Vaidyanathan (Founder PAQS.biz)"],
            links: []
        },
        {
            type: "Collaboration",
            name: "Joint Study Agreement with IBM Research",
            event: "Research Partnership",
            location: "UMBC",
            date: new Date(2024, 10, 15), // Estimated date since not specified
            team: ["UMBC KAI2-Lab", "Dr. Harsha Kokel"],
            links: []
        },
        {
            type: "Workshop",
            name: (
                <>
                    2nd Edition of Workshop on Knowledge Graphs for Responsible AI -
                    <span className="italic font-serif"> Calling for Papers</span>
                </>
            ),
            event: "Academic Workshop",
            location: "Virtual",
            date: new Date(2025, 1, 28),
            team: ["KAI2-Lab", "Edlira Vakaj", "Arijit Khan", "Nandana Mihindukulasooriya"],
            links: [
                {label: "Workshop Page", url: "https://sites.google.com/view/kg-star/team?authuser=0"},
                {label: "Previous Edition", url: "https://kil-workshop.github.io/KG-STAR/"}
            ]
        },
        {
            type: "Presentation",
            name: "WellDunn: On the Robustness and Explainability of Language Models and Large Language Models in Identifying Wellness Dimensions\n",
            event: "EMNLP 2024",
            location: "Miami, Florida",
            date: new Date(2024, 10, 15),
            team: ["Ali Mohammadi"],
            links: [
                {label: "Paper", url: "https://aclanthology.org/2024.blackboxnlp-1.23/"}
            ]
        }
    ];

    const formatDate = (date) => {
        // Create a date with the same year, month and day in local time
        const localDate = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
        );

        return localDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // State for filter and events
    const [selectedType, setSelectedType] = useState("All");
    const [newsItems, setNewsItems] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Get all unique event types for the dropdown
    const eventTypes = ["All", ...new Set(newsItemsData.map(item => item.type))];

    // Sort and filter events on load and when filter changes
    useEffect(() => {
        let filteredItems = [...newsItemsData];

        // Apply type filter if not "All"
        if (selectedType !== "All") {
            filteredItems = filteredItems.filter(item => item.type === selectedType);
        }

        // Sort by date (most recent first)
        filteredItems.sort((a, b) => b.date - a.date);

        setNewsItems(filteredItems);
    }, [selectedType]);

    // Toggle dropdown
    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    // Select filter type
    const selectType = (type) => {
        setSelectedType(type);
        setIsDropdownOpen(false);
    };

    // Function to get icon based on event type
    const getIcon = (type) => {
        switch (type.toLowerCase()) {
            case 'tutorial':
                return <FileText className="w-5 h-5 text-emerald-600"/>;
            case 'presentation':
                return <Presentation className="w-5 h-5 text-blue-600"/>;
            case 'publication':
                return <FileText className="w-5 h-5 text-purple-600"/>;
            case 'award':
                return <Award className="w-5 h-5 text-yellow-600"/>;
            case 'grant':
                return <Gift className="w-5 h-5 text-green-600"/>;
            case 'workshop':
                return <Users className="w-5 h-5 text-orange-600"/>;
            case 'collaboration':
                return <Users className="w-5 h-5 text-indigo-600"/>;
            case 'visit':
                return <MapPin className="w-5 h-5 text-red-600"/>;
            default:
                return <Calendar className="w-5 h-5 text-gray-600"/>;
        }
    };

    // Function to get color based on event type
    const getTypeColor = (type) => {
        switch (type.toLowerCase()) {
            case 'tutorial':
                return 'bg-emerald-100 text-emerald-800';
            case 'presentation':
                return 'bg-blue-100 text-blue-800';
            case 'publication':
                return 'bg-purple-100 text-purple-800';
            case 'award':
                return 'bg-yellow-100 text-yellow-800';
            case 'grant':
                return 'bg-green-100 text-green-800';
            case 'workshop':
                return 'bg-orange-100 text-orange-800';
            case 'collaboration':
                return 'bg-indigo-100 text-indigo-800';
            case 'visit':
                return 'bg-red-100 text-red-800';
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
                    <h1 className="text-white text-5xl font-bold tracking-tight">Lab News</h1>
                    <p className="text-gray-300 mt-4 text-xl">Latest achievements and activities</p>
                    <div className="w-32 h-1 bg-white mt-6 rounded-full"></div>
                </div>
            </div>

            {/* Filter section */}
            <div className="container mx-auto px-6 -mt-8 z-10 relative">
                <div className="bg-white rounded-lg shadow-md p-4 mb-8 flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-700 flex items-center">
                        <Filter className="w-5 h-5 mr-2"/>
                        Filter Events
                    </h3>

                    <div className="relative">
                        <button
                            onClick={toggleDropdown}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            {selectedType}
                            <ChevronDown className="ml-2 h-4 w-4"/>
                        </button>

                        {isDropdownOpen && (
                            <div
                                className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                                <div className="py-1" role="menu" aria-orientation="vertical">
                                    {eventTypes.map((type) => (
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

            {/* Content section */}
            <div className="container mx-auto px-6 py-4 -mt-4">
                <div className="grid grid-cols-1 gap-8">
                    {newsItems.length > 0 ? (
                        newsItems.map((item, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:shadow-xl hover:-translate-y-1"
                            >
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                                        <span
                                            className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getTypeColor(item.type)}`}>
                                            {getIcon(item.type)}
                                            <span className="ml-1">{item.type}</span>
                                        </span>
                                        <span className="text-gray-500 text-sm flex items-center">
                                            <Calendar className="w-4 h-4 mr-1"/>
                                            {formatDate(item.date)}
                                        </span>
                                    </div>

                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{item.name}</h2>
                                    <h3 className="text-xl text-gray-600 mb-4">{item.event}</h3>

                                    <div className="flex items-center text-gray-600 mb-4">
                                        <MapPin className="w-5 h-5 mr-2 text-gray-500"/>
                                        <span>{item.location}</span>
                                    </div>

                                    <div className="flex items-start mb-5">
                                        <Users className="w-5 h-5 mr-2 text-gray-500 mt-1"/>
                                        <div>
                                            <p className="text-gray-600 font-medium">Participants:</p>
                                            <p className="text-gray-700">
                                                {item.team.join(", ")}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-3 mt-4">
                                        {item.links.map((link, linkIndex) => (
                                            <a
                                                key={linkIndex}
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                            >
                                                <FileText className="w-4 h-4 mr-2"/>
                                                {link.label}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-lg text-gray-600">No events found for the selected filter.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}