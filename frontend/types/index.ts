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

// --- V2 Interfaces ---

export interface PersonaProfile {
  id: string;
  label: string;
  description: string;
  icon: string;
  weights: {
    connectivity: number;
    amenities: number;
    environment: number;
    safety: number;
    climate_flood: number;
  };
  priority_amenities: string[];
  filters_defaults: {
    connectivity_importance: 'low' | 'medium' | 'high';
    preferred_amenities: string[];
  };
}

export interface PropertyListing {
  id: string;
  title: string;
  type: 'apartment' | 'villa' | 'plot' | 'house';
  listing_type: 'buy' | 'rent' | 'new_project';
  price: number;
  price_per_sqft: number;
  bedrooms: number;
  bathrooms: number;
  area_sqft: number;
  locality: string;
  city: string;
  state: string;
  address: string;
  description: string;
  amenities: string[];
  image_url: string;
  furnished: string;
  possession: string;
  floor: string;
  facing: string;
  age: string;
  latitude: number;
  longitude: number;
  location_id: string;
  builder: string;
  rera: string;
  livability_score: number;
  posted_date: string;
  verified: boolean;
  is_demo: boolean;
}

export interface HeatmapCell {
  latitude: number;
  longitude: number;
  score: number;
  grade: string;
  data_completeness_pct: number;
  factors_summary: Record<string, number>;
}

export interface HeatmapResponse {
  cells: HeatmapCell[];
  persona: string;
  persona_label: string;
  grid_size: number;
  bbox: {
    min_lat: number;
    max_lat: number;
    min_lon: number;
    max_lon: number;
  };
  note: string;
}

export interface DeveloperSiteReport {
  site_id: string;
  display_name: string;
  city: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  project_metadata: {
    project_type: string;
    budget_bracket: string;
    target_audience: string;
    scale_acres: number;
  };
  suitability_score: number;
  feasibility_verdict: string;
  score_breakdown: Record<string, number>;
  sections: {
    soil_properties: any;
    groundwater_status: any;
    seismic_risk: any;
    climate_normals: any;
    flood_and_landslide: any;
    biodiversity_protected_areas: any;
    local_resources: any;
    connectivity_transport: any;
    demographics_census: any;
    market_indicators: any;
  };
  ai_engineering_recommendations: {
    text: string;
    disclaimer: string;
    model_used: string;
  };
  data_gaps: string[];
  statutory_clearances: string[];
  generated_at: string;
}

export interface BuyerMetricDetail {
  title: string;
  value: string;
  score: number;
  badge: string;
  badge_color: 'emerald' | 'lime' | 'amber' | 'red';
  source: string;
  timestamp: string;
  confidence: 'High' | 'Medium' | 'Estimated';
  is_proxy: boolean;
  formula: string;
}

export interface BuyerSector {
  id: string;
  name: string;
  city: string;
  center: [number, number];
  polygon: [number, number][];
  image: string;
  avg_price_sqft: number;
  avg_rent_2bhk: number;
  property_count: number;
  overall_score: number;
  grade_label: string;
  grade_color: string;
  reasons: string[];
  commute: {
    distance_km: number;
    car_minutes: number;
    metro_minutes: number;
    bus_minutes: number;
    bike_minutes: number;
    walk_minutes: number;
  };
  metrics: Record<string, BuyerMetricDetail>;
  weights_used: Record<string, number>;
  is_within_commute?: boolean;
  is_within_budget?: boolean;
  estimated_unit_price?: number;
}

export interface BuyerPreferences {
  city: string;
  property_types: string[];
  min_budget: number;
  max_budget: number;
  preferred_amenities: string[];
  good_aqi: boolean;
  good_water: boolean;
  low_noise: boolean;
  low_crime: boolean;
  local_language: string;
  max_commute_minutes: number;
  workplace_address: string;
  workplace_coords?: [number, number];
  latitude?: number;
  longitude?: number;
  custom_weights?: Record<string, number>;
}

export interface CommuteCalculation {
  mode: string;
  distance_km: number;
  duration_minutes: number;
  source: string;
  confidence: string;
  is_estimated: boolean;
  formula: string;
}

export interface AffordabilityCalculation {
  property_price: number;
  down_payment: number;
  loan_principal: number;
  monthly_emi: number;
  total_interest: number;
  total_payable: number;
  debt_to_income_pct: number;
  health_badge: string;
  health_color: 'emerald' | 'amber' | 'red';
  formula: string;
}

export interface SiteChecklistItem {
  category: string;
  title: string;
  reason: string;
  severity: 'High' | 'Medium' | 'Low';
}

