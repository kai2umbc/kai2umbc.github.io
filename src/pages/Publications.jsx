import React, {useEffect, useState} from 'react';
import {Card, CardContent} from '@/components/ui/card';
import {Input} from "@/components/ui/input";
import {Loader2, Search} from 'lucide-react';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

const PublicationsPage = () => {
    const orcidIds = [
        '0000-0002-5411-2230', // Manas Gaur
        '0009-0000-8632-0491', // Yash Saxena
        '0000-0002-3995-7235', // Shaswati Saha
        '0009-0006-3831-6811', // Sarvesh Baskar
        '0009-0004-5685-1899', // Ali Mohammadi
        '0009-0006-9813-9351', // Nancy Tyagi
        '0000-0002-0147-2777', // Surjodeep Sarkar
        '0009-0006-6081-9896', // Seyedreza Mohseni
        '0009-0003-8906-0914', // Nilanjana Das
    ];

    const [publications, setPublications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const publicationsPerPage = 10;

    useEffect(() => {
        const fetchPublications = async () => {
            try {
                setLoading(true);
                const allPublications = [];

                for (const orcidId of orcidIds) {
                    const response = await fetch(
                        `https://pub.orcid.org/v3.0/${orcidId}/works`,
                        {
                            headers: {
                                'Accept': 'application/json'
                            }
                        }
                    );

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const data = await response.json();
                    const works = data.group || [];

                    for (const work of works) {
                        const workSummary = work['work-summary'][0];
                        const publicationYear = parseInt(workSummary['publication-date']?.year?.value);

                        if (publicationYear >= 2023) {
                            const putCode = workSummary['put-code'];
                            const detailResponse = await fetch(
                                `https://pub.orcid.org/v3.0/${orcidId}/work/${putCode}`,
                                {
                                    headers: {
                                        'Accept': 'application/json'
                                    }
                                }
                            );

                            if (detailResponse.ok) {
                                const detailData = await detailResponse.json();
                                const authors = detailData.contributors?.contributor
                                        ?.filter(c => c['contributor-attributes']?.['contributor-role'] === 'author')
                                        ?.map(a => a['credit-name']?.value)
                                    || [];

                                // Create the publication object
                                let publication = {
                                    title: workSummary.title?.['title']?.value || 'Untitled',
                                    year: publicationYear,
                                    type: workSummary.type,
                                    url: workSummary?.url?.value ||
                                        (workSummary?.['external-ids']?.['external-id']?.find(
                                            id => id['external-id-type'] === 'doi'
                                        )?.['external-id-value']
                                            ? `https://doi.org/${workSummary?.['external-ids']?.['external-id']?.find(
                                                id => id['external-id-type'] === 'doi'
                                            )?.['external-id-value']}`
                                            : null),
                                    journal: workSummary['journal-title']?.value,
                                    authors: authors
                                };

                                // Check if this is Ali Mohammadi's WellDunn publication
                                if (orcidId === '0009-0004-5685-1899' &&
                                    publication.title &&
                                    publication.title.toLowerCase().includes('welldunn') &&
                                    publication.title.toLowerCase().includes('robustness') &&
                                    publication.title.toLowerCase().includes('explainability')) {

                                    // Update the publication with the preferred title and ACL link
                                    publication.title = "WellDunn: On the Robustness and Explainability of Language Models and Large Language Models in Identifying Wellness Dimensions";
                                    publication.url = "https://aclanthology.org/2024.blackboxnlp-1.23/";
                                }

                                allPublications.push(publication);
                            }
                        }
                    }
                }

                allPublications.sort((a, b) => b.year - a.year);
                setPublications(allPublications);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchPublications();
    }, []);

    // Search and filter publications
    const filteredPublications = publications.filter(pub => {
        const searchLower = searchQuery.toLowerCase();
        return (
            pub.title.toLowerCase().includes(searchLower) ||
            pub.authors.some(author =>
                author.toLowerCase().includes(searchLower)
            )
        );
    });

    // Pagination calculations
    const totalPages = Math.ceil(filteredPublications.length / publicationsPerPage);
    const indexOfLastPublication = currentPage * publicationsPerPage;
    const indexOfFirstPublication = indexOfLastPublication - publicationsPerPage;
    const currentPublications = filteredPublications.slice(indexOfFirstPublication, indexOfLastPublication);

    // Reset to first page when search query changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo(0, 0);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin"/>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-500 text-center p-4">
                Error loading publications: {error}
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Black header section taking up 1/4 of viewport height */}
            <div className="bg-[#091c22] h-[25vh] flex flex-col justify-center items-center">
                <div className="flex flex-col items-center">
                    <h1 className="text-white text-4xl font-bold">Publications</h1>
                    <div className="w-full h-0.5 bg-white mt-2"></div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-6">


                {/* Search Input */}
                <div className="relative mb-6">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"/>
                    <Input
                        type="text"
                        placeholder="Search by title or author..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                    />
                </div>

                {/* No results message */}
                {filteredPublications.length === 0 && searchQuery && (
                    <div className="text-center text-gray-500 py-8">
                        No publications found matching your search.
                    </div>
                )}

                {/* Publications list */}
                <div className="space-y-4 mb-8">
                    {currentPublications.map((pub, index) => (
                        <Card key={index} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-4">
                                <h2 className="text-xl font-semibold mb-2">
                                    {pub.url ? (
                                        <a
                                            href={pub.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 hover:underline"
                                        >
                                            {pub.title}
                                        </a>
                                    ) : (
                                        pub.title
                                    )}
                                </h2>
                                <div className="text-gray-600">
                                    {pub.journal && (
                                        <span className="block">{pub.journal}</span>
                                    )}
                                    {pub.authors.length > 0 && (
                                        <div className="text-sm mt-2 italic">
                                            {pub.authors.join(', ')}
                                        </div>
                                    )}
                                    <div className="flex gap-4 mt-2 text-sm">
                                        {pub.year && (
                                            <span>{pub.year}</span>
                                        )}
                                        {pub.type && (
                                            <span className="capitalize">
                                            {pub.type.toLowerCase().replace('-', ' ')}
                                        </span>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex flex-col items-center gap-2 pb-8">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>

                                {[...Array(totalPages)].map((_, i) => (
                                    <PaginationItem key={i + 1}>
                                        <PaginationLink
                                            onClick={() => handlePageChange(i + 1)}
                                            isActive={currentPage === i + 1}
                                            className="cursor-pointer"
                                        >
                                            {i + 1}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}

                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                        <div className="text-sm text-gray-600">
                            Showing
                            publications {indexOfFirstPublication + 1}-{Math.min(indexOfLastPublication, filteredPublications.length)} of {filteredPublications.length}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PublicationsPage;