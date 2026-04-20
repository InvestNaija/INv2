/* eslint-disable @typescript-eslint/no-explicit-any */
import * as grpc from '@grpc/grpc-js';
import { ProtoLoader, INLogger } from '@inv2/common';
import { TYPES } from '../business/types';
import { inject, injectable } from 'inversify';
import { GRPHolidayService } from './services/grpc.holiday.service';

@injectable()
export class GrpcServer {
   private server: grpc.Server;

   constructor(
      @inject(TYPES.GRPHolidayService)
      private readonly gpcHolidayService: GRPHolidayService
   ) {
      this.server = new grpc.Server();
   }

   public async start(port: number): Promise<void> {
      // Load proto services
      const holidayProto = ProtoLoader.loadProto('holiday.proto');

      // Add services
      const holidayGrpc = holidayProto as grpc.GrpcObject;
      this.server.addService(
         (holidayGrpc.common as any).holiday.HolidayService.service,
         {
            IsHoliday: this.gpcHolidayService.IsHoliday,
            GetNextBusinessDay: this.gpcHolidayService.GetNextBusinessDay,
            GetPreviousBusinessDay: this.gpcHolidayService.GetPreviousBusinessDay,
            GetHolidayList: this.gpcHolidayService.GetHolidayList,
         }
      );

      return new Promise((resolve, reject) => {
         this.server.bindAsync(
            `0.0.0.0:${port}`,
            grpc.ServerCredentials.createInsecure(),
            (err: any, boundPort: number) => {
               if (err) {
                  INLogger.log.error(`gRPC server failed to bind on port ${port}:`, err);
                  reject(err);
                  return;
               }
               INLogger.log.info(`gRPC server running on port ${boundPort}`);
               resolve();
            }
         );
      });
   }

   public stop(): Promise<void> {
      return new Promise((resolve) => {
         this.server.tryShutdown(() => {
            INLogger.log.info('gRPC server stopped');
            resolve();
         });
      });
   }
}
