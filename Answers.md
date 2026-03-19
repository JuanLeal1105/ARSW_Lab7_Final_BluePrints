# Laboratorio 7 - Blueprints en Tiempo Real

**Realizado por**

Juan Carlos Leal

Sebastián Villarraga


## **Resumen del Laboratorio**
Este repositorio contiene la implementación de un sistema de colaboración en tiempo real para el manejo de planos arquitectónicos (Blueprints). El proyecto integra una API RESTful para operaciones CRUD y un servidor Socket.IO para el dibujo colaborativo simultáneo.

### **Cambios y Especicifaciones en el Backend**
Para verificar el backend por favor dirigirse a este link:

[ARSW_Lab5_Security (Backend)](https://github.com/JuanLeal1105/ARSW_Lab5_BluePrints_Security)

#### **No se realizaron cambios en el backend de Spring Boot.** 
De acuerdo con los lineamientos del laboratorio, se permitía elegir entre implementar el tiempo real vía STOMP (modificando Spring Boot) o vía Socket.IO (creando un servidor Node.js independiente). Al elegir **Socket.IO (Opción A)**, el backend de Java se mantuvo intacto, dedicándose exclusiva y eficientemente a manejar la persistencia de datos (CRUD) y la seguridad vía JWT, sin mezclar la lógica de mensajería efímera.

#### **Requerimiento funcional. Docker para Persistencia ❗️**
Es necesario para el funcionamiento del front que el backend esté corriendo antes de iniciar cualquier operación con el front y de igual forma la base de datos que se creo de PostgreSQL haciendo uso de docker debe de estar corriendo, de tal forma que para ello se usa el sigueinte comando:
```bash
docker compose up -d
```

Lo anterior funciona debido a que dentro del Backend se tiene un `docker-compose.yml`. En dado caso que ya se tenga el conteneder corriendo, se puede obviar el comando anterior y proceder a correr el código.

## Parte 1. Arquitectura de Socket.IO
Para garantizar que los trazos de un usuario no interfieran con los de otro que esté visualizando un plano diferente, implementamos una arquitectura basada en **Salas (Rooms)** de Socket.IO, complementada con eventos globales para el Dashboard.

1. **Aislamiento por Plano:** Utilizamos una convención de nomenclatura estricta para las salas: `blueprints.{author}.{name}`.
2. **Flujo de Eventos:**
   - **`join-room`**: Al entrar a la vista de detalle, el cliente emite este evento para suscribirse únicamente a los cambios de ese plano específico.
   - **`draw-event`**: Cuando el usuario hace clic en el canvas, emite este evento con el payload `{ room, author, name, point: { x, y } }`.
   - **`blueprint-update`**: El servidor recibe el punto y hace un *broadcast* (`socket.to(room).emit`) a todos los demás clientes en la sala, excluyendo al emisor original.
   - **`dashboard-update` y `refresh-dashboard`:** Eventos de sincronización global. Si un usuario crea o elimina un plano desde la vista principal, se emite dashboard-update. El servidor retransmite refresh-dashboard a los demás usuarios para que actualicen sus tablas en tiempo real sin tener que recargar la página manualmente.

## Parte 2. Cambios en el Frontend (React)
Para que el cliente consumiera tanto el CRUD como los WebSockets, realizamos las siguientes modificaciones estratégicas:
- **Gestión de Conexión (`src/lib/socketIoClient.js`):** Se centralizó la lógica de instanciación de Socket.IO utilizando las variables de entorno (`VITE_IO_BASE`) para no contaminar los componentes de UI con URLs quemadas.
- **Estado Global (`blueprintsSlice.js`):** Se añadió el reducer `syncBlueprintPoints`. Esto centraliza todos los puntos (tanto los locales recién dibujados como los entrantes por WebSockets) en una única fuente de verdad cronológica en Redux, evitando que las líneas se rendericen distorsionadas por desincronización de arrays.
- **Vista de Detalle (`BlueprintDetailPage.jsx`):** Se integró el ciclo de vida de React (`useEffect`) con el de Socket.IO para unirse a la sala al montar el componente y desconectarse al desmontarlo. También gestiona la separación entre los puntos efímeros de la sesión y la acción de guardarlos permanentemente en la base de datos (REST).
- **Panel del Autor (`BlueprintsPage.jsx`- `CreateBlueprintModal.jsx`):** Se conectó el Dashboard a Socket.IO. Ahora, al crear un nuevo plano exitosamente desde el modal o eliminar uno de la tabla, se dispara un evento global de socket. Esto causa que todos los demás clientes en red re-despachen sus peticiones REST (fetchAllBlueprints) de forma automática, manteniendo las listas sincronizadas.
  - Se añadió lógica usando la función `reduce()` de JavaScript para calcular y renderizar dinámicamente el total histórico de puntos dibujados por un autor consultado.

### **Configuración de Variables de Entorno (`.env.local`)**
Para que el frontend se comunique correctamente con los dos backends (Java y Node.js), se configuró un archivo `.env.local` en la raíz del proyecto Frontend. Este archivo separa las rutas de desarrollo y facilita la transición a producción:
```env
# Backend Spring Boot (REST CRUD - Peticiones tradicionales)
VITE_API_BASE_URL=<your-backend-URL>

# Backend Node.js (Socket.IO Real-Time - Conexión de WebSockets)
VITE_IO_BASE=<your-socket-URL>

# Backend Spring Boot (Preparado en caso de usar STOMP en el futuro)
VITE_STOMP_BASE=ws:<your-backend-URL>
```

Acá está la explciación para cada variable de entorno:
- `VITE_API_BASE_URL` es interceptado por Axios para autenticar y manejar el CRUD.
- `VITE_IO_BASE` es consumido directamente por nuestra librería en socketIoClient.js para establecer el túnel TCP bidireccional.

## **Parte 3. Ejecución para WebSocket `server.js`**
El archivo `server.js` es un microservicio independiente construido en Node.js y Express. Dentro de este proyecto se encuentras ubicado en el .zip con el nombre `blueprints-socketio-server`.

### **¿Por qué fue necesario crearlo si ya teníamos Spring Boot?**
Socket.IO no es simplemente una implementación estándar de WebSockets (ws://); es un protocolo de mensajería completo que incluye long-polling fallbacks, reconexión automática y gestión nativa de canales ("rooms"). Spring Boot no soporta nativamente el protocolo de Socket.IO sin usar complejas dependencias de terceros. Por lo tanto, la solución más limpia y escalable fue delegar esta responsabilidad a Node.js.

### **¿Qué hace exactamente este servidor?**
Actúa exclusivamente como un Message Broker (enrutador de mensajes en memoria hiper-rápido):
1. No usa base de datos: No le importa la persistencia, de eso se encarga Java.
2. Manejo de estado efímero: Mantiene en la memoria RAM un registro de qué socket.id (usuario) está suscrito a qué sala (blueprints.juan.plano-1).
3. Distribución de baja latencia: Recibe coordenadas {x, y} de un emisor y las retransmite instantáneamente al resto de la sala, logrando la sensación de "tiempo real".
4. Sincronización Global: Notifica a través de un broadcast masivo cuando ocurren cambios a nivel de arquitectura (creación/eliminación de planos) para forzar la actualización del Frontend basado en REST.

## **Parte 4. Puesta en Marcha (Cómo correr el proyecto)**
El sistema consta de tres componentes que deben ejecutarse en paralelo:
- Backend CRUD (Spring Boot):
  - Asegúrate de tener la BD corriendo.
  - Ejecuta: `./mvnw spring-boot:run` o en dado caso corre el proyecto desde el botón run del IDE
  - Expone: http://localhost:8080

- Backend Real-Time (Node.js):
  - Ve a la carpeta blueprints-socketio-server. (`cd blueprints-socketio-server`)
  - Ejecuta los siguientes comandos:
    ```bash
    npm install
    node server.js
    ```
  - Expone: http://localhost:3001

- Frontend (React / Vite):
  - Ve a la carpeta del frontend (asegúrate de tener el .env.local).
  - Ejecuta los siguientes comandos:
    ```bash
    npm install
    npm run dev
    ```
  - Expone: http://localhost:5173
 
### **Video de muestra. Sockets Funcionando**
[![Watch the demo](https://img.youtube.com/vi/TpXhPHqDAxg/0.jpg)](https://youtu.be/TpXhPHqDAxg)

## **Parte 5. Pruebas y Aseguramiento de Calidad (Vitest)**

## **Parte 6. Observabilidad y Seguridad**
El microservicio de Node.js (server.js) implementa requisitos clave de grado producción:
- Restricción de Orígenes (CORS): Se configuró explícitamente cors({ origin: ['http://localhost:5173'] }). El servidor rechaza cualquier conexión WebSocket que provenga de un dominio distinto al de nuestro frontend autorizado.
- Health Check (GET /health): Se expuso un endpoint HTTP que retorna el estado de vida del servicio ({ status: 'UP', uptime: ... }). Esto es crucial para balanceadores de carga o monitores de orquestadores (como Docker/K8s).
- Validación de Payloads: Antes de emitir un punto al resto de usuarios, el servidor evalúa manualmente que el objeto exista y que x e y sean del tipo number. Si un atacante inyecta strings o scripts, el servidor lo aborta y lanza un log de advertencia [WARN].
- Opcional (JWT): Aunque la autenticación fuerte se maneja en el CRUD de Spring Boot, la separación de responsabilidades permite mantener la latencia del dibujo al mínimo (sin validar firmas RSA por cada milisegundo de movimiento del cursor).

## **Parte 7. Análisis: Socket.IO vs STOMP**

