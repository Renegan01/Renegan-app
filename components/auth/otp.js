import React, { useState, useEffect } from "react";
import { TouchableOpacity, View } from "react-native";
import { OtpInput, theme as OTPTheme } from "react-native-otp-entry";
import { useTheme } from "styled-components/native";
import styled from "styled-components/native";

export const Wrapper = styled.View`
  flex: 1;
  gap: 20px;
  margin-bottom: 12px;
`;

export const ResendWrapper = styled.View`
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
`;

export const ResendButton = styled.TouchableOpacity`
  margin-left: 10px;
`;

export const ResendButtonText = styled.Text`
  color: ${({ theme }) => theme.text_secondary};
  font-size: 14px;
`;

const OTPAuth = ({ otp, setOtp, onResend }) => {
  const theme = useTheme();

  const handleOtpChange = (text) => {
    setOtp(text);
  };

  const handleResendCode = () => {
    onResend();
  };

  const [resendTimer, setResendTimer] = useState(30);

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  return (
    <Wrapper>
      <OtpInput
        numberOfDigits={6}
        onTextChange={handleOtpChange}
        theme={{
          pinCodeTextStyle: { color: theme.text_primary },
          pinCodeContainerStyle: {
            borderRadius: 10,
            width: 50,
          },
        }}
        focusColor={theme.primary}
      />

      <ResendWrapper>
        <ResendButton onPress={handleResendCode} disabled={resendTimer > 0}>
          {resendTimer === 0 ? (
            <ResendButtonText style={{ color: theme.primary }}>
              Resend Code
            </ResendButtonText>
          ) : (
            <ResendButtonText>Resend Code in {resendTimer}'s</ResendButtonText>
          )}
        </ResendButton>
      </ResendWrapper>
    </Wrapper>
  );
};

export default OTPAuth;
