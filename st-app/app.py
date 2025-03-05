import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go

from config import CATEGORICAL_LABELS, INTERVENTIONS, METRIC_DISPLAY_CONFIG, SIMPLIFIED_CALCULATORS

# Setup page
st.set_page_config(page_title="Interventions Tool", page_icon="🏙️", layout="wide")

# Header
st.title("LIC IBZ Transformation Interventions Interactive Tool")
st.markdown("Explore the impacts and trade-offs of different urban design strategies")
st.markdown("---")

left_col, right_col = st.columns([1, 2])

with left_col:
    st.header("Intervention Controls")
    
    # Add basic intervention selector
    selected_intervention = st.selectbox(
        "Select Intervention",
        list(INTERVENTIONS.keys())
    )
    
    # Add parameter controls section
    st.subheader("Adjust Parameters")

    # Create parameters dict to store the values
    params_values = {}

    # Display sliders for the selected intervention
    for param_key, param_info in INTERVENTIONS[selected_intervention]["parameters"].items():
        # Create a slider with categorical values
        param_value = st.slider(
            f"{param_info['label']}",
            param_info['min'],
            param_info['max'],
            param_info['default'],
            format="%d",
            help=param_info['description']
        )
        
        # Display the selected label
        st.caption(f"Selected: {CATEGORICAL_LABELS[param_value]}")
        
        # Store the parameter value
        params_values[param_key] = param_value

    # Display impact metrics based on intervention type
    st.subheader("Impact Metrics")

    # Call the appropriate simplified calculation function based on the selected intervention
    metric_calculator = SIMPLIFIED_CALCULATORS[selected_intervention]
    
    # Prepare the arguments for the calculation function (without implementation level)
    if selected_intervention == "Public Seating Management":
        results = metric_calculator(
            params_values.get("seating_level", 0),
            params_values.get("plaza_level", 0)
        )
    else:  # Mobility Management
        results = metric_calculator(
            params_values.get("bike_lane_level", 0),
            params_values.get("bike_parking_level", 0),
            params_values.get("bike_share_level", 0)
        )
    
    # Get the display configuration for the selected intervention
    display_config = METRIC_DISPLAY_CONFIG[selected_intervention]
    metrics_to_show = display_config["metrics_to_show"]
    
    # Create two columns for metrics display
    col1, col2 = st.columns(2)
    
    # Distribute metrics across the columns
    half_metrics = len(metrics_to_show) // 2 + (len(metrics_to_show) % 2)
    
    with col1:
        for i in range(half_metrics):
            if i < len(metrics_to_show):
                metric_key, format_str, display_name = metrics_to_show[i]
                
                # Handle different result structures
                if selected_intervention == "Public Seating Management":
                    value = results["metrics"][metric_key]
                    delta = results["increases"][display_name]
                else:
                    value = results[metric_key]
                    delta = None  # Mobility doesn't have increases in current implementation
                
                st.metric(
                    display_name,
                    format_str.format(value),
                    delta
                )
    
    with col2:
        for i in range(half_metrics, len(metrics_to_show)):
            metric_key, format_str, display_name = metrics_to_show[i]
            
            # Handle different result structures
            if selected_intervention == "Public Seating Management":
                value = results["metrics"][metric_key]
                delta = results["increases"][display_name]
            else:
                value = results[metric_key]
                delta = None  # Mobility doesn't have increases in current implementation
            
            st.metric(
                display_name,
                format_str.format(value),
                delta
            )

with right_col:
    st.header(selected_intervention)
    st.markdown(INTERVENTIONS[selected_intervention]["description"])
    
    # Add basic tabs
    tab1, tab2 = st.tabs(["Impact Analysis", "Trade-offs"])
    
    with tab1:
        st.subheader("Impact Analysis")
        
        # Create columns for before/after images
        col1, col2 = st.columns(2)
        
        with col1:
            st.subheader("Current State")
            
            if selected_intervention == "Mobility Management":
                st.image("./assets/l0.jpg", caption="Current State", use_column_width=True)
            
            else:  # Public Seating Management
                seating_level = params_values.get("seating_level", 0)
                plaza_level = params_values.get("plaza_level", 0)
                st.image("./assets/s0-p0.png", caption="Current State", use_column_width=True)
        
        with col2:
            st.subheader(f"Transformation")
            
            # Display appropriate "after" image based on selected intervention and parameters
            if selected_intervention == "Mobility Management":
                try:
                    st.image("./assets/f1-after-bikelane.png", caption="Transformed State with Bike Lanes", use_column_width=True)
                except:
                    st.error("Image file not found: f1-after-bikelane.png")
                    st.info("Enhanced street with dedicated bike lanes")
            
            else:  # Public Seating Management
                seating_level = params_values.get("seating_level", 0)
                plaza_level = params_values.get("plaza_level", 0)

                if seating_level == 0 and plaza_level== 0:
                    st.image("./assets/s0-p0.png", caption="No Seating Added, No Plaza Added", use_column_width=True)
                elif seating_level == 0 and plaza_level== 1:
                    st.image("./assets/s0-p1.png", caption="No Seating Added, Minimal Plaza Added", use_column_width=True)
                elif seating_level == 0 and plaza_level== 2:
                    st.image("./assets/s0-p2.png", caption="No Seating Added, Extensive Plaza Added", use_column_width=True)
                elif seating_level == 1 and plaza_level== 0:
                    st.image("./assets/s1-p0.png", caption="Minimal Seating Added, No Plaza Added", use_column_width=True)
                elif seating_level == 1 and plaza_level== 1:
                    st.image("./assets/s1-p1.png", caption="Minimal Seating Added, Minimal Plaza Added", use_column_width=True)
                elif seating_level == 1 and plaza_level== 2:
                    st.image("./assets/s1-p2.png", caption="Minimal Seating Added, Extensive Plaza Added", use_column_width=True)
                elif seating_level == 2 and plaza_level== 0:
                    st.image("./assets/s2-p0.png", caption="Extensive Seating Added, No Plaza Added", use_column_width=True)
                elif seating_level == 2 and plaza_level== 1:
                    st.image("./assets/s2-p1.png", caption="Extensive Seating Added, Minimal Plaza Added", use_column_width=True)
                elif seating_level == 2 and plaza_level== 2:
                    st.image("./assets/s2-p2.png", caption="Extensive Seating Added, Extensive Plaza Added", use_column_width=True)
    
    with tab2:
        st.subheader("Trade-offs")
        
        if selected_intervention == "Public Seating Management":
            # Get trade-offs data from results
            tradeoffs = results["tradeoffs"]
            
            # Create a DataFrame from the trade-offs dictionary
            df_tradeoffs = pd.DataFrame({
                'Category': list(tradeoffs.keys()),
                'Score': list(tradeoffs.values())
            })
            
            # Display the DataFrame as a table
            st.write("Trade-off metrics (scale: 0-100):")
            st.dataframe(df_tradeoffs, use_container_width=True)
            
            # Display a horizontal bar chart for better visualization
            st.write("Trade-offs Visualization:")
            fig = px.bar(df_tradeoffs, 
                        x='Score', 
                        y='Category',
                        orientation='h',
                        labels={'Score': 'Impact (0-100)', 'Category': ''},
                        color='Score',
                        color_continuous_scale=['red', 'yellow', 'green'],
                        range_x=[0, 100])
                        
            # Update layout for better readability
            fig.update_layout(
                height=400,
                margin=dict(l=20, r=20, t=30, b=20),
                yaxis=dict(autorange="reversed")  # Reverse y-axis for better readability
            )
            
            st.plotly_chart(fig, use_container_width=True)
            
            # Add a radar chart as an alternative visualization
            categories = list(tradeoffs.keys())
            values = list(tradeoffs.values())
            
            # Add a radar chart
            fig_radar = go.Figure()
            
            # Add trace for current values
            fig_radar.add_trace(go.Scatterpolar(
                r=values,
                theta=categories,
                fill='toself',
                name='Current Selection',
                line=dict(color='rgba(31, 119, 180, 0.8)'),
                fillcolor='rgba(31, 119, 180, 0.3)'
            ))
            
            # Add trace for baseline (50% on all metrics)
            fig_radar.add_trace(go.Scatterpolar(
                r=[50, 50, 50, 50, 50],
                theta=categories,
                fill='toself',
                name='Baseline',
                line=dict(color='rgba(100, 100, 100, 0.3)'),
                fillcolor='rgba(100, 100, 100, 0.1)'
            ))
            
            # Update radar layout
            fig_radar.update_layout(
                polar=dict(
                    radialaxis=dict(
                        visible=True,
                        range=[0, 100]
                    )
                ),
                showlegend=True,
                height=450,
                margin=dict(l=80, r=80, t=40, b=40)
            )
            
            st.plotly_chart(fig_radar, use_container_width=True)
            
        else:  # Mobility Management
            # For Mobility Management, create a simple visualization of key metrics
            categories = ['pedestrian_safety', 'traffic_flow', 'business_access', 'cost_efficiency', 'community_support']
            values = [results[category] for category in categories]
            
            # Format category names for display
            display_categories = [cat.replace('_', ' ').title() for cat in categories]
            
            # Create a DataFrame for the metrics
            df_metrics = pd.DataFrame({
                'Category': display_categories,
                'Score': values
            })
            
            # Display the DataFrame as a table
            st.write("Trade-off metrics (scale: 0-100):")
            st.dataframe(df_metrics, use_container_width=True)
            
            # Display a horizontal bar chart
            st.write("Trade-offs Visualization:")
            fig = px.bar(df_metrics, 
                        x='Score', 
                        y='Category',
                        orientation='h',
                        labels={'Score': 'Impact (0-100)', 'Category': ''},
                        color='Score',
                        color_continuous_scale=['red', 'yellow', 'green'],
                        range_x=[0, 100])
                        
            # Update layout for better readability
            fig.update_layout(
                height=400,
                margin=dict(l=20, r=20, t=30, b=20),
                yaxis=dict(autorange="reversed")  # Reverse y-axis for better readability
            )
            
            st.plotly_chart(fig, use_container_width=True)

# Footer
st.markdown("---")
st.caption("Urban Interventions Interactive Tool - Created with Streamlit")