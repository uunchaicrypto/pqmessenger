// src/App.js
import { useEffect, useState } from "react";
import './App.css';
import { RiHome4Line } from "react-icons/ri";
import { FaRegBell, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { IoAnalyticsOutline, IoSettingsOutline } from "react-icons/io5";
import { MdOutlineFolderShared } from "react-icons/md";
import { TfiLayoutLineSolid } from "react-icons/tfi";
import { TfiMoreAlt } from "react-icons/tfi";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { LuLogOut } from "react-icons/lu";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { UserAuth } from "./context/AuthContext";
import { Atom } from 'react-loading-indicators';
import { motion } from "framer-motion";

function App() {
  const { fetchUserProfile, logout, user, loading } = UserAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    fetchUserProfile();
    navigate("/messages");
  }, []);

  useEffect(() => {
    if (!loading && (!user || Object.keys(user).length === 0)) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen min-w-screen bg-[#030018] flex justify-center items-center">
        <Atom color="#cc3131" size="large" text="LOADING" textColor="#ff0000" />
      </div>
    );
  }

  const navItems = [
    { to: "/messages", icon: <RiHome4Line size="1.5em" /> },
    { to: "/notification", icon: <FaRegBell size="1.5em" /> },
    { to: "/friend_request", icon: <MdOutlineFolderShared size="1.5em" /> },
  ];

  return (
    <main className="pt-10 pb-4 min-h-screen flex flex-col md:flex-row text-white bg-[#030018] max-w-screen">
      
      {/* Sidebar for md+ screens */}
      <aside className="hidden md:flex flex-col justify-between bg-[#030018] min-h-[90vh] 
        w-[60px] sm:w-[80px] md:w-[90px] lg:w-[100px] xl:w-[110px] items-center py-4">

        <div className="flex flex-col items-center">
          <div className="mb-4 text-center">
            {user ? (
              <FaCheckCircle color="limegreen" size="1.5em" title="User Logged In" />
            ) : (
              <FaTimesCircle color="red" size="1.5em" title="User Not Logged In" />
            )}
          </div>

          <div className="flex flex-col items-center gap-8">
            {navItems.map(({ to, icon }) => (
              <Link key={to} to={to} className="relative">
                {location.pathname.startsWith(to) && (
                  <motion.div
                    layoutId="nav-highlight"
                    className="absolute -left-2 -top-2 w-10 h-10 bg-white/10 rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  />
                )}
                <div className="relative z-10">{icon}</div>
              </Link>
            ))}
          </div>

          <div className="info mt-6">
            <TfiLayoutLineSolid color="gray" size="1.8em" />
          </div>
        </div>

        <div className="flex flex-col items-center gap-8">
          <IoSettingsOutline size="1.5em" color="white" title="Settings" />
          <Link to="/about_me">
            <IoMdInformationCircleOutline size="1.5em" className="fill-white" />
          </Link>
          <TfiLayoutLineSolid color="gray" size="1.8em" />
          <LuLogOut
            size="1.5em"
            color="white"
            className="cursor-pointer"
            onClick={logout}
            title="Logout"
          />
        </div>
      </aside>

      {/* Main Content */}
      <section className="flex-1 px-4">
        <Outlet />
      </section>

      {/* Bottom Nav - for small screens */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1a1a2e] border-t border-gray-700 text-white">
        <div className="flex justify-around items-center h-16">
          {navItems.map(({ to, icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center justify-center ${location.pathname.startsWith(to) ? 'text-blue-400' : 'text-gray-300'}`}
            >
              {icon}
            </Link>
          ))}
          <button onClick={() => setShowInfo(!showInfo)} className="text-white">
            <TfiMoreAlt size="1.5em" />
          </button>
        </div>

        {/* Expandable Info Section */}
        {showInfo && (
          <div className="flex justify-around items-center py-3 border-t border-gray-600 bg-[#111827]">
            <IoSettingsOutline size="1.5em" title="Settings" />
            <Link to="/about_me">
              <IoMdInformationCircleOutline size="1.5em" />
            </Link>
            <LuLogOut
              size="1.5em"
              className="cursor-pointer text-red-500"
              onClick={logout}
              title="Logout"
            />
          </div>
        )}
      </nav>
    </main>
  );
}

export default App;
