import React, { useState } from "react";
import {View,Text,TextInput,TouchableOpacity,StyleSheet,Alert,} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";

export default function Login({ navigation }) {
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const iniciarSesion = async () => {
    const emailNormalizado = email.trim().toLowerCase();

    if (emailNormalizado === "administrador@gmail.com" && contrasena === "1234") {
      navigation.replace("AdminTabs");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        emailNormalizado,
        contrasena,
      );
      const userDocRef = doc(db, "Usuarios", userCredential.user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        Alert.alert(
          "Error",
          "El usuario no tiene un rol asignado en el sistema.",
        );
        return;
      }

      const userData = userDocSnap.data();
      const rol = userData.rol ?? userData.Rol;
      const rolNormalizado =
        typeof rol === "string" ? rol.trim().toLowerCase() : "";

      if (rolNormalizado === "administrador" || rolNormalizado === "admin") {
        navigation.replace("AdminTabs");
      } else if (rolNormalizado === "cliente") {
        navigation.replace("ClienteTabs");
      } else {
        Alert.alert(
          "Error",
          "El rol del usuario no es válido. Verifica el campo Rol en Firestore.",
        );
      }
    } catch (error) {
      console.error("Error de autenticación:", error);
      Alert.alert(
        "Error de autenticación",
        "Correo o contraseña incorrectos. Inténtalo de nuevo.",
      );
    }
  };
  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>IKY</Text>
      <Text style={styles.subtitulo}>Iniciar sesión</Text>
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={contrasena}
        onChangeText={setContrasena}
        secureTextEntry
      />
      <TouchableOpacity style={styles.boton} onPress={iniciarSesion}>
        <Text style={styles.textoBoton}>Ingresar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.registroBoton} onPress={() => navigation.navigate("Registro")}>
        <Text style={styles.textoRegistro}>¿No tienes una cuenta? Regístrate</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    justifyContent: "center",
    padding: 25,
    backgroundColor: "#f7f7ff",
  },
  titulo: {
    fontSize: 38,
    fontWeight: "bold",
    color: "#7C7CFF",
    textAlign: "center",
  },
  subtitulo: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 30,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    padding: 14,
    marginBottom: 15,
  },
  boton: {
    backgroundColor: "#7C7CFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 18,
  },
  textoBoton: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  registroBoton: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  textoRegistro: {
    color: "#5a5aff",
    fontSize: 16,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});