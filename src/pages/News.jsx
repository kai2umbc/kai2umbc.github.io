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
                    <h2 className="text-2xl font-semibold mb-4">Tutorial on Neurosymbolic AI for Explainability,
                        Grounding, and Instructibility at AAAI 2025</h2>
                    <p className="mb-6">
                        Kudos to the amazing team: Deepa Tilwani, Ali Mohammadi, Edward Raff, Aman Chadha
                    </p>

                    <h2 className="text-2xl font-semibold mb-4">UG Consortium Presentation by Gerald Ndawula</h2>
                    <p className="mb-6">
                        Gerald Ndawula presented on Knowledge-infused Copilots for Mental Health at the UG Consortium.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4">AAAI Main Track Presentation: <a
                        href="https://arxiv.org/pdf/2412.16135?" target="_blank" rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline">The MAD Dataset for Code
                        Obfuscation</a></h2>
                    <p className="mb-6">
                        Congratulations to Seyedreza Mohseni and Ali Mohammadi on their presentation at the AAAI Main
                        Track.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4">COBIAS at ACM Web Science Conference</h2>
                    <p className="mb-6">
                        COBIAS will be presented at the ACM Web Science Conference. Congratulations to our lab intern,
                        Priyanshul Govil.
                    </p>
                </article>
            </div>
        </div>
    );
}