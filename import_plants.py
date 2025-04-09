#!/usr/bin/env python3
import csv
import requests
import time
import sys

# Configuration
API_URL = "http://localhost:8000/api/plants/"
CSV_FILE = "import.csv"

# Category mapping from one-letter codes to full category names
CATEGORY_MAP = {
    "T": "tomato",
    "P": "pepper",
    "V": "vegetable",
    "G": "green",
    "H": "herb",
    "F": "flower"
}

def read_csv(file_path):
    """Read plants from CSV file"""
    plants = []
    with open(file_path, 'r') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            # Convert type letter code to full category name
            category_code = row['Type']
            category = CATEGORY_MAP.get(category_code)
            if not category:
                print(f"Warning: Unknown category code '{category_code}' for plant '{row['Plant']}', skipping")
                continue
                
            # Clean and convert numeric fields
            seedlings = row['Seedlings'].strip() if row['Seedlings'].strip() else None
            transplant = row['Transplant'].strip() if row['Transplant'].strip() else None
            harvest = row['Harvest'].strip() if row['Harvest'].strip() else None
            
            if seedlings is not None:
                try:
                    seedlings = int(seedlings)
                except ValueError:
                    print(f"Warning: Invalid seedlings value '{seedlings}' for plant '{row['Plant']}', setting to null")
                    seedlings = None
                    
            if transplant is not None:
                try:
                    transplant = int(transplant)
                except ValueError:
                    print(f"Warning: Invalid transplant value '{transplant}' for plant '{row['Plant']}', setting to null")
                    transplant = None
                    
            if harvest is not None:
                try:
                    harvest = int(harvest)
                except ValueError:
                    print(f"Warning: Invalid harvest value '{harvest}' for plant '{row['Plant']}', setting to null")
                    harvest = None
            
            plant = {
                "name": row['Plant'].strip(),
                "category": category,
                "seedlings": seedlings,
                "transplant": transplant,
                "harvest": harvest
            }
            plants.append(plant)
    return plants

def import_plants(plants):
    """Import plants into the API"""
    success_count = 0
    duplicate_count = 0
    error_count = 0
    
    for i, plant in enumerate(plants):
        print(f"Importing {i+1}/{len(plants)}: {plant['name']} ({plant['category']})")
        
        try:
            response = requests.post(API_URL, json=plant)
            
            if response.status_code == 201:
                print(f"✅ Successfully imported plant: {plant['name']}")
                success_count += 1
            elif response.status_code == 409:
                print(f"⚠️ Duplicate plant: {plant['name']}")
                duplicate_count += 1
            else:
                print(f"❌ Error importing plant {plant['name']}: {response.status_code} - {response.text}")
                error_count += 1
                
            # Add a small delay to avoid overwhelming the API
            time.sleep(0.1)
            
        except requests.RequestException as e:
            print(f"❌ Request error for plant {plant['name']}: {str(e)}")
            error_count += 1
            
    return success_count, duplicate_count, error_count

def main():
    try:
        # Check if API is available
        try:
            response = requests.get("http://localhost:8000/")
            if response.status_code != 200:
                print(f"API server not responding correctly (status {response.status_code}). Make sure it's running on http://localhost:8000")
                return
        except requests.RequestException as e:
            print(f"Error connecting to API server: {str(e)}")
            print("Make sure your API server is running on http://localhost:8000")
            return
        
        # Read plants from CSV
        print(f"Reading plants from {CSV_FILE}...")
        plants = read_csv(CSV_FILE)
        print(f"Found {len(plants)} plants in CSV file")
        
        # Import plants
        print("\nStarting import...")
        success_count, duplicate_count, error_count = import_plants(plants)
        
        # Print summary
        print("\n----- Import Summary -----")
        print(f"Total plants in CSV: {len(plants)}")
        print(f"Successfully imported: {success_count}")
        print(f"Duplicates skipped: {duplicate_count}")
        print(f"Errors: {error_count}")
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return

if __name__ == "__main__":
    main()