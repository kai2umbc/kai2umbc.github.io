import React, {useState} from 'react';
import {ChevronLeft, ChevronRight} from 'lucide-react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/research-card';
import NetworkGraph from '/src/components/NetworkGraph.jsx';

const Research = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            title: "Consistent AI",
            description: "Advancing the foundations of reliable AI systems through mathematical precision and algorithmic consistency. Our research focuses on developing robust frameworks that ensure consistent performance across varied applications and scenarios.",
            bgColor: "bg-blue-50"
        },
        {
            title: "Reliable AI",
            description: "Creating AI systems that can process and analyze multiple data types while maintaining reliability. Our approach integrates various data formats including images, text, and audio to build comprehensive and dependable AI solutions.",
            bgColor: "bg-purple-50"
        },
        {
            title: "Explainable AI",
            description: "Developing transparent AI systems that provide clear reasoning for their decisions. Our research emphasizes the importance of understanding AI's decision-making process, making it accessible and interpretable for humans.",
            bgColor: "bg-green-50"
        },
        {
            title: "Trustworthy AI",
            description: "Building trust through human-centric AI design. Our research focuses on creating AI systems that are not only technically proficient but also emotionally intelligent and user-friendly, fostering trust between humans and AI.",
            bgColor: "bg-orange-50"
        },
        {
            title: "AI Safety",
            description: "Ensuring the safe development and deployment of AI technologies through robust regulatory frameworks. Our research aligns with European AI safety standards while pushing the boundaries of innovation.",
            bgColor: "bg-red-50"
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
            {/* Black header section taking up 1/4 of viewport height */}
            <div className="bg-[#091c22] h-[25vh] flex flex-col justify-center items-center">
                <div className="flex flex-col items-center">
                    <h1 className="text-white text-4xl font-bold">Research</h1>
                    <div className="w-full h-0.5 bg-white mt-2"></div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-8">
                <h2 className="text-4xl font-bold text-center mb-12 leading-tight">
                    Leading Neuro-Symbolic AI by integrating diverse human knowledge for safe, explainable
                    innovation.
                </h2>

                {/* Network Graph Section */}
                <div className="py-8 px-4">
                    <div className="max-w-6xl mx-auto">
                        <h1 className="text-4xl font-bold text-center mb-8 leading-tight">
                            Research Communities Network
                        </h1>
                        <NetworkGraph/>
                    </div>
                </div>

                {/* Research Carousel Section */}
                <div className="py-12 px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="relative">
                            {/* Navigation Buttons */}
                            <div className="absolute inset-y-0 left-0 flex items-center -ml-4 z-10">
                                <button
                                    onClick={prevSlide}
                                    className="p-2 rounded-full shadow-lg bg-white hover:bg-gray-50 transition-all"
                                >
                                    <ChevronLeft className="w-6 h-6"/>
                                </button>
                            </div>
                            <div className="absolute inset-y-0 right-0 flex items-center -mr-4 z-10">
                                <button
                                    onClick={nextSlide}
                                    className="p-2 rounded-full shadow-lg bg-white hover:bg-gray-50 transition-all"
                                >
                                    <ChevronRight className="w-6 h-6"/>
                                </button>
                            </div>

                            {/* Cards Container */}
                            <div className="overflow-hidden">
                                <div
                                    className="flex transition-transform duration-500 ease-in-out"
                                    style={{transform: `translateX(-${currentSlide * 100}%)`}}
                                >
                                    {slides.map((slide, index) => (
                                        <div key={index} className="w-full flex-shrink-0 px-4">
                                            <Card className={`h-full ${slide.bgColor}`}>
                                                <CardHeader>
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
                            <div className="flex justify-center space-x-2 mt-4">
                                {slides.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentSlide(index)}
                                        className={`w-2 h-2 rounded-full transition-all ${
                                            currentSlide === index
                                                ? 'bg-gray-800 w-4'
                                                : 'bg-gray-300'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Research;