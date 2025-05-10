import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import AllotingVolunteer from "./pages/AllotingVolunteer";
import SosMap from "./pages/SosMap";
import UserRequest from "./pages/UserRequest";
import NewsManagement from "./pages/NewsManagement";
import Warning from "./pages/Warning";
import LandingPage from "./pages/LandingPage";
import Logi from "./pages/Logi";
import ManageInventory from "./pages/ManageInventory";
import  Register  from "./pages/Register";
import CommunityReq from "./pages/CommunityReq";


const App = () => {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Routes>
          <Route path="/home"  element={<Home />}  />
          <Route path="/volunteer" element={<AllotingVolunteer />} />
          <Route path="/sos-map" element={<SosMap />} />
          <Route path="/user-request" element={<UserRequest />} />
          <Route path="/newspage" element={<NewsManagement/>} />
          <Route path="/warnings" element={<Warning/>} />
          <Route path="/" element={<LandingPage/>} />
          <Route path="/login" element={<Logi/>} />
          <Route path='/ManageInventory' element={<ManageInventory />} />
          <Route path='/register' element={<Register />} />
          <Route path='/communityReports' element={<CommunityReq/>}></Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;