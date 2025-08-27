// ModalSeleccionarCliente.jsx
export default function ModalSeleccionarCliente({ onClienteSeleccionado, onClose }) {
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/clientes")
      .then(res => res.json())
      .then(data => setClientes(data))
      .catch(err => console.error("Error al cargar clientes:", err));
  }, []);

  const handleSeleccion = (cliente) => {
    onClienteSeleccionado(cliente); // pasa el cliente al padre
  };

  return (
    <div className="modal">
      <h3>Seleccionar cliente</h3>
      {clientes.map(cliente => (
        <div key={cliente.id}>
          <button onClick={() => handleSeleccion(cliente)}>
            {cliente.nombre}
          </button>
        </div>
      ))}
      <button onClick={onClose}>Cancelar</button>
    </div>
  );
}
