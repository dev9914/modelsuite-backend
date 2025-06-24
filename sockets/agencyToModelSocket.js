import AgencyToModelMessage from '../models/AgencytoModelMessage.js';

const handleAgencyToModelSocket = (io, socket, connectedUsers) => {
  socket.on('send_message_agency_model', async (data) => {
    try {
      const newMessage = await AgencyToModelMessage.create({
        senderId: data.senderId,
        receiverId: data.receiverId,
        senderModel: data.senderModel,
        receiverModel: data.receiverModel,
        text: data.text,
      });

      const receiverSocketId = connectedUsers.get(data.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receive_message_agency_model', newMessage.toObject());
      }
    } catch (err) {
      console.error('❌ Error in send_message_agency_model:', err.message);
    }
  });
};

export default handleAgencyToModelSocket;
