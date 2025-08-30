import React, {useState} from 'react';
import {Calendar, ChevronRight, ExternalLink, FileText, MapPin, Search} from 'lucide-react';

export default function Talks() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');

    // Categories for filtering
    const categories = [
        'All',
        'Academic',
        'Conference',
        'Industry',
        'Healthcare',
        'Research'
    ];

    // Enhanced talk data with categories
    const talks = [
        {
            id: 1,
            title: "Towards Knowledge-aware Learning for Mental Health Communications",
            event: "UT Dallas Center for Machine Learning Lecture",
            description: "Knowledge-aware Learning for Mental Health Communications: Statistical and Semantic AI. Lecture Series, Center for Machine Learning, University of Texas at Dallas. Hosted by Prof(Dr). Sriraam Natarajan, Director of Center for Machine Learning and Starling Lab.",
            image: "/assets/talks/Towards Knowledge-aware Learning for Mental Health Communications.png",
            link: "https://docs.google.com/presentation/d/1IJZGVkJ4yrK62vXKFKk5lEDPhFAbDhAAhAef8Cpe8cE/edit?usp=sharing",
            date: "February 2025",
            location: "Dallas, TX, USA",
            categories: ['Academic', 'Research']
        },
        {
            id: 2,
            title: "Robustness in Large Language Models with NeuroSymbolic AI",
            event: "Presentations at Indian Institutions",
            description: "Knowledge-infused AI for Healthcare presented at Indraprastha Institute of Information Technology, Delhi with Dr. Raghava Mutharaju. AI for Social Good: Knowledge-aware Characterization of Web Communications delivered at LNM Institute of Information Technology, hosted by Prof(Dr.) Rahul Banerjee, Director.",
            image: "/assets/talks/Presentations at Indian Institutions.png",
            link: "https://www.slideshare.net/secret/Fvod1gEDa5Fsvn",
            date: "January 2025",
            location: "Delhi, India",
            categories: ['Academic', 'Research']
        },
        {
            id: 3,
            title: "Trustworthy Generative AI for Mental Health",
            event: "International Conference Presentations",
            description: "Knowledge-infused Learning in Healthcare at PyData Conference, University of Salamanca, Spain. Knowledge-infused Statistical Learning at PyData Berlin. NEURONE: NEURo-symbolic AI presented at 2nd ACM AI ML Systems Conference 2022. Tutorial on Explainable Data for AI delivered at AAAI ICWSM 2021.",
            image: "/assets/talks/International Conference Presentations.jpg",
            link: "https://docs.google.com/presentation/d/1VUigoKzSzD8hE2u-1T_eyqgNauVecVAUGrwMNpkXkJc/edit?usp=sharing",
            date: "December 2024",
            location: "Multiple Locations, Europe",
            categories: ['Conference', 'Healthcare']
        },
        {
            id: 4,
            title: "Trustworthy Generative AI: The Hybridization of Large Language Models with NeuroSymbolic AI",
            event: "Industry and Research Talks",
            description: "Knowledge-enhanced Machine Learning presentation at AI Center, Samsung Research America, Mountain View. Process Knowledge-infused AI keynote at Winter School, Knowledge Graph and Semantic Web Conference. Semantics of the Black-Box webinar for Sabudh Foundation Data Science Pro Series.",
            image: "/assets/talks/Industry and Research Talks.jpg",
            link: "https://docs.google.com/presentation/d/1qwNuYsJKvqhozO_ON3mfMizoHgLY_7V3QkrU1WdbM40/edit?usp=sharing",
            date: "November 2024",
            location: "Mountain View, CA, USA",
            categories: ['Industry', 'Research']
        },
        {
            id: 5,
            title: "Knowledge-aware Learning for Mental Health Communications",
            event: "Healthcare and Mental Health Research",
            description: "Psychdemic: Measuring Spatio-Temporal Psychological Impact of Novel Coronavirus presented at MIT Tech Review and Weill Cornell Medicine. Knowledge-infused AI for Healthcare presented at NIH Grantee Session, University of South Carolina, hosted by Prof(Dr). Xiaoming Li.",
            image: "/assets/talks/Healthcare and Mental Health Research.jpg",
            link: "https://docs.google.com/presentation/d/1d1Q_SVurFPO45XOe_1Viq7ixBhAaOl5z9ZRw-95BO54/edit?usp=sharing",
            date: "October 2024",
            location: "New York, NY, USA",
            categories: ['Healthcare', 'Research']
        },
        {
            id: 6,
            title: "AI for Social Good: Knowledge-aware Characterization of Web Communications",
            event: "Additional Notable Presentations",
            description: "Personalized Book-keeping at TalTech University, Knowledge-infused Reinforcement Learning at Knowledge Graph Conference 2022, and upcoming tutorial on Process Knowledge-infused Learning for Explainable Mental Healthcare at 19th ACL ICON Conference.",
            image: "/assets/talks/Additional Notable Presentations.jpg",
            link: "https://docs.google.com/presentation/d/1JGdik_LI5JMItVHuMycxm55ogmzhwQ6CNlB6RwdPMfk/edit?usp=sharing",
            date: "September 2024",
            location: "Tallinn, Estonia",
            categories: ['Conference', 'Research']
        }
    ];

    // Filter talks based on search and category
    const filteredTalks = talks.filter(talk => {
        const matchesSearch = talk.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            talk.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'All' || talk.categories.includes(filterCategory);
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen">
            {/* Header section with gradient background */}
            <div
                className="bg-gradient-to-r from-[#091c22] to-[#1a3a47] h-[30vh] flex flex-col justify-center items-center">
                <div className="flex flex-col items-center">
                    <h1 className="text-white text-5xl font-bold tracking-tight">Talks</h1>
                    <p className="text-gray-300 mt-4 text-xl">Sharing our knowledge and insights</p>
                    <div className="w-32 h-1 bg-white mt-6 rounded-full"></div>
                </div>
            </div>

            {/* Search and filter section */}
            <div className="container mx-auto px-6 -mt-8 z-10 relative">
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <div className="relative flex-grow">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400"/>
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Search talks..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {categories.map(category => (
                                <button
                                    key={category}
                                    onClick={() => setFilterCategory(category)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                        filterCategory === category
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content section */}
            <div className="container mx-auto px-6 py-8 -mt-4">
                <div className="grid grid-cols-1 gap-8">
                    {filteredTalks.length > 0 ? (
                        filteredTalks.map((talk) => (
                            <div
                                key={talk.id}
                                className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:shadow-xl hover:-translate-y-1"
                            >
                                <div className="md:flex">
                                    <div className="md:w-2/3 relative">
                                        <img
                                            src={talk.image}
                                            alt={talk.title}
                                            className="h-fit w-fit object-cover"
                                        />
                                        <div className="absolute top-0 left-0 m-4 flex flex-wrap gap-2">
                                            {talk.categories.map(category => (
                                                <span
                                                    key={category}
                                                    className="px-2 py-1 bg-black bg-opacity-70 text-white text-xs rounded-full"
                                                >
                                                    {category}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="md:w-2/3 p-6">
                                        <div className="flex flex-col h-full">
                                            <div className="mb-4">
                                                <h2 className="text-2xl font-bold text-gray-900 mb-2">{talk.title}</h2>
                                                <h3 className="text-xl text-gray-600 mb-2">{talk.event}</h3>

                                                <div
                                                    className="flex flex-wrap items-center text-gray-500 text-sm gap-4 mt-3 mb-4">
                                                    <div className="flex items-center">
                                                        <Calendar className="w-4 h-4 mr-1"/>
                                                        <span>{talk.date}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <MapPin className="w-4 h-4 mr-1"/>
                                                        <span>{talk.location}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="text-gray-600 mb-4 flex-grow">{talk.description}</p>

                                            <a
                                                href={talk.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors self-start mt-auto"
                                            >
                                                <ExternalLink className="w-4 h-4 mr-2"/>
                                                View Presentation
                                                <ChevronRight className="w-4 h-4 ml-1"/>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-16">
                            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4"/>
                            <h3 className="text-xl font-medium text-gray-700 mb-2">No talks found</h3>
                            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}