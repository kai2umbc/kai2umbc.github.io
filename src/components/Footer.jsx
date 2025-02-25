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
                // First scroll to top, then navigate to home with scroll instruction
                window.scrollTo(0, 0);
                navigate('/', {state: {scrollTo: targetId}});
            } else {
                // If already on home page, just scroll to section
                const element = document.getElementById(targetId);
                if (element) {
                    element.scrollIntoView({behavior: 'smooth'});
                }
            }
        } else {
            // For non-hash links, first scroll to top, then navigate
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
            title: 'Grants',
            link: '/grants',
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
        <footer className="bg-black text-white py-8 px-6 absolute bottom-0 left-0 right-0 w-full">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
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
                                className="block text-gray-400 hover:text-white text-sm transition-colors mb-4"
                            >
                                {section.title}
                            </a>
                            <ul className="space-y-2">
                                {section.items.map((item, itemIndex) => (
                                    <li key={itemIndex}>
                                        <a
                                            href={item.link}
                                            onClick={(e) => handleNavClick(e, item.link)}
                                            className="text-gray-400 hover:text-white text-sm transition-colors"
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