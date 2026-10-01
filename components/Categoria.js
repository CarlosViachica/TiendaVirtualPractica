import { Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const Categoria = (props) => {
return (
<TouchableOpacity style={styles.contenedor} onPress={props.onPress}>
<Ionicons
name={props.icono}
size={28}
color="#7C7CFF"
/>
<Text style={styles.nombre}>
{props.nombre}
</Text>
</TouchableOpacity>
);
};

export default Categoria;