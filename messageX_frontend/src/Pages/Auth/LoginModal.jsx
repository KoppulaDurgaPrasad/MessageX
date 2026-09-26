import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import "./LoginModal.css";

function LoginModal({ isOpen, onClose }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");

  const [otpSent, setOtpSent] = useState(false);

  const [timer, setTimer] = useState(60);

  const [loading, setLoading] = useState(false);

  const [verifying, setVerifying] = useState(false);

  const navigate = useNavigate();

  const handleClose = () => {
    if (loading || verifying) return;

    setPhoneNumber("");
    setOtp("");
    setOtpSent(false);
    setTimer(60);
    setLoading(false);
    setVerifying(false);

    onClose();
  };

  useEffect(() => {
    let interval;

    if (otpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [otpSent, timer]);

  if (!isOpen) return null;

  const handleSendOtp = async () => {
    const mobile = phoneNumber || "";
    const fullPhoneNumber = `+91${mobile}`;

    if (!/^\d{10}$/.test(mobile)) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/send-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phoneNumber: fullPhoneNumber,
          }),
        },
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Unable to send OTP");
      }

      toast.success("OTP Sent Successfully.");

      setOtpSent(true);
      setTimer(60);
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Unable to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    const mobile = phoneNumber || "";
    const fullPhoneNumber = `+91${mobile}`;
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }

    setVerifying(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phoneNumber: fullPhoneNumber,
            otp: otp,
          }),
        },
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Invalid OTP");
      }

      const data = await response.json();

      console.log(data);

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success("OTP Verified Successfully.");

      onClose();

      if (data.user.profileCompleted) {
        navigate("/chat");
      } else {
        navigate("/profile");
      }
    } catch (e) {
      console.error(e);
      toast.error(e.message);
    } finally {
      setVerifying(false);
    }
  };

  const resendOtp = () => {
    setOtp("");

    handleSendOtp();
  };

  return (
    <div className="login-overlay">
      <div className="login-modal">
        <button className="close-btn" onClick={handleClose}>
          ✕
        </button>

        <h1>Continue With Phone</h1>
        <p className="login-subtitle">
          We'll send a verification code to your mobile number.
        </p>

        <div className="phone-input-container">
          <div className="country-code">
            <span className="flag">🇮🇳</span>
            <span>+91</span>
          </div>

          <input
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="Enter mobile number"
            value={phoneNumber}
            disabled={otpSent}
            maxLength={10}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");

              if (value.length <= 10) {
                setPhoneNumber(value);
              }
            }}
          />
        </div>

        {otpSent && (
          <>
            <p className="phone-preview">
              OTP sent to <strong>+91 {phoneNumber}</strong>
            </p>
            <input
              className="otp-input"
              type="tel"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              placeholder="Enter 6-digit OTP"
              valu
              
               
              
              e={otp}
              maxLength={6}
              onChange={(e) => setOtp(e.target.value)}
            />

            {timer > 0 ? (
              <p className="timer">
                Resend OTP in 00:{String(timer).padStart(2, "0")}
              </p>
            ) : (
              <button
                className="resend-btn"
                onClick={resendOtp}
                disabled={loading || verifying}
              >
                {loading ? "Sending..." : "Resend OTP"}
              </button>
            )}
          </>
        )}

        {!otpSent ? (
          <button
            className="login-btn"
            onClick={handleSendOtp}
            disabled={loading || !/^\d{10}$/.test(phoneNumber || "")}
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        ) : (
          <button
            className="login-btn"
            onClick={handleVerify}
            disabled={verifying || otp.length !== 6}
          >
            {verifying ? "Verifying..." : "Verify & Continue"}
          </button>
        )}
      </div>
    </div>
  );
}

export default LoginModal;
