import React, { useState } from "react";
import { View, Text, StatusBar, StyleSheet } from "react-native";
import InputText from "../../components/text_fields/inputText";
import Button from "../../components/buttons/button";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native-gesture-handler";
import { useAuth } from "../../context/auth";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import styled, { useTheme } from "styled-components/native";
import { Image } from "react-native-elements";
import TextButton from "../../components/buttons/textButton";
import { useThemeContext } from "../../context/themeContext";
import { router } from "expo-router";
import { SignInApi } from "../../api";

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
`;

const ForgotButton = styled.View`
  justify-content: flex-end;
  align-items: flex-end;
  padding: 0px 8px;
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

const ViewFlex = styled.View`
  flex: 1;
  ${({ gap }) => gap && `gap: ${gap}px;`}
  ${({ padding }) => padding && `padding: ${padding}px;`}
`;

const SignIn = () => {
  const theme = useTheme();
  const themeMode = useThemeContext();
  const { signIn } = useAuth();
  const { toggleTheme } = useThemeContext();

  // Text input state
  const [textInput, setTextInput] = useState({
    email: "",
    password: "",
  });

  // Text error state
  const [textError, setTextError] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [isPasswordVisible, setPasswordVisible] = useState(false);

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

  const handleSignIn = () => {
    setError("");
    if (!isEmailValid(textInput.email)) {
      setTextError({ ...textError, email: "Invalid email format." });
    } else if (!textInput.password.trim()) {
      setTextError({ ...textError, password: "Password is required." });
    } else if (!textInput.email.trim()) {
      setTextError({ ...textError, email: "Email is required." });
    } else {
      setTextError({ ...textError, email: "", password: "" });
      setLoading(true);
      SignInApi({ email: textInput.email, password: textInput.password })
        .then((res) => {
          setLoading(false);
          if (res.status === 200)
            signIn({ token: res.data.token, data: res.data.user });
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

  const gotToSignUp = () => {
    router.replace("/sign-up");
  };

  const gotToForgotPassword = () => {
    router.replace("/forgot-password");
  };

  return (
    <Wrapper>
      <StatusBar
        barStyle={
          themeMode.theme === "light" ? "dark-content" : "light-content"
        }
        backgroundColor={theme.bg} // Set the status bar color based on the theme
      />
      <ViewFlex padding={16} gap={4}>
        <Logo>Renegan</Logo>
        <HeadingText>Welcome Back 👋</HeadingText>
        <SubHeadingText>
          Welcome Back, Please Enter Your University Mail Id{" "}
        </SubHeadingText>
      </ViewFlex>
      <ViewFlex padding={16} gap={16}>
        <ViewFlex gap={10}>
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

          {error && <Errortext>{error}</Errortext>}
        </ViewFlex>
        <ForgotButton>
          <TextButton
            onPress={gotToForgotPassword}
            label="Forgot Password?"
            color={theme.primary}
            disabled={false}
            enabled={true}
          />
        </ForgotButton>
        <Button
          type="filled"
          color={theme.white}
          bgcolor={theme.primary}
          loading={loading}
          onPress={handleSignIn}
        >
          Continue
        </Button>

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
            onPress={handleSignIn}
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
            onPress={handleSignIn}
          >
            Microsoft
          </Button>
        </SocialAuth>
        <AlreadyAccount>
          <Txt>Don't have an account on Renegan? </Txt>
          <TextButton
            label="Sign Up"
            color={theme.primary}
            disabled={false}
            enabled={true}
            onPress={gotToSignUp}
          />
        </AlreadyAccount>
      </ViewFlex>
    </Wrapper>
  );
};

export default SignIn;
