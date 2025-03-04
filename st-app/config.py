# from metrics import calculate_public_seating_metrics, calculate_mobility_metrics, calculate_curbside_metrics 

# Global definitions
CATEGORICAL_LABELS = {
    0: "None",
    1: "Minimal",
    2: "Extensive"
}

IMPLEMENTATION_LABELS = {
    0: "None",
    1: "Mid",
    2: "Full"
}

# Define corridor types from NYC DOT guidelines
CORRIDOR_TYPES = {
    "Baseline Street": {"width": "8'", "furnishing_zone": "3'", "walk_lane": "5'", "clear_path": "4'"},
    "Community Connector": {"width": "10'", "furnishing_zone": "2'", "walk_lane": "8'", "clear_path": "5'"},
    "Neighborhood Corridor": {"width": "15'", "furnishing_zone": "3'", "walk_lane": "12'", "clear_path": "8'"},
    "Regional Corridor": {"width": "20'", "furnishing_zone": "5'", "walk_lane": "15'", "clear_path": "12'"},
    "Global Corridor": {"width": "25'", "furnishing_zone": "5'", "walk_lane": "20'", "clear_path": "15'"}
}

# Define the intervention data
INTERVENTIONS = {
    "Public Seating Management": {
        "description": "Increase bench and plaza numbers to create more vibrant public spaces",
        "parameters": {
            "seating_level": {
                "label": "Seating Level",
                "min": 0,
                "max": 2,
                "default": 0,
                "description": "Level of seating intervention: None, Minimal (2-10 benches), Extensive (>10)"
            },
            "plaza_level": {
                "label": "Plaza Level",
                "min": 0,
                "max": 2,
                "default": 0,
                "description": "Level of plaza creation: None, Minimal (1-2 plazas), Extensive (3-5 plazas)"
            }
        },
        "conflicts": [
            "Maintenance costs for public seating and plazas need to be factored into long-term budgets",
            "Potential concerns about safety issues in seating areas",
            "Weather protection is critical for year-round usability"
        ]
    },
    "Mobility Management": {
        "description": "Improving bike infrastructure and connectivity throughout the district",
        "parameters": {
            "bike_lane_level": {
                "label": "Bike Lane Coverage",
                "min": 0,
                "max": 2,
                "default": 0,
                "description": "Level of bike lane coverage: None, Minimal (30%), Extensive (75%)"
            },
            "bike_share_level": {
                "label": "Bike Share Stations",
                "min": 0,
                "max": 2,
                "default": 0,
                "description": "Level of bike share stations: None, Minimal (2 stations), Extensive (6 stations)"
            }
        },
        "conflicts": [
            "Reduction in vehicle lanes might increase congestion during peak hours",
            "Weather considerations may affect year-round bike usage",
            "Initial infrastructure costs are high but maintenance costs are lower than road maintenance"
        ]
    },
    # "Curbside Management": {
    #     "description": "Reduce parking, create flexible curb spaces for multiple uses",
    #     "parameters": {
    #         "parking_level": {
    #             "label": "Parking Reduction",
    #             "min": 0,
    #             "max": 2,
    #             "default": 0,
    #             "description": "Level of parking reduction: None, Minimal (25%), Extensive (65%)"
    #         },
    #         "loading_level": {
    #             "label": "Loading Zones",
    #             "min": 0,
    #             "max": 2,
    #             "default": 0,
    #             "description": "Level of loading zones: None, Minimal (12 zones), Extensive (25 zones)"
    #         },
    #         "flexible_level": {
    #             "label": "Flexible Curb Spaces",
    #             "min": 0,
    #             "max": 2,
    #             "default": 0,
    #             "description": "Level of flexible curb spaces: None, Minimal (15 spaces), Extensive (35 spaces)"
    #         }
    #     },
    #     "conflicts": [
    #         "Reduction in parking spaces might affect businesses that rely on car-based customers",
    #         "Enforcement of loading zone time limits requires resources",
    #         "Clear signage is critical for flexible curb space usage"
    #     ]
    # }
}


# Dictionary mapping intervention types to their respective display configurations
METRIC_DISPLAY_CONFIG = {
    "Public Seating Management": {
        "metrics_to_show": [
            ("Pedestrian Dwell Time (min)", "{:.1f} min", "Pedestrian Dwell Time"),
            ("Business Foot Traffic (people/hr)", "{:,.0f}/hr", "Business Foot Traffic"),
            ("Social Interactions (count/hr)", "{:.0f}/hr", "Social Interactions"),
            ("Public Space Utilization (%)", "{:.1f}%", "Public Space Utilization")
        ]
    },
    "Mobility Management": {
        "metrics_to_show": [
            ("pedestrian_activity", "{:.1f}", "Pedestrian Activity"),
            ("economic_activity", "{:.1f}", "Economic Activity"),
            ("community_engagement", "{:.1f}", "Community Engagement"),
            ("pedestrian_safety", "{:.1f}%", "Pedestrian Safety")
        ]
    },
    "Curbside Management": {
        "metrics_to_show": [
            ("pedestrian_safety", "{:.1f}%", "Pedestrian Safety"),
            ("traffic_flow", "{:.1f}%", "Traffic Flow"),
            ("business_access", "{:.1f}%", "Business Access"),
            ("community_support", "{:.1f}%", "Community Support")
        ]
    }
}




from metrics import calculate_public_seating_metrics_simplified, calculate_mobility_metrics_simplified

SIMPLIFIED_CALCULATORS = {
    "Public Seating Management": calculate_public_seating_metrics_simplified,
    "Mobility Management": calculate_mobility_metrics_simplified
}