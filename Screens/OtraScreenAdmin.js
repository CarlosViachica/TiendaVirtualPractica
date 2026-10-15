// Importa React Native, la función de cierre de sesión de Firebase y la configuración de autenticación.
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";

// Pantalla del administrador con la opción para cerrar sesión.
export default function OtraScreenAdmin({ navigation }) {
  // Solicita confirmación antes de cerrar la sesión del administrador.
  const cerrarSesion = async () => {
    Alert.alert("Cerrar sesión", "¿Deseas salir de tu cuenta?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Cerrar sesión",
        style: "destructive",
        onPress: async () => {
          try {
            // Cierra la sesión en Firebase y regresa al usuario a la pantalla de inicio de sesión.
            await signOut(auth);
            navigation.getParent()?.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
          } catch (error) {
            // Informa si Firebase no pudo completar el cierre de sesión.
            console.error("Error al cerrar sesión:", error);
            Alert.alert(
              "Error",
              "No se pudo cerrar la sesión. Inténtalo de nuevo.",
            );
          }
        },
      },
    ]);
  };

  // Muestra el título del panel y el botón para iniciar el cierre de sesión.
  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>Panel del administrador</Text>
      <TouchableOpacity style={styles.boton} onPress={cerrarSesion}>
        <Text style={styles.textoBoton}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

// Define la presentación del contenedor, el título y el botón de cierre de sesión.
const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f7f7ff",
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 25,
  },
  boton: {
    backgroundColor: "#7C7CFF",
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  textoBoton: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});