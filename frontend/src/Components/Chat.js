import React, { useState, useEffect } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import "../ComponentsCss/chat.css";
import { FaPlus } from "react-icons/fa6";
import { IoMdSend } from "react-icons/io";
import { Outlet, useParams, useNavigate, useLocation, useNavigation } from "react-router-dom";
import profileImg from "../assets/profile.png";
import { AxiosClient } from "../utils/AxiosClient";

const Spinner = () => (
  <div className="flex items-center justify-center min-h-[90vh] w-full">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
  </div>
);

const Chat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const navigation = useNavigation();

  const [info, setInfo] = useState(false);
  const [friends, setFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    setInfo(location.pathname.endsWith("/info"));
  }, [location]);

  useEffect(() => {
    const fetchFriends = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await AxiosClient.get("/get_friends", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (Array.isArray(response.data)) {
          setFriends(response.data);
        } else {
          console.warn("Unexpected response:", response.data);
        }
      } catch (error) {
        console.error("Failed to fetch friends:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFriends();
  }, [token]);

  const handleClick = () => {
    if (info) {
      navigate(`/messages/${id}`);
    } else {
      navigate(`/messages/${id}/info`);
    }
  };

  const currentFriend = friends.find((friend) => friend.id === id);

  // If the component is still loading, show spinner instead of chat UI
  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="flex">
      <div
        className={
          info
            ? "min-h-[88vh] p-4  bg-[#100d22] rounded-3xl flex flex-col w-[43vw]"
            : "min-h-[88vh] p-4  bg-[#100d22] rounded-3xl flex flex-col w-[63vw]"
        }
      >
        {/* Top Bar */}
        <div className="h-[10%] bg-[#181030] rounded-full flex items-center justify-between pr-6">
          <div className="p-3 flex gap-4">
            <div className="relative flex">
              <img
                src={profileImg}
                width="45px"
                alt={currentFriend?.username || "profile"}
              />
              <p className="text-center relative text-[#12a445] text-[20px] top-6 right-3">
                ●
              </p>
            </div>
            <div
              onClick={handleClick}
              className="cursor-pointer"
              title="Toggle Info Panel"
            >
              <h1 className="font-sans text-white frndName">
                {currentFriend?.username || "Select a friend"}
              </h1>
              <p className="text-gray-400 font-light text-xs">
                {currentFriend ? "Online" : ""}
              </p>
            </div>
          </div>
          <div className="px-2 py-3 bg-[#251a4c] rounded-xl">
            <BsThreeDotsVertical />
          </div>
        </div>

        {/* Chat Body */}
        <div className="h-[70vh] rounded-2xl mt-2 overflow-y-auto">
          {!currentFriend && (
            <p className="text-white/80 p-4">Select a friend to start chatting</p>
          )}
        </div>

        {/* Input Box */}
        <div className="bg-[#181030] flex relative z-[1] pl-3 h-[10%] items-center rounded-2xl drop-shadow-[0_-6px_16px_rgba(0,0,0,0.4)]">
          <div className="px-3 py-3 bg-[#251a4c] rounded-xl">
            <FaPlus size="0.9em" />
          </div>
          <input
            type="text"
            placeholder="Type a Message"
            className={`p-2 placeholder-[#3e3757] placeholder-sm ${
              info ? "w-[29rem]" : "w-[46rem]"
            } bg-transparent outline-none`}
            disabled={!currentFriend}
          />
          <div className="flex justify-end w-[6.5rem]">
            <button type="button" disabled={!currentFriend}>
              <div className="flex px-2 py-3 bg-[#251a4c] rounded-xl gap-2 items-center">
                <IoMdSend size="1.4rem" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Info Panel if open */}
      {info && (
        <div>
          <Outlet />
        </div>
      )}
    </div>
  );
};

export default Chat;
