import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import profileImg from "../assets/profile.png";
import { motion } from "framer-motion";
import { AxiosClient } from "../utils/AxiosClient";
import toast from "react-hot-toast";

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await AxiosClient.get("/get_friend_accept_notifications", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setNotifications(response.data || []);
      } catch (error) {
        toast.error("Failed to fetch notifications.");
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchNotifications();
  }, [token]);

  return (
    <div className="flex">
      <section className="w-[22vw] min-h-[90vh] px-4 py-4 bg-[#100d22] rounded-3xl">
        <h1 className="heading text-2xl text-white mb-4">Notification</h1>

        <div className="p-3 mt-4 space-y-4">
          {loading ? (
            <p className="text-center text-cyan-400">Loading notifications...</p>
          ) : notifications.length === 0 ? (
            <p className="text-center text-white/60">No new notifications.</p>
          ) : (
            notifications.map((notif, index) => (
              <motion.div
                key={notif.id || index}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut", delay: index * 0.1 }}
                className="flex items-center p-4 rounded-3xl border border-white/10 bg-white/5"
              >
                <img
                  src={profileImg}
                  alt={notif.username}
                  className="w-[45px] h-[45px] rounded-full"
                />

                <div className="ml-4 flex-1 overflow-hidden">
                  <h1 className="font-semibold text-white/80">{notif.username}</h1>
                  <p className="text-sm text-green-400 truncate">
                    accepted your friend request
                  </p>
                </div>

                <div className="ml-auto text-sm text-white/50">
                  <p>{notif.time || "Just now"}</p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </section>

      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default Notification;
