import React, { useEffect } from "react";
import './App.css';
import { RiHome4Line } from "react-icons/ri";
import { FaRegBell, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { IoAnalyticsOutline, IoSettingsOutline } from "react-icons/io5";
import { MdOutlineFolderShared } from "react-icons/md";
import { TfiLayoutLineSolid } from "react-icons/tfi";
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
    <main className=" pt-10 pb-7 min-h-screen  flex max-w-screen text-white bg-[#030018]">
      {/* Sidebar */}
      <div className="w-[6vw] min-h-[90vh] flex flex-col justify-between bg-[#030018]">
        <div className="flex items-center flex-col">
          <div className="mb-4 text-center">
            {user ? (
              <FaCheckCircle color="limegreen" size="1.5em" title="User Logged In" />
            ) : (
              <FaTimesCircle color="red" size="1.5em" title="User Not Logged In" />
            )}
          </div>

          {/* Animated Navigation */}
          <div className="relative flex flex-col items-center gap-8 mt-2">
            {navItems.map(({ to, icon }) => (
              <Link key={to} to={to} className="relative">
                {location.pathname.startsWith(to) && (
                  <div className="relative right-[0.5rem] bottom-2" >

                  <motion.div
                    layoutId="nav-highlight"
                    className="absolute inset-0 w-10 h-10 bg-white/10 rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    />
                    </div>
                )}
                <div className="relative z-10 text-white">{icon}</div>
              </Link>
            ))}
          </div>

          <div className="info mt-6">
            <TfiLayoutLineSolid color="gray" size="1.8em" />
          </div>
        </div>

        {/* Bottom Settings / Info / Logout */}
        <div className="flex items-center flex-col">
          <div className="flex items-center gap-8 flex-col">
            <IoSettingsOutline size="1.5em" color="white" title="Settings" />
            <Link to="/about_me" className="flex items-center gap-2">
              <IoMdInformationCircleOutline size="1.5em" className="fill-white" fill="white" />
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
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4">
        <Outlet />
      </div>
    </main>
  );
}

export default App;
