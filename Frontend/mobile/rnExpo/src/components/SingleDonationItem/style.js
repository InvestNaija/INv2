import { StyleSheet } from "react-native";
// import { getFontFamily } from "../../_utils/fonts";
import { horizontalScale, scaleFontSize, verticalScale } from "../../assets/styles/scaling";

const style = StyleSheet.create({
   badge: {
      position: 'absolute',
      zIndex: 1,
      top: verticalScale(13),
      left: horizontalScale(10),
   },
   image: {
      width: horizontalScale(140),
      height: verticalScale(170),
      borderRadius: horizontalScale(20)
   },
   donationInfo: {
      marginTop: verticalScale(16),
   },
   price: {
      marginTop: verticalScale(5),
   }
});

export default style;