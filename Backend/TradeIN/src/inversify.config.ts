import { Container, interfaces } from "inversify";
import { TYPES } from "./business/types";
import { ISecurityRepository, ITradeInProfileRepository } from "./business/repositories";
import { SecurityRepository, TradeInProfileRepository } from "./business/repositories";
import { TradeINService, ZanibalService, IMarketDataService } from "./business/services";
import "./api/controllers";

const container = new Container();

container.bind<ISecurityRepository>(TYPES.ISecurityRepository).to(SecurityRepository);
container.bind<ITradeInProfileRepository>(TYPES.ITradeInProfileRepository).to(TradeInProfileRepository);

// Provider Factory setup
container.bind<string>(TYPES.ActiveTradeProvider).toConstantValue(process.env.ACTIVE_TRADE_PROVIDER || 'ZANIBAL');

container.bind<ZanibalService>(TYPES.ZanibalService).to(ZanibalService);
// Add other providers here as needed

container.bind<interfaces.Factory<IMarketDataService>>(TYPES.IMarketDataServiceFactory).toFactory<IMarketDataService>((context: interfaces.Context) => {
    return (provider: any) => {
        if (provider === 'ZANIBAL') {
            return context.container.get<ZanibalService>(TYPES.ZanibalService);
        }
        // Handle other providers
        throw new Error(`Provider ${provider} not supported`);
    };
});

container.bind<TradeINService>(TYPES.TradeINService).to(TradeINService);
container.bind<TradeINService>(TradeINService).toSelf(); // Allow direct injection by class

export { container };
