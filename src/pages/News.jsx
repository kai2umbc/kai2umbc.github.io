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
                    <h2 className="text-2xl font-semibold mb-4">New Students Join the Lab</h2>
                    <p className="mb-6">
                        We are excited to welcome Sarvesh Baskar and Yash Saxena to our research lab this semester.
                        Sarvesh joins us with a strong background in neural networks, while Yash brings expertise in
                        natural language processing. Both will be contributing to our ongoing AI for Healthcare
                        projects.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4">Student Conference Participation</h2>
                    <p className="mb-6">
                        Our lab member, Priya Sharma, will be presenting her research on "Knowledge-infused Learning
                        for Mental Health Prediction" at the International AI Conference in Singapore next month.
                        Additionally, Rohan Patel recently attended the NeurIPS 2024 conference in Vancouver, where
                        he showcased his work on semantic AI applications.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4">Lab-Organized Workshop</h2>
                    <p className="mb-6">
                        The lab successfully organized a two-day workshop titled "Advances in Neuro-symbolic AI" last
                        week. The event featured guest speakers from MIT and Google Research, with over 150 participants
                        from academia and industry exploring the latest trends in hybrid AI systems.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4">News Article Feature</h2>
                    <p className="mb-6">
                        Our lab's work on "AI-driven Mental Health Interventions" was recently featured in a TechCrunch
                        article titled "The Future of Healthcare: How AI is Revolutionizing Patient Care." The piece
                        highlighted our innovative approaches to knowledge-infused learning and their real-world impact.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4">Upcoming Book Release</h2>
                    <p className="mb-6">
                        We’re thrilled to announce the upcoming release of "Knowledge-infused AI: Bridging Data and
                        Semantics," authored by lab director Dr. Anita Rao and senior researcher Dr. Vikram Desai.
                        The book, set to launch in June 2025, explores practical applications of hybrid AI in healthcare
                        and beyond.
                    </p>
                </article>
            </div>
        </div>
    );
}