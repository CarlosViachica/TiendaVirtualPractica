import { View, Text, TextInput, StyleSheet, FlatList } from "react-native";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import Categoria from "../components/Categoria";
import Producto from "../components/Producto";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/config";

const Catalogo = () => {
  const [busqueda, setBusqueda] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    obtenerCategorias();
    obtenerProductos();
  }, []);

  const obtenerCategorias = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Categorias"));
      const datos = [];
      querySnapshot.forEach((doc) => {
        datos.push({ id: doc.id, ...doc.data() });
      });
      setCategorias(datos);
    } catch (error) {
      console.error("Error obteniendo categorías: ", error);
    }
  };

  const obtenerProductos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Productos"));
      const datos = [];
      querySnapshot.forEach((doc) => {
        datos.push({ id: doc.id, ...doc.data() });
      });
      setProductos(datos);
    } catch (error) {
      console.error("Error obteniendo productos: ", error);
    }
  };

  const productosFiltrados = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(busqueda.toLowerCase()),
  );

  const obtenerProductosPorCategoria = async (categoriaId) => {
    try {
      const consulta = query(
        collection(db, "Productos"),
        where("idCategoria", "==", categoriaId),
      );
      const consultaSnapshot = await getDocs(consulta);
      const datos = [];
      consultaSnapshot.forEach((documento) => {
        datos.push({ id: documento.id, ...documento.data() });
      });
      setProductos(datos);
    } catch (error) {
      console.error("Error obteniendo productos por categoría:", error);
    }
  };

  return (
    <View style={styles.contenedor}>
      <View style={styles.buscador}>
        <Ionicons name="search-outline" size={18} color="#7C7CFF" />
        <TextInput
          placeholder="Buscar producto"
          placeholderTextColor="#0d0dda"
          style={styles.input}
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categorias}
        contentContainerStyle={styles.categoriasContent}
        data={categorias}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Categoria
            nombre={item.nombre}
            icono={item.icono}
            onPress={() => obtenerProductosPorCategoria(item.id)}
          />
        )}
      />

      <View style={styles.linea} />
      <Text style={styles.titulo}>News</Text>

      <FlatList
        data={productosFiltrados}
        renderItem={({ item }) => (
          <Producto
            nombre={item.nombre}
            precio={item.precio}
            tiempo={item.tiempo}
            color={item.color}
            imagen={item.imagen}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        horizontal={false}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listaProductos}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    marginTop: 40,
  },
  buscador: {
    height: 55,
    backgroundColor: "#F5F4FC",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    marginTop: 12,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    fontSize: 12,
    marginLeft: 8,
  },
  categorias: {
    marginBottom: 10,
  },
  categoriasContent: {
    paddingRight: 12,
  },
  linea: {
    height: 3,
    backgroundColor: "#AAAAAA",
    marginHorizontal: -10,
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
    marginTop: 15,
    marginBottom: 10,
  },
  listaProductos: {
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
});

export default Catalogo;
