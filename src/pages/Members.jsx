import React from 'react';
import {Card, CardContent} from "@/components/ui/card";

const memberData = {
    "Principal Investigator": [
        {
            name: 'Manas Gaur',
            university: 'UMBC',
            title: 'Assistant Professor',
            image: '/assets/members/Manas Gaur.jpg',
            externalLink: 'https://manasgaur.github.io/'
        }
    ],
    "Research Scholars": [
        {
            name: 'Yash Saxena',
            university: 'UMBC',
            title: 'PhD Student',
            image: '/assets/members/Yash Saxena.jpg',
            externalLink: 'https://yashsaxena21.github.io/Portfolio/'
        },
        {
            name: 'Nilanjana Das',
            university: 'UMBC',
            title: 'PhD Student',
            image: '/assets/Black KAI2 Logo.jpg'
        },
        {
            name: 'Ali Mohammadi',
            university: 'UMBC',
            title: 'PhD Student',
            image: '/assets/members/Ali Mohammadi.JPG',
            externalLink: 'https://mohammadi-ali.github.io/'
        },
        {
            name: 'Seyedreza Mohseni',
            university: 'UMBC',
            title: 'PhD Student',
            image: '/assets/Black KAI2 Logo.jpg',
        },
        {
            name: 'Shaswati Saha',
            university: 'UMBC',
            title: 'PhD Student',
            image: '/assets/members/Shaswati Saha.jpg',
        },
        {
            name: 'Sarvesh Baskar',
            university: 'BITS Pilani Goa Campus',
            title: 'Visiting Research Scholar',
            image: '/assets/members/Sarvesh B.jpg',
        },
    ],
    "Masters Students": [
        {
            name: 'Saksham Kumar Sharma',
            university: 'UMBC',
            title: 'Masters Student',
            image: '/assets/members/Saksham Kumar Sharma.jpg'
        },
        {
            name: 'Benjamin Lagnese',
            university: 'UMBC',
            title: 'Masters Student',
            image: '/assets/members/Ben Lagnese.jpg'
        },
    ],
    "Undergraduate Students": [
        {
            name: 'Gerald Ndawula',
            university: 'UMBC',
            title: 'Senior',
            image: '/assets/members/Gerald Ndawula.jpg'
        },
        {
            name: 'Priyanshul Govil',
            university: 'UMBC',
            title: 'Senior',
            image: '/assets/members/Priyanshul Govil.jpg'
        },
        {
            name: 'Vamshi Bonagiri',
            university: 'UMBC',
            title: 'Senior',
            image: '/assets/members/Vamshi Bonagiri.jpg',
            externalLink: 'https://victorknox.github.io/'
        },
        {
            name: 'Mathew Dawit',
            university: 'UMBC',
            title: 'Freshman',
            image: '/assets/members/Mathew Dawit.jpg'
        },
    ],
    "High School Intern": [
        {
            name: 'Atmika Gorti',
            university: 'Freedom High School and Academies',
            title: 'Student',
            image: '/assets/Black KAI2 Logo.jpg'
        },
        {
            name: 'Batool Haider',
            university: 'Centerville High School',
            title: 'Student',
            image: '/assets/Black KAI2 Logo.jpg'
        },
    ],
    "Collaborators": [
        {
            name: 'Prasoon Goyal',
            university: 'Industry -- Amazon',
            title: 'Applied Scientist',
            image: '/assets/members/Prasoon Goyal.jpg',
            externalLink: 'https://prasoongoyal.com/'
        },
        {
            name: 'Aman Chadha',
            university: 'Industry -- AWS',
            title: 'Generative AI Leadership',
            image: '/assets/members/Aman Chadha.jpg',
            externalLink: 'https://www.aman.info/'
        },
        {
            name: 'Pulin Agrawal',
            university: 'Academia -- Penn State University',
            title: 'Assistant Professor',
            image: '/assets/members/Pulin Agrawal.jpg',
            externalLink: 'https://sites.google.com/view/pulinagrawal'
        },
        {
            name: 'Ponnurangam Kumaraguru',
            university: 'Academia -- IIIT Hyderabad',
            title: 'Professor',
            image: '/assets/members/Ponnurangam Kumaraguru.jpg',
            externalLink: 'https://precog.iiit.ac.in/'
        },
        {
            name: 'Ankur Padia',
            university: 'Industry -- Liberty Mutual Insurance',
            title: 'Director',
            image: '/assets/members/Ankur Padia.jpg'
        },
        {
            name: 'Jeffrey Davis',
            university: 'Academia -- UMBC',
            title: 'Professor',
            image: '/assets/members/Jeffrey Davis.jpg',
            externalLink: 'https://userpages.umbc.edu/~davisj/Davis/Welcome.html'
        },
        {
            name: 'Sanorita Dey',
            university: 'Academia -- UMBC',
            title: 'Assistant Professor',
            image: '/assets/members/Sanorita Dey.jpg',
            externalLink: 'https://www.csee.umbc.edu/~sanorita/'
        },
        {
            name: 'Sujit Singh',
            university: 'Industry -- Neural Nest',
            title: 'CEO and Founder',
            image: '/assets/members/Sujit Singh.jpg'
        },
        {
            name: 'Biplav Srivastava',
            university: 'Academia -- AI Institute, USC',
            title: 'Professor',
            image: '/assets/members/Biplav Srivastava.jpg',
            externalLink: 'https://sites.google.com/site/biplavsrivastava/'
        },
        {
            name: 'Srinivasan Parthasarathy',
            university: 'Academia -- Ohio State University',
            title: 'Professor',
            image: '/assets/members/Srinivasan Parthasarathy.jpg'
        },
        {
            name: 'Krishnaprasad Thirunarayan',
            university: 'Academia -- Wright State University',
            title: 'Professor',
            image: '/assets/members/Krishnaprasad Thirunarayan.jpg',
            externalLink: 'https://cecs.wright.edu/~tkprasad/'
        },
        {
            name: 'Harsha Kokel',
            university: 'Industry -- IBM',
            title: 'Research Scientist',
            image: '/assets/members/Harsha Kokel.jpg',
            externalLink: 'https://harshakokel.com/'
        },
        {
            name: 'Kamalika Das',
            university: 'Industry -- Intuit',
            title: 'Principal AI Research Scientist, Manager',
            image: '/assets/members/Kamalika Das.jpg',
            externalLink: 'https://userpages.cs.umbc.edu/kdas1/'
        },
    ],
    "Alumni": [
        {
            name: 'Sriram Vema',
            university: '',
            title: '',
            image: '/assets/members/Sriram Vema.jpg'
        },
        {
            name: 'Anmol Agrawal',
            university: 'CMU',
            title: 'Graduate Student',
            image: '/assets/members/Anmol Agrawal.jpg',
            externalLink: 'https://anmolagarwal999.github.io/'
        },
        {
            name: 'Vamsi Aribandi',
            university: 'Building Yutori.com',
            title: 'Founding Member of Technical Staff',
            image: '/assets/members/Vamsi Aribandi.jpg',
            externalLink: 'https://vamsi-aribandi.github.io/cv/'
        },
        {
            name: 'Shrey Gupta',
            university: 'Cartesia',
            title: 'Member of Technical Staff',
            image: '/assets/members/Shrey Gupta.jpg',
            externalLink: 'https://github.com/shreygupta2809/shreygupta2809'
        },
        {
            name: 'Surjodeep Sarkar',
            university: 'PostCare.AI',
            title: 'Chief Operating Officer & Co-Founder',
            image: '/assets/members/Surjodeep Sarkar.jpg',
            externalLink: 'https://linkedin.com/in/surjodeep-sarkar'
        },
        {
            name: 'Nancy Tyagi',
            university: 'PostCare.AI',
            title: 'Chief Technology Officer & Co-Founder',
            image: '/assets/members/Nancy Tyagi.jpeg',
            externalLink: 'https://linkedin.com/in/nancy-tyagi'
        },
        {
            name: 'Harisahan Nookala Venkata',
            university: 'Comcast',
            title: 'Software Engineer - Speech AI',
            image: '/assets/members/Harisahan Venkata.jpg',
            externalLink: 'https://www.linkedin.com/in/harisahan'
        },
    ]
};

const Member = () => {
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
                                            <CardContent className="p-0">
                                                {member.externalLink ? (
                                                    <a
                                                        href={member.externalLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="block"
                                                    >
                                                        <div className="aspect-square overflow-hidden">
                                                            <img
                                                                src={member.image}
                                                                alt={member.name}
                                                                className="w-full h-full object-cover transition-transform hover:scale-105"
                                                            />
                                                        </div>
                                                        <div className="p-4">
                                                            <h3 className="font-semibold text-lg mb-1">{member.name}</h3>
                                                            <p className="#717568 text-sm mb-1">{member.university}</p>
                                                            <p className="text-sm">{member.title}</p>
                                                        </div>
                                                    </a>
                                                ) : (
                                                    <div>
                                                        <div className="aspect-square overflow-hidden">
                                                            <img
                                                                src={member.image}
                                                                alt={member.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <div className="p-4">
                                                            <h3 className="font-semibold text-lg mb-1">{member.name}</h3>
                                                            <p className="#717568 text-sm mb-1">{member.university}</p>
                                                            <p className="text-sm">{member.title}</p>
                                                        </div>
                                                    </div>
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