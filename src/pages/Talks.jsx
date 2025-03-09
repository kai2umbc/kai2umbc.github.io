import React from 'react';
import {Card, CardContent} from '@/components/ui/card';

export default function Talks() {
    return (
        <div className="min-h-screen">
            {/* Black header section taking up 1/4 of viewport height */}
            <div className="bg-[#091c22] h-[25vh] flex flex-col justify-center items-center">
                <div className="flex flex-col items-center">
                    <h1 className="text-white text-4xl font-bold">Talks</h1>
                    <div className="w-full h-0.5 bg-white mt-2"></div>
                </div>
            </div>

            {/* Content section */}
            <div className="container mx-auto px-6 py-8">
                <article className="space-y-12">
                    {/* UT Dallas Section */}
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="md:w-1/2">
                            <h2 className="text-2xl font-semibold mb-4">UT Dallas Center for Machine Learning
                                Lecture</h2>
                            <p>
                                Knowledge-aware Learning for Mental Health Communications: Statistical and Semantic AI.
                                Lecture
                                Series, Center for Machine Learning, University of Texas at Dallas. Hosted by Prof(Dr).
                                Sriraam
                                Natarajan, Director of Center for Machine Learning and Starling Lab.
                            </p>
                        </div>
                        <div className="md:w-1/2">
                            <Card className="h-full hover:shadow-lg transition-shadow">
                                <CardContent className="p-4 h-full">
                                    <a href="http://bit.ly/AII_UTD" target="_blank" rel="noopener noreferrer"
                                       className="group flex flex-col h-full">
                                        <div className="relative overflow-hidden rounded-lg mb-4">
                                            <img
                                                src="/api/placeholder/800/400"
                                                alt="NeuroSymbolic AI for Grounding, Instructibility, and Explainability"
                                                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        </div>
                                        <h3 className="text-lg font-semibold group-hover:text-blue-600 transition-colors">
                                            NeuroSymbolic AI for Grounding, Instructibility, and Explainability
                                        </h3>
                                    </a>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Indian Institutions Section */}
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="md:w-1/2">
                            <h2 className="text-2xl font-semibold mb-4">Presentations at Indian Institutions</h2>
                            <p>
                                Knowledge-infused AI for Healthcare presented at Indraprastha Institute of Information
                                Technology, Delhi with Dr. Raghava Mutharaju. AI for Social Good: Knowledge-aware
                                Characterization of Web Communications delivered at LNM Institute of Information
                                Technology,
                                hosted by Prof(Dr.) Rahul Banerjee, Director.
                            </p>
                        </div>
                        <div className="md:w-1/2">
                            <Card className="h-full hover:shadow-lg transition-shadow">
                                <CardContent className="p-4 h-full">
                                    <a href="http://bit.ly/AII_IIITDdelhi" target="_blank" rel="noopener noreferrer"
                                       className="group flex flex-col h-full">
                                        <div className="relative overflow-hidden rounded-lg mb-4">
                                            <img
                                                src="/assets/talks/Presentations at Indian Institutions.png"
                                                alt="Robustness in Large Language Models with NeuroSymbolic AI"
                                                className="w-full h-60 object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        </div>
                                        <h3 className="text-lg font-semibold group-hover:text-blue-600 transition-colors">
                                            Robustness in Large Language Models with NeuroSymbolic AI
                                        </h3>
                                    </a>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* International Conference Section */}
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="md:w-1/2">
                            <h2 className="text-2xl font-semibold mb-4">International Conference Presentations</h2>
                            <p>
                                Knowledge-infused Learning in Healthcare at PyData Conference, University of Salamanca,
                                Spain.
                                Knowledge-infused Statistical Learning at PyData Berlin. NEURONE: NEURo-symbolic AI
                                presented at
                                2nd ACM AI ML Systems Conference 2022. Tutorial on Explainable Data for AI delivered at
                                AAAI
                                ICWSM 2021.
                            </p>
                        </div>
                        <div className="md:w-1/2">
                            <Card className="h-full hover:shadow-lg transition-shadow">
                                <CardContent className="p-4 h-full">
                                    <a href="https://docs.google.com/presentation/d/1VUigoKzSzD8hE2u-1T_eyqgNauVecVAUGrwMNpkXkJc/edit?usp=sharing"
                                       target="_blank" rel="noopener noreferrer" className="group flex flex-col h-full">
                                        <div className="relative overflow-hidden rounded-lg mb-4">
                                            <img
                                                src="/assets/talks/International Conference Presentations.jpg"
                                                alt="Trustworthy Generative AI for Mental Health"
                                                className="w-full h-60 object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        </div>
                                        <h3 className="text-lg font-semibold group-hover:text-blue-600 transition-colors">
                                            Trustworthy Generative AI for Mental Health
                                        </h3>
                                    </a>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Industry and Research Talks Section */}
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="md:w-1/2">
                            <h2 className="text-2xl font-semibold mb-4">Industry and Research Talks</h2>
                            <p>
                                Knowledge-enhanced Machine Learning presentation at AI Center, Samsung Research America,
                                Mountain View. Process Knowledge-infused AI keynote at Winter School, Knowledge Graph
                                and
                                Semantic Web Conference. Semantics of the Black-Box webinar for Sabudh Foundation Data
                                Science
                                Pro Series.
                            </p>
                        </div>
                        <div className="md:w-1/2">
                            <Card className="h-full hover:shadow-lg transition-shadow">
                                <CardContent className="p-4 h-full">
                                    <a href="https://docs.google.com/presentation/d/1qwNuYsJKvqhozO_ON3mfMizoHgLY_7V3QkrU1WdbM40/edit?usp=sharing"
                                       target="_blank" rel="noopener noreferrer" className="group flex flex-col h-full">
                                        <div className="relative overflow-hidden rounded-lg mb-4">
                                            <img
                                                src="/assets/talks/Industry and Research Talks.jpg"
                                                alt="Trustworthy Generative AI: The Hybridization of Large Language Models with NeuroSymbolic AI"
                                                className="w-full h-60 object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        </div>
                                        <h3 className="text-lg font-semibold group-hover:text-blue-600 transition-colors">
                                            Trustworthy Generative AI: The Hybridization of Large Language Models with
                                            NeuroSymbolic AI
                                        </h3>
                                    </a>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Healthcare and Mental Health Research Section */}
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="md:w-1/2">
                            <h2 className="text-2xl font-semibold mb-4">Healthcare and Mental Health Research</h2>
                            <p>
                                Psychdemic: Measuring Spatio-Temporal Psychological Impact of Novel Coronavirus
                                presented at MIT
                                Tech Review and Weill Cornell Medicine. Knowledge-infused AI for Healthcare presented at
                                NIH
                                Grantee Session, University of South Carolina, hosted by Prof(Dr). Xiaoming Li.
                            </p>
                        </div>
                        <div className="md:w-1/2">
                            <Card className="h-full hover:shadow-lg transition-shadow">
                                <CardContent className="p-4 h-full">
                                    <a href="https://docs.google.com/presentation/d/1d1Q_SVurFPO45XOe_1Viq7ixBhAaOl5z9ZRw-95BO54/edit?usp=sharing"
                                       target="_blank" rel="noopener noreferrer" className="group flex flex-col h-full">
                                        <div className="relative overflow-hidden rounded-lg mb-4">
                                            <img
                                                src="/assets/talks/Healthcare and Mental Health Research.jpg"
                                                alt="Knowledge-aware Learning for Mental Health Communications"
                                                className="w-full h-60 object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        </div>
                                        <h3 className="text-lg font-semibold group-hover:text-blue-600 transition-colors">
                                            Knowledge-aware Learning for Mental Health Communications
                                        </h3>
                                    </a>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Additional Notable Presentations Section */}
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="md:w-1/2">
                            <h2 className="text-2xl font-semibold mb-4">Additional Notable Presentations</h2>
                            <p>
                                Personalized Book-keeping at TalTech University, Knowledge-infused Reinforcement
                                Learning at
                                Knowledge Graph Conference 2022, and upcoming tutorial on Process Knowledge-infused
                                Learning for
                                Explainable Mental Healthcare at 19th ACL ICON Conference.
                            </p>
                        </div>
                        <div className="md:w-1/2">
                            <Card className="h-full hover:shadow-lg transition-shadow">
                                <CardContent className="p-4 h-full">
                                    <a href="https://docs.google.com/presentation/d/1JGdik_LI5JMItVHuMycxm55ogmzhwQ6CNlB6RwdPMfk/edit?usp=sharing"
                                       target="_blank" rel="noopener noreferrer" className="group flex flex-col h-full">
                                        <div className="relative overflow-hidden rounded-lg mb-4">
                                            <img
                                                src="/assets/talks/Additional Notable Presentations.jpg"
                                                alt="AI for Social Good: Knowledge-aware Characterization of Web Communications"
                                                className="w-full h-60 object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        </div>
                                        <h3 className="text-lg font-semibold group-hover:text-blue-600 transition-colors">
                                            AI for Social Good: Knowledge-aware Characterization of Web Communications
                                        </h3>
                                    </a>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </article>
            </div>
        </div>
    );
}