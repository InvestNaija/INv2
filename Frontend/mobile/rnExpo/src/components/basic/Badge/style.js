import { StyleSheet } from "react-native";
import { scaleFontSize, verticalScale } from "../../../../assets/styles/scaling";

const style = StyleSheet.create({
   badge: {
      backgroundColor: '#145855',
      height: verticalScale(22),
      justifyContent: 'center',
      borderRadius: 50,
   },
   title: {
      fontFamily: 'Inter',
      fontSize: scaleFontSize(10),
      fontWeight: 600,
      lineHeight: scaleFontSize(12),
      color: '#FFFFFF',
      textAlign: 'center',
   },
});

export default style;