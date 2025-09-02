import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import profileImg from "../assets/profile.png";
import { AxiosClient } from "../utils/AxiosClient";
import { motion } from "framer-motion";
import "../ComponentsCss/chat.css";
import toast from "react-hot-toast";

const FriendRequest = () => {
  const token = localStorage.getItem("token");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFriendRequests = async () => {
      try {
        const response = await AxiosClient.get("/get_requests", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = response.data;
        if (Array.isArray(data)) {
          setRequests(data);
        } else if (Array.isArray(data.pending_requests)) {
          setRequests(data.pending_requests);
        } else {
          console.warn("Unexpected response format:", data);
          setRequests([]);
        }
      } catch (error) {
        console.error("Error fetching friend requests:", error);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFriendRequests();
  }, [token]);

  const handleAccept = async (userId) => {
    try {
      await AxiosClient.post(
        "/accept_request",
        { from_user_id: userId },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      toast.success("Friend Accepted!");
      setRequests((prev) => prev.filter((request) => request.id !== userId));
    } catch (error) {
      toast.error(
        error?.response?.data?.error || "Failed to accept friend request."
      );
    }
  };

  const handleDecline = async (userId) => {
    try {
      await AxiosClient.post(
        "/decline_request",
        { from_user_id: userId },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      toast.success("Friend request declined.");
      setRequests((prev) => prev.filter((request) => request.id !== userId));
    } catch (error) {
      toast.error(
        error?.response?.data?.error || "Failed to decline friend request."
      );
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0 },
  };

  return (
    <div className="flex ">
      <section className="xl:w-[22vw] w-full min-h-[90vh] px-4 py-4 bg-[#100d22] rounded-3xl">
        <h1 className="heading text-2xl text-white mb-4">Friend Requests</h1>

        <div className="p-3 mt-4 space-y-4">
          {loading ? (
            <motion.p
              className="text-cyan-400 text-xl font-bold text-center drop-shadow-[0_0_10px_rgba(34,211,238,0.001)]"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: [0.5, 1, 0.5],
                scale: [0.95, 1.05, 0.95],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              🔄 Loading friend requests...
            </motion.p>
          ) : requests.length > 0 ? (
            requests.map((request, index) => (
              <motion.div
                key={request.id || index}
                className="hover:bg-white/5 hover:cursor-pointer hover:shadow-glow flex items-center p-4 rounded-3xl border border-white/10"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{
                  duration: 0.4,
                  delay: index * 0.1,
                  ease: "easeOut",
                }}
              >
                <img
                  src={profileImg}
                  alt="Profile"
                  className="w-[45px] h-[45px] rounded-full"
                />

                <div className="ml-4 flex-1 overflow-hidden">
                  <h1 className="font-semibold text-white/80">
                    {request.username || "Unknown"}
                  </h1>
                  <p className="text-sm text-white/60 truncate">
                    sent you a friend request
                  </p>
                </div>

                <div className="flex flex-col gap-2 ml-auto">
                  <button
                    onClick={() => handleAccept(request.id)}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 text-sm rounded-full"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleDecline(request.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 text-sm rounded-full"
                  >
                    Decline
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.p
              className="text-white/70 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              No friend requests.
            </motion.p>
          )}
        </div>
      </section>

      <div className="flex-1 mt-6 md:mt-0 md:ml-4">
        <Outlet />
      </div>
    </div>
  );
};

export default FriendRequest;
