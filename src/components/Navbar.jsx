import React, {useState} from 'react';
import {Menu, X} from 'lucide-react';
import {useLocation, useNavigate} from 'react-router-dom';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Function to determine which image to show based on current path
    const getNavbarImage = () => {
        const path = location.pathname;

        switch (path) {
            case '/':
                return "/assets/Black KAI2 Logo.jpg";
            default:
                return "/assets/Green KAI2 Logo.jpg";
        }
    };

    // Function to determine the background color based on current path
    const getNavbarColor = () => {
        const path = location.pathname;

        switch (path) {
            case '/':
                return "bg-black";
            default:
                return "bg-[#091c22]";
        }
    };

    const handleNavClick = (e, href) => {
        e.preventDefault();

        if (href.includes('#')) {
            const isHome = location.pathname === '/';
            const targetId = href.split('#')[1];

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
            navigate(href);
        }

        setIsOpen(false);
    };

    const navItems = [
        {name: 'Research', href: '/research'},
        {name: 'News', href: '/news'},
        {name: 'Grants', href: '/grants'},
        {name: 'Publications', href: '/publications'},
        {name: 'Members', href: '/members'},
        {name: 'Join', href: '/#join-lab'},
    ];

    return (
        <div className="relative">
            <nav className={`${getNavbarColor()} text-white shadow-lg`}>
                <div className="w-full">
                    <div className="flex justify-between items-center relative">
                        {/* Logo Container */}
                        <div className="flex-shrink-0 pl-4 md:pl-8">
                            <a href="/" onClick={(e) => handleNavClick(e, '/')}>
                                <div className="h-16 w-16">
                                    <img
                                        src={getNavbarImage()}
                                        alt="Page Logo"
                                        className="object-contain brightness-100 contrast-125"
                                    />
                                </div>
                            </a>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex md:items-center md:justify-end md:flex-1 md:pr-8">
                            {navItems.map((item) => (
                                <a
                                    key={item.name}
                                    href={item.href}
                                    onClick={(e) => handleNavClick(e, item.href)}
                                    className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors duration-200 border-b-2 border-transparent hover:border-white ml-8"
                                >
                                    {item.name}
                                </a>
                            ))}
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden pr-4">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                            >
                                {isOpen ? (
                                    <X className="block h-6 w-6"/>
                                ) : (
                                    <Menu className="block h-6 w-6"/>
                                )}
                            </button>
                        </div>

                        {/* Bottom border that spans from logo to last menu item */}
                        <div
                            className="absolute bottom-0 left-4 md:left-8 right-4 md:right-8 border-b-2 border-white"></div>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {isOpen && (
                    <div className={`md:hidden ${getNavbarColor()}`}>
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            {navItems.map((item) => (
                                <a
                                    key={item.name}
                                    href={item.href}
                                    onClick={(e) => handleNavClick(e, item.href)}
                                    className="text-gray-300 hover:text-white block px-3 py-2 text-base font-medium border-l-4 border-transparent hover:border-white transition-all duration-200"
                                >
                                    {item.name}
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </nav>
        </div>
    );
};

export default Navbar;