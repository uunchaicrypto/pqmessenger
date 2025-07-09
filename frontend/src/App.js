import React from "react";
import './App.css'
import { RiHome4Line } from "react-icons/ri";
import { FaRegBell } from "react-icons/fa";
import { IoAnalyticsOutline } from "react-icons/io5";
import { MdOutlineFolderShared } from "react-icons/md";
import { TfiLayoutLineSolid } from "react-icons/tfi";
import { IoSettingsOutline } from "react-icons/io5";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { LuLogOut } from "react-icons/lu";
import ChatMember from "./Components/ChatMember";
import Chat from "./Components/Chat";
import Info from "./Components/Info";


function App() {

  return (
  
       <>
       <main className="p-6 py-10 min-h-screen flex max-w-screen text-white bg-[#030018]">

    <div className="w-[6vw] min-h-[90vh] flex flex-col  justify-between bg-[#030018] ">
      <div className="flex items-center flex-col">
        <div className='flex items-center gap-8 flex-col'>

        <RiHome4Line  size={"1.5em"} color="white"/>
        <FaRegBell size={"1.5em"} color="white"/>
        <MdOutlineFolderShared size={"1.5em"} color="white"/>
        <IoAnalyticsOutline size={"1.5em"} color="white"/>
        </div>
        <TfiLayoutLineSolid color="gray" size={"1.8em"} />

      </div>
      <div className="flex items-center  flex-col">
        <div className='flex items-center gap-8 flex-col'>

        <IoSettingsOutline size={"1.5em"} color="white"  />
        <IoMdInformationCircleOutline size={"1.5em"} color="white"/>
        <TfiLayoutLineSolid color="gray" size={"1.8em"} />
        <LuLogOut size={"1.5em"} color="white"/>
        </div>
      </div>
    </div>
    <ChatMember/>
    <Chat/>
    <Info/>
    
       </main>
    </>
    
  );
}

export default App;
