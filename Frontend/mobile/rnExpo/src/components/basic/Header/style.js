import { StyleSheet } from "react-native";
import { getFontFamily } from "../../_utils/fonts";
import { scaleFontSize } from "../../assets/styles/scaling";

const style = StyleSheet.create({
   title1: {
      fontFamily: getFontFamily('Inter', '600'),
      fontSize: scaleFontSize(24),
      lineHeight: scaleFontSize(29),
      fontWeight: 600
   },
   title2: {
      fontFamily: getFontFamily('Inter', '600'),
      fontSize: scaleFontSize(18),
      lineHeight: scaleFontSize(22),
      fontWeight: 600
   },
   title3: {
      fontFamily: getFontFamily('Inter', '600'),
      fontSize: scaleFontSize(16),
      lineHeight: scaleFontSize(19),
      fontWeight: 600
   }
});

export default style;