import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";

// Muestra el perfil del cliente y permite regresar a la pantalla de inicio de sesión.
export default function OtraScreenCliente({ navigation }) {
  // Solicita confirmación antes de salir de la cuenta.
  const cerrarSesion = () => {
    Alert.alert("Cerrar sesión", "¿Deseas salir de tu cuenta?", [
      {
        // Cierra el diálogo sin cambiar la pantalla actual.
        text: "Cancelar",
        style: "cancel",
      },
      {
        // Reinicia la navegación y elimina las pantallas anteriores de la pila.
        text: "Cerrar sesión",
        style: "destructive",
        onPress: () => {
          navigation.getParent()?.reset({
            index: 0,
            routes: [{ name: "Login" }],
          });
        },
      },
    ]);
  };

  // Presenta el título, el mensaje de bienvenida y el botón para cerrar sesión.
  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>Mi perfil</Text>
      <Text>Bienvenido al área del cliente.</Text>
      <TouchableOpacity style={styles.boton} onPress={cerrarSesion}>
        <Text style={styles.textoBoton}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

// Define la distribución y apariencia de los elementos de la pantalla.
const styles = StyleSheet.create({
  // Centra el contenido y aplica el fondo y el espacio interior.
  contenedor: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7f7ff",
    padding: 20,
  },
  // Da formato al título del perfil.
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#7C7CFF",
    marginBottom: 10,
  },
  // Da formato al botón para cerrar sesión.
  boton: {
    backgroundColor: "#7C7CFF",
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginTop: 25,
  },
  // Da formato al texto que aparece dentro del botón.
  textoBoton: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});