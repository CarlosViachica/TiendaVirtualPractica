import { useCallback, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useFocusEffect } from "@react-navigation/native";
import { db } from "../firebase/config";
import Categoria from "../components/Categoria";
import Producto from "../components/Producto";

const Catalogo = () => {
  const [busqueda, setBusqueda] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [todosProductos, setTodosProductos] = useState([]);

  useFocusEffect(
    useCallback(() => {
      obtenerCategorias();
      obtenerProductos();
    }, []),
  );

  const obtenerCategorias = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Categorias"));
      const datos = [{ id: "todos", nombre: "Todos", icono: "grid-outline" }];

      querySnapshot.forEach((doc) => {
        datos.push({ id: doc.id, ...doc.data() });
      });

      setCategorias(datos);
    } catch (error) {
      console.error("Error obteniendo categorías: ", error);
    }
  };

  const obtenerProductosPorCategoria = async (categoriaId) => {
    if (categoriaId === "todos") {
      setProductos(todosProductos);
      return;
    }

    try {
      const consulta = query(
        collection(db, "Productos"),
        where("categoriaId", "==", categoriaId),
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

  const obtenerProductos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Productos"));
      const datos = [];
      querySnapshot.forEach((doc) => {
        datos.push({ id: doc.id, ...doc.data() });
      });
      setTodosProductos(datos);
      setProductos(datos);
    } catch (error) {
      console.error("Error obteniendo productos: ", error);
    }
  };

  const productosFiltrados = productos.filter((producto) =>
    (producto.nombre || "").toLowerCase().includes(busqueda.toLowerCase()),
  );

  return (
    <ScrollView
      style={styles.contenedor}
      contentContainerStyle={styles.contenedorContenido}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.buscador}>
        <Ionicons name="search-outline" size={18} color="#7C7CFF" />
        <TextInput
          placeholder="Buscar producto"
          placeholderTextColor="#B5B5D5"
          style={styles.input}
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categorias}
        contentContainerStyle={styles.categoriasContent}
      >
        {categorias.map((categoria) => (
          <Categoria
            key={categoria.id}
            nombre={categoria.nombre}
            icono={categoria.icono}
            onPress={() => obtenerProductosPorCategoria(categoria.id)}
          />
        ))}
      </ScrollView>

      <View style={styles.linea} />
      <Text style={styles.titulo}>News</Text>

      <View style={styles.productos}>
        {productosFiltrados.map((producto) => (
          <Producto
            key={producto.id}
            nombre={producto.nombre}
            precio={producto.precio}
            imagen={producto.imagen}
            color={producto.color || "#F4F4F4"}
            tiempo={producto.tiempo || "Hoy"}
          />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
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
    paddingRight: 10,
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
  columnWrapper: {
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  listaProductos: {
    paddingBottom: 20,
  },
  productos: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});
export default Catalogo;