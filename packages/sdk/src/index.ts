export type OfferHubSdkConfig = {
  apiUrl: string;
  apiKey: string;
};

export class OfferHub {
  constructor(private readonly config: OfferHubSdkConfig) {}
}
