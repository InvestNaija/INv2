import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import ManageExpense from './screens/ManageExpense';
import RecentExpenses from './screens/RecentExpenses';
import AllExpenses from './screens/AllExpenses';

import { Ionicons } from '@expo/vector-icons';
import IconButton from './components/UI/IconButton';

import { GlobalStyles } from '../../assets/styles/constants'

const Stack = createNativeStackNavigator();
const BottomTabs = createBottomTabNavigator();

export const TabNavigation = ()=> {
   return <BottomTabs.Navigator screenOptions={({ navigation }) => ({
      headerStyle: { backgroundColor: GlobalStyles.colors.primary500},
      headerTintColor: 'white',
      tabBarStyle: { backgroundColor: GlobalStyles.colors.primary500},
      tabBarActiveTintColor: GlobalStyles.colors.accent500,
      headerRight: ({ tintColor }) => (
        <IconButton
          icon="add"
          size={24}
          color={tintColor}
          onPress={() => {
            navigation.navigate('ManageExpense');
          }}
        />
      ),
   })}>
      <BottomTabs.Screen name='RecentExpenses' component={RecentExpenses} options={{
         title: 'Recent Expenses',
         tabBarLabel: 'Recent',
         tabBarIcon: ({color, size})=><Ionicons name={'hourglass'} color={color} size={size} />
      }} />
      <BottomTabs.Screen name='AllExpenses' component={AllExpenses} options={{
         title: 'All Expenses',
         tabBarLabel: 'All Expenses',
         tabBarIcon: ({color, size})=><Ionicons name={'calendar'} color={color} size={size} />
      }} />
   </BottomTabs.Navigator>
}
   
export const MainNavigation = ()=> {
   return <Stack.Navigator
      screenOptions={{
         headerStyle: { backgroundColor: GlobalStyles.colors.primary500 },
         headerTintColor: 'white',
      }}
   >
      <Stack.Screen name='ExpensesOverview' component={TabNavigation} options={{headerShown: false}} />
      <Stack.Screen name='ManageExpense' component={ManageExpense} options={{
               presentation: 'modal',
            }} />
   </Stack.Navigator>
}

