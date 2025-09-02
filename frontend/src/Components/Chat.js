import React, { useEffect, useState } from "react";
import { useParams, Outlet, useNavigate, useLocation, useOutletContext } from "react-router-dom";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaPlus } from "react-icons/fa6";
import { IoMdSend } from "react-icons/io";
import profileImg from "../assets/profile.png";
import { AxiosClient } from "../utils/AxiosClient";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { Scrollbar } from "react-scrollbars-custom";
const Chat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  // Get parent callback from Outlet context
  const outletContext = useOutletContext();
  const handleLatestMessage = outletContext?.handleLatestMessage;

  const [info, setInfo] = useState(false);
  const [friends, setFriends] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isXL, setIsXL] = useState(window.innerWidth >= 1280);

  useEffect(() => {
    const updateSize = () => setIsXL(window.innerWidth >= 1280);
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    setInfo(location.pathname.endsWith("/info"));
  }, [location]);

  useEffect(() => {
    const fetchFriends = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await AxiosClient.get("/get_friends", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFriends(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Failed to fetch friends:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFriends();
  }, []);

  useEffect(() => {
    if (!id) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    const fetchMessages = async () => {
      try {
        const response = await AxiosClient.get(`/get_messages/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(response.data);
        if (handleLatestMessage && Array.isArray(response.data) && response.data.length > 0) {
          const lastMsg = response.data[response.data.length - 1];
          handleLatestMessage(id, lastMsg.message);
        } else if (handleLatestMessage) {
          handleLatestMessage(id, "Start a conversation");
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };
    const interval = setInterval(fetchMessages, 3000);
    fetchMessages();
    return () => clearInterval(interval);
  }, [id, handleLatestMessage]);

  const handleClick = () => {
    if (info) {
      navigate(`/messages/${id}`);
    } else {
      navigate(`/messages/${id}/info`);
    }
  };

  const Spinner = () => (
    <div className="flex items-center justify-center min-h-[80vh] w-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-white"></div>
    </div>
  );

  const currentFriend = friends.find((friend) => friend.id === id);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-white">
        <Spinner />
      </div>
    );
  }

  const MessageSchema = Yup.object().shape({
    message: Yup.string()
      .trim()
      .required("Message cannot be empty")
      .max(500, "Too long"),
  });

  const sendMessage = async (values, { resetForm }) => {
    if (!values.message.trim() || !id) return;
    const token = localStorage.getItem("token");
    try {
      setIsSending(true);
      await AxiosClient.post(
        `/friend/${id}/${encodeURIComponent(values.message)}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      resetForm();
      // Optionally, fetch messages again to update the chat
      setIsSending(false);
      const response = await AxiosClient.get(`/get_messages/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(response.data);
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to send message");
    } finally {
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-1 overflow-hidden w-[102%]">
      <div
        className={`min-h-[88vh] bg-[#100d22] rounded-3xl flex flex-col ${
          info && !isXL ? "hidden" : "block"
        } w-full xl:flex-1`}
      >
        {/* Top Bar */}
        <div className="h-[10%] bg-[#181030] rounded-full flex items-center justify-between pr-6">
          <div className="p-3 flex gap-4">
            <div className="relative flex cursor-pointer" onClick={handleClick}>
              <img
                src={profileImg}
                width="45"
                height="45"
                alt={currentFriend?.username || "profile"}
                className="rounded-full object-cover"
              />
              <p className="text-center relative text-[#12a445] text-[20px] top-6 right-3">
                ●
              </p>
            </div>
            <div className="cursor-pointer" onClick={handleClick}>
              <h1 className="font-sans text-white frndName max-w-xs truncate">
                {currentFriend?.username || "Select a friend"}
              </h1>
              <p className="text-gray-400 font-light text-xs">
                {currentFriend ? "Online" : ""}
              </p>
            </div>
          </div>
        </div>

        <Scrollbar
          style={{ height: "70vh" }}
          className="rounded-2xl mt-2 bg-[#100d22]"
        >
          <div className="p-2">
            {!currentFriend && (
              <p className="text-white/80 p-4">
                Select a friend to start chatting
              </p>
            )}
            {messages.length === 0 && (
              <p className="text-white/80 p-4">No messages yet.</p>
            )}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-4 ${
                  msg.from === id ? "text-left" : "text-right"
                }`}
              >
                <div
                  className={`inline-block rounded-lg p-2 ${
                    msg.from === id
                      ? "bg-gray-300 text-black"
                      : " bg-blue-500 text-white"
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            ))}
          </div>
        </Scrollbar>

        {/* Input Box */}
        <Formik
          initialValues={{ message: "" }}
          validationSchema={MessageSchema}
          onSubmit={sendMessage}
        >
          {({ errors, touched }) => (
            <Form className="bg-[#181030] flex sm:flex-row relative z-[1] pl-3 h-[4rem] justify-between items-center rounded-2xl gap-2 sm:gap-0">
              <div className="flex w-full gap-2 items-center">
                <div className="px-3 py-3 bg-[#251a4c] rounded-xl shrink-0">
                  <FaPlus size="0.9em" />
                </div>
                <Field
                  name="message"
                  type="text"
                  placeholder="Type a Message"
                  className="p-2 placeholder-[#3e3757] bg-transparent text-white outline-none flex-grow w-full"
                  disabled={!currentFriend}
                />
              </div>
              <div className="flex justify-end mr-3 w-[6.5rem]">
                <button
                  type="submit"
                  disabled={!currentFriend || isSending}
                  className={`flex px-4 py-2 rounded-xl gap-2 items-center justify-center w-full ${
                    isSending
                      ? "bg-blue-400"
                      : "bg-[#251a4c] hover:bg-[#392c5e]"
                  }`}
                >
                  <IoMdSend size="1.4rem" />
                  {isSending && <span className="text-sm">Sending...</span>}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>

      {/* Info Panel */}
      {info && (
        <div className="w-full xl:w-[23rem] mt-4 xl:mt-0 xl:ml-4 rounded-3xl overflow-auto min-h-[80vh]">
          <Outlet />
        </div>
      )}
    </div>
  );
};

export default Chat;
