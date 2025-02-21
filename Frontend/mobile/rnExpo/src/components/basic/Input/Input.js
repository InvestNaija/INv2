import React, { useState } from "react";
import { Image, SafeAreaView, ScrollView, View, Text, TextInput } from "react-native";
import PropTypes from "prop-types";

import style from "./style";

const Input = (props) => {
   const [value, setValue] = useState('');
   return <View>
      <Text style={style.label}>{props.label}</Text>
      <TextInput 
         style={style.input} 
         placeholder={props.placeholder ? props.placeholder : null}
         value={value}
         autoCapitalize={props.autoCapitalize ? props.autoCapitalize : 'none'}
         autoCorrect={props.autoCorrect ? props.autoCorrect : false}
         secureTextEntry={props.secureTextEntry ? props.secureTextEntry : false}
         keyboardType={props.keyboardType ? props.keyboardType : 'default'}
         onChangeText={val=>{
            setValue(val);
            props.onChangeText(val)
         }} />
   </View>
}

Input.propTypes = {
   label: PropTypes.string.isRequired,
   placeholder: PropTypes.string,
   keyboardType: PropTypes.string,
   secureTextEntry: PropTypes.bool,
   onChangeText: PropTypes.func,
}
export default Input;