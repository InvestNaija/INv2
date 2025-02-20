import { StyleSheet } from "react-native";
import { getFontFamily } from "../../_utils/fonts";
import { horizontalScale, scaleFontSize, verticalScale } from "../../assets/styles/scaling";

const style = StyleSheet.create({
   searchContainer: {
      flexDirection: 'row',
      paddingHorizontal: horizontalScale(16),
      backgroundColor: '#F3F5F9',
      height: verticalScale(50),
      alignItems: 'center',
      borderRadius: horizontalScale(15),
   },
   searchInput: {
      flex: 1,
      marginLeft: horizontalScale(10),
      height: '80%',
      fontFamily: 'Inter',
      fontSize: scaleFontSize(14),
      lineHeight: scaleFontSize(14),
      color: '#686C7A',
   }
});

export default style;