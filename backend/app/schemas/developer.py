from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

class FeasibilityInputs(BaseModel):
    plot_acres: float = Field(default=3.5, description="Plot area in acres", ge=0.1, le=500.0)
    typology: str = Field(default="apartment_complex", description="residential_colony, apartment_complex, commercial_it_hub, mixed_use")
    far: float = Field(default=2.75, description="Floor Area Ratio / FSI", ge=0.5, le=8.0)
    ground_coverage_pct: float = Field(default=35.0, description="Ground coverage percentage", ge=10.0, le=70.0)
    land_cost_total_cr: float = Field(default=45.0, description="Total land acquisition cost in Crores INR", ge=0.5)
    construction_cost_per_sqft: float = Field(default=3200.0, description="Base construction cost per sq ft INR", ge=1000.0)
    sale_price_per_sqft: float = Field(default=7800.0, description="Projected base sale realization per sq ft INR", ge=2000.0)
    absorption_months: int = Field(default=30, description="Total sales and construction lifecycle in months", ge=6, le=120)
    financing_interest_pct: float = Field(default=9.5, description="Annual debt interest cost percentage", ge=0.0, le=25.0)
    debt_equity_ratio: float = Field(default=0.6, description="Debt share of total project development capital (0.0 to 0.85)", ge=0.0, le=0.85)

class DeveloperCommandCenterRequest(BaseModel):
    latitude: float = Field(default=28.6280, description="Site latitude")
    longitude: float = Field(default=77.3649, description="Site longitude")
    display_name: Optional[str] = "Sector 62, Noida Development Parcel"
    city: Optional[str] = "Noida"
    feasibility_inputs: Optional[FeasibilityInputs] = None
