import React, { useState, useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
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

  const token = localStorage.getItem("token");

  // ✅ Always call hooks — do not exit before this
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
      const response = await AxiosClient.post(
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
      </div>
    );
  }

  const popUpVariant = {
    initial: { opacity: 0, scale: 0.9, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    transition: { duration: 0.4, ease: "easeOut" },
  };

  return (
    <div className="flex flex-col md:flex-row">
      {/* Sidebar */}
      <motion.section
        className="w-full md:w-[22vw] min-h-[88vh] px-4 py-4 bg-[#100d22] rounded-3xl"
        initial={popUpVariant.initial}
        animate={popUpVariant.animate}
        transition={popUpVariant.transition}
      >
        <h1 className="text-2xl text-white mb-4">Direct Messages</h1>

        <div className="p-3 min-h-[70vh] overflow-y-auto">
          {friendsLoading ? (
            <p className="text-cyan-400 font-semibold text-center">Loading friends...</p>
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
                    className="rounded-full"
                  />
                  <div className="text-sm text-ellipsis overflow-hidden">
                    <h1 className="font-semibold text-white/80">
                      {friend.username}
                    </h1>
                    <p className="text-white/60 max-w-[121px] truncate">
                      Start a conversation
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
          <Form className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white/5 p-3 rounded-xl mt-4 w-full max-w-sm">
            <div className="flex-1">
              <Field
                name="username"
                type="text"
                placeholder="Enter username"
                className="w-full bg-transparent border border-white/10 text-white placeholder-white/50 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <ErrorMessage
                name="username"
                component="div"
                className="text-red-400 text-sm mt-1"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg text-white ${
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

      {/* Main Chat Content */}
      <motion.div
        className="flex-1 mt-6 md:mt-0 md:ml-4"
        initial={popUpVariant.initial}
        animate={popUpVariant.animate}
        transition={popUpVariant.transition}
      >
        <Outlet />
      </motion.div>
    </div>
  );
};

export default ChatMember;
