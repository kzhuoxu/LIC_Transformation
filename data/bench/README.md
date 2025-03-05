# Bench Data Directory

This directory should contain the following CSV file:

`City_Bench_LocationsHistorical20250303.csv`

## CSV Format

The application is configured to work with the NYC bench data format which includes the following key columns:

- `the_geom` - Point geometry in format "POINT (-73.897 40.862)"
- `Latitude` - Numeric latitude value
- `Longitude` - Numeric longitude value
- `BenchID` - Bench identifier
- `SiteID` - Site identifier
- `BenchType` - Type of bench (backed, backless, etc.)
- `Category` - Category such as BID
- `Borough` - Borough name (Bronx, Manhattan, etc.)
- `Installati` - Installation date
- `Address` - Street address of bench location
- `Street` - Street name
- `CrossStree` - Cross street name

Note: The application can handle variations in this format and will try to extract relevant information from available fields.

## Data Source

This data can be obtained from NYC Open Data or similar open data sources. If the source data format differs, you may need to adjust the data parsing logic in the `mapLayers.js` file.

## Sample Data Structure

```
the_geom,BoroCode,BoroName,BoroCD,CounDist,AssemDist,StSenDist,CongDist,SiteID,BenchID,Category,BenchType,Installati,Address,GeocodeAdd,Street,CrossStree,Borough,ComDist,BusRoute,BID,Latitude,Longitude,FEMAFldz,FEMAFldT,HrcEvac
POINT (-73.89716666711392 40.86236111070519),2,Bronx,205,15,78,33,15,1194,260,BID,backed,10/22/2012,South side Overpass at East Fordham Rd and Grand Concourse,"40°51'44.5""N 73°53'49.8""W",East Fordham Road,Grand Concourse East and West,Bronx,205,Not Applicable,Fordham Road,40.8623611107,-73.8971666671,X,AREA OF MINIMAL FLOOD HAZARD,
```

If you don't have this file, you'll need to:
1. Download it from an open data source
2. Create a sample file with the expected format
3. Adjust the code to match your data format if necessary