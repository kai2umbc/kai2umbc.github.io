import React from 'react';
import {useLocation, useNavigate} from 'react-router-dom';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const navigate = useNavigate();
    const location = useLocation();

    const handleNavClick = (e, link) => {
        e.preventDefault();

        if (link.includes('#')) {
            const isHome = location.pathname === '/';
            const targetId = link.split('#')[1];

            if (!isHome) {
                window.scrollTo(0, 0);
                navigate('/', {state: {scrollTo: targetId}});
            } else {
                const element = document.getElementById(targetId);
                if (element) {
                    element.scrollIntoView({behavior: 'smooth'});
                }
            }
        } else {
            window.scrollTo(0, 0);
            navigate(link);
        }
    };

    const navItems = [
        {
            title: 'Research',
            link: '/research',
            items: [
                {name: 'News', link: '/news'}
            ]
        },
        {
            title: 'Talks',
            link: '/talks',
            items: [
                {name: 'Publications', link: '/publications'}
            ]
        },
        {
            title: 'Members',
            link: '/members',
            items: [
                {name: 'Join', link: '/#join-lab'}
            ]
        }
    ];

    return (
        <footer className="bg-black text-white py-4 px-4 md:py-8 md:px-6 absolute bottom-0 left-0 right-0 w-full">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-8">
                    {/* Logo Section */}
                    <div>
                        <a href="/" onClick={(e) => handleNavClick(e, '/')}>
                            <div className="h-16 w-16">
                                <img
                                    src="/assets/Black KAI2 Logo.jpg"
                                    alt="KAI2 Logo"
                                    className="object-contain brightness-100 contrast-125"
                                />
                            </div>
                        </a>
                        <div className="text-gray-400 text-sm mt-4">
                            © {currentYear} KAI2 Lab
                        </div>
                    </div>

                    {/* Navigation Sections */}
                    {navItems.map((section, index) => (
                        <div key={index}>
                            <a
                                href={section.link}
                                onClick={(e) => handleNavClick(e, section.link)}
                                className="block text-gray-400 hover:text-white text-sm transition-colors mb-2 md:mb-4 py-1"
                            >
                                {section.title}
                            </a>
                            <ul className="space-y-2">
                                {section.items.map((item, itemIndex) => (
                                    <li key={itemIndex}>
                                        <a
                                            href={item.link}
                                            onClick={(e) => handleNavClick(e, item.link)}
                                            className="text-gray-400 hover:text-white text-sm transition-colors py-1"
                                        >
                                            {item.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </footer>
    );
};

export default Footer;