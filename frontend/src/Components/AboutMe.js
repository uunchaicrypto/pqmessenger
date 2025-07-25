import { UserAuth } from "../context/AuthContext";
import profileImg from "../assets/profile.png";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.2,
      duration: 0.8,
    },
  },
};

const childVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 80 },
  },
};

const AboutMe = () => {
  const { user } = UserAuth();

  return (
    <motion.div
      className="min-h-[80vh] w-full max-w-xl mx-auto mt-10 bg-gradient-to-br from-[#0e0c2b] via-[#15123e] to-[#1a174c] text-white p-8 rounded-3xl shadow-2xl border border-white/10 relative overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Animated Glow Ring */}
      <motion.div
        className="absolute -top-10 -left-10 w-40 h-40 bg-purple-500 opacity-30 rounded-full blur-2xl animate-ping"
        initial={{ opacity: 0.1, scale: 0.8 }}
        animate={{ opacity: 0.25, scale: 1 }}
        transition={{ repeat: Infinity, duration: 10000*10000, ease: "easeInOut" }}
      ></motion.div>

      <motion.h1
        className="text-4xl font-bold text-center mb-6 text-white tracking-wide"
        variants={childVariants}
      >
        About Me
      </motion.h1>

      {!user ? (
        <motion.p
          className="text-center text-white/70"
          variants={childVariants}
        >
          You are not logged in.
        </motion.p>
      ) : (
        <motion.div
          className="flex flex-col items-center gap-4"
          variants={containerVariants}
        >
          {/* Profile Image */}
          <motion.div
            className="relative group"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 120 }}
          >
            <img
              src={profileImg}
              alt="User"
              className="w-28 h-28 rounded-full border-4 border-white/20 shadow-xl group-hover:shadow-purple-400 transition duration-500"
            />
            {/* Pulse Ring */}
            <div className="absolute inset-0 rounded-full border-4 border-purple-500/30 animate-pulse"></div>
          </motion.div>

          {/* Username */}
          <motion.h2
            className="text-2xl font-semibold text-white/90"
            variants={childVariants}
          >
            {user.username || "Unnamed User"}
          </motion.h2>

          {/* Email */}
          {user.email && (
            <motion.p
              className="text-md text-white/60"
              variants={childVariants}
            >
              ✉️ {user.email}
            </motion.p>
          )}

          {/* Joined Date */}
          {user.created_at && (
            <motion.p
              className="text-md text-white/50 italic"
              variants={childVariants}
            >
              🕓 Joined: {new Date(user.created_at).toLocaleDateString()}
            </motion.p>
          )}

          {/* User ID */}
          <motion.p
            className="text-xs text-white/30 mt-4 select-text"
            variants={childVariants}
          >
            🔐 ID: {user.user_id}
          </motion.p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AboutMe;
