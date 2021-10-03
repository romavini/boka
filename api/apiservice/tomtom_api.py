import requests
from apiservice.helpers import get_apikey


class TomTomNearBy:
    def __init__(self):
        self.key = get_apikey("TOMTOM_API_KEY")

    def get_lat_long_from_address(self, query: str):
        params = {
            "key": self.key,
        }
        req = requests.get(
            f"https://api.tomtom.com/search/2/search/{query}.json",
            params=params,
        )
        obj = req.json()

        return obj["results"][0]["position"]
