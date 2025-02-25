export default function News() {
    return (
        <div className="min-h-screen">
            {/* Black header section taking up 1/4 of viewport height */}
            <div className="bg-[#091c22] h-[25vh] flex flex-col justify-center items-center">
                <div className="flex flex-col items-center">
                    <h1 className="text-white text-4xl font-bold">Lab News</h1>
                    <div className="w-full h-0.5 bg-white mt-2"></div>
                </div>
            </div>

            {/* Content section */}
            <div className="container mx-auto px-6 py-8">
                <article className="prose max-w-none">
                    <h2 className="text-2xl font-semibold mb-4">UT Dallas Center for Machine Learning Lecture</h2>
                    <p className="mb-6">
                        Knowledge-aware Learning for Mental Health Communications: Statistical and Semantic AI. Lecture
                        Series, Center for Machine Learning, University of Texas at Dallas. Hosted by Prof(Dr). Sriraam
                        Natarajan, Director of Center for Machine Learning and Starling Lab.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4">Presentations at Indian Institutions</h2>
                    <p className="mb-6">
                        Knowledge-infused AI for Healthcare presented at Indraprastha Institute of Information
                        Technology, Delhi with Dr. Raghava Mutharaju. AI for Social Good: Knowledge-aware
                        Characterization of Web Communications delivered at LNM Institute of Information Technology,
                        hosted by Prof(Dr.) Rahul Banerjee, Director.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4">International Conference Presentations</h2>
                    <p className="mb-6">
                        Knowledge-infused Learning in Healthcare at PyData Conference, University of Salamanca, Spain.
                        Knowledge-infused Statistical Learning at PyData Berlin. NEURONE: NEURo-symbolic AI presented at
                        2nd ACM AI ML Systems Conference 2022. Tutorial on Explainable Data for AI delivered at AAAI
                        ICWSM 2021.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4">Industry and Research Talks</h2>
                    <p className="mb-6">
                        Knowledge-enhanced Machine Learning presentation at AI Center, Samsung Research America,
                        Mountain View. Process Knowledge-infused AI keynote at Winter School, Knowledge Graph and
                        Semantic Web Conference. Semantics of the Black-Box webinar for Sabudh Foundation Data Science
                        Pro Series.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4">Healthcare and Mental Health Research</h2>
                    <p className="mb-6">
                        Psychdemic: Measuring Spatio-Temporal Psychological Impact of Novel Coronavirus presented at MIT
                        Tech Review and Weill Cornell Medicine. Knowledge-infused AI for Healthcare presented at NIH
                        Grantee Session, University of South Carolina, hosted by Prof(Dr). Xiaoming Li.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4">Additional Notable Presentations</h2>
                    <p>
                        Personalized Book-keeping at TalTech University, Knowledge-infused Reinforcement Learning at
                        Knowledge Graph Conference 2022, and upcoming tutorial on Process Knowledge-infused Learning for
                        Explainable Mental Healthcare at 19th ACL ICON Conference.
                    </p>
                </article>
            </div>
        </div>
    );
}