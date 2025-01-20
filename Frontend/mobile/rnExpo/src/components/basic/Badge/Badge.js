import React, { useState, useRef } from "react";
import { View, Text } from "react-native";
import PropTypes from "prop-types";
import style from "./style";
import { horizontalScale } from "../../../../assets/styles/scaling";

const Badge = (props) => {
   const [ width, setWidth ] = useState(0);
   const textRef = useRef(null);
   const horizontalPadding = 10;
   const tabWidth = {
      width: horizontalScale(horizontalPadding * 2 + width)
   };

   return <View style={[style.badge, tabWidth]}>
      <Text 
         ref={textRef} 
         onTextLayout={event=> {            
            setWidth(event.nativeEvent.lines[0].width)
         }}
         style={[style.title]}
      >
            {props.title}
      </Text>
   </View>;
}

Badge.propTypes = {
   title: PropTypes.string.isRequired,
}
export default Badge;