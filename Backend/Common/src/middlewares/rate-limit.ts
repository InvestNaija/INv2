import { RateLimiterRedis } from 'rate-limiter-flexible';
import { RedisClientType } from 'redis';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { EmailBuilderService } from '../services/email-builder.service';
import { Exception } from '../errors';

interface RateLimiterConfig {
   max?: number;
   windowMs?: number;
   subject: string;
}

export class RateLimiter {
   private static instanceCount = 0;
   private static redisClient: RedisClientType;

   /**
      * Optional: Set the global Redis client for all rate limiters.
      * If not set, it must be provided to individual limiters or used from a shared pool.
      */
   static init(client: RedisClientType) {
      this.redisClient = client;
   }

   /**
    * Returns a raw RateLimiterRedis instance for manual consumption.
    * Useful for cases like failed login attempts where we only consume on failure.
    */
   static getRawLimiter(subject: string, max: number, windowMs: number): RateLimiterRedis {
      if (!this.redisClient) {
         throw new Error('RateLimiter: Redis client not initialized. Call RateLimiter.init(client) first.');
      }

      return new RateLimiterRedis({
         storeClient: this.redisClient,
         points: max,
         duration: Math.ceil(windowMs / 1000),
         keyPrefix: `rl:${subject.replace(/\s+/g, '_').toLowerCase()}`,
      });
   }

   static limit(config: RateLimiterConfig | number, windowMsPositional?: number): RequestHandler {
      const id = ++RateLimiter.instanceCount;
      
      let max = 2; // Default points
      let windowMs = 600000; // Default 10 minutes
      let subject: string;

      // Handle configuration object or positional arguments
      if (typeof config === 'object' && !Array.isArray(config)) {
         max = config.max || max;
         windowMs = config.windowMs || windowMs;
         subject = config.subject;
      } else {
         max = (config as number) || max;
         if (windowMsPositional) windowMs = windowMsPositional;
         subject = 'Rate Limit Exceeded'; // Default subject if not provided in positional
      }

      if (!subject) {
         throw new Error('RateLimiter: "subject" is required in the configuration object.');
      }

      console.warn(`[RateLimiter] [ID:${id}] Initializing for subject: ${subject}. NODE_ENV: ${process.env.NODE_ENV}`);

      // Skip rate limiting if not in production
      if (process.env.NODE_ENV !== 'production') {
         return (req: Request, res: Response, next: NextFunction) => next();
      }

      if (!this.redisClient) {
         throw new Error('RateLimiter: Redis client not initialized. Call RateLimiter.init(client) first.');
      }

      const limiter = new RateLimiterRedis({
         storeClient: this.redisClient,
         points: max,
         duration: Math.ceil(windowMs / 1000),
         keyPrefix: `rl:${subject.replace(/\s+/g, '_').toLowerCase()}`,
      });

      return async (req: Request, res: Response, next: NextFunction) => {
         // Use real IP if behind a proxy
         const key = (req.headers?.['x-real-ip'] as string) || req.ip || '';
         console.warn(`[RateLimiter] [ID:${id}] [${new Date().toISOString()}] Request Hit. Key: ${key}. URL: ${req.originalUrl}`);

         try {
            const rateLimiterRes = await limiter.consume(key);
            console.warn(`[RateLimiter] [ID:${id}] [${new Date().toISOString()}] Successfully consumed point for ${key}. Remaining Points: ${rateLimiterRes.remainingPoints}. msBeforeNext: ${rateLimiterRes.msBeforeNext}`);
            next();
         } catch (rateLimiterRes: any) {
            console.warn(`[RateLimiter] [ID:${id}] [${new Date().toISOString()}] !!! RATE LIMIT EXCEEDED for ${key}. Hits: ${rateLimiterRes.consumedPoints}. Max: ${max}`);
         
            const currentHits = rateLimiterRes.consumedPoints || 'Unknown';
            
            // Mail to customer (optional based on whether req.currentUser or req.user exists)
            const user = (req as any).currentUser || (req as any).user;
            if (user && user.email) {
               new EmailBuilderService({ recipient: user.email, sender: 'no-reply@investnaija.com', subject })
                  .setCustomerDetails(user)
                  .setEmailType({
                  type: 'login_failed', // Reusing login_failed or a custom one if available. 
                  // Note: EmailBuilderService matches on 'type'. If 'type' is not found, it uses 'message' from meta.
                  meta: { 
                     name: user.firstName,
                     message: `
                        <p>We noticed too many requests from your account in a short period.</p>
                        <p>If this wasn't you, please contact support immediately.</p>
                     `
                  }
               }).execute();
            }

            // Mail to admin
            new EmailBuilderService({ 
               recipient: ['integrations@chapelhilldenham.com', 'riskmanagement@chapelhilldenham.com'], 
               sender: 'no-reply@investnaija.com', 
               subject 
            })
               .setCustomerDetails({ firstName: 'Support', email: 'info@investnaija.com' } as any)
               .setEmailType({
                  type: 'admin_alert', // This type might not exist, but setEmailType handles default case
                  meta: { name: 'Admin' },
                  message: `
                  <p>An IP address (<b>${key}</b>) has reached the rate limit.</p>
                  <p><b>Total Hits in Window:</b> ${currentHits}</p>
                  <p><b>Limit:</b> ${max} requests per ${Math.round(windowMs / 60000)} minutes.</p>
                  <hr>
                  <p><b>User:</b> ${user ? `${user.firstName} ${user.lastName}` : 'Guest/Anonymous'}</p>
                  <p><b>Email:</b> ${user ? user.email : 'N/A'}</p>
                  <p><b>Request:</b> ${req.method} ${req.originalUrl}</p>
                  <p><b>Headers:</b> ${JSON.stringify(req.headers)}</p>
                  <p><b>Body:</b> ${JSON.stringify(req.body)}</p>
                  <p>Please take necessary action if this looks suspicious.</p>
                  `
               })
               .execute();
            
            // Return 429 Too Many Requests
            return next(new Exception({
               message: `Too many requests, please try again later.`,
               code: 429,
               show: true
            }));
         }
      };
   }
}