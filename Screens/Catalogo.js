import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  FlatList,
} from "react-native";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import Categoria from "../components/Categoria";
import Producto from "../components/Producto";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";

const Catalogo = () => {
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("todos");
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

  const categoriasConTodos = [
    { id: "todos", nombre: "Todos", icono: "grid-outline" },
    ...categorias,
  ];

  const normalizarTexto = (valor) =>
    String(valor ?? "").trim().toLowerCase();

  const productosFiltrados = productos.filter((producto) => {
    const categoriaProducto = normalizarTexto(
      producto.categoriaId ?? producto.categoria ?? producto.categoriaNombre ?? ""
    );
    const categoriaSeleccionadaNormalizada = normalizarTexto(categoriaSeleccionada);

    const coincideCategoria =
      categoriaSeleccionada === "todos" ||
      categoriaProducto === categoriaSeleccionadaNormalizada ||
      categorias.some((categoria) => {
        const opcionesCategoria = [
          normalizarTexto(categoria.id),
          normalizarTexto(categoria.nombre),
        ];

        return (
          opcionesCategoria.includes(categoriaProducto) &&
          opcionesCategoria.includes(categoriaSeleccionadaNormalizada)
        );
      });

    const nombreProducto = (producto.nombre || "").toLowerCase();
    const coincideBusqueda = nombreProducto.includes(busqueda.toLowerCase());

    return coincideCategoria && coincideBusqueda;
  });

  const seleccionarCategoria = (categoriaId) => {
    setCategoriaSeleccionada(categoriaId);
  };

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
        contentContainerStyle={styles.categoriasContenido}
      >
        {categoriasConTodos.map((categoria) => (
          <Categoria
            key={categoria.id}
            nombre={categoria.nombre}
            icono={categoria.icono}
            onPress={() => seleccionarCategoria(categoria.id)}
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
  productos: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: 20,
  },
  listaProductos: {
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
});

export default Catalogo;