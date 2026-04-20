import { Main } from '../index';
import { container } from '../inversify.config';
process.env.PORT = '3000';
import { setup } from '../domain';
import { rabbitmqWrapper } from '../rabbitmq.wrapper';
import { redisWrapper } from '../redis.wrapper';
import { INLogger } from '@inv2/common';

jest.mock('../domain');
jest.mock('../rabbitmq.wrapper');
jest.mock('../redis.wrapper');
jest.mock('../inversify.config');
jest.mock('../app'); 
jest.mock('../events/listeners');
jest.mock('@inv2/common');

describe('Main', () => {
   let main: Main;
   let mockGrpcServer: any;
   let exitSpy: jest.SpyInstance;
   let logSpy: jest.SpyInstance;
   const mockApp: any = {};

   beforeEach(() => {
      jest.clearAllMocks();
      exitSpy = jest.spyOn(process, 'exit').mockImplementation((code?: string | number | null | undefined) => {
         throw new Error(`process.exit called with ${code}`);
      });
      logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      
      mockGrpcServer = {
         start: jest.fn().mockResolvedValue(undefined),
         stop: jest.fn().mockResolvedValue(undefined),
      };

      (container.get as jest.Mock).mockReturnValue(mockGrpcServer);
      (INLogger.init as jest.Mock).mockReturnValue(undefined);
      (INLogger.log as any) = {
         info: jest.fn(),
         error: jest.fn(),
      };
   });

   afterEach(() => {
      exitSpy.mockRestore();
      logSpy.mockRestore();
   });

   it('should start successfully when all dependencies are healthy', async () => {
      (setup as jest.Mock).mockResolvedValue(undefined);
      (redisWrapper.connect as jest.Mock).mockResolvedValue(undefined);
      (rabbitmqWrapper.connect as jest.Mock).mockResolvedValue(undefined);
      (rabbitmqWrapper as any).connection = { on: jest.fn() };

      main = new Main(mockApp);
      await (main as any).init(mockApp);

      expect(setup).toHaveBeenCalled();
      expect(redisWrapper.connect).toHaveBeenCalled();
      expect(rabbitmqWrapper.connect).toHaveBeenCalled();
      expect(mockGrpcServer.start).toHaveBeenCalled();
   });

   it('should exit when database setup fails', async () => {
      (setup as jest.Mock).mockRejectedValue(new Error('DB Fail'));

      main = new Main(mockApp);
      
      try {
         await (main as any).init(mockApp);
      } catch (e: any) {
         expect(e.message).toContain('process.exit called with 1');
      }

      expect(exitSpy).toHaveBeenCalledWith(1);
   });

   it('should exit when event bus connection fails', async () => {
      (setup as jest.Mock).mockResolvedValue(undefined);
      (redisWrapper.connect as jest.Mock).mockRejectedValue(new Error('Redis Fail'));

      main = new Main(mockApp);
      
      try {
         await (main as any).init(mockApp);
      } catch (e: any) {
         expect(e.message).toContain('process.exit called with 1');
      }

      expect(exitSpy).toHaveBeenCalledWith(1);
   });

   it('should exit when gRPC server fails to start', async () => {
      (setup as jest.Mock).mockResolvedValue(undefined);
      (redisWrapper.connect as jest.Mock).mockResolvedValue(undefined);
      (rabbitmqWrapper.connect as jest.Mock).mockResolvedValue(undefined);
      (rabbitmqWrapper as any).connection = { on: jest.fn() };
      mockGrpcServer.start.mockRejectedValue(new Error('gRPC Fail'));

      main = new Main(mockApp);
      
      try {
         await (main as any).init(mockApp);
      } catch (e: any) {
         expect(e.message).toContain('process.exit called with 1');
      }

      expect(exitSpy).toHaveBeenCalledWith(1);
   });
});
