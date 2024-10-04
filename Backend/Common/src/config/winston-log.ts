
import { format, createLogger, transports } from "winston";
import Transport, { TransportStreamOptions } from 'winston-transport';
import { LogCreatedPublisher } from "../events/common-publisher/log-created";
import { Connection } from "amqplib";

interface INv2TransportOptions extends TransportStreamOptions {
   endpoint: string
}
class INv2Transport extends Transport {
   private logPublisher: LogCreatedPublisher;
   constructor(opts: INv2TransportOptions, rabbitMQcxn: Connection) {
      super(opts);
      //
      // Consume any custom options here. e.g.:
      // - Connection information for databases
      // - Authentication information for APIs (e.g. loggly, papertrail, logentries, etc.).
      //
      this.logPublisher = new LogCreatedPublisher(rabbitMQcxn)
   }
  
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   log(info: any, callback: any) {
      setImmediate(() => {
         this.emit('logged', info);
      });      
      // Perform the writing to the remote service
      this.logPublisher.publish({
        level: info.level,
        service: info.service,
        message: info.message,
        timestamp: info.timestamp
      });
      callback();
   }
};
class Logger {
   private service!: string;
   private cxn!: Connection;
   init(service: string, cxn: Connection) {
      this.service = service;
      this.cxn = cxn
   }
   get log() {
      return createLogger({
         level: 'info',
         transports: [
            new transports.Console(),
            new INv2Transport({
               level: 'info',
               endpoint: 'none',
            }, this.cxn)
         ],
         format: format.combine(
            // format.colorize(),
            format.timestamp({ format: 'MMM-DD-YYYY HH:mm:ss' }),
            format.json(),
            format.prettyPrint(),
            format.errors({stack: true})
         ),
         defaultMeta: { service: this.service }
      });
   }
}
export const INLogger = new Logger;