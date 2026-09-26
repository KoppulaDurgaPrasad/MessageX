import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  const [username, setUsername] = useState("");
  const [about, setAbout] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);

  const [preview, setPreview] = useState(null);

  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB.");
      return;
    }

    setProfilePicture(file);

    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (username.trim() === "") {
      toast.error("Username is required");
      return;
    }

    if (!profilePicture) {
      toast.error("Please select a profile picture.");
      return;
    }

    if (about.trim() === "") {
      toast.error("About is required");
      return;
    }

    setLoading(true);

    try {
      let imageUrl = preview;

      if (profilePicture) {
        const formData = new FormData();

        formData.append("file", profilePicture);

        const uploadResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/upload?folder=profile`,
          {
            method: "POST",
            body: formData,
          },
        );

        if (!uploadResponse.ok) {
          throw new Error("Image upload failed");
        }

        imageUrl = await uploadResponse.text();
      }

      const token = localStorage.getItem("accessToken");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            username: username.trim(),
            profilePicture: imageUrl,
            about: about.trim(),
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Unable to update profile");
      }

      const updatedUser = await response.json();

      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast.success("Profile Updated Successfully");

      setUsername("");
      setAbout("");
      setProfilePicture(null);
      setPreview(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      navigate("/chat");
    } catch (e) {
      console.error(e);

      toast.error(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/users/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) return;

        const user = await response.json();

        setUsername(user.username || "");
        setAbout(user.about || "");
        setPreview(user.profilePicture || null);
      } catch (e) {
        console.error(e);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h1>Complete Your Profile</h1>

        <p>Tell everyone a little about yourself.</p>

        <div className="profile-image-section">
          <label htmlFor="profileImage">
            <img
              src={
                preview
                  ? preview
                  : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt="Profile"
              className="profile-image"
            />
          </label>

          <input
            ref={fileInputRef}
            id="profileImage"
            type="file"
            accept="image/*"
            hidden
            disabled={loading}
            onChange={handleImageChange}
          />

          <label htmlFor="profileImage" className="upload-text">
            Change Profile Picture
          </label>
        </div>

        <input
          type="text"
          placeholder="Username"
          value={username}
          maxLength={25}
          onChange={(e) => setUsername(e.target.value)}
        />

        <textarea
          placeholder="About"
          value={about}
          maxLength={150}
          onChange={(e) => setAbout(e.target.value)}
        />

        <div className="char-counter">{about.length}/150</div>

        <button
          onClick={handleSave}
          disabled={
            loading ||
            !username.trim() ||
            !about.trim() ||
            (!profilePicture && !preview)
          }
        >
          {loading ? "Saving..." : "Save & Continue"}
        </button>
      </div>
    </div>
  );
}

export default Profile;
