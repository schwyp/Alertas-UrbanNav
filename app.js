const { Server } = require("socket.io");

const io = new Server({ 
  cors: {
    origin: "http://localhost:3002",
    methods: ["GET", "POST"]
  }
});


io.on("connection", async (socket) => {
  const { idUsuario, tipoUsuario } = socket.handshake.query;
  // console.log(socket.handshake.query)



  if(tipoUsuario === 'CONDUCTOR'){
    console.log(`Conductor conectado ${idUsuario}`);
    socket.join("CONDUCTORES");

    //emit to conductores room a message
    io.to("CONDUCTORES").emit("message", "Otro conductor se ha conectado");
    
  }

  if(tipoUsuario === 'CLIENTE'){
    console.log(`Cliente conectado ${idUsuario}`);
    socket.join("CLIENTES");

    socket.on("alertar-conductores" , (data) => {
      const { conductoresCercanos, cliente } = data

      //obtener informacion de todos los conductores en la sala de conductores
      console.log(conductoresCercanos, cliente)

      conductoresCercanos.forEach(({ idMongoDB }) => {
        //send to all conductores in the room
        socket.to(idMongoDB).emit("message", "saaasdsdadsasaddsasdsdasadsa");
      }) 
    })
    
  }

  
  // Manejar el evento disconnect
  socket.on("disconnect", () => {
    console.log('usuario desconectado: ', idUsuario, ' tipo: ', tipoUsuario);
    // Puedes realizar acciones adicionales cuando un usuario se desconecta
  });
  
  
  
});

// io.on('disconnect', () => {
//   console.log('Conductor desconectado');
// });


io.listen(5050);