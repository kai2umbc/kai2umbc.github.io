import React from 'react';
import {Card, CardContent} from "@/components/ui/card";

const memberData = {
    "Principal Investigator": [
        {
            name: 'Manas Gaur',
            university: 'UMBC',
            title: 'Assistant Professor',
            image: '/assests/img/members/Manas Gaur.jpg',
            externalLink: 'https://manasgaur.github.io/'
        }
    ],
    "Research Scholars": [
        {
            name: 'Yash Saxena',
            university: 'UMBC',
            title: 'PhD Student',
            image: '/assests/img/members/Yash Saxena.jpg',
            externalLink: 'https://yashsaxena21.github.io/Portfolio/'
        },
        {
            name: 'Nilanjana Das',
            university: 'UMBC',
            title: 'PhD Student',
            image: ''
        },
        {
            name: 'Ali Mohammadi',
            university: 'UMBC',
            title: 'PhD Student',
            image: '/assests/img/members/Ali Mohammadi.JPG',
            externalLink: 'https://mohammadi-ali.github.io/'
        },
        {
            name: 'Sarvesh Baskar',
            university: 'BITS Pilani Goa Campus',
            title: 'Visiting Research Scholar',
            image: '/assests/img/members/Sarvesh B.jpg'
        },
    ],
    "Masters Students": [
        {
            name: 'Priyanshul Govil',
            university: 'UMBC',
            title: 'Masters Student',
            image: '/assests/img/members/Priyanshul Govil.jpg'
        },
        {
            name: 'Saksham Kumar Sharma',
            university: 'UMBC',
            title: 'Masters Student',
            image: '/assests/img/members/Saksham Kumar Sharma.jpg'
        },
        {
            name: 'Benjamin Lagnese',
            university: 'UMBC',
            title: 'Masters Student',
            image: '/assests/img/members/Ben Lagnese.jpg'
        },
    ],
    "Undergraduate Students": [
        {
            name: 'Gerald Ndawula',
            university: 'UMBC',
            title: 'Senior',
            image: '/assests/img/members/Gerald Ndawula.jpg'
        },
        {
            name: 'Mathew Dawit',
            university: 'UMBC',
            title: 'Freshman',
            image: '/assests/img/members/Mathew Dawit.jpg'
        },
        {
            name: 'Sriram Vema',
            university: 'UMBC',
            title: '',
            image: '/assests/img/members/Sriram Vema.jpg'
        },
    ]
};

const Member = () => {
    // Default placeholder image for members without an image
    const placeholderImage = '/assests/img/placeholder.jpg';

    return (
        <div className="min-h-screen">
            <div className="bg-[#091c22] h-[25vh] flex flex-col justify-center items-center">
                <div className="flex flex-col items-center">
                    <h1 className="text-white text-4xl font-bold">Members</h1>
                    <div className="w-full h-0.5 bg-white mt-2"></div>
                </div>
            </div>

            <div className="w-full py-8">
                {Object.entries(memberData).map(([section, members]) => {
                    const getFlexWidth = (count) => {
                        if (count === 1) return 'w-72';
                        if (count === 2) return 'w-[600px]';
                        if (count === 3) return 'w-[900px]';
                        return 'w-[1200px]';
                    };

                    return (
                        <div key={section} className="mb-12">
                            <h2 className="text-2xl font-bold mb-6 text-center">{section}</h2>
                            <div className="flex justify-center">
                                <div
                                    className={`${getFlexWidth(members.length)} flex flex-wrap gap-6 justify-center mx-auto`}>
                                    {members.map((member, index) => (
                                        <Card
                                            key={`${member.name}-${index}`}
                                            className="w-72 overflow-hidden hover:shadow-lg transition-shadow"
                                        >
                                            <CardContent className="p-0 flex flex-col">
                                                {member.externalLink ? (
                                                    <a
                                                        href={member.externalLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="block w-full"
                                                    >
                                                        <div className="w-full h-64 overflow-hidden">
                                                            <img
                                                                src={member.image || placeholderImage}
                                                                alt={member.name}
                                                                className="w-full h-full object-cover transition-transform hover:scale-105"
                                                                onError={(e) => {
                                                                    e.target.src = placeholderImage;
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="p-4 bg-white">
                                                            <h3 className="font-semibold text-lg mb-1">{member.name}</h3>
                                                            <p className="text-gray-600 text-sm mb-1">{member.university}</p>
                                                            <p className="text-sm">{member.title}</p>
                                                        </div>
                                                    </a>
                                                ) : (
                                                    <>
                                                        <div className="w-full h-64 overflow-hidden">
                                                            <img
                                                                src={member.image || placeholderImage}
                                                                alt={member.name}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    e.target.src = placeholderImage;
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="p-4 bg-white">
                                                            <h3 className="font-semibold text-lg mb-1">{member.name}</h3>
                                                            <p className="text-gray-600 text-sm mb-1">{member.university}</p>
                                                            <p className="text-sm">{member.title}</p>
                                                        </div>
                                                    </>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Member;