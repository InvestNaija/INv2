import { Publisher, Subjects, AssetCreatedEvent } from '@inv2/common';

/**
 * AssetCreatedPublisher
 * Responsible for publishing an event to RabbitMQ when a new investment asset is created.
 * Uses the standard AssetCreatedEvent definition from @inv2/common.
 */
export class AssetCreatedPublisher extends Publisher<AssetCreatedEvent> {
   readonly subject = Subjects.InvestINAssetCreated;
}
