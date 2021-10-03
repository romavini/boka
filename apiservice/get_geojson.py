import requests
import json
from datetime import date


def main(date_time: str):
    obj = get_geodata(date_time)
    print(obj)
    return obj


def get_date(date) -> str:
    sep = ",.;-\\/_"

    date = str(date)
    new_date = ""

    for e in date:
        new_date += e if e not in sep else ""

    return new_date


def get_days(date_time: str):
    """Return the number of the days"""
    year = int(date_time[:4])
    month = int(date_time[4:6])
    day = int(date_time[6:])

    days = date(year, month, day) - date(year, 1, 1)
    days_int = days.days + 1

    return days_int


def get_geodata(date_time: str):
    date_time = get_date(date_time)
    days = get_days(date_time)
    href = (
        "https://pmmpublisher.pps.eosdis.nasa.gov/products/"
        f"global_landslide_nowcast/export/Global/2021/{days}"
        f"/global_landslide_nowcast_{date_time}.geojson"
    )
    req = requests.get(href)
    obj = json.loads(req.text)

    return obj


if __name__ == "__main__":
    obj = main(input("insira data no formato AAAAMMDD\n>>"))
