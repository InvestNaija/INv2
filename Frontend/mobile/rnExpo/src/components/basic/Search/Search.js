import React, { useRef, useState } from 'react';
import { Pressable, TextInput } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

import style from './style';
import { scaleFontSize } from '../../assets/styles/scaling';
import PropTypes from 'prop-types';

const Search = (props) => {
   const [ search, setSearch ] = useState('');
   const textInputRef = useRef(null);
   const handleFocus = ()=>{
      textInputRef.current.focus()
   };
   const handleSearch = val => {
      setSearch(val);
      props.onSearch(val);
   }
   return <Pressable style={style.searchContainer} onPress={handleFocus}>
      <FontAwesomeIcon icon={faSearch} color={'#25C0FF'} size={scaleFontSize(22)} />
      <TextInput ref={textInputRef} style={style.searchInput} placeholder={props.placeholder} value={search} onChangeText={val=> handleSearch(val)} />
   </Pressable>
};

Search.defaultProps = {
   onSearch: ()=>{},
   placeholder: 'Search...'
};
Search.propTypes = {
   onSearch: PropTypes.func,
   placeholder: PropTypes.string,
}
export default Search;