def calculate_public_seating_metrics_simplified(seating_level, plaza_level):
    """
    Calculate metrics for Public Seating Management intervention without implementation level
    
    Parameters:
    - seating_level: 0 (None), 1 (Minimal), 2 (Extensive)
    - plaza_level: 0 (None), 1 (Minimal), 2 (Extensive)
    
    Returns:
    - Dictionary with metrics, increases, tradeoffs
    """
    # Convert categorical levels to numerical values
    bench_mapping = {0: 0, 1: 2, 2: 5}  # None, Minimal (2-10), Extensive (>10)
    plaza_mapping = {0: 0, 1: 1, 2: 3}   # None, Minimal (1-2), Extensive (3-5)

    # min 2, exten 5
    
    bench_count = bench_mapping[seating_level]
    plaza_count = plaza_mapping[plaza_level]
    
    # Base metrics (minimum values even with zero intervention)
    base_metrics = {
        "Pedestrian Dwell Time (min)": 5,
        "Business Foot Traffic (people/hr)": 120,
        "Social Interactions (count/hr)": 15,
        "Public Space Utilization (%)": 10,
        "Maintenance Cost ($/year)": 5000
    }
    
    # Calculate scaled impact (implementation factor now built into the calculations)
    bench_impact = bench_count 
    plaza_impact = plaza_count * 3  # Plazas have 3x impact
    
    # Calculate metrics with specific formulas
    metrics = {
        "Pedestrian Dwell Time (min)": base_metrics["Pedestrian Dwell Time (min)"] + (bench_impact * 0.8) + (plaza_impact * 2.5),
        "Business Foot Traffic (people/hr)": base_metrics["Business Foot Traffic (people/hr)"] + (bench_impact * 5) + (plaza_impact * 25),
        # "Social Interactions (count/hr)": base_metrics["Social Interactions (count/hr)"] + (bench_impact * 2) + (plaza_impact * 10),
        "Public Space Utilization (%)": min(95, base_metrics["Public Space Utilization (%)"] + (bench_impact * 1.2) + (plaza_impact * 5)),
        # "Maintenance Cost ($/year)": base_metrics["Maintenance Cost ($/year)"] + (bench_impact * 200) + (plaza_impact * 1500)
    }
    
    # Calculate percentage increases for display
    increases = {
        "Pedestrian Dwell Time": f"{(metrics['Pedestrian Dwell Time (min)'] / base_metrics['Pedestrian Dwell Time (min)']):.1f}X",
        "Business Foot Traffic": f"{(metrics['Business Foot Traffic (people/hr)'] / base_metrics['Business Foot Traffic (people/hr)']):.1f}X",
        # "Social Interactions": f"{(metrics['Social Interactions (count/hr)'] / base_metrics['Social Interactions (count/hr)']):.1f}X",
        "Public Space Utilization": f"{(metrics['Public Space Utilization (%)'] / base_metrics['Public Space Utilization (%)']):+.0%}",
        # "Maintenance Cost": f"{(metrics['Maintenance Cost ($/year)'] / base_metrics['Maintenance Cost ($/year)']):.1f}X"
    }
    
    # Trade-off metrics (0-100 scale for radar chart)
    tradeoffs = {
        "Community Engagement": min(100, 40 + (bench_impact * 1.5) + (plaza_impact * 4)),
        "Sidewalk Clearance": max(0, 90 - (bench_impact * 0.8) - (plaza_impact * 2.5)),  # Negative impact
        "Pedestrian Safety": min(100, 60 + (bench_impact * 0.7) + (plaza_impact * 2)),
        "Business Visibility": min(100, 50 + (bench_impact * 1.2) + (plaza_impact * 3)),
        "Cost Efficiency": max(0, 85 - (bench_impact * 0.5) - (plaza_impact * 3))  # Negative impact
    }
    
    return {
        "metrics": metrics,
        "increases": increases,
        "tradeoffs": tradeoffs
    }

def calculate_mobility_metrics_simplified(bike_lane_level, bike_parking_level, bike_share_level):
    """
    Calculate metrics for Mobility Management with compact text descriptions
    
    Parameters:
    - bike_lane_level: 0 (None), 1 (Minimal - 30%), 2 (Extensive - 75%)
    - bike_parking_level: 0 (None), 1 (Minimal - 15 spots), 2 (Extensive - 40 spots)
    - bike_share_level: 0 (None), 1 (Minimal - 2 stations), 2 (Extensive - 6 stations)
    
    Returns:
    - Dictionary with text descriptions for metrics
    """
    # Compact text descriptions based on implementation levels
    
    # Space Utilization Text
    if bike_lane_level == 0:
        space_text = "Limited"
    elif bike_lane_level == 1:
        space_text = "Improved"
    else:  # bike_lane_level == 2
        space_text = "Optimal"
    
    # Economic Value Text
    if bike_share_level == 0:
        economic_text = "Basic"
    elif bike_share_level == 1:
        economic_text = "Enhanced"
    else:  # bike_share_level == 2
        economic_text = "Maximum"
    
    # Community Engagement Text
    if bike_parking_level == 0:
        community_text = "Minimal"
    elif bike_parking_level == 1:
        community_text = "Regular"
    else:  # bike_parking_level == 2
        community_text = "Vibrant"
    
    # Map categorical levels to actual values (for trade-offs calculation)
    bike_lane_values = {0: 0, 1: 30, 2: 75}  # % coverage
    bike_parking_values = {0: 0, 1: 15, 2: 40}  # spots
    bike_share_values = {0: 0, 1: 2, 2: 6}  # stations
    
    bike_lane_coverage = bike_lane_values[bike_lane_level]
    bike_parking_spots = bike_parking_values[bike_parking_level]
    bike_share_stations = bike_share_values[bike_share_level]
    
    # Calculate numerical metrics for trade-offs tab
    pedestrian_safety = 40 + (bike_lane_coverage * 0.3) + (bike_parking_spots * 0.2) + (bike_share_stations * 2.5)
    traffic_flow = 70 - (bike_lane_coverage * 0.1) + (bike_share_stations * 2.5)
    business_access = 50 + (bike_parking_spots * 0.5) + (bike_share_stations * 4)
    cost_efficiency = 90 - (bike_lane_coverage * 0.2) - (bike_parking_spots * 0.3) - (bike_share_stations * 5)
    community_support = 40 + (bike_lane_coverage * 0.4) + (bike_parking_spots * 0.1) + (bike_share_stations * 1.5)
    
    # Cap all values at 100
    pedestrian_safety = min(100, pedestrian_safety)
    traffic_flow = min(100, traffic_flow)
    business_access = min(100, business_access)
    cost_efficiency = min(100, cost_efficiency)
    community_support = min(100, community_support)
    
    # Calculate original metrics (just for compatibility)
    pedestrian_activity = 30 + (bike_lane_coverage / 2)
    economic_activity = 35 + (bike_share_stations * 4)
    community_engagement = 20 + (bike_parking_spots / 2)
    
    return {
        # Text descriptions for display
        "space_text": space_text,
        "economic_text": economic_text,
        "community_text": community_text,
        
        # Original metrics for backward compatibility
        "pedestrian_activity": pedestrian_activity,
        "economic_activity": economic_activity,
        "community_engagement": community_engagement,
        
        # Metrics for trade-offs tab
        "pedestrian_safety": pedestrian_safety,
        "traffic_flow": traffic_flow,
        "business_access": business_access,
        "cost_efficiency": cost_efficiency,
        "community_support": community_support
    }