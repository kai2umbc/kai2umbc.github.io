import React, {useEffect, useState} from 'react';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

// Import your component files
import PublicationCard from '@/components/PublicationCard';
import PublicationSkeleton from '@/components/PublicationSkeleton';
import SearchInput from '@/components/SearchInput';
import SuccessFeedback from '@/components/SuccessFeedback';

// Cache for API responses
const apiCache = new Map();

// Function to perform cached fetch
async function cachedFetch(url, options) {
    const cacheKey = url + JSON.stringify(options || {});

    // Check if response is in cache and not expired (e.g., 1 hour)
    if (apiCache.has(cacheKey)) {
        const {data, timestamp} = apiCache.get(cacheKey);
        if (Date.now() - timestamp < 3600000) { // 1 hour cache
            return {ok: true, json: () => Promise.resolve(data)};
        }
    }

    // If not in cache or expired, make the actual fetch
    const response = await fetch(url, options);
    if (response.ok) {
        const data = await response.json();
        apiCache.set(cacheKey, {data, timestamp: Date.now()});
        return {ok: true, json: () => Promise.resolve(data)};
    }

    return response;
}

// Function to remove HTML tags from strings
function stripHtmlTags(str) {
    if (!str) return '';
    return str.replace(/<[^>]*>/g, '');
}

// Function to fetch detailed work data for a specific put-code with caching
async function fetchWorkDetail(orcid, putCode) {
    try {
        const response = await cachedFetch(`https://pub.orcid.org/v3.0/${orcid}/work/${putCode}`, {
            headers: {
                'Accept': 'application/json',
            },
        });
        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status} fetching work details for ORCID ${orcid}, putCode ${putCode}`);
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching work detail: ${error.message}`);
        return null;
    }
}

// Function to fetch works for an ORCID ID with batching
async function fetchWorksBatch(orcidBatch) {
    return Promise.all(
        orcidBatch.map(orcid =>
            cachedFetch(`https://pub.orcid.org/v3.0/${orcid}/works`, {
                headers: {'Accept': 'application/json'}
            }).then(res => res.ok ? res.json() : {group: []})
        )
    );
}

// Function to fetch all works with improved batching
async function fetchAllWorks(orcidIds) {
    const workDetails = [];
    const orcidSet = new Set();
    const batchSize = 3; // Process 3 ORCID IDs at a time

    for (let i = 0; i < orcidIds.length; i += batchSize) {
        const batch = orcidIds.slice(i, i + batchSize);
        console.log(`Processing ORCID batch ${i / batchSize + 1}: ${batch.join(', ')}`);

        const batchResults = await fetchWorksBatch(batch);

        // Process each ORCID's results in the batch
        for (let j = 0; j < batchResults.length; j++) {
            const data = batchResults[j];
            const orcid = batch[j];

            const workGroups = data.group || [];
            console.log(`Found ${workGroups.length} work groups for ORCID ${orcid}`);

            // Use Promise.all for parallel processing of work details
            const detailPromises = [];

            // Queue up all the work detail requests
            for (const group of workGroups) {
                const summaries = group['work-summary'] || [];
                for (const summary of summaries) {
                    const putCode = summary['put-code'];
                    const sourceOrcid = summary['source']['source-orcid']?.path || orcid;
                    detailPromises.push(fetchWorkDetail(sourceOrcid, putCode));
                }
            }

            // Wait for all work detail requests to complete
            const details = await Promise.all(detailPromises);

            // Process the completed work details
            for (const workDetail of details) {
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
    }

    return {workDetails, orcidSet: Array.from(orcidSet)};
}

// Improved Function to extract author names from work details
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
    const {workDetails} = await fetchAllWorks(orcidIds);
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
            const authors = extractAuthorNames(work);
            const publication = {
                title: stripHtmlTags(work.title.title.value),
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
    const [retryCount, setRetryCount] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);
    const [visibleCount, setVisibleCount] = useState(5);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const publicationsPerPage = 10;

    const orcidIds = [
        '0000-0002-5411-2230', // Manas Gaur
        '0009-0000-8632-0491', // Yash Saxena
        '0000-0002-3995-7235', // Shaswati Saha
        '0009-0006-3831-6811', // Sarvesh B
        '0009-0004-5685-1899', // Ali Mohammadi || Seyedali Mohammadi
        '0009-0006-9813-9351', // Nancy Tyagi
        '0000-0002-0147-2777', // Surjodeep Sarkar
        '0009-0006-6081-9896', // Seyedreza Mohseni
        '0009-0003-8906-0914', // Nilanjana Das
        '0009-0009-5029-0476', // Aayush Jannumahanti
    ];

    useEffect(() => {
        async function loadPublications() {
            try {
                setLoading(true);
                setLoadingProgress(0);

                // Simulate progress updates
                const progressInterval = setInterval(() => {
                    setLoadingProgress(prev => {
                        const newProgress = prev + Math.random() * 15;
                        return newProgress > 90 ? 90 : newProgress;
                    });
                }, 800);

                console.log("Starting to fetch publications...");
                const data = await fetchPublications(orcidIds);
                console.log(`Fetched ${data.length} publications`);

                clearInterval(progressInterval);
                setLoadingProgress(100);

                setPublications(data);
                setError(null);

                if (data.length > 0) {
                    setShowSuccess(true);
                    setTimeout(() => setShowSuccess(false), 4000);
                }
            } catch (err) {
                console.error("Failed to fetch publications:", err);
                setError("Failed to load publications. Please try again later.");
            } finally {
                setTimeout(() => {
                    setLoading(false);
                }, 500); // Small delay for smoother transition
            }
        }

        loadPublications();
    }, [retryCount]);

    // Handle retry
    const handleRetry = () => {
        setError(null);
        setLoading(true);
        setRetryCount(prev => prev + 1);
    };

    // Reset to first page when search query changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    // Incremental loading effect
    useEffect(() => {
        if (!loading) {
            setVisibleCount(5); // Reset to initial count when new data loads

            const incrementVisibility = () => {
                setVisibleCount(prev => {
                    const filteredLength = filteredPublications.length;
                    const currentSlice = filteredPublications.slice(
                        indexOfFirstPublication,
                        indexOfLastPublication
                    ).length;

                    return Math.min(prev + 2, currentSlice);
                });
            };

            // Start incrementing after a delay
            const timer = setTimeout(incrementVisibility, 100);
            const interval = setInterval(incrementVisibility, 150);

            return () => {
                clearTimeout(timer);
                clearInterval(interval);
            };
        }
    }, [loading, currentPage, searchQuery]);

    // Filter publications based on search query
    const filteredPublications = publications.filter(pub =>
        pub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pub.authors.some(author => author.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (pub.journal && pub.journal.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (pub.type && pub.type.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Pagination logic
    const totalPages = Math.ceil(filteredPublications.length / publicationsPerPage);
    const indexOfLastPublication = currentPage * publicationsPerPage;
    const indexOfFirstPublication = indexOfLastPublication - publicationsPerPage;
    const currentPublications = filteredPublications.slice(indexOfFirstPublication, indexOfLastPublication);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            setVisibleCount(1); // Reset visible count for new page
            window.scrollTo(0, 0); // Scroll to top on page change
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setVisibleCount(1); // Reset visible count for new search
    };

    return (
        <div className="min-h-screen">
            {/* Enhanced header section with gradient */}
            <div
                className="bg-gradient-to-r from-[#091c22] to-[#0f2c38] h-[30vh] flex flex-col justify-center items-center">
                <div className="flex flex-col items-center">
                    <h1 className="text-white text-5xl font-bold tracking-tight">Publications</h1>
                    <p className="text-gray-300 mt-4 text-xl">Our recent research contributions</p>
                    <div className="w-32 h-1 bg-white mt-6 rounded-full"></div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-6 -mt-8 relative z-10">
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    {/* Enhanced Search Input */}
                    <SearchInput
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />

                    {/* Loading Progress Bar */}
                    {loading && (
                        <div className="mb-6">
                            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
                                    style={{width: `${loadingProgress}%`}}
                                ></div>
                            </div>
                            <p className="text-center text-sm text-gray-500 mt-2">
                                Loading publications... {Math.round(loadingProgress)}%
                            </p>
                        </div>
                    )}

                    {/* Loading Skeleton */}
                    {loading && <PublicationSkeleton/>}

                    {/* Error State with Retry */}
                    {error && (
                        <div className="text-center py-8">
                            <p className="text-red-500 mb-4">{error}</p>
                            <button
                                onClick={handleRetry}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* No results message */}
                    {!loading && !error && filteredPublications.length === 0 && searchQuery && (
                        <div className="text-center text-gray-500 py-8">
                            <p className="text-lg mb-2">No publications found matching "{searchQuery}"</p>
                            <p>Try adjusting your search terms or clear the search to see all publications.</p>
                        </div>
                    )}

                    {/* No publications loaded */}
                    {!loading && !error && publications.length === 0 && (
                        <div className="text-center text-gray-500 py-8">
                            <p className="text-lg mb-2">No publications found</p>
                            <p>Please check the ORCID IDs and try again.</p>
                        </div>
                    )}

                    {/* Publications list with incremental loading */}
                    {!loading && !error && filteredPublications.length > 0 && (
                        <div className="space-y-4 mb-8">
                            {currentPublications.slice(0, visibleCount).map((pub, index) => (
                                <PublicationCard
                                    key={`${pub.doi || pub.title}-${index}`}
                                    publication={pub}
                                />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {!loading && !error && totalPages > 1 && (
                        <div className="flex flex-col items-center gap-2 pb-4">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                        />
                                    </PaginationItem>
                                    {/* Show limited page numbers for better UX */}
                                    {[...Array(totalPages)].map((_, i) => {
                                        // Show first page, last page, and current page +/- 1
                                        if (
                                            i === 0 ||
                                            i === totalPages - 1 ||
                                            (i >= currentPage - 2 && i <= currentPage)
                                        ) {
                                            return (
                                                <PaginationItem key={i + 1}>
                                                    <PaginationLink
                                                        onClick={() => handlePageChange(i + 1)}
                                                        isActive={currentPage === i + 1}
                                                        className="cursor-pointer"
                                                    >
                                                        {i + 1}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            );
                                        }
                                        // Show ellipsis for skipped pages
                                        if (i === 1 && currentPage > 3) {
                                            return <PaginationItem key="ellipsis-start">...</PaginationItem>;
                                        }
                                        if (i === totalPages - 2 && currentPage < totalPages - 2) {
                                            return <PaginationItem key="ellipsis-end">...</PaginationItem>;
                                        }
                                        return null;
                                    })}
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

            {/* Success Feedback */}
            {showSuccess && (
                <SuccessFeedback message={`Successfully loaded ${publications.length} publications!`}/>
            )}
        </div>
    );
};

export default PublicationsPage;