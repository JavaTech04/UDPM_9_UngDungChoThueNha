import axios from "axios";
import "driver.js/dist/driver.css";
import React, { useEffect, useState } from "react";
import { apiKey } from "../api";
import unidecode from "unidecode";
import {
  Box,
  Button,
  Input,
  Typography,
  FormControl,
  FormLabel,
} from "@mui/joy";
import { toast } from "react-toastify";
import { AccountCircle, Email } from "@mui/icons-material";

const apiBaseUrl = "https://api.gameshift.dev/nx/users";

const AuthForm = ({ setIsLoggedIn, setUserData }) => {
  const [formData, setFormData] = useState({
    referenceId: "",
    email: "",
    externalWalletAddress: "",
  });

  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPhantomInstalled, setIsPhantomInstalled] = useState(false);

  useEffect(() => {
    const checkPhantomWallet = () => {
      const { solana } = window;
      setIsPhantomInstalled(!!(solana && solana.isPhantom));
    };

    checkPhantomWallet();
  }, []);

  const connectPhantomWallet = async () => {
    if (!isPhantomInstalled) {
      toast.error("Phantom Wallet chưa được cài đặt");
      return null;
    }

    try {
      const resp = await window.solana.connect();
      return resp.publicKey.toString();
    } catch (err) {
      toast.error("Kết nối ví Phantom thất bại");
      return null;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedValue = unidecode(value);

    setFormData((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));
  };

  const validateForm = () => {
    if (!formData.referenceId || !formData.email) {
      toast.error("Vui lòng nhập đầy đủ thông tin.");
      return false;
    }
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error("Email không hợp lệ.");
      return false;
    }
    return true;
  };

  const handleAction = async (isRegister) => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (isRegister) {
        const walletAddress = await connectPhantomWallet();
        if (!walletAddress) {
          setIsLoading(false);
          return;
        }

        setFormData((prev) => ({
          ...prev,
          externalWalletAddress: walletAddress,
        }));

        const config = {
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            "x-api-key": apiKey,
          },
        };

        await axios.post(
          apiBaseUrl,
          {
            referenceId: formData.referenceId,
            email: formData.email,
            externalWalletAddress: walletAddress,
          },
          config
        );

        toast.success("Đăng ký thành công!");
      } else {
        const config = {
          headers: {
            accept: "application/json",
            "x-api-key": apiKey,
          },
        };

        const response = await axios.get(
          `${apiBaseUrl}/${formData.referenceId}`,
          config
        );

        if (response.data.email !== formData.email) {
          toast.error("Email không khớp");
          return;
        }

        toast.success("Đăng nhập thành công!");
      }

      setTimeout(() => {
        setUserData(formData);
        setIsLoggedIn(true);
      }, 1500);
    } catch (err) {
      toast.error("Đã xảy ra lỗi. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        backgroundImage:
          'url("https://kinsta.com/wp-content/uploads/2019/12/wordpress-rest-api.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          p: 5,
          color: "white",
          backdropFilter: "blur(5px)",
        }}
      >
        <Typography
          level="h1"
          sx={{
            color: "#fff",
            mb: 2,
            fontWeight: "bold",
            textShadow: "2px 2px 4px rgba(0,0,0,0.6)",
          }}
        >
          Ứng dụng Quản lý Thuê Nhà
        </Typography>
        <Typography
          level="body1"
          sx={{
            mb: 4,
            fontSize: 18,
            maxWidth: 600,
            textShadow: "1px 1px 3px rgba(0,0,0,0.5)",
          }}
        >
          Nền tảng giúp bạn quản lý, tìm kiếm và theo dõi các giao dịch thuê nhà
          một cách dễ dàng và thuận tiện. Khám phá ngay!
        </Typography>
      </Box>

      {/* Right Section */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backdropFilter: "blur(5px)",
        }}
      >
        <Box
          sx={{
            maxWidth: 420,
            width: "100%",
            p: 4,
            borderRadius: 4,
            backgroundColor: "rgba(10, 25, 47, 0.95)",
            color: "white",
            boxShadow: "0px 8px 24px rgb(111 144 241)",
          }}
        >
          <Typography
            level="h4"
            textAlign="center"
            fontWeight="bold"
            mb={2}
            sx={{ color: "white" }}
          >
            {isRegistering ? "ĐĂNG kÝ" : "ĐĂNG NHẬP"}
          </Typography>
          <form>
            <FormControl sx={{ mb: 3 }}>
              <FormLabel sx={{ color: "rgba(255, 255, 255, 0.8)" }}>
                <AccountCircle
                  sx={{
                    mr: 1,
                    verticalAlign: "middle",
                    color: "rgba(255,255,255,0.8)",
                  }}
                />
                Tên tài khoản
              </FormLabel>
              <Input
                name="referenceId"
                value={formData.referenceId}
                onChange={handleInputChange}
                placeholder="Nhập mã tham chiếu"
                disabled={isLoading}
                sx={{
                  bgcolor: "rgba(255,255,255,0.1)",
                  color: "white",
                  "::placeholder": { color: "rgba(255,255,255,0.6)" },
                }}
              />
            </FormControl>
            <FormControl sx={{ mb: 3 }}>
              <FormLabel sx={{ color: "rgba(255, 255, 255, 0.8)" }}>
                <Email
                  sx={{
                    mr: 1,
                    verticalAlign: "middle",
                    color: "rgba(255,255,255,0.8)",
                  }}
                />
                Email
              </FormLabel>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Nhập email"
                disabled={isLoading}
                sx={{
                  bgcolor: "rgba(255,255,255,0.1)",
                  color: "white",
                  "::placeholder": { color: "rgba(255,255,255,0.6)" },
                }}
              />
            </FormControl>
            {isRegistering && !isPhantomInstalled && (
              <Box
                sx={{
                  marginTop: 2,
                  textAlign: "center",
                  color: "warning.main",
                }}
              >
                Vui lòng cài đặt Phantom Wallet để đăng ký
              </Box>
            )}
            <Button
              variant="solid"
              fullWidth
              color={isRegistering ? "dark" : "primary"}
              onClick={() => handleAction(isRegistering)}
              disabled={isLoading || (isRegistering && !isPhantomInstalled)}
              sx={{
                background: isRegistering
                  ? "linear-gradient(to right, #0072ff, #00c6ff)"
                  : "linear-gradient(to right, #001f3f, #0072ff)",
                "&:hover": { opacity: 0.9 },
                color: "white",
              }}
            >
              {isLoading
                ? "Đang xử lý..."
                : isRegistering
                ? "Đăng ký"
                : "Đăng nhập"}
            </Button>
          </form>
          <Box sx={{ textAlign: "center", marginTop: 2 }}>
            <Button
              size="small"
              color="info"
              sx={{ color: "white" }}
              onClick={() => setIsRegistering(!isRegistering)}
              disabled={isLoading}
            >
              {isRegistering
                ? "Đã có tài khoản? Đăng nhập"
                : "Chưa có tài khoản? Đăng ký"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AuthForm;
