// Hooks de React para conservar estado y memorizar funciones entre renders.
import { useCallback, useState } from "react";
// Componentes nativos usados para mostrar la lista, sus acciones y estados.
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
// Evita que el contenido de la pantalla quede debajo de la barra de estado.
import { SafeAreaView } from "react-native-safe-area-context";
// Iconografía de los botones y estados vacíos.
import { Ionicons } from "@expo/vector-icons";
// Funciones de React Navigation para reaccionar al foco y navegar al formulario.
import { useFocusEffect, useNavigation } from "@react-navigation/native";
// Operaciones de Firestore utilizadas en esta pantalla.
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";
// Instancia compartida de la base de datos.
import { db } from "../firebase/config";

const VistaAdmin = () => {
  const navigation = useNavigation();

  // Productos recuperados de Firestore y estados visuales de carga/error.
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState("");

  // Consulta los productos; el parámetro diferencia la carga inicial del gesto
  // de actualización manual de la lista.
  const cargarProductos = useCallback(async (actualizar = false) => {
    if (actualizar) {
      setActualizando(true);
    } else {
      setCargando(true);
    }
    setError("");

    try {
      // Lee la colección y agrega el ID de Firestore a cada objeto producto.
      const resultado = await getDocs(collection(db, "Productos"));
      setProductos(
        resultado.docs.map((producto) => ({
          id: producto.id,
          ...producto.data(),
        })),
      );
    } catch (e) {
      // Registra el error para diagnóstico y muestra un mensaje recuperable.
      console.error("Error cargando productos para administración:", e);
      setError("No fue posible cargar los productos. Intenta nuevamente.");
    } finally {
      // Cierra los indicadores de carga independientemente del resultado.
      setCargando(false);
      setActualizando(false);
    }
  }, []);

  // Carga o actualiza la lista cada vez que la pantalla vuelve a primer plano,
  // por ejemplo, después de agregar o editar un producto.
  useFocusEffect(
    useCallback(() => {
      cargarProductos();
    }, [cargarProductos]),
  );

  // Solicita confirmación antes de borrar y elimina el documento elegido
  // tanto de Firestore como del estado local de la pantalla.
  const eliminarProducto = (producto) => {
    Alert.alert(
      "Eliminar producto",
      // CORREGIDO: Usando backticks para interpolar la variable
      `¿Deseas eliminar "${producto.nombre || "este producto"}"?`,
      [
        // Cierra el diálogo sin realizar cambios.
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              // Borra el registro remoto y lo quita de la lista visible.
              await deleteDoc(doc(db, "Productos", producto.id));
              setProductos((actuales) =>
                actuales.filter((actual) => actual.id !== producto.id),
              );
            } catch (e) {
              // Informa al usuario si Firestore no pudo completar la operación.
              console.error("Error eliminando producto:", e);
              Alert.alert(
                "No se pudo eliminar",
                "Ocurrió un error al eliminar el producto. Intenta nuevamente.",
              );
            }
          },
        },
      ],
    );
  };

  // Construye la tarjeta visual para cada producto de FlatList.
  const renderProducto = ({ item }) => (
    <View style={styles.tarjeta}>
      {/* Muestra la imagen disponible o un icono sustituto si no hay URL. */}
      {item.imagen ? (
        <Image source={{ uri: item.imagen }} style={styles.imagen} />
      ) : (
        <View style={styles.imagenVacia}>
          <Ionicons name="image-outline" size={28} color="#AAA9C2" />
        </View>
      )}
      <View style={styles.detalles}>
        {/* Nombre y precio con valores alternativos para datos incompletos. */}
        <Text style={styles.nombre} numberOfLines={2}>
          {item.nombre || "Producto sin nombre"}
        </Text>
        <Text style={styles.precio}>${Number(item.precio || 0).toFixed(2)}</Text>
        {/* Acciones disponibles para este producto. */}
        <View style={styles.acciones}>
          <Pressable
            accessibilityRole="button"
            // CORREGIDO: Usando backticks para interpolar la variable
            accessibilityLabel={`Editar ${item.nombre || "producto"}`}
            style={styles.botonEditar}
            // Abre el formulario pasando el ID para que se cargue en modo edición.
            onPress={() => navigation.navigate("FormularioAdd", { productId: item.id })}
          >
            <Ionicons name="create-outline" size={17} color="#5546D7" />
            <Text style={styles.textoEditar}>Editar</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            // CORREGIDO: Usando backticks para interpolar la variable
            accessibilityLabel={`Eliminar ${item.nombre || "producto"}`}
            style={styles.botonEliminar}
            // Ejecuta el flujo de eliminación con confirmación.
            onPress={() => eliminarProducto(item)}
          >
            <Ionicons name="trash-outline" size={17} color="#D94A62" />
          </Pressable>
        </View>
      </View>
    </View>
  );

  return (
    // Área segura superior y contenedor raíz de la pantalla.
    <SafeAreaView style={styles.contenedor} edges={["top"]}>
      {/* Título de administración y acceso al formulario de alta. */}
      <View style={styles.encabezado}>
        <View>
          <Text style={styles.etiqueta}>GESTIÓN DE TIENDA</Text>
          <Text style={styles.titulo}>Productos</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          style={styles.botonAgregar}
          // Abre el formulario sin ID, es decir, en modo de nuevo producto.
          onPress={() => navigation.navigate("FormularioAdd")}
        >
          <Ionicons name="add" size={21} color="#FFFFFF" />
          <Text style={styles.textoAgregar}>Agregar</Text>
        </Pressable>
      </View>

      {/* El mensaje también permite reintentar la consulta al tocarlo. */}
      {error ? (
        <Pressable
          accessibilityRole="button"
          style={styles.error}
          onPress={() => cargarProductos()}
        >
          <Text style={styles.textoError}>{error} Toca para reintentar.</Text>
        </Pressable>
      ) : null}

      {/* Mientras se obtiene la primera respuesta se muestra el indicador;
          después, FlatList presenta los productos y permite actualizar al deslizar. */}
      {cargando ? (
        <ActivityIndicator style={styles.cargando} color="#5546D7" size="large" />
      ) : (
        <FlatList
          data={productos}
          // Identificador estable que React Native usa para cada fila.
          keyExtractor={(item) => item.id}
          // Función que dibuja cada tarjeta de producto.
          renderItem={renderProducto}
          contentContainerStyle={[
            styles.lista,
            productos.length === 0 && styles.listaVacia,
          ]}
          refreshControl={
            // Control nativo de actualización por gesto de deslizar hacia abajo.
            <RefreshControl
              refreshing={actualizando}
              onRefresh={() => cargarProductos(true)}
              tintColor="#5546D7"
            />
          }
          ListEmptyComponent={
            // Mensaje informativo cuando la colección no contiene productos.
            <View style={styles.vacio}>
              <Ionicons name="cube-outline" size={42} color="#AAA9C2" />
              <Text style={styles.vacioTitulo}>Aún no hay productos</Text>
              <Text style={styles.vacioDetalle}>
                Agrega el primer producto para mostrarlo en el catálogo.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

// Estilos de la pantalla organizados por encabezado, lista, tarjetas,
// botones y estados de carga, vacío y error.
const styles = StyleSheet.create({
  // Fondo general y distribución del encabezado.
  contenedor: { flex: 1, backgroundColor: "#F7F7FC" },
  encabezado: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  etiqueta: {
    color: "#77768F",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  titulo: { color: "#242337", fontSize: 27, fontWeight: "800", marginTop: 3 },
  // Botón principal que inicia el alta de producto.
  botonAgregar: {
    backgroundColor: "#5546D7",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  textoAgregar: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  // Espaciado exterior de la lista y alineación cuando está vacía.
  lista: { paddingHorizontal: 16, paddingBottom: 20 },
  listaVacia: { flexGrow: 1 },
  // Distribución y elevación de la tarjeta de cada producto.
  tarjeta: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    marginBottom: 12,
    minHeight: 132,
    elevation: 2,
    shadowColor: "#27244F",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  // Imagen del producto y marcador visual alternativo.
  imagen: {
    width: 104,
    height: 108,
    borderRadius: 12,
    backgroundColor: "#F2F1FA",
    resizeMode: "contain",
  },
  imagenVacia: {
    width: 104,
    height: 108,
    borderRadius: 12,
    backgroundColor: "#F2F1FA",
    alignItems: "center",
    justifyContent: "center",
  },
  // Área textual de la tarjeta y apariencia del nombre/precio.
  detalles: { flex: 1, paddingLeft: 13, justifyContent: "space-between" },
  nombre: { color: "#29283C", fontSize: 15, fontWeight: "700" },
  precio: { color: "#5546D7", fontSize: 16, fontWeight: "800", marginTop: 5 },
  // Alineación y colores de los controles para editar y eliminar.
  acciones: { flexDirection: "row", alignItems: "center", gap: 9 },
  botonEditar: {
    height: 34,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    borderRadius: 9,
    backgroundColor: "#F0EEFF",
  },
  textoEditar: { color: "#5546D7", fontSize: 12, fontWeight: "700" },
  botonEliminar: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
    backgroundColor: "#FFF0F2",
  },
  // Indicadores y mensajes de lista vacía o error.
  cargando: { flex: 1 },
  vacio: { alignItems: "center", justifyContent: "center", flex: 1, padding: 32 },
  vacioTitulo: { color: "#333248", fontSize: 17, fontWeight: "700", marginTop: 14 },
  vacioDetalle: {
    color: "#77768F",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 6,
  },
  error: {
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 12,
    backgroundColor: "#FFF0F2",
    borderRadius: 10,
  },
  textoError: { color: "#B8324A", fontSize: 12 },
});

export default VistaAdmin;