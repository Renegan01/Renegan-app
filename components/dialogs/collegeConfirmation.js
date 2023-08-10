import { Modal, Text, View } from "react-native";
import React from "react";
import styled, { useTheme } from "styled-components/native";
import Button from "../buttons/button";
import { Icon } from "react-native-elements";

//Dialog
const DialogContainer = styled.View`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

const Dialog = styled.View`
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  width: 95%;
  elevation: 5;
  gap: 2px;
`;

const Label = styled.View`
  flex-direction: row;
  gap: 8px;
  margin-bottom: 6px;
  align-items: center;
`;

const LabelText = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.text_primary + 90};
`;

const DialogTitle = styled.Text`
  font-size: 18px;
  color: ${({ theme }) => theme.text_primary};
  font-weight: 600;
`;

const Country = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.text_primary + 80};
  margin-bottom: 4px;
  font-weight: 500;
`;

const Des = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.text_secondary};
  margin-bottom: 22px;
`;

const Flex = styled.View`
  flex-direction: row;
  justify-content: space-between;
  gap: 12px;
`;

const Verified = styled.View`
  justify-content: center;
  align-items: center;
  border-radius: 50px;
  background-color: #27ae60;
  height: 16px;
  width: 16px;
`;
const CollegeConfirmationDialog = ({ visible, onCancel, onConfirm, data }) => {
  const theme = useTheme();
  return (
    <Modal visible={visible} transparent>
      <DialogContainer>
        <Dialog>
          <Label>
            <LabelText>College Details</LabelText>
            <Verified>
              <Icon name="check" size={8} color="white" />
            </Verified>
          </Label>
          <DialogTitle>{data?.name}</DialogTitle>
          <Country>Country: {data?.country}</Country>
          <Des>
            If you are from this college click confirm to proceed further. If
            not provide your correct college Email Id.
          </Des>
          <Flex>
            <Button
              type="outlined"
              bordercolor={theme.text_secondary_light}
              color={theme.text_secondary}
              loading={false}
              onPress={onCancel}
              paddingVertical={12}
            >
              Cancel
            </Button>
            <Button
              type="filled"
              color={theme.white}
              bgcolor={theme.primary}
              paddingVertical={12}
              loading={false}
              onPress={onConfirm}
            >
              Confirm
            </Button>
          </Flex>
        </Dialog>
      </DialogContainer>
    </Modal>
  );
};

export default CollegeConfirmationDialog;
