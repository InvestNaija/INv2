import React, { useState, useRef } from "react";
import { Pressable, Text } from "react-native";
import PropTypes from "prop-types";
import style from "./style";
import { horizontalScale } from "../../assets/styles/scaling";

const Tab = (props) => {
   const [ width, setWidth ] = useState(0);
   const textRef = useRef(null);
   const horizontalPadding = 33;
   const tabWidth = {
      width: horizontalScale(horizontalPadding * 2 + width)
   };

   return <Pressable 
            style={[style.tab, props.isInactive && style.inactiveTab, tabWidth]}
            onPress={()=>props.onPress(props.tabId)}
         >
      <Text 
         ref={textRef} 
         onTextLayout={event=> {            
            setWidth(event.nativeEvent.lines[0].width)
         }}
         style={[style.title, props.isInactive && style.inactiveTitle]}
      >
            {props.title}
      </Text>
   </Pressable>;
}

Tab.defaultProps = {
   isInactive: false,
   onPress: ()=>{}
}
Tab.propTypes = {
   tabId: PropTypes.number.isRequired,
   title: PropTypes.string.isRequired,
   isInactive: PropTypes.bool,
   onPress: PropTypes.func
}
export default Tab;