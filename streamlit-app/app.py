import streamlit as st
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import plotly.express as px
import plotly.graph_objects as go
from PIL import Image
import matplotlib.patches as mpatches

# Set page configuration
st.set_page_config(
    page_title="Urban Interventions Tool",
    page_icon="🏙️",
    layout="wide"
)

# Add custom CSS for better styling
st.markdown("""
<style>
    .stTabs [data-baseweb="tab-list"] {
        gap: 8px;
    }
    .stTabs [data-baseweb="tab"] {
        height: 50px;
        white-space: pre-wrap;
        border-radius: 4px 4px 0px 0px;
        padding: 10px 16px;
    }
    .stTabs [aria-selected="true"] {
        background-color: #3b82f6 !important;
        color: white !important;
    }
    .stMarkdown h1, h2, h3, h4, h5 {
        margin-bottom: 0.5rem;
    }
</style>
""", unsafe_allow_html=True)

# Header
st.title("Urban Interventions Interactive Tool")
st.markdown("Explore the impacts and trade-offs of different urban design strategies")
st.markdown("---")

# Define the intervention data
interventions = {
    "Mobility Management": {
        "description": "Improving bike infrastructure and connectivity throughout the district",
        "parameters": {
            "bike_lane_coverage": {
                "label": "Bike Lane Coverage",
                "min": 0,
                "max": 100,
                "default": 0,
                "unit": "%",
                "description": "Percentage of streets with dedicated bike lanes"
            },
            "bike_parking_spots": {
                "label": "Bike Parking Spots",
                "min": 0,
                "max": 50,
                "default": 0,
                "unit": "",
                "description": "Number of dedicated bike parking areas"
            },
            "bike_share_stations": {
                "label": "Bike Share Stations",
                "min": 4,
                "max": 6,
                "default": 0,
                "unit": "",
                "description": "Number of bike share stations"
            }
        },
        "conflicts": [
            "Reduction in vehicle lanes might increase congestion during peak hours",
            "Weather considerations may affect year-round bike usage",
            "Initial infrastructure costs are high but maintenance costs are lower than road maintenance"
        ]
    },
    "Public Seating Management": {
        "description": "Increase bench and plaza numbers to create more vibrant public spaces",
        "parameters": {
            "bench_count": {
                "label": "Bench Count",
                "min": 0,
                "max": 20,
                "default": 0,
                "unit": "",
                "description": "Number of public benches installed"
            },
            "plaza_count": {
                "label": "Plaza Count",
                "min": 0,
                "max": 5,
                "default": 0,
                "unit": "",
                "description": "Number of public plazas created"
            },
        },
        "conflicts": [
            "Maintenance costs for public seating and plazas need to be factored into long-term budgets",
            "Potential concerns about safety issues in seating areas",
            "Weather protection is critical for year-round usability"
        ]
    },
    "Curbside Management": {
        "description": "Reduce parking, create flexible curb spaces for multiple uses",
        "parameters": {
            "parking_reduction": {
                "label": "Parking Reduction",
                "min": 0,
                "max": 75,
                "default": 25,
                "unit": "%",
                "description": "Percentage reduction in on-street parking spaces"
            },
            "loading_zones": {
                "label": "Loading Zones",
                "min": 0,
                "max": 30,
                "default": 12,
                "unit": "",
                "description": "Number of dedicated loading zones"
            },
            "flexible_curb_spaces": {
                "label": "Flexible Curb Spaces",
                "min": 0,
                "max": 40,
                "default": 15,
                "unit": "",
                "description": "Number of time-variable flexible curb spaces"
            }
        },
        "conflicts": [
            "Reduction in parking spaces might affect businesses that rely on car-based customers",
            "Enforcement of loading zone time limits requires resources",
            "Clear signage is critical for flexible curb space usage"
        ]
    }
}

# Create the main layout with columns
left_col, right_col = st.columns([1, 2])

with left_col:
    st.header("Intervention Controls")
    
    # Analysis Mode Selection
    analysis_mode = st.radio(
        "Analysis Mode",
        ["Single Intervention", "Combined Analysis"],
        horizontal=True
    )
    
    if analysis_mode == "Single Intervention":
        # Intervention Selection
        selected_intervention = st.selectbox(
            "Select Intervention",
            list(interventions.keys())
        )
        
        st.subheader("Adjust Parameters")
        
        # Create parameters dict to store the values
        params_values = {}
        
        # Display sliders for the selected intervention
        for param_key, param_info in interventions[selected_intervention]["parameters"].items():
            param_value = st.slider(
                f"{param_info['label']} {param_info['unit']}",
                param_info['min'],
                param_info['max'],
                param_info['default'],
                help=param_info['description']
            )
            params_values[param_key] = param_value
            
        # Implementation Level Slider
        implementation_level = st.slider(
            "Implementation Level",
            0, 100, 0,
            help="Level of implementation from current state to full implementation"
        )
        
        # Calculate impact metrics based on parameters and implementation level
        pedestrian_activity = (30 + (implementation_level / 100) * 20)
        economic_activity = (35 + (implementation_level / 100) * 25)
        community_engagement = (20 + (implementation_level / 100) * 30)
        
        # Display impact metrics
        st.subheader("Impact Metrics")
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.metric("Pedestrian Activity", f"{pedestrian_activity:.1f}")
            st.metric("Economic Activity", f"{economic_activity:.1f}")
        
        with col2:
            st.metric("Community Engagement", f"{community_engagement:.1f}")
            
        # Calculate trade-off metrics based on selected intervention and parameters
        if selected_intervention == "Mobility Management":
            pedestrian_safety = 40 + (params_values["bike_lane_coverage"] * 0.3) + (params_values["bike_parking_spots"] * 0.2) + (params_values["bike_share_stations"] * 0.5)
            traffic_flow = 70 - (params_values["bike_lane_coverage"] * 0.1) + (params_values["bike_share_stations"] * 0.5)
            business_access = 50 + (params_values["bike_parking_spots"] * 0.5) + (params_values["bike_share_stations"] * 0.8)
            cost_efficiency = 90 - (params_values["bike_lane_coverage"] * 0.2) - (params_values["bike_parking_spots"] * 0.3) - (params_values["bike_share_stations"] * 1)
            community_support = 40 + (params_values["bike_lane_coverage"] * 0.4) + (params_values["bike_parking_spots"] * 0.1) + (params_values["bike_share_stations"] * 0.3)
        
        elif selected_intervention == "Public Seating Management":
            pedestrian_safety = 45 + (params_values["bench_count"] * 0.2) + (params_values["plaza_count"] * 1)
            traffic_flow = 60
            business_access = 55 + (params_values["bench_count"] * 0.5) + (params_values["plaza_count"] * 2)
            cost_efficiency = 85 - (params_values["bench_count"] * 0.3) - (params_values["plaza_count"] * 5)
            community_support = 50 + (params_values["bench_count"] * 0.4) + (params_values["plaza_count"] * 3)
        
        else:  # Curbside Management
            pedestrian_safety = 60 + (params_values["parking_reduction"] * 0.4)
            traffic_flow = 50 + (params_values["loading_zones"] * 0.5) + (params_values["flexible_curb_spaces"] * 0.3)
            business_access = 70 - (params_values["parking_reduction"] * 0.2) + (params_values["loading_zones"] * 1)
            cost_efficiency = 75 - (params_values["flexible_curb_spaces"] * 0.5)
            community_support = 45 + (params_values["flexible_curb_spaces"] * 0.8)
            
        # Cap all values at 100
        pedestrian_safety = min(100, pedestrian_safety)
        traffic_flow = min(100, traffic_flow)
        business_access = min(100, business_access)
        cost_efficiency = min(100, cost_efficiency)
        community_support = min(100, community_support)
    
    else:  # Combined Analysis
        st.info("Showing the cumulative impact of all interventions combined")
        
        implementation_level = st.slider(
            "Implementation Level",
            0, 100, 41,
            help="Level of implementation from current state to full implementation"
        )
        
        # Placeholder for combined analysis values
        pedestrian_safety_mobility = 65
        traffic_flow_mobility = 59
        business_access_mobility = 70
        cost_efficiency_mobility = 81
        community_support_mobility = 56
        
        pedestrian_safety_mobility_seating = 75
        traffic_flow_mobility_seating = 65
        business_access_mobility_seating = 75
        cost_efficiency_mobility_seating = 70
        community_support_mobility_seating = 65
        
        pedestrian_safety_all = 85
        traffic_flow_all = 70
        business_access_all = 80
        cost_efficiency_all = 65
        community_support_all = 75

with right_col:
    if analysis_mode == "Single Intervention":
        st.header(selected_intervention)
        st.markdown(interventions[selected_intervention]["description"])
        
        # Create tabs for different views
        tab1, tab2, tab3, tab4 = st.tabs(["Before/After", "Map view", "Impact Analysis", "Trade-offs"])
        


        with tab1:
            st.subheader("Before/After Comparison")
            
            # Create a simple before/after visualization
            col1, col2 = st.columns(2)
            
            with col1:
                st.subheader("Current State")
                # Create a simple "before" visualization
                fig_before, ax_before = plt.subplots(figsize=(6, 4))
                ax_before.set_xlim(0, 10)
                ax_before.set_ylim(0, 6)
                
            
            with col2:
                st.subheader(f"Transformed ({implementation_level}% Implementation)")
                # Create a simple "after" visualization - we'll reuse code from above but with interventions applied
                fig_after, ax_after = plt.subplots(figsize=(6, 4))
                ax_after.set_xlim(0, 10)
                ax_after.set_ylim(0, 6)
                
                # Draw streets
                for i in range(1, 10):
                    ax_after.plot([0, 10], [i, i], 'gray', alpha=0.4)
                    ax_after.plot([i, i], [0, 6], 'gray', alpha=0.4)
                
                # Add intervention elements based on selected intervention and implementation level
                if selected_intervention == "Mobility Management":
                    # Scaled based on implementation level
                    bike_lane_count = int((params_values["bike_lane_coverage"] / 100) * 9 * (implementation_level / 100))
                    bike_parking_count = int(params_values["bike_parking_spots"] * (implementation_level / 100))
                    bike_share_count = int(params_values["bike_share_stations"] * (implementation_level / 100))
                    
                    # Add bike lanes
                    for i in range(1, bike_lane_count + 1):
                        ax_after.plot([0, 10], [i, i], 'blue', linewidth=2, alpha=0.6)
                    
                    # Add bike parking
                    for _ in range(min(bike_parking_count, 20)):
                        x = np.random.uniform(0.5, 9.5)
                        y = np.random.uniform(0.5, 5.5)
                        ax_after.scatter(x, y, color='blue', marker='s', s=30)
                    
                    # Add bike share stations
                    for _ in range(bike_share_count):
                        x = np.random.uniform(0.5, 9.5)
                        y = np.random.uniform(0.5, 5.5)
                        ax_after.scatter(x, y, color='green', marker='o', s=80)
                
                elif selected_intervention == "Public Seating Management":
                    # Scaled based on implementation level
                    bench_count = int(params_values["bench_count"] * (implementation_level / 100))
                    plaza_count = int(params_values["plaza_count"] * (implementation_level / 100))
                    shade_count = int(params_values["shade_structures"] * (implementation_level / 100))
                    
                    # Add benches
                    for _ in range(bench_count):
                        x = np.random.uniform(0.5, 9.5)
                        y = np.random.uniform(0.5, 5.5)
                        ax_after.scatter(x, y, color='brown', marker='|', s=60)
                    
                    # Add plazas
                    for _ in range(plaza_count):
                        x = np.random.uniform(1, 8.5)
                        y = np.random.uniform(1, 4.5)
                        circle = plt.Circle((x, y), 0.5, color='orange', alpha=0.3)
                        ax_after.add_patch(circle)
                    
                    # Add shade structures
                    for _ in range(shade_count):
                        x = np.random.uniform(0.5, 9.5)
                        y = np.random.uniform(0.5, 5.5)
                        ax_after.scatter(x, y, color='green', marker='^', s=40)
                
                else:  # Curbside Management
                    # Scaled based on implementation level
                    parking_reduction = params_values["parking_reduction"] * (implementation_level / 100)
                    loading_count = int(params_values["loading_zones"] * (implementation_level / 100))
                    flexible_count = int(params_values["flexible_curb_spaces"] * (implementation_level / 100))
                    
                    # Reduce parking (show fewer parking spaces)
                    parking_spots = int(20 * (1 - parking_reduction / 100))
                    for _ in range(parking_spots):
                        x = np.random.uniform(0.5, 9.5)
                        y = np.random.uniform(0.5, 5.5)
                        rect = plt.Rectangle((x, y), 0.3, 0.2, color='gray')
                        ax_after.add_patch(rect)
                    
                    # Add loading zones
                    for _ in range(loading_count):
                        x = np.random.uniform(0.5, 9.5)
                        y = np.random.uniform(0.5, 5.5)
                        rect = plt.Rectangle((x, y), 0.4, 0.3, color='yellow')
                        ax_after.add_patch(rect)
                    
                    # Add flexible curb spaces
                    for _ in range(flexible_count):
                        x = np.random.uniform(0.5, 9.5)
                        y = np.random.uniform(0.5, 5.5)
                        rect = plt.Rectangle((x, y), 0.3, 0.2, color='purple', alpha=0.7)
                        ax_after.add_patch(rect)
                
                ax_after.set_title(f"Transformed State")
                ax_after.grid(True, alpha=0.3)
                ax_after.set_xticks([])
                ax_after.set_yticks([])
                
                st.pyplot(fig_after)


        with tab2:
            # Display a mock map image
            st.subheader("District Map with Intervention")
            st.info(f"Implementation Level: {implementation_level}%")
            
            
        with tab3:
            st.subheader("Impact Analysis")
            
            # Create bar chart comparing current vs proposed
            impact_data = {
                'Scenario': ['Current', 'Proposed'],
                'Pedestrian Activity': [pedestrian_activity / 2, pedestrian_activity],
                'Economic Activity': [economic_activity / 2, economic_activity],
                'Community Engagement': [community_engagement / 2, community_engagement]
            }
            
            impact_df = pd.DataFrame(impact_data)
            impact_df_melted = pd.melt(impact_df, id_vars=['Scenario'], var_name='Metric', value_name='Value')
            
            fig_impact = px.bar(
                impact_df_melted, 
                x='Scenario', 
                y='Value', 
                color='Metric',
                barmode='group',
                color_discrete_map={
                    'Pedestrian Activity': '#3B82F6',
                    'Economic Activity': '#10B981',
                    'Community Engagement': '#F59E0B'
                },
                title="Impact Comparison"
            )
            fig_impact.update_layout(height=400)
            st.plotly_chart(fig_impact, use_container_width=True)
            
        
        with tab4:
            st.subheader("Trade-off Analysis")
            
            # Create radar chart for trade-offs
            categories = ['Pedestrian Safety', 'Traffic Flow', 'Business Access', 'Cost Efficiency', 'Community Support']
            values = [pedestrian_safety, traffic_flow, business_access, cost_efficiency, community_support]
            
            fig = go.Figure()
            
            fig.add_trace(go.Scatterpolar(
                r=values,
                theta=categories,
                fill='toself',
                name='Impact Score',
                line_color='#3B82F6'
            ))
            
            fig.update_layout(
                polar=dict(
                    radialaxis=dict(
                        visible=True,
                        range=[0, 100]
                    )),
                showlegend=True,
                height=400
            )
            
            st.plotly_chart(fig, use_container_width=True)
            
            # Display conflicts and considerations
            st.subheader("Conflicts & Considerations")
            
            for conflict in interventions[selected_intervention]["conflicts"]:
                st.markdown(f"- {conflict}")
    
    else:  # Combined Analysis
        st.header("Combined Analysis")
        st.markdown("This view shows the cumulative impact of all interventions combined at various implementation levels.")
        
        # Create a radar chart for combined analysis
        categories = ['Pedestrian Safety', 'Traffic Flow', 'Business Access', 'Cost Efficiency', 'Community Support']
        
        fig = go.Figure()
        
        fig.add_trace(go.Scatterpolar(
            r=[pedestrian_safety_mobility, traffic_flow_mobility, business_access_mobility, 
               cost_efficiency_mobility, community_support_mobility],
            theta=categories,
            fill='toself',
            name='Mobility Only',
            line_color='#3B82F6'
        ))
        
        fig.add_trace(go.Scatterpolar(
            r=[pedestrian_safety_mobility_seating, traffic_flow_mobility_seating, 
               business_access_mobility_seating, cost_efficiency_mobility_seating, 
               community_support_mobility_seating],
            theta=categories,
            fill='toself',
            name='Mobility + Seating',
            line_color='#10B981'
        ))
        
        fig.add_trace(go.Scatterpolar(
            r=[pedestrian_safety_all, traffic_flow_all, business_access_all, 
               cost_efficiency_all, community_support_all],
            theta=categories,
            fill='toself',
            name='All Interventions',
            line_color='#F59E0B'
        ))
        
        fig.update_layout(
            polar=dict(
                radialaxis=dict(
                    visible=True,
                    range=[0, 100]
                )),
            showlegend=True,
            height=500
        )
        
        st.plotly_chart(fig, use_container_width=True)
        
        # Display implementation strategy
        st.subheader("Implementation Strategy")
        st.markdown("Based on the analysis, we recommend a phased approach:")
        st.markdown("1. **Phase 1**: Mobility Management (Higher impact for lower cost)")
        st.markdown("2. **Phase 2**: Public Seating Management (Builds on increased foot traffic)")
        st.markdown("3. **Phase 3**: Curbside Management (More politically feasible after other improvements)")
        
        # Display synergies and conflicts
        st.subheader("Synergies & Conflicts")
        st.markdown("- Bike lanes and reduced parking work well together to shift transportation modes")
        st.markdown("- Public seating increases effectiveness of bike infrastructure by creating destinations")
        st.markdown("- Loading zones may conflict with bike lanes in some narrow streets")
        st.markdown("- Combined costs require careful budgeting and phasing")

# Add footer
st.markdown("---")
st.caption("Urban Interventions Interactive Tool - Created with Streamlit")