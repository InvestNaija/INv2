import { StyleSheet } from "react-native";
import { horizontalScale } from "../../../../assets/styles/scaling";

const styles = StyleSheet.create({
   button: {
      margin: horizontalScale(8),
      borderRadius: horizontalScale(20),
   },
   pressed: {
      opacity: 0.7,
   },
});

export default styles;