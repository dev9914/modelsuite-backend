import handleAgencyToModelSocket from './agencyToModelSocket.js';

const registerSocketHandlers = (io, socket, connectedUsers) => {
  handleAgencyToModelSocket(io, socket, connectedUsers);
};

export default registerSocketHandlers;