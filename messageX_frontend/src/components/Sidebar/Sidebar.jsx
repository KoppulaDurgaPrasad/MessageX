import { NavLink, useNavigate } from "react-router-dom";
import {
  FaComments,
  FaUserFriends,
  FaCircle,
  FaPhoneAlt,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";

import "./Sidebar.css";

function Sidebar({ currentUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    navigate("/", { replace: true });
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <img src="/messageX.png" alt="MessageX" />
      </div>

      <div className="sidebar-menu">
        <NavLink
          to="/chat"
          className={({ isActive }) =>
            isActive ? "sidebar-item active" : "sidebar-item"
          }
        >
          <FaComments />
          <span>Chats</span>
        </NavLink>

        <NavLink
          to="/groups"
          className={({ isActive }) =>
            isActive ? "sidebar-item active" : "sidebar-item"
          }
        >
          <FaUserFriends />
          <span>Groups</span>
        </NavLink>

        <NavLink
          to="/status"
          className={({ isActive }) =>
            isActive ? "sidebar-item active" : "sidebar-item"
          }
        >
          <FaCircle />
          <span>Status</span>
        </NavLink>

        <NavLink
          to="/calls"
          className={({ isActive }) =>
            isActive ? "sidebar-item active" : "sidebar-item"
          }
        >
          <FaPhoneAlt />
          <span>Calls</span>
        </NavLink>
      </div>

      <div className="sidebar-bottom">
        <div className="sidebar-profile">
          <img
            src={currentUser?.profilePicture || "/default-avatar.png"}
            alt="Profile"
            className="profile-avatar"
          />

          <p>{currentUser?.username || "Loading..."}</p>
        </div>
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            isActive ? "sidebar-item active" : "sidebar-item"
          }
        >
          <FaUser />
          <span>Profile</span>
        </NavLink>

        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
