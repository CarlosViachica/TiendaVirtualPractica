import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { addDoc, collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";

const NuevoProducto = ({ route, navigation }) => {
  const productoEditar = route?.params?.producto;

  const [categorias, setCategorias] = useState([]);
  const [formulario, setFormulario] = useState({
    nombre: "",
    precio: "",
    categoriaId: "",
    descripcion: "",
    imagen: "",
  });

  const normalizarTexto = (valor) =>
    String(valor ?? "").trim().toLowerCase();

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

  const resolverCategoriaId = (valor) => {
    const texto = normalizarTexto(valor);

    if (!texto) {
      return "general";
    }

    const categoriaEncontrada = categorias.find((categoria) => {
      const opcionesCategoria = [
        normalizarTexto(categoria.id),
        normalizarTexto(categoria.nombre),
      ];

      return opcionesCategoria.includes(texto);
    });

    return categoriaEncontrada ? categoriaEncontrada.id : texto;
  };

  useEffect(() => {
    obtenerCategorias();
  }, []);

  useEffect(() => {
    if (!productoEditar) {
      return;
    }

    const categoriaActual = categorias.find((categoria) => {
      const opcionesCategoria = [
        normalizarTexto(categoria.id),
        normalizarTexto(categoria.nombre),
      ];

      return opcionesCategoria.includes(normalizarTexto(productoEditar.categoriaId || productoEditar.categoriaNombre || ""));
    });

    setFormulario({
      nombre: productoEditar.nombre || "",
      precio: String(productoEditar.precio || ""),
      categoriaId: categoriaActual?.nombre || productoEditar.categoriaNombre || productoEditar.categoriaId || "",
      descripcion: productoEditar.descripcion || "",
      imagen: productoEditar.imagen || "",
    });
  }, [productoEditar, categorias]);

  const actualizarCampo = (campo, valor) => {
    setFormulario((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  };

  const guardarProducto = async () => {
    if (!formulario.nombre.trim()) {
      Alert.alert("Campo requerido", "Escribe el nombre del producto.");
      return;
    }

    if (!formulario.precio || Number(formulario.precio) <= 0) {
      Alert.alert("Campo requerido", "Ingresa un precio válido.");
      return;
    }

    try {
      const categoriaSeleccionada = categorias.find((categoria) => {
        const opcionesCategoria = [
          normalizarTexto(categoria.id),
          normalizarTexto(categoria.nombre),
        ];

        return opcionesCategoria.includes(normalizarTexto(formulario.categoriaId));
      });

      const producto = {
        nombre: formulario.nombre.trim(),
        precio: Number(formulario.precio),
        categoriaId: resolverCategoriaId(formulario.categoriaId),
        categoriaNombre: categoriaSeleccionada?.nombre || formulario.categoriaId.trim() || "General",
        descripcion: formulario.descripcion.trim(),
        imagen:
          formulario.imagen.trim() ||
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
      };

      if (productoEditar?.id) {
        await updateDoc(doc(db, "Productos", productoEditar.id), producto);
      } else {
        await addDoc(collection(db, "Productos"), producto);
      }

      navigation.goBack();
    } catch (error) {
      console.error("Error al guardar el producto: ", error);
      Alert.alert("Error", "No se pudo guardar el producto.");
    }
  };

  return (
    <ScrollView style={styles.contenedor}>
      <View style={styles.card}>
        <Text style={styles.titulo}>
          {productoEditar ? "Editar producto" : "Nuevo producto"}
        </Text>

        <Text style={styles.label}>Nombre</Text>
        <TextInput
          style={styles.input}
          value={formulario.nombre}
          onChangeText={(texto) => actualizarCampo("nombre", texto)}
          placeholder="Ej: Camiseta básica"
        />

        <Text style={styles.label}>Precio</Text>
        <TextInput
          style={styles.input}
          value={formulario.precio}
          onChangeText={(texto) => actualizarCampo("precio", texto)}
          placeholder="Ej: 499.99"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Categoría</Text>
        <TextInput
          style={styles.input}
          value={formulario.categoriaId}
          onChangeText={(texto) => actualizarCampo("categoriaId", texto)}
          placeholder="Ej: ropa"
        />

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formulario.descripcion}
          onChangeText={(texto) => actualizarCampo("descripcion", texto)}
          placeholder="Descripción del producto"
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>URL de imagen</Text>
        <TextInput
          style={styles.input}
          value={formulario.imagen}
          onChangeText={(texto) => actualizarCampo("imagen", texto)}
          placeholder="https://..."
        />

        <TouchableOpacity style={styles.botonGuardar} onPress={guardarProducto}>
          <Text style={styles.botonTexto}>{productoEditar ? "Guardar cambios" : "Agregar producto"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botonCancelar} onPress={() => navigation.goBack()}>
          <Text style={styles.botonCancelarTexto}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#F6F7FB",
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 18,
  },
  label: {
    marginBottom: 8,
    color: "#374151",
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    backgroundColor: "#F9FAFB",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  botonGuardar: {
    backgroundColor: "#6C63FF",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  botonTexto: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  botonCancelar: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 12,
  },
  botonCancelarTexto: {
    color: "#374151",
    fontWeight: "600",
  },
});

export default NuevoProducto;
