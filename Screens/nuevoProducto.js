// Hooks de React para cargar los datos iniciales y controlar el formulario.
import { useEffect, useState } from "react";
// Componentes nativos para construir el formulario y su comportamiento móvil.
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
// Mantiene el formulario dentro de los límites seguros de la pantalla.
import { SafeAreaView } from "react-native-safe-area-context";
// Iconos usados como apoyo visual en el formulario y sus botones.
import { Ionicons } from "@expo/vector-icons";
// Acceso al identificador de ruta y navegación de regreso al administrador.
import { useNavigation, useRoute } from "@react-navigation/native";
// Operaciones de Firestore para consultar, crear y actualizar productos.
import { addDoc, collection, doc, getDoc, getDocs, updateDoc, } from "firebase/firestore";
// Instancia compartida de Firestore configurada para la aplicación.
import { db } from "../firebase/config";

// Valores vacíos que sirven para inicializar y completar el formulario.
const initialValues = {
  nombre: "",
  precio: "",
  imagen: "",
  descripcion: "",
  color: "#F4F4F4",
  categoriaId: "",
};

const NuevoProducto = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const productId = route.params?.productId;
  const id = Array.isArray(productId) ? productId[0] : productId;
  const editando = Boolean(id);
  // Estado de los campos, categorías disponibles, carga, guardado y errores.
  const [formulario, setFormulario] = useState(initialValues);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(editando);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  // Carga las categorías y, cuando se está editando, recupera los datos
  // del producto para precargar los campos.
  useEffect(() => {
    const cargarFormulario = async () => {
      try {
        // Obtiene las categorías que el usuario puede asignar al producto.
        const categoriasSnapshot = await getDocs(collection(db, "Categorias"));
        setCategorias(
          categoriasSnapshot.docs.map((categoria) => ({
            id: categoria.id,
            ...categoria.data(),
          }))
        );

        if (id) {
          // Busca el producto por su ID; si no existe, muestra un mensaje.
          const productoSnapshot = await getDoc(doc(db, "Productos", id));
          if (!productoSnapshot.exists()) {
            setError("El producto que intentas editar ya no existe.");
            return;
          }
          const producto = productoSnapshot.data();
          // Combina valores iniciales con los datos encontrados y convierte
          // el precio en texto para poder mostrarlo en TextInput.
          setFormulario({
            ...initialValues,
            ...producto,
            precio: String(producto.precio ?? ""),
          });
        }
      } catch (e) {
        // Informa de forma visible si falla la consulta de categorías/producto.
        console.error("Error cargando el formulario de producto:", e);
        setError("No fue posible cargar los datos. Intenta nuevamente.");
      } finally {
        // Termina el estado de carga aun si la consulta falla.
        setCargando(false);
      }
    };

    cargarFormulario();
  }, [id]);

  // Actualiza únicamente el campo indicado conservando el resto del formulario.
  const cambiarCampo = (campo, valor) => {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
  };

  // Valida los datos y crea un documento nuevo o actualiza el producto existente.
  const guardarProducto = async () => {
    // Elimina espacios sobrantes del nombre y convierte el precio a número.
    const nombre = formulario.nombre.trim();
    const precio = Number(formulario.precio);

    // Rechaza campos obligatorios vacíos, precios no numéricos o negativos.
    if (!nombre || !formulario.precio.trim() || !Number.isFinite(precio) || precio < 0) {
      setError("Ingresa un nombre y un precio válido (cero o mayor).");
      return;
    }

    setError("");
    setGuardando(true);
    // Prepara el objeto con los campos que se guardarán en Firestore.
    const datos = {
      nombre,
      precio,
      imagen: formulario.imagen.trim(),
      descripcion: formulario.descripcion.trim(),
      color: formulario.color.trim() || "#F4F4F4",
      categoriaId: formulario.categoriaId || null,
    };

    try {
      if (id) {
        // Con ID, se actualiza el documento existente.
        await updateDoc(doc(db, "Productos", id), datos);
      } else {
        // Sin ID, se agrega un documento nuevo a la colección Productos.
        await addDoc(collection(db, "Productos"), datos);
      }
      // Vuelve a la pantalla anterior, cuya lista se recarga al tomar el foco.
      navigation.goBack();
    } catch (e) {
      // Deja el formulario abierto e informa si Firestore no pudo guardar.
      console.error("Error guardando producto:", e);
      setError("No fue posible guardar el producto. Intenta nuevamente.");
    } finally {
      // Habilita nuevamente los controles al terminar el intento de guardado.
      setGuardando(false);
    }
  };

  // Durante la carga de los datos de edición, muestra un indicador centrado.
  if (cargando) {
    return (
      <View style={styles.cargando}>
        <ActivityIndicator color="#5546D7" size="large" />
      </View>
    );
  }

  return (
    // Área segura inferior, útil para evitar solapamiento con elementos del sistema.
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      {/* Ajusta el diseño cuando aparece el teclado, especialmente en iOS. */}
      <KeyboardAvoidingView
        style={styles.contenedor}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Permite desplazar el formulario cuando el contenido o teclado no caben. */}
        <ScrollView
          contentContainerStyle={styles.contenido}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Presentación del formulario; el icono y el texto dependen del modo. */}
          <View style={styles.intro}>
            <View style={styles.icono}>
              <Ionicons
                name={editando ? "create-outline" : "cube-outline"}
                size={25}
                color="#5546D7"
              />
            </View>
            <Text style={styles.titulo}>
              {editando ? "Editar producto" : "Nuevo producto"}
            </Text>
            <Text style={styles.subtitulo}>
              Completa los datos para {editando ? "actualizar" : "agregar"} el producto.
            </Text>
          </View>

          {/* Muestra los errores de validación o de operaciones con Firestore. */}
          {error ? <Text style={styles.error}>{error}</Text> : null}

          {/* Campo obligatorio del nombre del producto. */}
          <Text style={styles.etiqueta}>Nombre del producto *</Text>
          <TextInput
            value={formulario.nombre}
            onChangeText={(valor) => cambiarCampo("nombre", valor)}
            placeholder="Ej. Tenis deportivos"
            placeholderTextColor="#9B9AAF"
            style={styles.input}
            maxLength={100}
            returnKeyType="next"
          />

          {/* Campo obligatorio del precio, con teclado numérico decimal. */}
          <Text style={styles.etiqueta}>Precio *</Text>
          <View style={styles.precioInput}>
            <Text style={styles.simboloPrecio}>$</Text>
            <TextInput
              value={formulario.precio}
              onChangeText={(valor) => cambiarCampo("precio", valor)}
              placeholder="0.00"
              placeholderTextColor="#9B9AAF"
              style={styles.inputPrecio}
              keyboardType="decimal-pad"
            />
          </View>

          {/* Campo opcional para la dirección web de la imagen del producto. */}
          <Text style={styles.etiqueta}>URL de la imagen</Text>
          <TextInput
            value={formulario.imagen}
            onChangeText={(valor) => cambiarCampo("imagen", valor)}
            placeholder="https://..."
            placeholderTextColor="#9B9AAF"
            style={styles.input}
            autoCapitalize="none"
            keyboardType="url"
          />

          {/* Campo de texto multilínea para información adicional del producto. */}
          <Text style={styles.etiqueta}>Descripción</Text>
          <TextInput
            value={formulario.descripcion}
            onChangeText={(valor) => cambiarCampo("descripcion", valor)}
            placeholder="Detalles del producto"
            placeholderTextColor="#9B9AAF"
            style={[styles.input, styles.inputDescripcion]}
            multiline
            textAlignVertical="top"
            maxLength={500}
          />

          {/* Permite asignar una categoría o continuar sin categoría si no hay. */}
          <Text style={styles.etiqueta}>Categoría</Text>
          {categorias.length > 0 ? (
            <View style={styles.categorias}>
              {/* Cada categoría funciona como selector y refleja su selección. */}
              {categorias.map((categoria) => {
                const seleccionada = formulario.categoriaId === categoria.id;
                return (
                  <Pressable
                    key={categoria.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: seleccionada }}
                    style={[
                      styles.categoria,
                      seleccionada && styles.categoriaSeleccionada,
                    ]}
                    onPress={() =>
                      cambiarCampo(
                        "categoriaId",
                        seleccionada ? "" : categoria.id
                      )
                    }
                  >
                    <Text
                      style={[
                        styles.textoCategoria,
                        seleccionada && styles.textoCategoriaSeleccionada,
                      ]}
                    >
                      {categoria.nombre || "Categoría"}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <Text style={styles.ayudaCategoria}>
              No hay categorías disponibles; puedes guardar el producto sin categoría.
            </Text>
          )}

          {/* Guarda el producto y muestra un indicador mientras espera a Firestore. */}
          <Pressable
            accessibilityRole="button"
            disabled={guardando}
            style={[styles.botonGuardar, guardando && styles.botonDeshabilitado]}
            onPress={guardarProducto}
          >
            {guardando ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                <Text style={styles.textoGuardar}>
                  {editando ? "Guardar cambios" : "Agregar producto"}
                </Text>
              </>
            )}
          </Pressable>

          {/* Regresa sin guardar; se bloquea mientras una operación está activa. */}
          <Pressable
            accessibilityRole="button"
            disabled={guardando}
            style={styles.botonCancelar}
            onPress={() => {
              if (!guardando) router.back();
            }}
          >
            <Text style={styles.textoCancelar}>Cancelar</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Estilos visuales separados por áreas: presentación, campos, categorías,
// mensajes de error, acciones y estado de carga.
const styles = StyleSheet.create({
  // Contenedores generales y presentación introductoria.
  safeArea: { flex: 1, backgroundColor: "#F7F7FC" },
  contenedor: { flex: 1 },
  contenido: { padding: 20, paddingBottom: 32 },
  intro: { alignItems: "center", marginBottom: 24 },
  icono: {
    width: 54,
    height: 54,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEECFF",
    marginBottom: 12,
  },
  // Título, subtítulo y etiquetas que describen los campos.
  titulo: { color: "#29283C", fontSize: 23, fontWeight: "800" },
  subtitulo: {
    color: "#77768F",
    fontSize: 13,
    textAlign: "center",
    marginTop: 5,
  },
  etiqueta: {
    color: "#39384D",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 7,
    marginTop: 15,
  },
  // Apariencia de los campos de texto y del campo compuesto de precio.
  input: {
    minHeight: 49,
    borderWidth: 1,
    borderColor: "#E5E4EF",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    color: "#29283C",
    fontSize: 14,
  },
  precioInput: {
    minHeight: 49,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E4EF",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
  },
  simboloPrecio: { color: "#77768F", fontSize: 15, fontWeight: "700" },
  inputPrecio: { flex: 1, color: "#29283C", fontSize: 14, paddingLeft: 10 },
  inputDescripcion: { minHeight: 94, paddingTop: 13 },
  // Distribución y aspecto normal/seleccionado de los selectores de categoría.
  categorias: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  categoria: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E4EF",
    borderWidth: 1,
  },
  categoriaSeleccionada: { backgroundColor: "#5546D7", borderColor: "#5546D7" },
  textoCategoria: { color: "#5E5D74", fontSize: 12, fontWeight: "600" },
  textoCategoriaSeleccionada: { color: "#FFFFFF" },
  ayudaCategoria: { color: "#77768F", fontSize: 12, lineHeight: 18 },
  // Mensaje que informa errores al cargar o guardar el producto.
  error: {
    color: "#B8324A",
    backgroundColor: "#FFF0F2",
    borderRadius: 10,
    padding: 11,
    fontSize: 12,
    lineHeight: 18,
  },
  // Botones para guardar y cancelar, incluido el aspecto durante el guardado.
  botonGuardar: {
    height: 52,
    borderRadius: 13,
    marginTop: 27,
    backgroundColor: "#5546D7",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  botonDeshabilitado: { opacity: 0.7 },
  textoGuardar: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  botonCancelar: { alignItems: "center", padding: 15, marginTop: 4 },
  textoCancelar: { color: "#77768F", fontSize: 14, fontWeight: "600" },
  // Posición del indicador que aparece mientras se cargan datos existentes.
  cargando: { flex: 1, alignItems: "center", justifyContent: "center" },
});

export default NuevoProducto;