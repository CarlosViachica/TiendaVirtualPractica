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

const styles = StyleSheet.create({
  contenedor: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4F4FF",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 10,
    minWidth: 88,
  },
  nombre: {
    marginTop: 6,
    fontSize: 12,
    color: "#333",
    fontWeight: "600",
  },
});

export default Categoria;