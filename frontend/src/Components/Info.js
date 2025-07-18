import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import profileImg from "../assets/profile.png";
import { AxiosClient } from "../utils/AxiosClient";
import '../ComponentsCss/animation.css';

// Reusable Spinner component
const Spinner = () => (
  <div className="flex items-center justify-center min-h-[80vh] w-full">
    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-white"></div>
  </div>
);

const Info = () => {
  const { id } = useParams();
  const [friend, setFriend] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFriendInfo = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token");

      const response = await AxiosClient.get(`/friend/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFriend(response.data);
    } catch {
      setError("Failed to load friend info.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchFriendInfo();
  }, [fetchFriendInfo]);

  if (loading) {
    return (
      <div className="w-[25vw] bg-[#100d22] pt-10 flex ml-3 p-8 rounded-3xl min-h-[70vh]">
        <Spinner />
      </div>
    );
  }

  if (error || !friend) {
    return (
      <div className="w-[25vw] bg-[#100d22] pt-10 flex flex-col items-center justify-center ml-3 p-8 rounded-3xl min-h-[90vh]">
        <p className="text-white mb-4">{error || "No info available."}</p>
        <button
          onClick={fetchFriendInfo}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-[25vw] bg-[#100d22] pt-10 flex ml-3 p-8 rounded-3xl min-h-[90vh]">
      <div
        className="info flex items-center mx-auto flex-col opacity-0 animate-fadeIn"
        style={{ animationFillMode: "forwards", animationDuration: "0.5s" }}
      >
        <img
          src={friend.profilePic || profileImg}
          width={150}
          alt={friend.username || "Profile"}
          className="rounded-full object-cover"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = profileImg;
          }}
        />
        <h1 className="font-sans mt-4 text-xl text-white frndName">{friend.username}</h1>
        <p className="text-center text-sm text-white/70 mt-1">
          Joined {friend.joinedDate ? new Date(friend.joinedDate).toLocaleDateString() : "N/A"}
        </p>
      </div>
    </div>
  );
};

export default Info;
