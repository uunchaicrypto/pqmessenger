import React from "react";
import { Link, Outlet } from "react-router-dom";
import profileImg from '../assets/profile.png';
const ChatMember = () => {
  return (
<>
<div className="flex">

    <section className="w-[22vw] min-h-[90vh] px-4 py-4 bg-[#100d22] rounded-3xl">
      <h1 className="heading text-2xl">Direct Messages</h1>
      <div className="p-3 mt-4">
        <Link to="/messages/1" className="Chat" title="Open chat with Prasiddha">
          <div className="hover:bg-white/5 hover:cursor-pointer h-16 flex gap-4 items-center p-2 rounded-3xl">
            <img src="profile.png" alt="Profile" width={"45px"} />
            <div className="text-sm text-ellipsis overflow-hidden">
              <h1 className="font-semibold text-white/80">Prasiddha Thapa</h1>
              <div className="text-white/80">
                <p className="max-w-[121px] truncate whitespace-nowrap overflow-hidden">
                  1 new message
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-400 ml-auto text-right">
              <h1 className="font-normal">05:30 PM</h1>
              <p className="text-green-400">●</p>
            </div>
          </div>
        </Link>
      </div>
      {/* 👇 Nested Chat will render here */}
    </section>
      <div>
      <Outlet />

      </div>
</div>
      </>
  );
};

export default ChatMember;
