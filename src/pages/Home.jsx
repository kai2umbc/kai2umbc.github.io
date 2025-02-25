import React, {useEffect} from 'react';
import {useLocation} from 'react-router-dom';
import {ArrowRight, Linkedin, Mail} from 'lucide-react';
import {Card, CardContent} from '@/components/ui/card';

const Home = () => {
    const location = useLocation();

    useEffect(() => {
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
    }, [location]);

    return (
        <div className="w-full">
            {/* Hero Section */}
            <section className="bg-[#E8F1F2]">
                <div className="relative">
                    <div className="w-full animate-slideDown">
                        <img
                            src="src/img/front page.jpg"
                            alt="AI Brain Illustration"
                            className="w-full h-screen object-cover"
                            style={{
                                clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)',
                                marginTop: '-1px'
                            }}
                        />
                    </div>
                </div>

                {/* Lab Description */}
                <div className="py-16 px-4">
                    <h2 className="text-3xl font-bold text-center mb-6">
                        Here at the KAI2 Lab, we study neural networks with symbolic reasoning techniques.
                    </h2>
                    <p className="max-w-3xl mx-auto text-center text-lg font-medium">
                        We work on combining AI with different forms of human knowledge to create human-centered
                        systems. By integrating knowledge graphs, lexicons, and commonsense understanding, we develop AI
                        systems
                        that are explainable, interpretable, and safe - making AI more aligned with human reasoning and
                        suitable for sensitive applications.
                    </p>
                </div>
            </section>

            {/* News Section */}
            <section className="bg-[#E8F1F2] py-20">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-8">
                    {/* People Card */}
                    <Card className="bg-white shadow-lg">
                        <CardContent className="p-6 flex flex-col min-h-[32rem]">
                            <h3 className="text-2xl font-bold mb-4">People</h3>
                            <p className="mb-6 flex-grow">
                                Meet our team of researchers and students working on cutting-edge AI projects. Our lab
                                brings together
                                experts from various backgrounds including machine learning, knowledge representation,
                                natural language processing, and cognitive science. We foster a collaborative
                                environment
                                where innovative ideas flourish and groundbreaking research takes shape.
                            </p>
                            <a href="/members"
                               className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded transition-all duration-300 hover:bg-[#CBDFE2] hover:text-black">
                                <span>Our Lab</span>
                                <ArrowRight size={16}/>
                            </a>
                        </CardContent>
                    </Card>

                    {/* Research Card */}
                    <Card className="bg-white shadow-lg">
                        <CardContent className="p-6 flex flex-col min-h-[32rem]">
                            <h3 className="text-2xl font-bold mb-4">Research</h3>
                            <p className="mb-6 flex-grow">
                                Explore our ongoing research projects and discoveries in artificial intelligence. Our
                                work
                                focuses on bridging the gap between neural networks and symbolic reasoning, developing
                                interpretable AI systems, and creating novel approaches to knowledge integration in
                                machine
                                learning models. We're particularly interested in making AI systems more transparent and
                                reliable.
                            </p>
                            <a href="/research"
                               className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded transition-all duration-300 hover:bg-[#CBDFE2] hover:text-black">
                                <span>Our Science</span>
                                <ArrowRight size={16}/>
                            </a>
                        </CardContent>
                    </Card>

                    {/* Publications Card */}
                    <Card className="bg-white shadow-lg">
                        <CardContent className="p-6 flex flex-col min-h-[32rem]">
                            <h3 className="text-2xl font-bold mb-4">Publications</h3>
                            <p className="mb-6 flex-grow">
                                Browse our latest publications and academic contributions to the field. Our research has
                                been published in top-tier conferences and journals including AAAI, IJCAI, NeurIPS, and
                                various IEEE transactions. We regularly share our findings with the broader AI community
                                through peer-reviewed papers, technical reports, and conference presentations.
                            </p>
                            <a href="/publications"
                               className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded transition-all duration-300 hover:bg-[#CBDFE2] hover:text-black">
                                <span>Our Papers</span>
                                <ArrowRight size={16}/>
                            </a>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Join our Lab Section */}
            <section id="join-lab" className="bg-[#E8F1F2] py-20">
                <div className="max-w-4xl mx-auto text-center px-8">
                    <h2 className="text-4xl font-bold mb-8">Join our Lab</h2>
                    <p className="text-xl mb-12">Connect with us through the following channels:</p>

                    <div
                        className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8">
                        <a href="https://www.linkedin.com/company/kai2/"
                           target="_blank"
                           rel="noopener noreferrer"
                           className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded transition-all duration-300 hover:bg-[#CBDFE2] hover:text-black">
                            <Linkedin size={24}/>
                            <span>Connect on LinkedIn</span>
                        </a>

                        <a href="mailto:manas@umbc.edu"
                           className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded transition-all duration-300 hover:bg-[#CBDFE2] hover:text-black">
                            <Mail size={24}/>
                            <span>Email Us</span>
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;