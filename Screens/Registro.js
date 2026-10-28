import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";

export default function Registro({ navigation }) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [cargando, setCargando] = useState(false);

  const registrarCliente = async () => {
    if (!nombre.trim() || !email.trim() || !telefono.trim() || !contrasena.trim()) {
      Alert.alert("Completa todos los campos", "Todos los datos son obligatorios.");
      return;
    }

    if (contrasena.length < 6) {
      Alert.alert("Contraseña inválida", "La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setCargando(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        contrasena,
      );

      await setDoc(doc(db, "Usuarios", userCredential.user.uid), {
        nombre: nombre.trim(),
        email: email.trim().toLowerCase(),
        telefono: telefono.trim(),
        rol: "cliente",
        createdAt: new Date().toISOString(),
      });

      Alert.alert("Registro exitoso", "Tu cuenta fue creada correctamente.");
      navigation.replace("ClienteTabs");
    } catch (error) {
      console.error("Error al registrar cliente:", error);

      let mensaje = "No se pudo completar el registro.";

      if (error.code === "auth/email-already-in-use") {
        mensaje = "Este correo ya está registrado.";
      } else if (error.code === "auth/invalid-email") {
        mensaje = "El correo electrónico no es válido.";
      }

      Alert.alert("Error", mensaje);
    } finally {
      setCargando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.contenedor}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.titulo}>Registrate</Text>

          <TextInput
            style={styles.input}
            placeholder="Nombre de usuario"
            value={nombre}
            onChangeText={setNombre}
            autoCapitalize="words"
          />

          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Teléfono"
            value={telefono}
            onChangeText={setTelefono}
            keyboardType="phone-pad"
          />

          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            value={contrasena}
            onChangeText={setContrasena}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.boton}
            onPress={registrarCliente}
            disabled={cargando}
          >
            <Text style={styles.textoBoton}>
              {cargando ? "Registrando..." : "Crear cuenta"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.textoVolver}>Ya tengo cuenta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#f7f7ff",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 22,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  titulo: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    color: "#7C7CFF",
    marginBottom: 24,
  },
  input: {
    backgroundColor: "#F5F5F7",
    borderWidth: 1,
    borderColor: "#D9D9E8",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
    fontSize: 16,
  },
  boton: {
    backgroundColor: "#7C7CFF",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  textoBoton: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  textoVolver: {
    color: "#5A5AFF",
    textAlign: "center",
    marginTop: 18,
    fontSize: 15,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
