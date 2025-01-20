import { StyleSheet } from "react-native";
// import { getFontFamily } from "../../_utils/fonts";
import { scaleFontSize, verticalScale } from "../../assets/styles/scaling";

const style = StyleSheet.create({
   tab: {
      backgroundColor: '#2979FE',
      height: verticalScale(50),
      justifyContent: 'center',
      borderRadius: 50,
   },
   inactiveTab: {
      backgroundColor: '#F3F5F9',
   },
   title: {
      fontFamily: 'Inter',
      fontSize: scaleFontSize(14),
      fontWeight: 500,
      lineHeight: scaleFontSize(17),
      color: '#FFFFFF',
      textAlign: 'center',
   },
   inactiveTitle: {
      color: '#79869F',
   },
});

export default style;