import React, { useState, useEffect } from "react";
import { Link, Outlet, useParams, useLocation } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { AxiosClient } from "../utils/AxiosClient";
import profileImg from "../assets/profile.png";
import { motion } from "framer-motion";

const AddFriendSchema = Yup.object().shape({
  username: Yup.string().required("Username is required"),
});

const ChatMember = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [friends, setFriends] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(true);
  const [latestMessages, setLatestMessages] = useState({});
  const handleLatestMessage = (friendId, message) => {
    setLatestMessages(prev => ({ ...prev, [friendId]: message }));
  };
  const token = localStorage.getItem("token");

  const { id } = useParams();
  const location = useLocation();

  const isChatOpen = !!id;

  useEffect(() => {
    if (!token) return;

    const fetchFriends = async () => {
      setFriendsLoading(true);
      try {
        const response = await AxiosClient.get("/get_friends", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFriends(response.data || []);
      } catch (error) {
        toast.error("Failed to fetch friends.");
        setFriends([]);
      } finally {
        setFriendsLoading(false);
      }
    };

    fetchFriends();
  }, [token]);

  const handleAddFriend = async (values, { resetForm }) => {
    if (!token) return;
    setIsLoading(true);
    try {
      await AxiosClient.post(
        "/add_friend",
        { user: values.username },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      toast.success("Friend request sent!");
      resetForm();
    } catch (error) {
      toast.error(
        error?.response?.data?.error || "Failed to send friend request."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-white text-center mt-20">
        You must be logged in to view messages.
        <Link to="/" className="text-blue-500 underline ml-2">
          Login
        </Link>
      </div>
    );
  }

  const popUpVariant = {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    transition: { duration: 0.4, ease: "easeOut" },
  };

  return (
  <div className="flex flex-col xl:flex-row gap-4 px-2 ">
      {/* Friend List Section */}
      <motion.section
        className={`w-full xl:w-[25%] min-h-[88vh] px-4 py-4 bg-[#100d22] rounded-3xl
        ${isChatOpen ? "hidden xl:block" : "block"}`}
        initial={popUpVariant.initial}
        animate={popUpVariant.animate}
        transition={popUpVariant.transition}
      >
        <h1 className="text-2xl text-white mb-4">Direct Messages</h1>

        {/* Friends List */}
        <div className="p-3 min-h-[66vh] max-h-[66vh] overflow-y-auto space-y-2">
          {friendsLoading ? (
            <p className="text-cyan-400 font-semibold text-center">
              Loading friends...
            </p>
          ) : friends.length > 0 ? (
            friends.map((friend) => (
              <Link
                key={friend.id}
                to={`/messages/${friend.id}`}
                className="Chat"
                title={`Chat with ${friend.username}`}
              >
                <div className="hover:bg-white/5 hover:cursor-pointer h-16 flex gap-4 items-center p-2 rounded-3xl">
                  <img
                    src={profileImg}
                    alt="Profile"
                    width={"45px"}
                    className="rounded-full object-cover w-[45px] h-[45px]"
                  />
                  <div className="text-sm text-ellipsis overflow-hidden">
                    <h1 className="font-semibold text-white/80">
                      {friend.username}
                    </h1>
                    <p className="text-white/60 max-w-[150px] truncate">
                      {latestMessages[friend.id] || "Start a conversation"}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-white/70 text-center">No friends found.</p>
          )}
        </div>

        {/* Add Friend Form */}
        <Formik
          initialValues={{ username: "" }}
          validationSchema={AddFriendSchema}
          onSubmit={handleAddFriend}
        >
          <Form className="flex flex-col md:flex-row items-center md:mt-4 gap-3 bg-white/5 p-4 rounded-xl w-full">
            <div className="flex-1 relative w-full">
              <Field
                name="username"
                type="text"
                placeholder="Enter username"
                className="w-full bg-transparent border border-white/10 text-white placeholder-white/50 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <ErrorMessage
                name="username"
                component="div"
                className="text-red-400 text-sm absolute z-1 bottom-[-19px] mt-1"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg text-white w-full sm:w-auto ${
                isLoading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isLoading ? "Sending..." : "Add Friend"}
            </button>
          </Form>
        </Formik>
      </motion.section>

      {/* Chat Section */}
      <motion.div
        className={`flex-1 ${isChatOpen ? "block" : "hidden xl:block"} w-[100%]`}
        initial={popUpVariant.initial}
        animate={popUpVariant.animate}
        transition={popUpVariant.transition}
      >
  <Outlet context={{ handleLatestMessage }} />
      </motion.div>
    </div>
  );
};

export default ChatMember;
