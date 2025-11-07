import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

export class ProtoLoader {
   private static readonly PROTO_DIR = path.join(__dirname, 'proto');

   static loadProto(protoFileName: string) {
      const packageDefinition = protoLoader.loadSync(
         path.join(this.PROTO_DIR, protoFileName),
         {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true
         }
      );
      return grpc.loadPackageDefinition(packageDefinition);
   }
}