import React from 'react';
import {Card, CardContent} from '@/components/ui/card';
import {BookOpen, Calendar, ExternalLink, Users} from 'lucide-react';

const PublicationCard = ({publication}) => {
    // Publication type color mapping
    const getTypeColor = (type) => {
        const typeMap = {
            'journal-article': 'bg-blue-100 text-blue-800 border-blue-200',
            'conference-paper': 'bg-purple-100 text-purple-800 border-purple-200',
            'book-chapter': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'book': 'bg-green-100 text-green-800 border-green-200',
            'preprint': 'bg-red-100 text-red-800 border-red-200'
        };

        return typeMap[type?.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    return (
        <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-blue-500">
            <CardContent className="p-4">
                <div className="flex justify-between items-start">
                    <h2 className="text-xl font-semibold mb-2 text-gray-800">
                        {publication.url ? (
                            <a
                                href={publication.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 hover:underline flex items-start gap-1 group"
                            >
                                {publication.title}
                                <ExternalLink
                                    className="w-4 h-4 mt-1 opacity-0 group-hover:opacity-100 transition-opacity"/>
                            </a>
                        ) : (
                            publication.title
                        )}
                    </h2>
                </div>

                {publication.journal && (
                    <div className="flex items-center gap-2 text-gray-600 mt-2">
                        <BookOpen className="w-4 h-4 text-gray-500"/>
                        <span>{publication.journal}</span>
                    </div>
                )}

                {publication.authors && publication.authors.length > 0 && (
                    <div className="flex items-center gap-2 mt-2 text-gray-600">
                        <Users className="w-4 h-4 text-gray-500"/>
                        <div className="text-sm italic">{publication.authors.join(', ')}</div>
                    </div>
                )}

                <div className="flex gap-4 mt-3">
                    {publication.year && (
                        <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-gray-500"/>
                            <span className="text-sm">{publication.year}</span>
                        </div>
                    )}

                    {publication.type && (
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${getTypeColor(publication.type)}`}>
                            {publication.type.toLowerCase().replace('-', ' ')}
                        </span>
                    )}

                    {publication.doi && (
                        <span
                            className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 border border-gray-200">
                            DOI
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default PublicationCard;