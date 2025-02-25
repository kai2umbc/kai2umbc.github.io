import React from 'react';
import Navbar from './components/Navbar';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Members from "./pages/Members.jsx";
import News from "./pages/News.jsx";
import Research from "./pages/Research.jsx";
import Publications from "./pages/Publications.jsx";
import Home from "./pages/Home.jsx";
import Footer from "./components/Footer.jsx";
import Grants from "./pages/Grants.jsx";

function App() {
    return (

        <div className="App">
            <div className="min-h-screen relative pb-[300px]">
                <BrowserRouter>

                    <Navbar/>

                    <Routes>
                        <Route path="/" element={<Home/>}/>
                        <Route path="/grants" element={<Grants/>}/>
                        <Route path="/members" element={<Members/>}/>
                        <Route path="/research" element={<Research/>}/>
                        <Route path="/news" element={<News/>}/>
                        <Route path="/publications" element={<Publications/>}/>

                    </Routes>


                    <Footer/>


                </BrowserRouter>
            </div>


        </div>
    );
}

export default App;