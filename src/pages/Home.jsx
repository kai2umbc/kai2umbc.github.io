import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {
    ArrowRight,
    Award,
    BookOpen,
    Brain,
    Calendar,
    ChevronDown,
    FileText,
    Globe,
    Lightbulb,
    Linkedin,
    Mail,
    MapPin,
    Users
} from 'lucide-react';
import {Card, CardContent} from '@/components/ui/card';

const Home = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);
    const [activeSection, setActiveSection] = useState('overview');

    // Handle navigation from other pages with scroll targets
    useEffect(() => {
        setIsVisible(true);

        if (location.state?.scrollTo) {
            const element = document.getElementById(location.state.scrollTo);
            if (element) {
                element.scrollIntoView({behavior: 'smooth'});
            }
            window.history.replaceState({}, document.title);
        } else if (location.hash) {
            const targetId = location.hash.substring(1);
            const element = document.getElementById(targetId);
            if (element) {
                element.scrollIntoView({behavior: 'smooth'});
            }
        }

        // Track scroll position to highlight active nav item
        const handleScroll = () => {
            const scrollPosition = window.scrollY;

            // Get sections and determine which one is currently in view
            const sections = ['overview', 'research-areas', 'cards', 'join-lab'];
            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const offsetTop = element.offsetTop;
                    const height = element.offsetHeight;

                    if (scrollPosition >= offsetTop - 200 && scrollPosition < offsetTop + height - 200) {
                        setActiveSection(section);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [location]);

    const handleNavigation = (path) => {
        navigate(path);
        window.scrollTo(0, 0);
    };

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({behavior: 'smooth'});
        }
    };

    // Research areas data
    const researchAreas = [
        {
            title: "Neuro-Symbolic AI",
            description: "Combining neural networks with symbolic reasoning to create more robust and interpretable AI systems.",
            icon: <Brain className="w-12 h-12 text-blue-600"/>
        },
        {
            title: "Knowledge Integration",
            description: "Incorporating domain knowledge, commonsense reasoning, and structured knowledge into machine learning models.",
            icon: <Lightbulb className="w-12 h-12 text-emerald-600"/>
        },
        {
            title: "Human-Centered AI",
            description: "Developing AI systems that align with human values, needs, and cognitive processes for real-world applications.",
            icon: <Globe className="w-12 h-12 text-purple-600"/>
        }
    ];

    return (
        <div className="w-full">
            {/* Floating Navigation */}
            <div className="fixed top-20 right-6 z-30 hidden lg:block">
                <div className="bg-white rounded-lg shadow-lg p-4">
                    <ul className="space-y-2">
                        <li>
                            <button
                                onClick={() => scrollToSection('overview')}
                                className={`flex items-center px-3 py-2 rounded-md transition-colors ${activeSection === 'overview' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                            >
                                <span className="mr-2">Overview</span>
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => scrollToSection('research-areas')}
                                className={`flex items-center px-3 py-2 rounded-md transition-colors ${activeSection === 'research-areas' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                            >
                                <span className="mr-2">Research</span>
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => scrollToSection('cards')}
                                className={`flex items-center px-3 py-2 rounded-md transition-colors ${activeSection === 'cards' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                            >
                                <span className="mr-2">Explore</span>
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => scrollToSection('join-lab')}
                                className={`flex items-center px-3 py-2 rounded-md transition-colors ${activeSection === 'join-lab' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                            >
                                <span className="mr-2">Join Us</span>
                            </button>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Hero Section */}
            <section id="overview"
                     className="relative h-screen overflow-hidden bg-gradient-to-b from-[#091c22] to-[#1a3a47]">
                {/* Animated Neural Network Overlay */}
                <div className="absolute inset-0 opacity-30 z-0">
                    <div className="absolute w-4 h-4 bg-blue-400 rounded-full top-1/4 left-1/3 animate-pulse"></div>
                    <div
                        className="absolute w-3 h-3 bg-green-400 rounded-full top-1/3 left-2/3 animate-pulse delay-100"></div>
                    <div
                        className="absolute w-5 h-5 bg-purple-400 rounded-full top-2/3 left-1/4 animate-pulse delay-200"></div>
                    <div
                        className="absolute w-4 h-4 bg-yellow-400 rounded-full top-1/2 left-1/2 animate-pulse delay-300"></div>
                    {/* Connect nodes with lines */}
                    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <line x1="25%" y1="25%" x2="66%" y2="33%" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
                        <line x1="66%" y1="33%" x2="25%" y2="66%" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
                        <line x1="25%" y1="66%" x2="50%" y2="50%" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
                        <line x1="50%" y1="50%" x2="33%" y2="25%" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
                    </svg>
                </div>

                <div className="relative h-full flex flex-col justify-center items-center text-center z-10 px-6">
                    <div
                        className={`transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">KAI<sup>2</sup> Lab
                        </h1>
                        <div className="w-24 h-1 bg-blue-500 mx-auto mb-8 rounded-full"></div>
                        <h2 className="text-xl md:text-3xl text-gray-200 mb-8 max-w-3xl mx-auto">
                            Knowledge Infused Artificial Intelligence and Inference Lab
                        </h2>
                        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-12">
                            Bridging neural networks with symbolic reasoning to build more interpretable,
                            explainable, and human-centered AI systems.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                            <button
                                onClick={() => scrollToSection('research-areas')}
                                className="px-8 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                            >
                                <span>Explore Research</span>
                                <ChevronDown className="ml-2 w-5 h-5"/>
                            </button>
                            <button
                                onClick={() => handleNavigation('/publications')}
                                className="px-8 py-3 bg-transparent text-white border border-white rounded-lg hover:bg-white hover:text-blue-900 transition-colors flex items-center justify-center"
                            >
                                <span>Our Publications</span>
                                <ArrowRight className="ml-2 w-5 h-5"/>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                    <ChevronDown className="w-8 h-8 text-white"/>
                </div>
            </section>

            {/* Research Areas Section */}
            <section id="research-areas" className="py-24 bg-[#E8F1F2]">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-6">Our Research Focus</h2>
                        <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                            At the KAI<sup>2</sup> Lab, we combine neural networks with symbolic reasoning
                            to create AI systems that are more aligned with human reasoning.
                        </p>
                        <div className="w-24 h-1 bg-blue-500 mx-auto mt-8 rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                        {researchAreas.map((area, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-xl shadow-lg p-8 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                            >
                                <div className="flex justify-center mb-6">
                                    {area.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-center mb-4">{area.title}</h3>
                                <p className="text-gray-700 text-center">{area.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Cards Section */}
            <section id="cards" className="py-24 bg-gradient-to-b from-[#E8F1F2] to-white">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-6">Explore Our Lab</h2>
                        <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                            Discover our team, research, and academic contributions to the field of AI.
                        </p>
                        <div className="w-24 h-1 bg-blue-500 mx-auto mt-8 rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                        {/* People Card */}
                        <Card
                            className="bg-white shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                            <div
                                className="h-40 bg-gradient-to-r from-blue-600 to-blue-400 flex justify-center items-center">
                                <Users className="w-20 h-20 text-white"/>
                            </div>
                            <CardContent className="p-6 flex flex-col">
                                <h3 className="text-2xl font-bold mb-4">People</h3>
                                <p className="mb-6 flex-grow">
                                    Meet our team of researchers and students working on cutting-edge AI projects. Our
                                    lab
                                    brings together experts from various backgrounds including machine learning,
                                    knowledge
                                    representation, natural language processing, and cognitive science.
                                </p>
                                <button
                                    onClick={() => handleNavigation('/members')}
                                    className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:bg-blue-700 w-full justify-center">
                                    <span>Our Lab</span>
                                    <ArrowRight size={16}/>
                                </button>
                            </CardContent>
                        </Card>

                        {/* Research Card */}
                        <Card
                            className="bg-white shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                            <div
                                className="h-40 bg-gradient-to-r from-emerald-600 to-emerald-400 flex justify-center items-center">
                                <BookOpen className="w-20 h-20 text-white"/>
                            </div>
                            <CardContent className="p-6 flex flex-col">
                                <h3 className="text-2xl font-bold mb-4">Research</h3>
                                <p className="mb-6 flex-grow">
                                    Explore our ongoing research projects and discoveries in artificial intelligence.
                                    Our
                                    work focuses on bridging the gap between neural networks and symbolic reasoning,
                                    developing interpretable AI systems, and creating novel approaches to knowledge
                                    integration.
                                </p>
                                <button
                                    onClick={() => handleNavigation('/research')}
                                    className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:bg-emerald-700 w-full justify-center">
                                    <span>Our Science</span>
                                    <ArrowRight size={16}/>
                                </button>
                            </CardContent>
                        </Card>

                        {/* Publications Card */}
                        <Card
                            className="bg-white shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                            <div
                                className="h-40 bg-gradient-to-r from-purple-600 to-purple-400 flex justify-center items-center">
                                <FileText className="w-20 h-20 text-white"/>
                            </div>
                            <CardContent className="p-6 flex flex-col">
                                <h3 className="text-2xl font-bold mb-4">Publications</h3>
                                <p className="mb-6 flex-grow">
                                    Browse our latest publications and academic contributions to the field. Our research
                                    has
                                    been published in top-tier conferences and journals including AAAI, IJCAI, NeurIPS,
                                    and
                                    various IEEE transactions.
                                </p>
                                <button
                                    onClick={() => handleNavigation('/publications')}
                                    className="inline-flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:bg-purple-700 w-full justify-center">
                                    <span>Our Papers</span>
                                    <ArrowRight size={16}/>
                                </button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Latest News Preview */}
            <section className="py-20 bg-white">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-6">Latest News</h2>
                        <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                            Stay updated with our recent publications, presentations, and events.
                        </p>
                        <div className="w-24 h-1 bg-blue-500 mx-auto mt-8 rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Featured News Item */}
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <span
                                        className="px-3 py-1 rounded-full text-sm font-medium flex items-center bg-purple-100 text-purple-800">
                                        <Award className="w-5 h-5 text-purple-600 mr-1"/>
                                        <span>Publication</span>
                                    </span>
                                    <span className="text-gray-500 text-sm flex items-center">
                                        <Calendar className="w-4 h-4 mr-1"/>
                                        February 16, 2025
                                    </span>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">The MAD Dataset for Code
                                    Obfuscation</h2>
                                <h3 className="text-xl text-gray-600 mb-4">AAAI 2025 Main Track</h3>
                                <div className="flex items-center text-gray-600 mb-4">
                                    <MapPin className="w-5 h-5 mr-2 text-gray-500"/>
                                    <span>Washington D.C., USA</span>
                                </div>
                                <a
                                    href="https://arxiv.org/pdf/2412.16135"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-4 py-2 mt-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                >
                                    <FileText className="w-4 h-4 mr-2"/>
                                    View Paper
                                </a>
                            </div>
                        </div>

                        {/* News Preview */}
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <span
                                        className="px-3 py-1 rounded-full text-sm font-medium flex items-center bg-emerald-100 text-emerald-800">
                                        <FileText className="w-5 h-5 text-emerald-600 mr-1"/>
                                        <span>Tutorial</span>
                                    </span>
                                    <span className="text-gray-500 text-sm flex items-center">
                                        <Calendar className="w-4 h-4 mr-1"/>
                                        February 15, 2025
                                    </span>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">Neurosymbolic AI for
                                    Explainability, Grounding, and Instructibility</h2>
                                <h3 className="text-xl text-gray-600 mb-4">AAAI 2025</h3>
                                <div className="flex items-center text-gray-600 mb-4">
                                    <MapPin className="w-5 h-5 mr-2 text-gray-500"/>
                                    <span>Washington D.C., USA</span>
                                </div>
                                <a
                                    href="https://nesy-egi.github.io/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-4 py-2 mt-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                >
                                    <FileText className="w-4 h-4 mr-2"/>
                                    Tutorial Page
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="text-center mt-12">
                        <button
                            onClick={() => handleNavigation('/news')}
                            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg transition-all duration-300 hover:bg-blue-700"
                        >
                            <span>View All News</span>
                            <ArrowRight size={18}/>
                        </button>
                    </div>
                </div>
            </section>

            {/* Join our Lab Section */}
            <section id="join-lab" className="py-24 bg-gradient-to-b from-white to-[#E8F1F2]">
                <div className="max-w-4xl mx-auto text-center px-8">
                    <h2 className="text-4xl font-bold mb-6">Join our Lab</h2>
                    <p className="text-xl mb-6 max-w-2xl mx-auto">
                        We're always looking for talented researchers, students, and collaborators
                        passionate about advancing the field of AI. Get in touch with us to explore
                        opportunities.
                    </p>
                    <div className="w-24 h-1 bg-blue-500 mx-auto mb-12 rounded-full"></div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                        <div
                            className="bg-white rounded-xl shadow-lg p-8 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                            <Linkedin size={48} className="text-blue-600 mx-auto mb-4"/>
                            <h3 className="text-2xl font-bold mb-4">Professional Network</h3>
                            <p className="text-gray-700 mb-6">
                                Follow our lab's activities and connect with our researchers on LinkedIn.
                            </p>
                            <a
                                href="https://www.linkedin.com/company/kai2/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg transition-all duration-300 hover:bg-blue-700 w-full justify-center"
                            >
                                <span>Connect on LinkedIn</span>
                                <ArrowRight size={16}/>
                            </a>
                        </div>

                        <div
                            className="bg-white rounded-xl shadow-lg p-8 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                            <Mail size={48} className="text-blue-600 mx-auto mb-4"/>
                            <h3 className="text-2xl font-bold mb-4">Direct Contact</h3>
                            <p className="text-gray-700 mb-6">
                                Reach out to us directly to discuss research opportunities and collaborations.
                            </p>
                            <a
                                href="mailto:manas@umbc.edu"
                                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg transition-all duration-300 hover:bg-blue-700 w-full justify-center"
                            >
                                <span>Email Us</span>
                                <ArrowRight size={16}/>
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;