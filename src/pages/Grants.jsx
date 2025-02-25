export default function Grants() {
    return (
        <div className="min-h-screen">
            {/* Black header section taking up 1/4 of viewport height */}
            <div className="bg-[#091c22] h-[25vh] flex flex-col justify-center items-center">
                <div className="flex flex-col items-center">
                    <h1 className="text-white text-4xl font-bold">Grants</h1>
                    <div className="w-full h-0.5 bg-white mt-2"></div>
                </div>
            </div>

            {/* Content section */}
            <div className="container mx-auto px-6 py-8">
                <article className="prose max-w-none">
                    <h2 className="text-2xl font-semibold mb-4">Current Grants</h2>
                    <div className="mb-8">
                        <h3 className="text-xl font-medium mb-2">NSF Research Grant</h3>
                        <p className="mb-4">
                            "Development of Novel Quantum Computing Architectures"<br/>
                            Amount: $2.5M | Duration: 2024-2027<br/>
                            Principal Investigator: Dr. Sarah Johnson
                        </p>

                        <h3 className="text-xl font-medium mb-2">Department of Energy Grant</h3>
                        <p className="mb-4">
                            "Sustainable Energy Storage Solutions"<br/>
                            Amount: $1.8M | Duration: 2023-2026<br/>
                            Principal Investigator: Dr. Michael Chen
                        </p>

                        <h3 className="text-xl font-medium mb-2">NIH Research Grant</h3>
                        <p className="mb-4">
                            "Advanced Biomaterial Development for Tissue Engineering"<br/>
                            Amount: $3.2M | Duration: 2024-2028<br/>
                            Principal Investigator: Dr. Emily Rodriguez
                        </p>
                    </div>

                    <h2 className="text-2xl font-semibold mb-4">Grant Opportunities</h2>
                    <div className="mb-8">
                        <h3 className="text-xl font-medium mb-2">Graduate Student Fellowships</h3>
                        <p className="mb-4">
                            Applications are now open for our annual graduate student fellowship program.
                            These fellowships provide funding for innovative research projects in quantum computing,
                            materials science, and sustainable energy.
                        </p>

                        <h3 className="text-xl font-medium mb-2">Postdoctoral Grants</h3>
                        <p className="mb-4">
                            We offer competitive postdoctoral grants for researchers interested in joining
                            our lab. Current focus areas include quantum materials, energy storage, and
                            advanced computing architectures.
                        </p>
                    </div>

                    <h2 className="text-2xl font-semibold mb-4">Application Process</h2>
                    <p className="mb-4">
                        To apply for any of our grants, please submit a detailed research proposal,
                        CV, and budget justification through our online portal. Applications are
                        reviewed quarterly by our research committee.
                    </p>


                </article>
            </div>
        </div>
    );
}