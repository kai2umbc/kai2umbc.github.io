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
        '0000-0002-5411-2230',
        '0009-0000-8632-0491',
        '0000-0002-3995-7235',
        '0009-0006-3831-6811',
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

                                allPublications.push({
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
                                    authors: authors,
                                    // Add a placeholder image for publications
                                    image: '/assets/img/publications/publication-placeholder.jpg'
                                });
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

    // Function to determine width based on number of items
    const getFlexWidth = (count) => {
        if (count === 1) return 'w-72';
        if (count === 2) return 'w-[600px]';
        if (count === 3) return 'w-[900px]';
        return 'w-[1200px]';
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

            <div className="w-full py-8">
                {/* Search Input */}
                <div className="relative mb-6 max-w-md mx-auto">
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

                {/* Publications list - styled like member cards */}
                <div className="mb-12">
                    <div className="flex justify-center">
                        <div className={`max-w-4xl flex flex-wrap gap-6 justify-center mx-auto`}>
                            {currentPublications.map((pub, index) => (
                                <Card
                                    key={index}
                                    className="w-72 overflow-hidden hover:shadow-lg transition-shadow"
                                >
                                    <CardContent className="p-0">
                                        {pub.url ? (
                                            <a
                                                href={pub.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block"
                                            >
                                                <div className="p-4">
                                                    <h3 className="font-semibold text-lg mb-1 line-clamp-2">{pub.title}</h3>
                                                    {pub.journal && (
                                                        <p className="text-sm mb-1 text-gray-600">{pub.journal}</p>
                                                    )}
                                                    {pub.authors.length > 0 && (
                                                        <p className="text-sm italic line-clamp-2">
                                                            {pub.authors.join(', ')}
                                                        </p>
                                                    )}
                                                    <div className="flex gap-2 mt-2 text-sm">
                                                        {pub.year && (
                                                            <span
                                                                className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">{pub.year}</span>
                                                        )}
                                                        {pub.type && (
                                                            <span
                                                                className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs capitalize">
                                                                {pub.type.toLowerCase().replace('-', ' ')}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </a>
                                        ) : (
                                            <div className="p-4">
                                                <h3 className="font-semibold text-lg mb-1 line-clamp-2">{pub.title}</h3>
                                                {pub.journal && (
                                                    <p className="text-sm mb-1 text-gray-600">{pub.journal}</p>
                                                )}
                                                {pub.authors.length > 0 && (
                                                    <p className="text-sm italic line-clamp-2">
                                                        {pub.authors.join(', ')}
                                                    </p>
                                                )}
                                                <div className="flex gap-2 mt-2 text-sm">
                                                    {pub.year && (
                                                        <span
                                                            className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">{pub.year}</span>
                                                    )}
                                                    {pub.type && (
                                                        <span
                                                            className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs capitalize">
                                                            {pub.type.toLowerCase().replace('-', ' ')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
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