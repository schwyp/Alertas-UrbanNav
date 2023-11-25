const { Server } = require("socket.io");

const io = new Server({ 
  cors: {
    origin: "http://localhost:3002",
    methods: ["GET", "POST"]
  }
});

const usuariosConectados = {}; // Objeto para mapear usuarioId a socket.id

io.on("connection", async (socket) => {
  const { idUsuario, tipoUsuario } = socket.handshake.query;

  //si el idUsuario ya existe en el objeto usuariosConectados, entonces se elimina el socket.id anterior
  //y se reemplaza por el nuevo
    usuariosConectados[idUsuario] = socket.id;

  // console.log(usuariosConectados)

  if(tipoUsuario === 'CONDUCTOR'){
    console.log(`Conductor conectado ${idUsuario}`);
    socket.join("CONDUCTORES");

    //emit to conductores room a message
    // io.to("CONDUCTORES").emit("message", "Otro conductor se ha conectado");

    socket.on("servicio-tomado", (id) => {

      //send to all conductores in the room
      socket.to("CONDUCTORES").emit("actualizacion-servicios", id);

    })

    socket.on('servicio-solicitud-a-cliente' , (info) => {
      console.log('servico-solicitud-a-cliente')
      console.log(info)
      const idCliente = info.servicio.idCliente
      const socketIdCliente = usuariosConectados[idCliente]
      console.log(socketIdCliente)
      io.to(socketIdCliente).emit("servicio-solicitud-de-conductor", info);
    })

    socket.on('llego-origen', (servicio) => {
      console.log('llego-origen')
      const idCliente = servicio.idCliente
      const socketIdCliente = usuariosConectados[idCliente]
      console.log(socketIdCliente)
      io.to(socketIdCliente).emit("llego-origen-conductor", servicio);
    })
    
  }

  if(tipoUsuario === 'CLIENTE'){
    console.log(`Cliente conectado ${idUsuario}`);
    socket.join("CLIENTES");

    socket.on("alertar-conductores" , (info) => {
      console.log('ALERTAR CONDUCTORES')
      const { conductoresCercanos, cliente } = info

      //obtener informacion de todos los conductores en la sala de conductores
      conductoresCercanos.forEach((data) => {
        //send to all conductores in the room
        
        console.log(data.idMongoDB, usuariosConectados[data.idMongoDB])
        io.to(usuariosConectados[data.idMongoDB]).emit("nuevo-servicio", info);
        // socket.to("CONDUCTORES").emit("message", data);
      }) 
    })

    socket.on('servicio-solicitud-cliente-aceptada' , (info) => {
      console.log('servicio-solicitud-cliente-aceptada')
      const idConductor = info.conductor.idMongoDB
      const socketIdConductor = usuariosConectados[idConductor]
      console.log(socketIdConductor)
      io.to(socketIdConductor).emit("servicio-solicitud-aceptada", info);
    })

    socket.on('servicio-solicitud-cliente-rechazada' , (info) => {
      console.log('servicio-solicitud-cliente-rechazada')
      const idConductor = info.conductor.idMongoDB
      const socketIdConductor = usuariosConectados[idConductor]
      console.log(socketIdConductor)
      io.to(socketIdConductor).emit("servicio-solicitud-rechazada", info);
    })
    
  }

  
  // Manejar el evento disconnect
  socket.on("disconnect", () => {
    console.log('usuario desconectado: ', idUsuario, ' tipo: ', tipoUsuario);
    delete usuariosConectados[idUsuario];
  });
  
  
  
});

// io.on('disconnect', () => {
//   console.log('Conductor desconectado');
// });


io.listen(5050);