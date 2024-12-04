// Author: Nong Hoang Vu || JavaTech
// Facebook:https://facebook.com/NongHoangVu04
// Github: https://github.com/JavaTech04
// Youtube: https://www.youtube.com/@javatech04/?sub_confirmation=1
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import {
  Box,
  Button,
  Input,
  Typography,
  FormControl,
  FormLabel,
  FormHelperText,
  IconButton,
} from "@mui/joy";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from "react-toastify";
import { AccountCircle, Email, Home, Lock, Search } from "@mui/icons-material";
import { apiKey } from "../utils/constants";
import logo from "./../assert/sol.png";

const apiBaseUrl = "https://api.gameshift.dev/nx/users";

const AuthForm = ({ setIsLoggedIn, setUserData }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPhantomInstalled, setIsPhantomInstalled] = useState(false);

  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const checkPhantomWallet = () => {
      const { solana } = window;
      setIsPhantomInstalled(!!(solana && solana.isPhantom));
    };

    checkPhantomWallet();
  }, []);

  const connectPhantomWallet = async () => {
    if (!isPhantomInstalled) {
      toast.error("Phantom Wallet chưa được cài đặt!");
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

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      if (isRegistering) {
        const walletAddress = await connectPhantomWallet();
        if (!walletAddress) {
          setIsLoading(false);
          return;
        }

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
            referenceId: data.referenceId,
            email: data.email,
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
          `${apiBaseUrl}/${data.referenceId}`,
          config
        );

        if (response.data.email !== data.email) {
          toast.error("Email không hợp lệ");
          return;
        }

        toast.success("Đăng nhập thành công!");
      }

      setTimeout(() => {
        setUserData(data);
        setIsLoggedIn(true);
      }, 1500);
    } catch (e) {
      toast.error(e?.response?.data?.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        height: "100vh",
        backgroundImage:
          'url("https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExMHhxNHA5dmVhZWlpaHJiNHF5Y2t5enIwZzdrOXVrN28xdWVoMHd0aCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/doXBzUFJRxpaUbuaqz/giphy.webp")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backdropFilter: "blur(5px)",
      }}
    >
      <Box
        component="nav"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 3,
          py: 2,
          position: "fixed",
          width: "100%",
          zIndex: 1000,
          backdropFilter: "blur(10px)",
          color: "white",
        }}
      >
        {/* Logo */}
        <Box
          component="a"
          href="https://www.facebook.com/NongHoangVu04"
          sx={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <Box
            component="img"
            src={logo}
            alt="Logo"
            sx={{
              height: { xs: 30, md: 40 },
              width: { xs: 30, md: 40 },
              borderRadius: "50%",
              objectFit: "cover",
              mr: 1,
            }}
          />
          <Typography
            sx={{
              fontWeight: "bold",
              fontSize: { xs: "1.25rem", md: "1.5rem" },
              background: "linear-gradient(to right, #0072ff, #00c6ff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0px 0px 5px rgba(0, 183, 255, 0.8)",
            }}
          >
            SOLANA UDPM 9
          </Typography>
        </Box>

        {/* Desktop Navigation Links */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            gap: { md: 4 },
          }}
        >
          {["Trang chủ", "Tính năng", "Giới thiệu", "Liên hệ"].map(
            (link, index) => (
              <Typography
                key={index}
                component="a"
                href={`#${link.toLowerCase().replace(/\s/g, "-")}`}
                sx={{
                  color: "rgba(255, 255, 255, 0.8)",
                  fontWeight: "500",
                  textDecoration: "none",
                  fontSize: "1rem",
                  position: "relative",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    width: "0%",
                    height: "2px",
                    bottom: "-2px",
                    left: 0,
                    background: "linear-gradient(to right, #0072ff, #00c6ff)",
                    transition: "width 0.3s",
                  },
                  "&:hover::after": {
                    width: "100%",
                  },
                }}
              >
                {link}
              </Typography>
            )
          )}
        </Box>

        {/* CTA Button */}
        <Button
          variant="soft"
          sx={{
            display: { xs: "none", md: "block" },
            background: "linear-gradient(to right, #0072ff, #00c6ff)",
            color: "white",
            fontWeight: "bold",
            textTransform: "uppercase",
            "&:hover": {
              opacity: 0.9,
            },
          }}
          onClick={() => setIsRegistering(!isRegistering)}
        >
          {isRegistering ? "Đăng nhâp" : "Đăng ký"}
        </Button>

        {/* Mobile Hamburger Menu */}
        <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center" }}>
          <IconButton onClick={toggleMobileMenu} color="inherit">
            {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
        </Box>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <Box
            sx={{
              position: "absolute",
              top: "100%",
              left: 0,
              width: "100%",
              background: "rgba(10, 25, 47, 0.95)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 2,
              zIndex: 999,
            }}
          >
            {["Trang chủ", "Tính năng", "Giới thiệu", "Liên hệ"].map(
              (link, index) => (
                <Typography
                  key={index}
                  component="a"
                  href={`#${link.toLowerCase().replace(/\s/g, "-")}`}
                  onClick={toggleMobileMenu}
                  sx={{
                    color: "rgba(255, 255, 255, 0.8)",
                    fontWeight: "500",
                    textDecoration: "none",
                    fontSize: "1rem",
                    my: 1,
                    "&:hover": { color: "#0072ff" },
                  }}
                >
                  {link}
                </Typography>
              )
            )}
            <Button
              variant="soft"
              href="#register"
              onClick={() => setIsRegistering(!isRegistering)}
              sx={{
                mt: 2,
                background: "linear-gradient(to right, #0072ff, #00c6ff)",
                color: "white",
                fontWeight: "bold",
                textTransform: "uppercase",
                "&:hover": {
                  opacity: 0.9,
                },
              }}
            >
              {isRegistering ? "Đăng nhâp" : "Đăng ký"}
            </Button>
          </Box>
        )}
      </Box>
      <Box
        component="div"
        sx={{
          flex: 1,
          display: "flex",
          width: "100%",
          backdropFilter: "blur(5px)",
          color: "white",
          justifyContent: "center",
          alignItems: "center",
          padding: { xs: 2, md: 0 },
        }}
      >
        {/* Left Section: Title and Description */}
        <Box
          sx={{
            flex: 1,
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            padding: { xs: 2, md: 4 },
            color: "white",
            textAlign: { xs: "center", md: "left" },
          }}
        >
          {/* Main Heading */}
          <Typography
            level="h1"
            sx={{
              color: "#fff",
              mb: 1.5,
              fontWeight: "bold",
              textShadow: "2px 2px 4px rgba(0,0,0,0.6)",
              fontSize: { xs: "1.5rem", md: "2.5rem" },
            }}
          >
            Ứng dụng thuê nhà tiên phong với NFT
          </Typography>

          {/* Subheading */}
          <Typography
            level="h2"
            sx={{
              color: "rgba(200, 200, 255, 0.9)",
              mb: 3,
              fontSize: { xs: 12, md: 16 },
              maxWidth: { xs: "100%", md: 600 },
              textShadow: "1px 1px 3px rgba(0,0,0,0.5)",
            }}
          >
            Tận dụng sức mạnh blockchain để bảo vệ thông tin, nâng cao minh bạch
            và tối ưu hóa giao dịch thuê nhà của bạn.
          </Typography>

          {/* CTA Description */}
          <Typography
            level="body1"
            sx={{
              mb: 3,
              fontSize: { xs: 12, md: 16 },
              maxWidth: { xs: "100%", md: 600 },
              lineHeight: 1.8,
              textShadow: "1px 1px 3px rgba(0,0,0,0.5)",
            }}
          >
            Với công nghệ NFT và blockchain, mỗi giao dịch đều được mã hóa, đảm
            bảo an toàn và đáng tin cậy.{" "}
            <Typography
              component="a"
              href="https://www.facebook.com/NongHoangVu04"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: "cyan",
                fontWeight: "bold",
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Tìm hiểu thêm
            </Typography>
          </Typography>

          {/* Divider */}
          <Box
            sx={{
              width: "80%",
              height: 2,
              bgcolor: "rgba(255, 255, 255, 0.2)",
              my: 2,
            }}
          />

          {/* Feature List with MUI Icons */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[
              {
                text: "Giao dịch minh bạch với blockchain",
                icon: <Lock sx={{ fontSize: 30, color: "white" }} />,
              },
              {
                text: "Tài sản NFT đại diện quyền sở hữu",
                icon: <Home sx={{ fontSize: 30, color: "white" }} />,
              },
              {
                text: "Đăng ký và quản lý giao dịch dễ dàng",
                icon: <Search sx={{ fontSize: 30, color: "white" }} />,
              },
            ].map((feature, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                  padding: 2,
                  borderRadius: 50,
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                  transition: "all 0.3s",
                  "&:hover": { transform: "scale(1.05)" },
                }}
              >
                {feature.icon}
                <Typography
                  level="body2"
                  sx={{
                    fontSize: { xs: 12, md: 16 },
                    color: "rgba(255,255,255,0.9)",
                  }}
                >
                  {feature.text}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Call to Action Button */}
          <Button
            variant="soft"
            sx={{
              mt: 4,
              px: 4,
              py: 1.5,
              fontSize: { xs: 14, md: 18 },
              fontWeight: "bold",
              color: "white",
              background: "linear-gradient(to right, #0072ff, #00c6ff)",
              borderRadius: "30px",
              boxShadow: "0 5px 15px rgba(0, 123, 255, 0.5)",
              "&:hover": {
                background: "linear-gradient(to right, #0056cc, #0099ff)",
              },
            }}
            href="https://www.facebook.com/NongHoangVu04"
            target="_blank"
          >
            Bắt đầu hành trình với chúng tôi
          </Button>
        </Box>

        {/* Right Section: Login/Register Form */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: { xs: 2, md: 0 },
          }}
        >
          <Box
            sx={{
              maxWidth: 420,
              width: "100%",
              p: { xs: 2, md: 4 },
              borderRadius: 50,
              backgroundColor: "rgba(4 106 255 / 19%)",
              color: "white",
              boxShadow: "0px 8px 24px rgb(174 190 238)",
              position: "relative",
              overflow: "hidden",
              zIndex: 1,
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            {/* Title */}
            <Typography
              level="h4"
              textAlign="center"
              fontWeight="bold"
              mb={2}
              sx={{
                color: "#fff",
                fontSize: { xs: "1.5rem", md: "1.75rem" },
                textShadow: "0px 4px 6px rgba(0, 0, 0, 0.6)",
              }}
            >
              {isRegistering ? "ĐĂNG KÝ" : "ĐĂNG NHẬP"}
            </Typography>

            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Username Input */}
              <FormControl sx={{ mb: 3 }} error={!!errors.referenceId}>
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
                  {...register("referenceId", {
                    required: "Tên tài khoản là bắt buộc.",
                    minLength: {
                      value: 3,
                      message: "Tên tài khoản phải có ít nhất 3 ký tự.",
                    },
                  })}
                  placeholder="Tên tài khoản"
                  disabled={isLoading}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.1)",
                    color: "white",
                    borderRadius: 10,
                    padding: "12px",
                    "&:hover": {
                      borderColor: "rgba(0, 123, 255, 0.6)",
                      backgroundColor: "rgba(255,255,255,0.2)",
                    },
                    "::placeholder": { color: "rgba(255,255,255,0.6)" },
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                  }}
                />
                {errors.referenceId && (
                  <FormHelperText>{errors.referenceId.message}</FormHelperText>
                )}
              </FormControl>

              {/* Email Input */}
              <FormControl sx={{ mb: 3 }} error={!!errors.email}>
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
                  {...register("email", {
                    required: "Email là bắt buộc.",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Email không hợp lệ.",
                    },
                  })}
                  placeholder="Nhập email"
                  disabled={isLoading}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.1)",
                    color: "white",
                    borderRadius: 10,
                    padding: "12px",
                    "&:hover": {
                      borderColor: "rgba(0, 123, 255, 0.6)",
                      backgroundColor: "rgba(255,255,255,0.2)",
                    },
                    "::placeholder": { color: "rgba(255,255,255,0.6)" },
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                  }}
                />
                {errors.email && (
                  <FormHelperText>{errors.email.message}</FormHelperText>
                )}
              </FormControl>

              {/* Submit Button */}
              <Button
                variant="solid"
                fullWidth
                type="submit"
                color={isRegistering ? "dark" : "primary"}
                disabled={isLoading || (isRegistering && !isPhantomInstalled)}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: { xs: 14, md: 18 },
                  fontWeight: "bold",
                  color: "white",
                  background: "linear-gradient(to right, #0072ff, #00c6ff)",
                  borderRadius: "30px",
                  boxShadow: "0 5px 15px rgba(0, 123, 255, 0.5)",
                  "&:hover": {
                    background: "linear-gradient(to right, #0056cc, #0099ff)",
                  },
                }}
              >
                {isLoading
                  ? "Đang xử lý..."
                  : isRegistering
                  ? "Đăng ký"
                  : "Đăng nhập"}
              </Button>
            </form>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AuthForm;
