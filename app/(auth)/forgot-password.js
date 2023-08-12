import { View, Text, StatusBar } from "react-native";
import React, { useEffect, useState } from "react";
import styled, { useTheme } from "styled-components/native";
import { useThemeContext } from "../../context/themeContext";
import InputText from "../../components/text_fields/inputText";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { SendOtp, VerifyOtp, getUserFromEmail, resetPassword } from "../../api";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import OTPAuth from "../../components/auth/otp";
import Button from "../../components/buttons/button";
import { router } from "expo-router";

const Wrapper = styled.ScrollView`
  flex: 1;
  padding: 20% 0px;
  background-color: ${({ theme }) => theme.bg};
`;

const Logo = styled.Text`
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.primary};
  padding: 14px 0px;
`;

const BackButton = styled.TouchableOpacity`
  padding: 0px 8px;
`;

const HeadingText = styled.Text`
  font-size: 30px;
  font-weight: 700;
  color: ${({ theme }) => theme.text_primary};
`;

const SubHeadingText = styled.Text`
  font-size: 14px;
  font-weight: 400;
  color: ${({ theme }) => theme.text_secondary};
`;

const Errortext = styled.Text`
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.error};
  padding: 4px 0px;
`;
const Email = styled.Text`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.primary};
  padding: 4px 0px;
`;

const ViewFlex = styled.View`
  flex: 1;
  ${({ gap }) => gap && `gap: ${gap}px;`}
  ${({ padding }) => padding && `padding: ${padding}px;`}
`;

const ForgotPassword = () => {
  const theme = useTheme();
  const themeMode = useThemeContext();

  const [step, setStep] = useState(1);

  //Text Fields
  const [textInput, setTextInput] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [textError, setTextError] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setPasswordVisible] = useState(false);

  const [updatedData, setUpdatedData] = useState({
    id: "",
    type: "",
    password: "",
  });

  //Otp
  const [otp, setOtp] = useState("");

  // set text input
  const handleChange = (fieldName, value) => {
    setTextInput((prevState) => ({
      ...prevState,
      [fieldName]: value,
    }));
    setTextError((prevErrors) => ({
      ...prevErrors,
      [fieldName]: "", // Clear error when input changes
    }));
  };

  //Verifiers Functions
  const isEmailValid = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isPasswordValid = (password) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleVerifyEmail = () => {
    if (!textInput.email.trim()) {
      setTextError({ ...textError, email: "Email is required." });
    } else if (!isEmailValid(textInput.email)) {
      setTextError({ ...textError, email: "Invalid email format." });
    } else {
      getUserFromEmail({ email: textInput.email })
        .then((res) => {
          if (res.status === 200) {
            setError("");
            setLoading(false);
            setUpdatedData({
              ...updatedData,
              id: res.data.id,
              type: res.data.type,
            });
            setStep(2);
          }
        })
        .catch((error) => {
          setLoading(false);
          if (error.response) {
            setError(error.response.data.message);
          } else {
            setError(error.message);
          }
        });
    }
  };

  const handleSendOtp = async () => {
    setError("");
    setLoading(true);
    // Perform validation for email input
    SendOtp({ email: textInput.email })
      .then((res) => {
        setLoading(false);
        Toast.show({
          type: "success",
          text1: "OTP Sent",
          text2: `OTP has been sent to ${textInput.email}`,
        });
      })
      .catch((error) => {
        setLoading(false);
        Toast.show({
          type: "error",
          text1: error.message,
        });
        setError(error.message);
      });
  };

  const handleVerifyOtp = async () => {
    setError("");
    setLoading(true);
    if (!otp.trim() && otp.length !== 6) {
      setError("OTP is required.");
      setLoading(false);
      return;
    }
    // Perform validation for email input
    VerifyOtp({ otp: otp })
      .then((res) => {
        setLoading(false);
        setStep(3);
      })
      .catch((error) => {
        setLoading(false);
        Toast.show({
          type: "error",
          text1: error.message,
        });
        setError(error.message);
      });
  };

  useEffect(() => {
    if (step === 2) {
      handleSendOtp();
    }
  }, [step]);

  // handle password

  const handelPassword = async () => {
    setError("");

    if (!textInput.confirmPassword.trim()) {
      setTextError({
        ...textError,
        confirmPassword: "Confirm Password is required.",
      });
    }

    if (!textInput.password.trim()) {
      setTextError({ ...textError, password: "Password is required." });
    }

    if (!isPasswordValid(textInput.password)) {
      setTextError({
        ...textError,
        password:
          "Password must have at least 8 characters, one uppercase letter, one lowercase letter, one digit, and one special character.",
      });
    }

    if (
      textInput.confirmPassword.trim() &&
      textInput.password.trim() &&
      isPasswordValid(textInput.password) &&
      textInput.password !== textInput.confirmPassword
    ) {
      setTextError({
        ...textError,
        password: "Password and Confirm Password must be same.",
        confirmPassword: "Password and Confirm Password must be same.",
      });
    }

    if (
      textInput.confirmPassword.trim() &&
      textInput.password.trim() &&
      isPasswordValid(textInput.password) &&
      textInput.password === textInput.confirmPassword
    ) {
      setTextError({
        ...textError,
        password: "",
        confirmPassword: "",
      });
      setLoading(true);

      await resetPassword({ ...updatedData, password: textInput.password })
        .then((res) => {
          if (res.status === 200) {
            setError("");
            setLoading(false);
            Toast.show({
              type: "success",
              text1: "Password Reset",
              text2: `Password has been reset successfully`,
            });
            router.replace("/sign-in");
          }
        })
        .catch((error) => {
          setLoading(false);
          if (error.response) {
            setError(error.response.data.message);
          } else {
            setError(error.message);
          }
        });
    }
  };

  //handel steps
  const handleStepSubmit = () => {
    switch (step) {
      case 1:
        // Perform validation for email input
        handleVerifyEmail();
        break;
      case 2:
        // Perform validation for email input
        handleVerifyOtp();
        break;
      case 3:
        // Perform validation for OTP input
        handelPassword();
        break;
      default:
        break;
    }
  };
  const handleBack = () => {
    if (step === 1) router.replace("/sign-in");
    else setStep((prevStep) => Math.max(prevStep - 1, 1));
  };

  return (
    <Wrapper>
      <StatusBar
        barStyle={
          themeMode.theme === "light" ? "dark-content" : "light-content"
        }
        backgroundColor={theme.bg} // Set the status bar color based on the theme
      />
      <BackButton onPress={handleBack}>
        <Icon name="chevron-left" size={32} color={theme.text_primary} />
      </BackButton>

      <ViewFlex padding={16} gap={4}>
        <Logo>Renegan</Logo>
        {step === 1 && (
          <>
            <HeadingText>Forgot Your Password 🔑</HeadingText>
            <SubHeadingText>
              Please Enter Your University Mail Id to reset your password.
            </SubHeadingText>
          </>
        )}
        {step === 2 && (
          <>
            <HeadingText>Verify Your Email 📧</HeadingText>
            <SubHeadingText>
              Please enter the One-Time Password (OTP) sent to your email
              address.
            </SubHeadingText>
            <Email>{textInput.email}</Email>
          </>
        )}
        {step === 3 && (
          <>
            <HeadingText>Update your Password 🔒</HeadingText>
            <SubHeadingText>
              Please create a new strong password to secure your account.
            </SubHeadingText>
          </>
        )}
      </ViewFlex>

      <ViewFlex padding={16} gap={16}>
        <ViewFlex gap={10}>
          {step === 1 && (
            <InputText
              startIcon={
                <Icon
                  name="email-outline"
                  size={24}
                  color={theme.text_secondary}
                />
              }
              value={textInput.email}
              onChangeText={(text) => handleChange("email", text)}
              placeholder="Enter email address"
              label="Email Address"
              type={"email-address"}
              error={textError.email}
            />
          )}
          {step === 2 && (
            <>
              <OTPAuth
                otp={otp}
                setOtp={setOtp}
                onResend={() => handleSendOtp()}
              />
            </>
          )}
          {step === 3 && (
            <>
              <InputText
                startIcon={
                  <Icon
                    name="lock-outline"
                    size={24}
                    color={theme.text_secondary}
                  />
                }
                value={textInput.password}
                onChangeText={(text) => handleChange("password", text)}
                secureTextEntry={!isPasswordVisible}
                placeholder="Enter password"
                label="Password"
                type={"default"}
                error={textError.password}
              />
              <InputText
                startIcon={
                  <Icon
                    name="lock-outline"
                    size={24}
                    color={theme.text_secondary}
                  />
                }
                value={textInput.confirmPassword}
                onChangeText={(text) => handleChange("confirmPassword", text)}
                secureTextEntry={!isPasswordVisible}
                placeholder="Confirm password"
                label="Confirm Password"
                type={"default"}
                error={textError.confirmPassword}
              />
            </>
          )}
        </ViewFlex>

        {error && <Errortext>{error}</Errortext>}
        {/* Continue button should submit the current step */}
        <Button
          type="filled"
          color={theme.white}
          bgcolor={theme.primary}
          loading={loading}
          onPress={handleStepSubmit}
        >
          {step === 3 ? "Update Password" : "Continue"}
        </Button>
      </ViewFlex>
    </Wrapper>
  );
};

export default ForgotPassword;
