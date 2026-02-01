import React from "react";
import { Text } from "react-native";
import theme from "../theme";

const AppText = ({ children, style, variant = "body", ...props }) => {
  const fontSize = theme.typography[variant] || theme.typography.body;

  return (
    <Text
      style={[
        {
          color: theme.colors.textPrimary,
          fontSize,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

export default AppText;
