import { StyleSheet } from "react-native";
import { verticalScale } from "./scaling";

const globalStyles = StyleSheet.create({
   bgWhite: {
      backgroundColor: 'white'
   },
   flex: {
      flex: 1,
   },
   mb24: {
      marginBottom: verticalScale(24)
   }
});

export default globalStyles;