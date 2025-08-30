import React, {useState} from 'react';
import {BookOpen, Brain, BrainCircuit, ChevronLeft, ChevronRight, Globe, Lightbulb, Share2, Shield} from 'lucide-react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/research-card';
import NetworkGraph from '/src/components/NetworkGraph.jsx';

const Research = () => {
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
            title: "Human-Focused AI",
            description: "Developing AI systems that align with human values, needs, and cognitive processes for real-world applications.",
            icon: <Globe className="w-12 h-12 text-purple-600"/>
        }
    ];

    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            title: "Consistent AI",
            description: "Advancing the foundations of reliable AI systems through mathematical precision and algorithmic consistency. Our research focuses on developing robust frameworks that ensure consistent performance across varied applications and scenarios.",
            bgColor: "bg-blue-50",
            icon: <BrainCircuit className="w-12 h-12 text-blue-600 mb-4"/>
        },
        {
            title: "Reliable AI",
            description: "Creating AI systems that process and analyze multiple data types while maintaining reliability. Our approach integrates various data formats including images, text, and audio to build comprehensive and dependable AI solutions.",
            bgColor: "bg-purple-50",
            icon: <Share2 className="w-12 h-12 text-purple-600 mb-4"/>
        },
        {
            title: "Explainable AI",
            description: "Developing transparent AI systems that provide clear reasoning for their decisions. Our research emphasizes the importance of understanding AI's decision-making process, making it accessible and interpretable for humans.",
            bgColor: "bg-green-50",
            icon: <Lightbulb className="w-12 h-12 text-green-600 mb-4"/>
        },
        {
            title: "Trustworthy AI",
            description: "Building trust through human-centric AI design. Our research focuses on creating AI systems that are not only technically proficient but also emotionally intelligent and user-friendly, fostering trust between humans and AI.",
            bgColor: "bg-orange-50",
            icon: <BookOpen className="w-12 h-12 text-orange-600 mb-4"/>
        },
        {
            title: "AI Safety",
            description: "Ensuring the safe development and deployment of AI technologies through robust regulatory frameworks. Our research aligns with European AI safety standards while pushing the boundaries of innovation.",
            bgColor: "bg-red-50",
            icon: <Shield className="w-12 h-12 text-red-600 mb-4"/>
        }
    ];

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    return (
        <div className="min-h-screen">
            {/* Header section with gradient background */}
            <div
                className="bg-gradient-to-r from-[#091c22] to-[#1a3a47] h-[30vh] flex flex-col justify-center items-center">
                <div className="flex flex-col items-center">
                    <h1 className="text-white text-5xl font-bold tracking-tight">Research</h1>
                    <p className="text-gray-300 mt-4 text-xl">Advancing AI through knowledge integration</p>
                    <div className="w-32 h-1 bg-white mt-6 rounded-full"></div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-12 -mt-6">
                <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
                    <h2 className="text-4xl font-bold text-center mb-8 leading-tight text-gray-800">
                        Leading Neuro-Symbolic AI by integrating diverse human knowledge for safe, explainable
                        innovation.
                    </h2>
                    <p className="text-lg text-gray-600 text-center max-w-4xl mx-auto">
                        Our lab sits at the intersection of neural networks and symbolic reasoning, creating AI systems
                        that combine the power of deep learning with the interpretability of knowledge representation.
                    </p>
                </div>

                {/* Research Carousel Section - Enhanced with animations and icons */}
                <div className="py-12">
                    <h3 className="text-3xl font-bold text-center mb-10 text-gray-800">Our Research Focus Areas</h3>
                    <div className="max-w-6xl mx-auto">
                        <div className="relative">
                            {/* Navigation Buttons */}
                            <div className="absolute inset-y-0 left-0 flex items-center -ml-6 z-10">
                                <button
                                    onClick={prevSlide}
                                    className="p-3 rounded-full shadow-lg bg-white hover:bg-gray-50 transition-all transform hover:scale-110"
                                >
                                    <ChevronLeft className="w-6 h-6"/>
                                </button>
                            </div>
                            <div className="absolute inset-y-0 right-0 flex items-center -mr-6 z-10">
                                <button
                                    onClick={nextSlide}
                                    className="p-3 rounded-full shadow-lg bg-white hover:bg-gray-50 transition-all transform hover:scale-110"
                                >
                                    <ChevronRight className="w-6 h-6"/>
                                </button>
                            </div>

                            {/* Cards Container */}
                            <div className="overflow-hidden rounded-xl shadow-lg">
                                <div
                                    className="flex transition-transform duration-500 ease-in-out"
                                    style={{transform: `translateX(-${currentSlide * 100}%)`}}
                                >
                                    {slides.map((slide, index) => (
                                        <div key={index} className="w-full flex-shrink-0 px-4">
                                            <Card
                                                className={`h-full ${slide.bgColor} border-none transform transition-all duration-300 hover:shadow-xl`}>
                                                <CardHeader className="flex flex-col items-center text-center">
                                                    {slide.icon}
                                                    <CardTitle className="text-3xl">{slide.title}</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <CardDescription className="text-lg text-gray-700">
                                                        {slide.description}
                                                    </CardDescription>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Carousel Indicators */}
                            <div className="flex justify-center space-x-2 mt-6">
                                {slides.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentSlide(index)}
                                        className={`w-3 h-3 rounded-full transition-all ${
                                            currentSlide === index ? 'bg-blue-600 w-8' : 'bg-gray-300'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Network Graph Section - Enhanced with card container */}
                <div className="py-12">
                    <div className="bg-white rounded-lg shadow-lg p-8 max-w-6xl mx-auto">
                        <h2 className="text-3xl font-bold text-center mb-8 leading-tight text-gray-800">
                            Research Communities Network
                        </h2>
                        <p className="text-lg text-gray-600 text-center max-w-4xl mx-auto mb-8">
                            Explore how our research connects with various communities and domains in the AI landscape.
                        </p>
                        <div className="rounded-lg overflow-hidden border border-gray-100">
                            <NetworkGraph/>
                        </div>
                    </div>
                </div>

                {/* Visual Selection Image - Enhanced presentation */}
                <section id="research-areas" className="py-24 bg-[#E8F1F2]">
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold mb-6">AI Research Domains</h2>
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
            </div>
        </div>
    );
};

export default Research;