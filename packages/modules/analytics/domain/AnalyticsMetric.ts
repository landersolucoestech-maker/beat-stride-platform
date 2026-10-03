export interface AnalyticsMetricProps {
  id: string;
  organizationId: string;
  providerCode: string;
  metricDate: string;
  metricType: "STREAM" | "VIEW" | "SAVE" | "PLAYLIST_ADD";
  releaseId: string | null;
  recordingId: string | null;
  destinationCode: string | null;
  territoryCode: string | null;
  value: string;
  createdAt: Date;
}

export class AnalyticsMetric {
  private constructor(private readonly props: AnalyticsMetricProps) {}
  static create(props: AnalyticsMetricProps): AnalyticsMetric {
    if (!/^\d+$/.test(props.value)) throw new Error("ANALYTICS_VALUE_INVALID");
    return new AnalyticsMetric(props);
  }
  snapshot(): Readonly<AnalyticsMetricProps> { return { ...this.props }; }
}
