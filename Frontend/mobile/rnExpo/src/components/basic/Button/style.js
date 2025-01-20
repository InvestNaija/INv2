import { StyleSheet } from "react-native";
// import { getFontFamily } from "../../_utils/fonts";
import { scaleFontSize, verticalScale } from "../../../../assets/styles/scaling";

const style = StyleSheet.create({
   button: {
      backgroundColor: '#2979FE',
      height: verticalScale(55),
      justifyContent: 'center',
      borderRadius: 50,
   },
   disabled: {
      opacity: 0.5
   },
   title: {
      fontFamily: 'Inter',
      fontSize: scaleFontSize(16),
      fontWeight: 500,
      lineHeight: scaleFontSize(19),
      color: '#FFFFFF',
      textAlign: 'center',
   }
});

export default style;