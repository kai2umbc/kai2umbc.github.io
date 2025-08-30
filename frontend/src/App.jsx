import React from 'react';
import Navbar from './components/Navbar';
import {HashRouter, Route, Routes} from "react-router-dom";
import Members from "./pages/Members.jsx";
import News from "./pages/News.jsx";
import Research from "./pages/Research.jsx";
import Publications from "./pages/Publications.jsx";
import Home from "./pages/Home.jsx";
import Footer from "./components/Footer.jsx";
import Talks from "./pages/Talks.jsx";
import Grants from "./pages/Grants.jsx";
import ChatbotWidget from './components/ChatbotWidget';

function App() {
    return (
        <div className="App">
            <div className="min-h-screen relative pb-[300px]">
                <HashRouter>
                    <Navbar/>
                    <Routes>
                        <Route path="/" element={<Home/>}/>
                        <Route path="/talks" element={<Talks/>}/>
                        <Route path="/members" element={<Members/>}/>
                        <Route path="/research" element={<Research/>}/>
                        <Route path="/news" element={<News/>}/>
                        <Route path="/publications" element={<Publications/>}/>
                        <Route path="/grants" element={<Grants/>}/>
                    </Routes>
                    <Footer/>
                </HashRouter>
                <ChatbotWidget />
            </div>
        </div>
    );
}

export default App;