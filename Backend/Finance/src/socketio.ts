
import { Server } from 'socket.io';
import http from 'http';
import { Exception } from "@inv2/common";


class SocketIO {
   private cxn!: Server;
   
   get client() {
      if(!this.cxn) throw new Exception({code: 500, message: 'Cannot connecting to SocketIO'});
      return this.cxn;
   }

   connect(svr: http.Server) {
      this.cxn = new Server(svr, { cors: { origin: '*' } });
      return new Promise<void>((resolve, reject) => {
         this.client.on('connection', () => {
            console.log('Connected to socket');
            resolve();
         });
         this.client.on('error', (error: string) =>{
            reject(error);
         });
      });
   }
}
export const socketIO = new SocketIO;