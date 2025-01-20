import React from "react";
import { Image, Pressable, View } from "react-native";
import PropTypes from "prop-types";
import style from "./style";
import Badge from "../Badge/Badge";
import Header from "../Header/Header";

const SingleDonationItem = (props) => {
   return <Pressable onPress={()=>props.onPress(props.donationItemId)}>
      <View>
         <View style={style.badge}>
            <Badge title={props.badgeTitle} />
         </View>
         <Image resizeMode={'cover'} source={{uri: props.uri}} style={style.image} />
      </View>
      <View style={style.donationInfo}>
         <Header type={3} title={props.donationTitle} color={'#0A043C'} numberOfLines={1} />
         <View style={style.price}>
            <Header type={3} title={'$'+props.price} color={'#156CF7'} />
         </View>
      </View>
   </Pressable>;
}

SingleDonationItem.propTypes = {
   donationItemId: PropTypes.number.isRequired,
   uri: PropTypes.string.isRequired,
   badgeTitle: PropTypes.string.isRequired,
   donationTitle: PropTypes.string.isRequired,
   price: PropTypes.number.isRequired,
   onPress: PropTypes.func
}
export default SingleDonationItem;