# get_xy.py


import json
import requests

# Kakao Local API key
KAKAO_API_KEY = "97c14104a350ad82addadb0b85c63eaa"

def get_xy(address):
    """
    Use Kakao Local API to convert address to coordinates
    """
    url = "https://dapi.kakao.com/v2/local/search/address.json"
    headers = {"Authorization": f"KakaoAK {KAKAO_API_KEY}"}
    params = {"query": address}

    response = requests.get(url, headers=headers, params=params)
    if response.status_code == 200:
        result = response.json()
        if result['documents']:
            lon = result['documents'][0]['x']
            lat = result['documents'][0]['y']
            return lon, lat
        else:
            print(f"No documents found for address: {address}")
            return None, None
    else:
        print(f"Error {response.status_code}: {response.text}")
        return None, None

def main():
    # Read list.json file
    with open("list.json", "r", encoding="utf-8") as file:
        data = json.load(file)

    # Process addresses and get coordinates
    results = []
    for location in data["locations"]:
        name = location["name"]
        address = location["address"]

        lon, lat = get_xy(address)
        if lon and lat:
            print(f"{name} ({address}) → Longitude: {lon}, Latitude: {lat}")
            results.append({"name": name, "address": address, "lon": lon, "lat": lat})
        else:
            print(f"{name} ({address}) → Coordinates not found.")
            results.append({"name": name, "address": address, "lon": None, "lat": None})

    # Save results to results.json
    with open("results.json", "w", encoding="utf-8") as outfile:
        json.dump(results, outfile, ensure_ascii=False, indent=4)
    print("\nProcessing complete! Results saved to 'results.json'.")

if __name__ == "__main__":
    main()