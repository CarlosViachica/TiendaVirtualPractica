import { useCallback, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { collection, getDocs } from "firebase/firestore";
import { useFocusEffect } from "@react-navigation/native";
import { db } from "../firebase/config";
import Categoria from "../components/Categoria";
import Producto from "../components/Producto";

const Catalogo = () => {
  // Estado para la búsqueda del usuario y para guardar los datos de categorías y productos.
  const [busqueda, setBusqueda] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [todosProductos, setTodosProductos] = useState([]);

  // Cada vez que la pantalla vuelve a estar activa, se recargan las categorías y productos.
  useFocusEffect(
    useCallback(() => {
      obtenerCategorias();
      obtenerProductos();
    }, []),
  );

  // Carga las categorías desde Firestore y agrega una opción inicial para ver todo el catálogo.
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

  // Convierte texto a un formato uniforme para comparar nombres e IDs sin importar mayúsculas o espacios.
  const normalizarTexto = (valor) =>
    String(valor ?? "").trim().toLowerCase();

  // Verifica si un producto pertenece a la categoría seleccionada, aceptando varios nombres de campos.
  const coincidenciaCategoria = (producto, categoriaId, categoriaNombre) => {
    const idCategoria = normalizarTexto(categoriaId);
    const nombreCategoria = normalizarTexto(categoriaNombre);

    const valoresProducto = [
      producto.categoriaId,
      producto.idCategoria,
      producto.categoria,
      producto.categoriaNombre,
      producto.categoriaName,
      producto.nombreCategoria,
      producto.categoryId,
      producto.category,
      producto.categoryName,
    ].map(normalizarTexto);

    return valoresProducto.some((valor) => {
      if (!valor) return false;
      return (
        valor === idCategoria ||
        valor === nombreCategoria ||
        valor.replace(/\s+/g, "") === idCategoria.replace(/\s+/g, "") ||
        valor.replace(/\s+/g, "") === nombreCategoria.replace(/\s+/g, "")
      );
    });
  };

  // Muestra solo los productos de la categoría seleccionada, o todos si se elige "Todos".
  const obtenerProductosPorCategoria = (categoriaId, categoriaNombre) => {
    if (!categoriaId || categoriaId === "todos") {
      setProductos(todosProductos);
      return;
    }

    const productosCoincidentes = todosProductos.filter((producto) =>
      coincidenciaCategoria(producto, categoriaId, categoriaNombre),
    );

    setProductos(productosCoincidentes);
  };

  // Obtiene todos los productos desde Firestore y los guarda para usarlos en filtros.
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

  // Filtra los productos por el texto escrito en el buscador.
  const productosFiltrados = productos.filter((producto) =>
    (producto.nombre || "").toLowerCase().includes(busqueda.toLowerCase()),
  );

  // Render principal del catálogo: buscador, categorías, sección de productos y listado final.
  return (
    <ScrollView
      style={styles.contenedor}
      contentContainerStyle={styles.contenedorContenido}
      showsVerticalScrollIndicator={false}
    >
      {/* Barra de búsqueda para filtrar productos por nombre. */}
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

      {/* Carrusel horizontal de categorías para cambiar el filtro activo. */}
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
            onPress={() => obtenerProductosPorCategoria(categoria.id, categoria.nombre)}
          />
        ))}
      </ScrollView>

      <View style={styles.linea} />
      <Text style={styles.titulo}>News</Text>

      {/* Grid de productos con el resultado final del filtro actual. */}
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