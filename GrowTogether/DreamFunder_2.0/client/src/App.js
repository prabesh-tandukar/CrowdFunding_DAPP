// // App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Web3Provider } from "./context/Web3Context";
import Navbar from "./components/Navbar.js";
import Home from "./pages/Home";
import Campaigns from "./pages/Campaigns";
import CreateCampaign from "./pages/CreateCampaign";
import CampaignDetails from "./components/CampaignDetails";
import UserDashboard from "./components/UserDashboard";
import AboutPage from "./pages/AboutPage.js";
import HowItWorksPage from "./pages/HowItWorksPage.js";

function App() {
  return (
    <Web3Provider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/create-campaign" element={<CreateCampaign />} />
            <Route path="/campaign/:id" element={<CampaignDetails />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
          </Routes>
        </div>
      </Router>
    </Web3Provider>
  );
}

export default App;

// App.js
// import React from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// function Home() {
//   return <div>Home Page</div>;
// }

// function App() {
//   return (
//     <Router>
//       <div className="App">
//         <Routes>
//           <Route path="/" element={<Home />} />
//         </Routes>
//       </div>
//     </Router>
//   );
// }

// export default App;
