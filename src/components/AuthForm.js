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
} from "@mui/joy";
import { toast } from "react-toastify";
import { AccountCircle, Email } from "@mui/icons-material";
import { apiKey } from "../api";

const apiBaseUrl = "https://api.gameshift.dev/nx/users";

const AuthForm = ({ setIsLoggedIn, setUserData }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPhantomInstalled, setIsPhantomInstalled] = useState(false);

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
    // <Box
    //   sx={{
    //     display: "flex",
    //     height: "100vh",
    //     backgroundImage:
    //       'url("https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExMHhxNHA5dmVhZWlpaHJiNHF5Y2t5enIwZzdrOXVrN28xdWVoMHd0aCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/doXBzUFJRxpaUbuaqz/giphy.webp")',
    //     backgroundSize: "cover",
    //     backgroundPosition: "center",
    //     backdropFilter: "blur(5px)",
    //   }}
    // >
    //   {/* Left Section: Title and Description */}
    //   <Box
    //     sx={{
    //       flex: 1,
    //       display: "flex",
    //       flexDirection: "column",
    //       justifyContent: "center",
    //       alignItems: "flex-start",
    //       padding: 5,
    //       color: "white",
    //       backdropFilter: "blur(5px)",
    //     }}
    //   >
    //     <Typography
    //       level="h1"
    //       sx={{
    //         color: "#fff",
    //         mb: 2,
    //         fontWeight: "bold",
    //         textShadow: "2px 2px 4px rgba(0,0,0,0.6)",
    //       }}
    //     >
    //       Ứng dụng cho thuê nhà dựa trên NFT
    //     </Typography>
    //     <Typography
    //       level="body1"
    //       sx={{
    //         mb: 4,
    //         fontSize: 18,
    //         maxWidth: 600,
    //         textShadow: "1px 1px 3px rgba(0,0,0,0.5)",
    //       }}
    //     >
    //       Nền tảng giúp bạn quản lý, tìm kiếm và theo dõi các giao dịch thuê nhà
    //       một cách dễ dàng và thuận tiện. Khám phá ngay!
    //     </Typography>
    //   </Box>

    //   {/* Right Section: Login/Register Form */}
    //   <Box
    //     sx={{
    //       flex: 1,
    //       display: "flex",
    //       justifyContent: "center",
    //       alignItems: "center",
    //       backdropFilter: "blur(5px)",
    //     }}
    //   >
    //     <Box
    //       sx={{
    //         maxWidth: 420,
    //         width: "100%",
    //         p: 4,
    //         borderRadius: 4,
    //         backgroundColor: "rgba(10, 25, 47, 0.95)",
    //         color: "white",
    //         boxShadow: "0px 8px 24px rgb(111 144 241)",
    //       }}
    //     >
    //       <Typography
    //         level="h4"
    //         textAlign="center"
    //         fontWeight="bold"
    //         mb={2}
    //         sx={{ color: "white" }}
    //       >
    //         {isRegistering ? "ĐĂNG KÝ" : "ĐĂNG NHẬP"}
    //       </Typography>
    //       <form onSubmit={handleSubmit(onSubmit)}>
    //         <FormControl sx={{ mb: 3 }} error={!!errors.referenceId}>
    //           <FormLabel sx={{ color: "rgba(255, 255, 255, 0.8)" }}>
    //             <AccountCircle
    //               sx={{
    //                 mr: 1,
    //                 verticalAlign: "middle",
    //                 color: "rgba(255,255,255,0.8)",
    //               }}
    //             />
    //             Tên tài khoản
    //           </FormLabel>
    //           <Input
    //             {...register("referenceId", {
    //               required: "Tên tài khoản là bắt buộc.",
    //               minLength: {
    //                 value: 3,
    //                 message: "Tên tài khoản phải có ít nhất 3 ký tự.",
    //               },
    //             })}
    //             placeholder="Tên tài khoản"
    //             disabled={isLoading}
    //             sx={{
    //               bgcolor: "rgba(255,255,255,0.1)",
    //               color: "white",
    //               "::placeholder": { color: "rgba(255,255,255,0.6)" },
    //             }}
    //           />
    //           {errors.referenceId && (
    //             <FormHelperText>{errors.referenceId.message}</FormHelperText>
    //           )}
    //         </FormControl>
    //         <FormControl sx={{ mb: 3 }} error={!!errors.email}>
    //           <FormLabel sx={{ color: "rgba(255, 255, 255, 0.8)" }}>
    //             <Email
    //               sx={{
    //                 mr: 1,
    //                 verticalAlign: "middle",
    //                 color: "rgba(255,255,255,0.8)",
    //               }}
    //             />
    //             Email
    //           </FormLabel>
    //           <Input
    //             {...register("email", {
    //               required: "Email là bắt buộc.",
    //               pattern: {
    //                 value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    //                 message: "Email không hợp lệ.",
    //               },
    //             })}
    //             placeholder="Nhập email"
    //             disabled={isLoading}
    //             sx={{
    //               bgcolor: "rgba(255,255,255,0.1)",
    //               color: "white",
    //               "::placeholder": { color: "rgba(255,255,255,0.6)" },
    //             }}
    //           />
    //           {errors.email && (
    //             <FormHelperText>{errors.email.message}</FormHelperText>
    //           )}
    //         </FormControl>
    //         <Button
    //           variant="solid"
    //           fullWidth
    //           type="submit"
    //           color={isRegistering ? "dark" : "primary"}
    //           disabled={isLoading || (isRegistering && !isPhantomInstalled)}
    //           sx={{
    //             background: isRegistering
    //               ? "linear-gradient(to right, #0072ff, #00c6ff)"
    //               : "linear-gradient(to right, #001f3f, #0072ff)",
    //             "&:hover": { opacity: 0.9 },
    //             color: "white",
    //           }}
    //         >
    //           {isLoading
    //             ? "Đang xử lý..."
    //             : isRegistering
    //             ? "Đăng ký"
    //             : "Đăng nhập"}
    //         </Button>
    //       </form>
    //       <Box sx={{ textAlign: "center", marginTop: 2 }}>
    //         <Button
    //           size="small"
    //           color="info"
    //           sx={{ color: "white" }}
    //           onClick={() => setIsRegistering(!isRegistering)}
    //           disabled={isLoading}
    //         >
    //           {isRegistering
    //             ? "Đã có tài khoản? Đăng nhập"
    //             : "Chưa có tài khoản? Đăng ký"}
    //         </Button>
    //       </Box>
    //     </Box>
    //   </Box>
    // </Box>
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
  {/* Left Section: Title and Description */}
  <Box
    sx={{
      flex: 1,
      display: { xs: "none", md: "flex" }, // Ẩn trên màn hình nhỏ
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "flex-start",
      padding: { xs: 2, md: 5 },
      color: "white",
      backdropFilter: "blur(5px)",
      textAlign: { xs: "center", md: "left" },
    }}
  >
    <Typography
      level="h1"
      sx={{
        color: "#fff",
        mb: 2,
        fontWeight: "bold",
        textShadow: "2px 2px 4px rgba(0,0,0,0.6)",
        fontSize: { xs: "1.5rem", md: "2.5rem" },
      }}
    >
      Ứng dụng cho thuê nhà dựa trên NFT
    </Typography>
    <Typography
      level="body1"
      sx={{
        mb: 4,
        fontSize: { xs: 14, md: 18 },
        maxWidth: { xs: "100%", md: 600 },
        textShadow: "1px 1px 3px rgba(0,0,0,0.5)",
      }}
    >
      Nền tảng giúp bạn quản lý, tìm kiếm và theo dõi các giao dịch thuê nhà
      một cách dễ dàng và thuận tiện. Khám phá ngay!
    </Typography>
  </Box>

  {/* Right Section: Login/Register Form */}
  <Box
    sx={{
      flex: 1,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backdropFilter: "blur(5px)",
      padding: { xs: 2, md: 0 },
    }}
  >
    <Box
      sx={{
        maxWidth: 420,
        width: "100%",
        p: { xs: 2, md: 4 },
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
        sx={{ color: "white", fontSize: { xs: "1.25rem", md: "1.5rem" } }}
      >
        {isRegistering ? "ĐĂNG KÝ" : "ĐĂNG NHẬP"}
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
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
              "::placeholder": { color: "rgba(255,255,255,0.6)" },
            }}
          />
          {errors.referenceId && (
            <FormHelperText>{errors.referenceId.message}</FormHelperText>
          )}
        </FormControl>
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
              "::placeholder": { color: "rgba(255,255,255,0.6)" },
            }}
          />
          {errors.email && (
            <FormHelperText>{errors.email.message}</FormHelperText>
          )}
        </FormControl>
        <Button
          variant="solid"
          fullWidth
          type="submit"
          color={isRegistering ? "dark" : "primary"}
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
