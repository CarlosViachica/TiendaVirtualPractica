import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";

import Catalogo from "./Screens/Catalogo";
import VistaAdmin from "./Screens/VistaAdmin";
import NuevoProducto from "./Screens/nuevoProducto";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const AdminStack = () => (
  <Stack.Navigator initialRouteName="VistaAdmin">
    <Stack.Screen
      name="VistaAdmin"
      component={VistaAdmin}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="nuevoProducto"
      component={NuevoProducto}
      options={{ title: "Nuevo producto" }}
    />
  </Stack.Navigator>
);

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarActiveTintColor: "#6C63FF",
            tabBarInactiveTintColor: "#8E8E9F",
            tabBarIcon: ({ color, size }) => {
              const iconName =
                route.name === "Catálogo" ? "grid-outline" : "shield-checkmark-outline";

              return <Ionicons name={iconName} size={size} color={color} />;
            },
          })}
        >
          <Tab.Screen name="Catálogo" component={Catalogo} />
          <Tab.Screen name="VistaAdmin" component={AdminStack} />
        </Tab.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
