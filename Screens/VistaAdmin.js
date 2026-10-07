import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";

const VistaAdmin = ({ navigation }) => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const cargarCategorias = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Categorias"));
      const datos = querySnapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));
      setCategorias(datos);
    } catch (error) {
      console.error("Error obteniendo categorías para administración: ", error);
    }
  };

  const cargarProductos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Productos"));
      const datos = querySnapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));
      setProductos(datos);
    } catch (error) {
      console.error("Error obteniendo productos para administración: ", error);
      Alert.alert("Error", "No se pudieron cargar los productos.");
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarCategorias();
      cargarProductos();
    }, [])
  );

  const confirmarEliminacion = (producto) => {
    Alert.alert(
      "Eliminar producto",
      `¿Deseas eliminar "${producto.nombre}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "Productos", producto.id));
              cargarProductos();
            } catch (error) {
              console.error("Error eliminando producto: ", error);
              Alert.alert("Error", "No se pudo eliminar el producto.");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.contenedor}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Vista Administrador</Text>
        <TouchableOpacity
          style={styles.botonAgregar}
          onPress={() => navigation.navigate("nuevoProducto")}
        >
          <Text style={styles.botonAgregarTexto}>Agregar nuevo</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={productos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listaContenido}
        ListEmptyComponent={
          <Text style={styles.vacio}>No hay productos registrados.</Text>
        }
        renderItem={({ item }) => {
          const categoriaProducto = categorias.find((categoria) => {
            if (!categoria || !item) {
              return false;
            }

            return (
              String(categoria.id).trim().toLowerCase() ===
                String(item.categoriaId || "").trim().toLowerCase() ||
              String(categoria.nombre).trim().toLowerCase() ===
                String(item.categoriaNombre || item.categoriaId || "").trim().toLowerCase()
            );
          });

          return (
            <View style={styles.tarjetaProducto}>
              <View style={styles.infoProducto}>
                <Text style={styles.nombreProducto}>{item.nombre}</Text>
                <Text style={styles.precioProducto}>$ {Number(item.precio || 0).toFixed(2)}</Text>
                <Text style={styles.categoriaProducto}>{categoriaProducto?.nombre || item.categoriaNombre || item.categoriaId || "Sin categoría"}</Text>
              </View>

            <View style={styles.acciones}>
              <TouchableOpacity
                style={styles.botonEditar}
                onPress={() => navigation.navigate("nuevoProducto", { producto: item })}
              >
                <Text style={styles.botonTexto}>Editar</Text>
              </TouchableOpacity>

                <TouchableOpacity
                  style={styles.botonEliminar}
                  onPress={() => confirmarEliminacion(item)}
                >
                  <Text style={styles.botonTexto}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#F6F7FB",
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
  },
  botonAgregar: {
    backgroundColor: "#6C63FF",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  botonAgregarTexto: {
    color: "#fff",
    fontWeight: "700",
  },
  listaContenido: {
    paddingBottom: 24,
  },
  tarjetaProducto: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },
  infoProducto: {
    marginBottom: 12,
  },
  nombreProducto: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  precioProducto: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: "600",
    color: "#6C63FF",
  },
  categoriaProducto: {
    marginTop: 4,
    color: "#6B7280",
    fontSize: 13,
  },
  acciones: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  botonEditar: {
    backgroundColor: "#E0E7FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  botonEliminar: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  botonTexto: {
    color: "#111827",
    fontWeight: "600",
  },
  vacio: {
    textAlign: "center",
    color: "#6B7280",
    marginTop: 30,
    fontSize: 16,
  },
});

export default VistaAdmin;
