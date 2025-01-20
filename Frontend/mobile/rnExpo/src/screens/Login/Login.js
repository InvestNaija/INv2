import React, { useState } from "react";
import { Image, SafeAreaView, ScrollView, View, Text, Pressable } from "react-native";
import { useSelector } from "react-redux";
import globalStyles from "../../assets/styles/global.styles";
import style from "./style";
import Input from "../../components/Input/Input";
import Header from "../../components/Header/Header";
import Button from "../../components/Button/Button";
import { Routes } from "../../_navigation/routes.enum";

const Login = ({navigation, route}) => {
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   
   return <SafeAreaView style={[globalStyles.bgWhite, globalStyles.flex]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={style.container}>
         <View style={globalStyles.mb24}>
            <Header type={1} title={'Welcome back, Login'} /> 
         </View>
         <View style={globalStyles.mb24}>
            <Input 
               label={'Email'} 
               placeholder={'Enter your email'}
               keyboardType={'email-address'}
               onChangeText={val=>setEmail(val)}
            />
         </View>
         <View style={globalStyles.mb24}>
            <Input
               secureTextEntry={true}
               label={'Password'} 
               placeholder={'Enter your password'}
               onChangeText={val=>setPassword(val)}
            />
         </View>
         <View style={globalStyles.mb24}>
            <Button
               onPress={async () => {
               let user = await loginUser(email, password);
               console.log(user)
               if (!user.status) {
                  setError(user.error);
               } else {
                  setError('');
                  dispatch(logIn(user.data));
                  navigation.navigate(Routes.Home);
               }
               }}
               title={'Login'}
               isDisabled={email.length < 5 || password.length < 8}
            />
         </View>
         <Pressable style={style.registrationButton} onPress={()=>navigation.navigate(Routes.Registration)}>
            <Header type={3} color={'#156CF7'} title={`Don't have an account`} />
         </Pressable>
      </ScrollView>
   </SafeAreaView>
}

export default Login;