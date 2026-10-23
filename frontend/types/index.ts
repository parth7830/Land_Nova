export interface LocationItem {
  id: string;
  display_name: string;
  locality?: string;
  city?: string;
  state?: string;
  country: string;
  latitude: float;
  longitude: float;
  bounding_box?: [number, number, number, number];
  is_demo?: boolean;
  source?: string;
}

export type float = number;

export interface AmenityItem {
  id: string;
  name: string;
  category: 'education' | 'healthcare' | 'transit' | 'recreation' | 'commercial' | 'emergency';
  sub_category: string;
  latitude: number;
  longitude: number;
  distance_meters: number;
  source: string;
}

export interface AmenitiesSummary {
  education: number;
  healthcare: number;
  transit: number;
  recreation: number;
  commercial: number;
  emergency: number;
}

export interface AmenitiesResponse {
  location_id: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  total_count: number;
  counts_by_category: AmenitiesSummary;
  items: AmenityItem[];
  data_source: string;
  data_freshness: string;
}

export interface WeatherCurrent {
  temperature_c: number;
  relative_humidity: number;
  apparent_temperature: number;
  wind_speed_kmh: number;
  precipitation_mm: number;
  weather_description: string;
  weather_code: number;
}

export interface AirQualityData {
  us_aqi?: number;
  pm2_5?: number;
  pm10?: number;
  european_aqi?: number;
  category_label: string;
  status_color: string;
}

export interface ClimateRiskData {
  elevation_meters: number;
  flood_risk_level: 'Low' | 'Moderate' | 'Elevated' | 'High';
  flood_risk_score: number;
  annual_rainfall_mm: number;
  extreme_heat_days_per_year: number;
  historical_flood_note: string;
}

export interface WeatherClimateResponse {
  location_id: string;
  latitude: number;
  longitude: number;
  current: WeatherCurrent;
  air_quality?: AirQualityData;
  climate_risk: ClimateRiskData;
  source: string;
  data_freshness: string;
}

export interface FactorDetail {
  name: string;
  key: string;
  score: number;
  weight: number;
  effective_weight: number;
  status: string;
  explanation: string;
  source: string;
  confidence: string;
  metrics: Record<string, any>;
}

export interface LivabilityResponse {
  location_id: string;
  display_name: string;
  latitude: number;
  longitude: number;
  overall_score: number;
  is_partial: boolean;
  grade: string;
  data_completeness_pct: number;
  included_factors: string[];
  excluded_factors: string[];
  factors: Record<string, FactorDetail>;
  key_advantages: string[];
  key_concerns: string[];
  recommendation_summary: string;
  calculated_at: string;
  methodology_note: string;
}

export interface BuilderMetric {
  name: string;
  score: number;
  weight: number;
  category: string;
  status: string;
  details: string;
  verified_data_point: string;
}

export interface BuilderSuitabilityResponse {
  location_id: string;
  display_name: string;
  project_type: string;
  budget_bracket: string;
  target_audience: string;
  suitability_score: number;
  feasibility_verdict: string;
  risk_level: string;
  data_completeness_pct: number;
  metrics: BuilderMetric[];
  key_drivers: string[];
  identified_constraints: string[];
  due_diligence_checklist: string[];
  statutory_clearances_required: string[];
  disclaimer: string;
}

export interface LocationComparisonResponse {
  location_a: LivabilityResponse;
  location_b: LivabilityResponse;
  score_delta: number;
  category_winners: Record<string, string>;
  head_to_head_summary: string;
  buyer_verdict: string;
  builder_verdict: string;
}

export interface AIChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  model_used?: string;
  verified_facts?: string[];
  warnings?: string[];
  is_demo?: boolean;
}
