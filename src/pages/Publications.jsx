import React, {useEffect, useState} from 'react';
import {Card, CardContent} from '@/components/ui/card';
import {Input} from "@/components/ui/input";
import {Search} from 'lucide-react';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

// Function to remove HTML tags from strings
function stripHtmlTags(str) {
    if (!str) return '';
    return str.replace(/<[^>]*>/g, '');
}


// Function to fetch name for a given ORCID ID (Not used directly in final version but kept for potential future use)
async function fetchName(orcid) {
    try {
        const response = await fetch(`https://pub.orcid.org/v3.0/${orcid}/person`, {
            headers: {
                'Accept': 'application/json',
            },
        });
        if (!response.ok) throw new Error(`Failed to fetch person for ORCID ${orcid}`);
        const data = await response.json();
        const name = data.name;
        if (name) {
            if (name['credit-name']?.value) {
                return name['credit-name'].value;
            } else if (name['given-names']?.value && name['family-name']?.value) {
                return `${name['given-names'].value} ${name['family-name'].value}`;
            } else if (name['given-names']?.value) {
                return name['given-names'].value;
            } else if (name['family-name']?.value) {
                return name['family-name'].value;
            }
        }
        return null;
    } catch (error) {
        console.error(`Error fetching name for ORCID ${orcid}:`, error);
        return null;
    }
}

// Function to fetch detailed work data for a specific put-code
async function fetchWorkDetail(orcid, putCode) {
    try {
        const response = await fetch(`https://pub.orcid.org/v3.0/${orcid}/work/${putCode}`, {
            headers: {
                'Accept': 'application/json',
            },
        });
        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status} fetching work details for ORCID ${orcid}, putCode ${putCode}`);
            return null; // Return null instead of throwing error, handle null in caller
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching work detail: ${error.message}`);
        return null; // Return null in case of error
    }
}

// Function to fetch all works and collect unique contributor ORCID IDs
async function fetchAllWorks(orcidIds) {
    const workDetails = [];
    const orcidSet = new Set();

    for (const orcid of orcidIds) {
        try {
            console.log(`Fetching works for ORCID: ${orcid}`);
            const response = await fetch(`https://pub.orcid.org/v3.0/${orcid}/works`, {
                headers: {
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                console.error(`HTTP error! status: ${response.status} fetching works for ORCID ${orcid}`);
                continue; // Continue to next ORCID if fetching works fails for one
            }

            const data = await response.json();
            const workGroups = data.group || [];

            // Process each work group
            for (const group of workGroups) {
                const summaries = group['work-summary'] || [];

                for (const summary of summaries) { // Loop through summaries to handle cases with multiple summaries in a group
                    const putCode = summary['put-code'];
                    const sourceOrcid = summary['source']['source-orcid']?.path || orcid;

                    // Fetch full work details for this put-code
                    const workDetail = await fetchWorkDetail(sourceOrcid, putCode);

                    if (workDetail) {
                        workDetails.push(workDetail);

                        // Collect contributor ORCID IDs
                        const contributors = workDetail.contributors?.contributor || [];
                        for (const contributor of contributors) {
                            const orcidPath = contributor['contributor-orcid']?.path;
                            if (orcidPath) {
                                orcidSet.add(orcidPath);
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error(`Error processing works for ORCID ${orcid}:`, error);
        }
    }

    return {workDetails, orcidSet: Array.from(orcidSet)};
}

// Function to fetch names for a list of ORCID IDs (Not used in final author extraction but kept for potential enhancements)
async function fetchNames(orcidSet) {
    const nameMap = new Map();

    // Process in batches to avoid overwhelming the API (Not used in current author extraction logic)
    const batchSize = 10;
    for (let i = 0; i < orcidSet.length; i += batchSize) {
        const batch = orcidSet.slice(i, i + batchSize);
        const namePromises = batch.map(orcid => fetchName(orcid));
        const names = await Promise.all(namePromises);

        batch.forEach((orcid, index) => {
            if (names[index]) {
                nameMap.set(orcid, names[index]);
            }
        });
    }

    return nameMap;
}

// Improved Function to extract author names from work details (Integrated from previous response)
const extractAuthorNames = (workDetails) => {
    const authors = [];
    if (workDetails && workDetails.citation && workDetails.citation['citation-formatted'] && workDetails.citation['citation-formatted']['content']) {
        // Attempting to parse author names from formatted citation - might need adjustments based on citation format
        const citationContent = workDetails.citation['citation-formatted']['content'];
        // This is a very basic attempt and might need more robust parsing depending on citation format
        const authorStringMatch = citationContent.match(/^(.*?)\.\s/); // Attempt to extract authors from start of citation
        if (authorStringMatch && authorStringMatch[1]) {
            // Simple split by comma, might need more sophisticated logic
            return authorStringMatch[1].split(',').map(author => author.trim());
        }
    }
    if (workDetails && workDetails.contributors && workDetails.contributors.contributor) {
        return workDetails.contributors.contributor.map(contributor => {
            const creditName = contributor['credit-name']?.value;
            const familyName = contributor['contributor-attributes']?.contributor?.name?.['family-name']?.value;
            const givenNames = contributor['contributor-attributes']?.contributor?.name?.['given-names']?.value;

            if (creditName) return creditName; // Prefer credit name if available as it's often full name
            if (familyName && givenNames) return `${givenNames} ${familyName}`; // Fallback to combining given and family names
            return "Author name not available"; // If no name info, indicate unavailability
        }).filter(authorName => authorName !== "Author name not available"); // Filter out unavailable names for cleaner display
    }

    return ["Authors not available"]; // Fallback if no contributor info
};

// Get a unique key for deduplication (DOI if available, else title)
function getUniqueKey(publication) {
    return publication.doi || publication.title;
}

// Parse the publication date into a Date object
function parsePublicationDate(dateObj) {
    if (!dateObj) return new Date(0); // Default to epoch (1970-01-01) if no date
    const year = dateObj.year?.value || '1970';
    const month = dateObj.month?.value || '01';
    const day = dateObj.day?.value || '01';
    return new Date(`${year}-${month}-${day}`);
}


// Main function to fetch and process publications
async function fetchPublications(orcidIds) {
    console.log("Fetching work details...");
    const {workDetails} = await fetchAllWorks(orcidIds); // Assume this fetches raw data
    console.log(`Fetched ${workDetails.length} work details`);

    // Use a Map to track the most recent publication for each unique key
    const publicationsMap = new Map();

    // Process each work
    for (const work of workDetails) {
        const externalIds = work['external-ids']?.['external-id'] || [];
        const doi = externalIds.find(id => id['external-id-type'] === 'doi')?.['external-id-value'];
        const year = work['publication-date']?.year?.value;

        // Optional: Filter by year (e.g., 2023 or later)
        if (year && parseInt(year) >= 2023) {
            const authors = extractAuthorNames(work); // Assume this extracts authors
            const publication = {
                title: stripHtmlTags(work.title.title.value), // Assume stripHtmlTags removes HTML
                journal: work['journal-title']?.value || null,
                authors: authors.length > 0 ? authors : ['Author information unavailable'],
                year: year,
                type: work.type,
                url: doi ? `https://doi.org/${doi}` : (work.url?.value || null),
                doi: doi || null,
                publicationDate: work['publication-date'] // Full date object for comparison
            };

            const key = getUniqueKey(publication);
            const currentDate = parsePublicationDate(publication.publicationDate);

            // If key exists, compare dates and keep the more recent one
            if (!publicationsMap.has(key)) {
                publicationsMap.set(key, publication);
            } else {
                const existing = publicationsMap.get(key);
                const existingDate = parsePublicationDate(existing.publicationDate);
                if (currentDate > existingDate) {
                    publicationsMap.set(key, publication);
                }
            }
        }
    }

    // Convert Map values to an array of unique publications
    const uniquePublications = Array.from(publicationsMap.values());

    // Sort by year descending, then by title ascending
    uniquePublications.sort((a, b) => {
        const yearA = parseInt(a.year);
        const yearB = parseInt(b.year);
        if (yearB !== yearA) {
            return yearB - yearA; // Newer years first
        }
        return a.title.localeCompare(b.title); // Alphabetical within same year
    });

    return uniquePublications;
}

const PublicationsPage = () => {
    const [publications, setPublications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const publicationsPerPage = 10;

    const orcidIds = [
        '0000-0002-5411-2230',
        '0009-0000-8632-0491',
        '0000-0002-3995-7235',
        '0009-0006-3831-6811',
        '0009-0004-5685-1899',
        '0009-0006-9813-9351',
        '0000-0002-0147-2777',
        '0009-0006-6081-9896',
        '0009-0003-8906-0914',
    ];

    useEffect(() => {
        async function loadPublications() {
            try {
                setLoading(true);
                console.log("Starting to fetch publications...");
                const data = await fetchPublications(orcidIds);
                console.log(`Fetched ${data.length} publications`);
                setPublications(data);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch publications:", err);
                setError("Failed to load publications. Please try again later.");
            } finally {
                setLoading(false);
            }
        }

        loadPublications();
    }, []);

    // Reset to first page when search query changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    // Filter publications based on search query
    const filteredPublications = publications.filter(pub =>
        pub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pub.authors.some(author => author.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Pagination logic
    const totalPages = Math.ceil(filteredPublications.length / publicationsPerPage);
    const indexOfLastPublication = currentPage * publicationsPerPage;
    const indexOfFirstPublication = indexOfLastPublication - publicationsPerPage;
    const currentPublications = filteredPublications.slice(indexOfFirstPublication, indexOfLastPublication);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo(0, 0); // Scroll to top on page change
        }
    };

    return (
        <div className="min-h-screen">
            {/* Black header section */}
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

                {/* Loading and Error States */}
                {loading && (
                    <div className="text-center py-8">
                        <p>Loading publications...</p>
                    </div>
                )}

                {error && (
                    <div className="text-center text-red-500 py-8">
                        <p>{error}</p>
                    </div>
                )}

                {/* No results message */}
                {!loading && !error && filteredPublications.length === 0 && searchQuery && (
                    <div className="text-center text-gray-500 py-8">
                        No publications found matching your search.
                    </div>
                )}

                {/* No publications loaded */}
                {!loading && !error && publications.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                        No publications found. Please check the ORCID IDs and try again.
                    </div>
                )}

                {/* Publications list */}
                {!loading && !error && (
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
                                        {pub.journal && <span className="block">{pub.journal}</span>}
                                        {pub.authors && pub.authors.length > 0 && (
                                            <div className="text-sm mt-2 italic">
                                                {pub.authors.join(', ')}
                                            </div>
                                        )}
                                        <div className="flex gap-4 mt-2 text-sm">
                                            {pub.year && <span>{pub.year}</span>}
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
                )}

                {/* Pagination */}
                {!loading && !error && totalPages > 1 && (
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