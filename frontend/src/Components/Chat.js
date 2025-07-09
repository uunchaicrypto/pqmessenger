import React from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import "../ComponentsCss/chat.css";
import { FaPlus } from "react-icons/fa6";
import { IoMdSend } from "react-icons/io";
const Chat = () => {
  return (
    <div className="min-h-[90vh] p-4 ml-5 bg-[#100d22] rounded-3xl flex flex-col  w-[43vw]">
      <div className="h-[10%] bg-[#181030] rounded-full flex items-center justify-between pr-6 ">
        <div className="p-3 flex gap-4">
          <div className="relative flex">
            <img src="profile.png" width={"45px"} alt="" />
            <p className="text-center relative text-[#12a445] text-[20px] top-6 right-3 ">
              ●
            </p>
          </div>
          <div>
            <h1 className="font-sans text-white frndName">Prasiddha Thapa</h1>
            <p className="text-gray-400 font-light text-xs">Online</p>
          </div>
        </div>
        <div className="px-2 py-3 bg-[#251a4c] rounded-xl">
          <p>
            <BsThreeDotsVertical />
          </p>
        </div>
      </div>
      <div className=" h-[77%] rounded-2xl mt-2"></div>
      <div className="bg-[#181030] flex relative z-[1] pl-3 h-[10%] items-center rounded-2xl drop-shadow-[0_-6px_16px_rgba(0,0,0,0.4)]">
        <div className="px-3 py-3 bg-[#251a4c] rounded-xl">
          <FaPlus size={'0.9em'} />
        </div>
        <div><input type="text" placeholder='Type a Message' className="p-2 placeholder-[#3e3757] placeholder-sm w-[29rem] bg-transparent outline-none"  /></div>
        <div className="flex justify-end w-[6.5rem]">
          <button type="button">
            <div className="flex px-2 py-3 bg-[#251a4c] rounded-xl gap-2 items-center">
          <IoMdSend size={'1.4rem'}/>
          </div>
            </button>
          </div>
      </div>
    </div>
  );
};

export default Chat;
