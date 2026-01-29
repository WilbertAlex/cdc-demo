const { spawn } = require("child_process");
const path = require("path");
const { io } = require("socket.io-client");

// ¡Cambia esta URL por la tuya real cuando lo tengas!
const SOCKET_SERVER_URL = "https://";  // o http://... si no tienes https

const socket = io(SOCKET_SERVER_URL);

socket.on("connect", () => {
  console.log("¡Conectado al dashboard en cPanel! ");
});

socket.on("connect_error", (err) => {
  console.error("Error al conectar:", err.message);
});

// Ruta donde estará Maxwell (lo subiremos en el siguiente paso)
const maxwellPath = path.join(__dirname, "maxwell/lib/*");

const maxwell = spawn("java", [
  "-cp", maxwellPath,
  "com.zendesk.maxwell.Maxwell",
  "--user=maxwell",
  "--password=maxwell",
  "--host=tu-host-de-mysql",     // ej: "mysql.tudominio.com" o IP
  "--producer=stdout"
]);

maxwell.stdout.on("data", (data) => {
  const lines = data.toString().split("\n");
  lines.forEach(line => {
    if (line.trim().startsWith("{")) {
      try {
        const event = JSON.parse(line);
        console.log("Evento CDC →", event);
        socket.emit("cdc", event);
      } catch (e) {
        console.error("JSON malo:", line);
      }
    }
  });
});

maxwell.stderr.on("data", (data) => {
  console.error("Error de Maxwell:", data.toString());
});

maxwell.on("close", (code) => {
  console.log(`Maxwell se cerró con código ${code}`);
});