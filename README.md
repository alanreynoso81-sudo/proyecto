# Proyecto biblioteca

Pagina web local organizada con frontend separado y backend en Node.js/Express conectado a MongoDB.

## Estructura

- `PAGINA WEB/index.html`: pagina principal.
- `PAGINA WEB/css/style.css`: estilos separados del HTML.
- `PAGINA WEB/js/script.js`: JavaScript del navegador.
- `server/server.js`: servidor Express y conexion a MongoDB.
- `.env.example`: variables de entorno de ejemplo.

## Configuracion

1. Instala Node.js con npm si no esta disponible.
2. Instala MongoDB local o usa MongoDB Atlas.
3. Copia `.env.example` a `.env`.
4. Ajusta `MONGODB_URI` si usas otra conexion.
5. Ejecuta:

```bash
npm install
npm start
```

Despues abre `http://localhost:3000`.

## Publicacion gratis

Para publicar el proyecto completo se puede usar:

- GitHub para guardar el codigo.
- Render para hospedar el servidor Node/Express.
- MongoDB Atlas M0 para una base de datos gratis.

En Render se deben configurar estas variables:

- `MONGODB_URI`: cadena de conexion de MongoDB Atlas.
- `MONGODB_DB_NAME`: `proyecto_liz`.
