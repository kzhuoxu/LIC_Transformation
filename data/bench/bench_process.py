import geopandas as gpd
import matplotlib.pyplot as plt
import numpy as np
import json
from shapely.geometry import Point, shape, mapping
from shapely.wkt import loads

# File paths
bench_file = 'City_Bench_Locations__Historical__20250303.csv'
seats_file = 'Seating_Locations_20250304.csv'
plaza_file = 'NYC_DOT_Pedestrian_Plazas_20250304.csv'
parks_file = 'Parks_Properties_20241031.csv'
bid_file = '../NYC_BIDS_09112015.csv'

# Load and process bench data
bench_data = gpd.read_file(bench_file)
bench_data['the_geom'] = gpd.GeoSeries.from_wkt(bench_data['the_geom'])
bench_data = gpd.GeoDataFrame(bench_data, geometry='the_geom')

# Load and process seats data
seats_data = gpd.read_file(seats_file)
seats_data = seats_data[seats_data['Latitude'] != '']
seats_data['geometry'] = seats_data.apply(
    lambda row: Point(float(row['Longitude']), float(row['Latitude'])), 
    axis=1
)
seats_data = gpd.GeoDataFrame(seats_data, geometry='geometry')

# Load and process plaza data
plaza_data = gpd.read_file(plaza_file)
plaza_data['the_geom'] = gpd.GeoSeries.from_wkt(plaza_data['the_geom'])
plaza_data = gpd.GeoDataFrame(plaza_data, geometry='the_geom')

# Load and process parks data
parks_data = gpd.read_file(parks_file)
parks_data['the_geom'] = parks_data['multipolygon'].apply(loads)
parks_data = gpd.GeoDataFrame(parks_data, geometry='the_geom')

# Load and process BID data
bid_data = gpd.read_file(bid_file)
lic_data = bid_data[bid_data['F_ALL_BI_2'] == "Long Island City Partnership"]
lic_data['the_geom'] = gpd.GeoSeries.from_wkt(lic_data['the_geom'])
lic_data = gpd.GeoDataFrame(lic_data, geometry='the_geom')
exploded_lic_data = lic_data.explode()

# Get the bounding box of Long Island City BID
bounding_box = exploded_lic_data.total_bounds

# Filter data to include only features within the bounding box
bench_within_bbox = bench_data.cx[bounding_box[0]:bounding_box[2], bounding_box[1]:bounding_box[3]]
bench_within_bbox = gpd.GeoDataFrame(bench_within_bbox, geometry='the_geom')

seats_within_bbox = seats_data.cx[bounding_box[0]:bounding_box[2], bounding_box[1]:bounding_box[3]]
seats_within_bbox = gpd.GeoDataFrame(seats_within_bbox, geometry='geometry')

plaza_within_bbox = plaza_data.cx[bounding_box[0]:bounding_box[2], bounding_box[1]:bounding_box[3]]
plaza_within_bbox = gpd.GeoDataFrame(plaza_within_bbox, geometry='the_geom')

parks_within_bbox = parks_data.cx[bounding_box[0]:bounding_box[2], bounding_box[1]:bounding_box[3]]
parks_within_bbox = gpd.GeoDataFrame(parks_within_bbox, geometry='the_geom')

# Print summary of features within the bounding box
print("Number of benches within the bounding box:", bench_within_bbox.shape[0])
print("Number of seats within the bounding box:", seats_within_bbox.shape[0])
print("Number of plazas within the bounding box:", plaza_within_bbox.shape[0])
print("Number of parks within the bounding box:", parks_within_bbox.shape[0])

# Prepare bench data for export
bench_within_bbox['type'] = 'bench'
bench_within_bbox['color'] = bench_within_bbox['Category'].apply(
    lambda x: hash(str(x)) % 16777215 if pd.notna(x) else 13339741
)
bench_within_bbox['SeatingCapacity'] = 3

# Prepare plaza data for export
plaza_within_bbox['type'] = 'plaza'
plaza_within_bbox['color'] = plaza_within_bbox['Partner'].apply(
    lambda x: hash(str(x)) % 16777215 if pd.notna(x) else 5578642
)
# Calculate seating capacity for plazas based on area
plaza_within_bbox['area'] = plaza_within_bbox.geometry.area
# Assuming 1 person per 10 square meters for plazas
plaza_within_bbox['SeatingCapacity'] = (plaza_within_bbox['area'] / 10).astype(int)
# Ensure a minimum capacity
plaza_within_bbox['SeatingCapacity'] = plaza_within_bbox['SeatingCapacity'].apply(
    lambda x: max(x, 10)
)

# Prepare parks data for export
parks_within_bbox['type'] = 'park'
parks_within_bbox['color'] = parks_within_bbox['TYPECATEGORY'].apply(
    lambda x: hash(str(x)) % 16777215 if pd.notna(x) else 8453982
)
# Calculate seating capacity for parks based on area
parks_within_bbox['area'] = parks_within_bbox.geometry.area
# Assuming 1 person per 20 square meters for parks (less dense than plazas)
parks_within_bbox['SeatingCapacity'] = (parks_within_bbox['area'] / 20).astype(int)
# Ensure a minimum capacity
parks_within_bbox['SeatingCapacity'] = parks_within_bbox['SeatingCapacity'].apply(
    lambda x: max(x, 5)
)

# Create a combined GeoJSON for all features
def create_combined_geojson():
    features = []
    
    # Add bench features
    bench_cols = ['BenchType', 'Category', 'BID', 'color', 'SeatingCapacity', 'type']
    for _, row in bench_within_bbox.iterrows():
        properties = {col: row[col] for col in bench_cols if col in row}
        feature = {
            "type": "Feature",
            "properties": properties,
            "geometry": mapping(row.the_geom)
        }
        features.append(feature)
    
    # Add plaza features
    plaza_cols = ['Plaza_Name', 'Partner', 'Program_Phase', 'color', 'SeatingCapacity', 'type', 'area']
    for _, row in plaza_within_bbox.iterrows():
        properties = {col: row[col] for col in plaza_cols if col in row}
        feature = {
            "type": "Feature",
            "properties": properties,
            "geometry": mapping(row.the_geom)
        }
        features.append(feature)
    
    # Add parks features
    parks_cols = ['TYPECATEGORY', 'ACRES', 'PARK_NAME', 'color', 'SeatingCapacity', 'type', 'area']
    for _, row in parks_within_bbox.iterrows():
        properties = {col: row[col] for col in parks_cols if col in row}
        feature = {
            "type": "Feature",
            "properties": properties,
            "geometry": mapping(row.the_geom)
        }
        features.append(feature)
    
    return {
        "type": "FeatureCollection",
        "features": features
    }

# Create the combined GeoJSON
combined_data = create_combined_geojson()

# Save the combined data to a GeoJSON file
with open("combined_facilities.json", "w") as f:
    json.dump(combined_data, f)

# Save the LIC BID boundary to a GeoJSON file
exploded_lic_data.to_file("lic_bid.json", driver='GeoJSON')

# Create a simple plot to visualize the data
fig, ax = plt.subplots(figsize=(12, 12))

# Plot the LIC BID boundary
exploded_lic_data.plot(ax=ax, edgecolor='black', facecolor='none', linewidth=1)

# Plot benches
bench_within_bbox.plot(ax=ax, column='Category', legend=True, markersize=20, marker='o', 
                       cmap='Set1', legend_kwds={'title': 'Bench Category'})

# Plot plazas
plaza_within_bbox.plot(ax=ax, column='Partner', alpha=0.5, legend=True, 
                       cmap='Set2', legend_kwds={'title': 'Plaza Partner'})

# Plot parks
parks_within_bbox.plot(ax=ax, column='TYPECATEGORY', alpha=0.5, legend=True, 
                       cmap='Set3', legend_kwds={'title': 'Park Type'})

plt.title("Facilities in Long Island City BID")
plt.tight_layout()
plt.savefig("lic_facilities_map.png")
plt.close()

print("Processing complete!")
print("Files created: combined_facilities.json, lic_bid.json")
print("Map saved as: lic_facilities_map.png")