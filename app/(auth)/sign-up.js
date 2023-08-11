import React, { useEffect, useState } from "react";
import { Modal, View, Text, StatusBar, TouchableOpacity } from "react-native";
import InputText from "../../components/text_fields/inputText";
import Button from "../../components/buttons/button";
import { useAuth } from "../../context/auth";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import styled, { useTheme } from "styled-components/native";
import { Image } from "react-native-elements";
import TextButton from "../../components/buttons/textButton";
import { useThemeContext } from "../../context/themeContext";
import { router } from "expo-router";
import OTPAuth from "../../components/auth/otp";
import { EmailDomainVerify, SendOtp, VerifyOtp } from "../../api";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import { set } from "react-native-reanimated";
import CollegeConfirmationDialog from "../../components/dialogs/collegeConfirmation";

const Container = styled.ScrollView`
  flex: 1;
  padding: 50px 0px;
  background-color: ${({ theme }) => theme.bg};
`;

const Wrapper = styled.View`
  flex: 1;
  ${({ padding }) => padding && `padding: ${padding}px`};
  ${({ gap }) => gap && `gap: ${gap}px`};
`;

const BackButton = styled.TouchableOpacity`
  padding: 0px 8px;
`;

const Logo = styled.Text`
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.primary};
  padding: 14px 0px;
`;

const Verified = styled.View`
  justify-content: center;
  align-items: center;
  border-radius: 50px;
  background-color: #27ae60;
  height: 22px;
  width: 22px;
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

  span {
    font-weight: 700;
    color: ${({ theme }) => theme.primary};
  }
`;

const Email = styled.Text`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.primary};
  padding: 4px 0px;
`;

const Seperator = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0px 50px;
  gap: 12px;
`;

const Hr = styled.View`
  height: 1px;
  width: 30%;
  background-color: ${({ theme }) => theme.text_secondary_light};
`;

const OrText = styled.Text`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.text_secondary};
`;

const SocialAuth = styled.View`
  flex-direction: row;
  width: 100%;
  gap: 8px;
`;

const AlreadyAccount = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 12px 8px;
`;

const Txt = styled.Text`
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

const SignUp = () => {
  const theme = useTheme();
  const themeMode = useThemeContext();
  const { signIn } = useAuth();
  const { toggleTheme } = useThemeContext();
  const [userType, setUserType] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false); // For social auth buttons
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);

  //dialog
  const [showConfirmationDialog, setShowConfirmationDialog] = useState({
    show: false,
    data: null,
  });
  const handleConfirmUserType = () => {
    setShowConfirmationDialog({ show: false, data: null }); // Close the confirmation dialog
    setStep(3); // Move to step 2
  };

  const handleCancelUserType = () => {
    setShowConfirmationDialog({ show: false, data: null }); // Close the confirmation dialog
    // Optionally, you can reset the selected userType or take other actions
  };

  // Text input state
  const [textInput, setTextInput] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  });

  // Text error state
  const [textError, setTextError] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  });

  //otp
  const [otp, setOtp] = useState("");

  const handleUserTypeSelection = (type) => {
    setUserType(type);
    setStep(2); // Move to the next step of account creation
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

  const handleProfilePictureUpload = (pictureData) => {
    // Handle the uploaded profile picture here, you can store it in state
    setProfilePicture(pictureData);
  };

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

  const handleBack = () => {
    setStep((prevStep) => Math.max(prevStep - 1, 1));
  };

  //Step 2 Verify Email Domain
  const handleVerifyEmail = async () => {
    // Perform validation for email input
    setError("");
    if (!textInput.email.trim()) {
      setTextError({ ...textError, email: "Email is required." });
    } else if (!isEmailValid(textInput.email)) {
      setTextError({ ...textError, email: "Invalid email format." });
    } else {
      setTextError({ ...textError, email: "" });

      setLoading(true);
      EmailDomainVerify({ email: textInput.email })
        .then((res) => {
          setLoading(false);
          if (res.status === 200)
            setShowConfirmationDialog({ show: true, data: res.data.college });
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
    // Perform validation for email input
    VerifyOtp({ otp: otp })
      .then((res) => {
        setLoading(false);
        setStep(4);
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

  const handelPassword = () => {
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
      setStep(5); // Move to the next step
    }
  };

  useEffect(() => {
    if (step === 3) {
      handleSendOtp();
    }
  }, [step]);

  // Define a function to handle each step submission
  const handleStepSubmit = () => {
    switch (step) {
      case 2:
        // Perform validation for email input
        handleVerifyEmail();
        break;
      case 3:
        // Perform validation for OTP input
        handleVerifyOtp();
        break;
      case 4:
        handelPassword();
        break;
      case 5:
        // Perform validation for full name input
        if (!textInput.fullName.trim()) {
          setTextError({ ...textError, fullName: "Full name is required." });
        } else {
          setTextError({ ...textError, fullName: "" });
          handleSignUp(); // Proceed to sign-up process when all steps are completed
        }
        break;
      default:
        break;
    }
  };

  const handleSignUp = () => {
    toggleTheme();
    signIn();
  };

  const gotToSignIn = () => {
    router.replace("/sign-in");
  };

  return (
    <Container>
      <StatusBar
        barStyle={
          themeMode.theme === "light" ? "dark-content" : "light-content"
        }
        backgroundColor={theme.bg} // Set the status bar color based on the theme
      />
      {
        // If the current step is not the first step, show the back button
        step > 1 && (
          <BackButton onPress={handleBack}>
            <Icon name="chevron-left" size={32} color={theme.text_primary} />
          </BackButton>
        )
      }
      <Wrapper padding={16} gap={16}>
        <Logo>Renegan</Logo>
        {step === 1 && (
          <>
            <HeadingText>Choose Account Type 🚀</HeadingText>
            <SubHeadingText>
              Let us know if you are a Student, Society / Clubs or a University.
            </SubHeadingText>
          </>
        )}
        {step === 2 && (
          <>
            <HeadingText>
              Create
              {userType === "student"
                ? " Student "
                : userType === "society"
                ? " Society / Clubs "
                : userType === "university"
                ? " University "
                : ""}
              Account
            </HeadingText>
            <SubHeadingText>
              {userType === "student"
                ? "Please enter your university email address to create a student account."
                : userType === "society"
                ? "Please enter your Lead / Coordinator's university email address to create a society / clubs account."
                : userType === "university"
                ? "Please enter your university email address to create a university account."
                : ""}
            </SubHeadingText>
          </>
        )}
        {step === 3 && (
          <>
            <HeadingText>Verify Your Email 📧</HeadingText>
            <SubHeadingText>
              Please enter the One-Time Password (OTP) sent to your email
              address.
            </SubHeadingText>
            <Email>{textInput.email}</Email>
          </>
        )}
        {step === 4 && (
          <>
            <HeadingText>Create a Password 🔒</HeadingText>
            <SubHeadingText>
              Please create a new strong password to secure your account.
            </SubHeadingText>
          </>
        )}
        {step === 5 && (
          <>
            <HeadingText>Add Your Details ✍️</HeadingText>
            <SubHeadingText>
              Add details and information’s about yourself
            </SubHeadingText>
          </>
        )}
      </Wrapper>
      <Wrapper padding={16} gap={16}>
        <Wrapper gap={16}>
          {step === 1 && (
            <>
              <Button
                type="outlined"
                bordercolor={theme.text_secondary_light}
                color={theme.text_secondary}
                startIcon={<Text>👨‍🎓</Text>}
                endIcon={
                  <Icon
                    name="chevron-right"
                    size={24}
                    color={theme.text_secondary}
                  />
                }
                textStart={true}
                onPress={() => handleUserTypeSelection("student")}
              >
                University Student
              </Button>
              <Button
                type="outlined"
                bordercolor={theme.text_secondary_light}
                color={theme.text_secondary}
                startIcon={<Text>💫</Text>}
                endIcon={
                  <Icon
                    name="chevron-right"
                    size={24}
                    color={theme.text_secondary}
                  />
                }
                textStart={true}
                onPress={() => handleUserTypeSelection("society")}
              >
                Society / Clubs
              </Button>
              <Button
                type="outlined"
                bordercolor={theme.text_secondary_light}
                color={theme.text_secondary}
                startIcon={<Text>🏛</Text>}
                endIcon={
                  <Icon
                    name="chevron-right"
                    size={24}
                    color={theme.text_secondary}
                  />
                }
                textStart={true}
                onPress={() => handleUserTypeSelection("university")}
              >
                University / College
              </Button>
            </>
          )}
          {step === 2 && (
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
          {step === 3 && (
            <>
              <OTPAuth
                otp={otp}
                setOtp={setOtp}
                onResend={() => handleSendOtp()}
              />
            </>
          )}
          {step === 4 && (
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
          {step === 5 && (
            <>
              <InputText
                startIcon={
                  <Icon
                    name="pencil-outline"
                    size={24}
                    color={theme.text_secondary}
                  />
                }
                value={textInput.username}
                onChangeText={(text) => handleChange("username", text)}
                placeholder="Enter a username"
                label="Userame"
                type={"default"}
                error={textError.username}
              />
              <InputText
                startIcon={
                  <Icon
                    name="account-outline"
                    size={24}
                    color={theme.text_secondary}
                  />
                }
                value={textInput.fullName}
                onChangeText={(text) => handleChange("fullName", text)}
                placeholder="Enter your full name"
                label="Full Name"
                type={"default"}
                error={textError.fullName}
              />

              {/* Upload Profile Picture */}
              {/* <View>
                {profilePicture ? (
                  <Image
                    source={{ uri: profilePicture }}
                    style={{ width: 100, height: 100, borderRadius: 50 }}
                  />
                ) : (
                  <TextButton
                    label="Upload Profile Picture"
                    color={theme.primary}
                    disabled={false}
                    enabled={true}
                    onPress={() => {
                      // Simulate the image upload. In your real implementation, you would use a library like react-native-image-picker to handle image selection and upload.
                      handleProfilePictureUpload(
                        "data:image/png;base64, YOUR_BASE64_ENCODED_IMAGE_DATA"
                      );
                    }}
                  />
                )}
              </View> */}
            </>
          )}
        </Wrapper>

        {error && <Errortext style={{ color: "red" }}>{error}</Errortext>}
        {/* Continue button should submit the current step */}
        {step > 1 && (
          <Button
            type="filled"
            color={theme.white}
            bgcolor={theme.primary}
            loading={loading}
            onPress={handleStepSubmit}
          >
            {step === 5 ? "Submit" : "Continue"}
          </Button>
        )}

        {step === 2 && (
          <>
            <Seperator>
              <Hr />
              <OrText>Or Continue With</OrText>
              <Hr />
            </Seperator>
            <SocialAuth>
              <Button
                startIcon={
                  <Image
                    source={require("../../assets/icons/Google.png")}
                    style={{ width: 20, height: 20 }}
                  />
                }
                type="outlined"
                bordercolor={theme.text_secondary_light}
                color={theme.text_secondary}
                loading={socialLoading}
                onPress={handleSignUp}
              >
                Google
              </Button>
              <Button
                startIcon={
                  <Image
                    source={require("../../assets/icons/Microsoft.png")}
                    style={{ width: 20, height: 20 }}
                  />
                }
                type="outlined"
                bordercolor={theme.text_secondary_light}
                color={theme.text_secondary}
                loading={socialLoading}
                onPress={handleSignUp}
              >
                Microsoft
              </Button>
            </SocialAuth>
          </>
        )}

        {(step === 1 || step === 2) && (
          <AlreadyAccount>
            <Txt>Already have an account on Renegan? </Txt>
            <TextButton
              label="Sign In"
              color={theme.primary}
              disabled={false}
              enabled={true}
              onPress={gotToSignIn}
            />
          </AlreadyAccount>
        )}
      </Wrapper>
      <CollegeConfirmationDialog
        visible={showConfirmationDialog.show}
        onConfirm={handleConfirmUserType}
        onCancel={handleCancelUserType}
        data={showConfirmationDialog.data}
      />
    </Container>
  );
};

export default SignUp;
