from datetime import datetime
from shapely.geometry import Point
from shapely.geometry import Polygon
from apiservice.helpers import print_message, print_final_message
from apiservice.cep import get_address_from_cep
from apiservice.get_geojson import get_geodata
from apiservice.tomtom_api import TomTomNearBy
import haversine as hs


def get_yesterday(cur_date):
    yesterday = datetime.fromtimestamp(datetime.timestamp(cur_date) - (60 * 60 * 24))

    return yesterday


def dist_between(coord1, coord2, radius=20000):
    """"""
    return hs.haversine(coord1, coord2) * 1000 <= radius


def point_in_poygon(coord, poly):
    point = Point(coord)
    polygon = Polygon(poly)

    return polygon.contains(point)


def get_nowcast(obj_data, long_lat):
    greater_nowcast = 0
    for pol in obj_data["features"]:
        if point_in_poygon(long_lat, pol["geometry"]["coordinates"][0]):
            if pol["properties"]["nowcast"] > greater_nowcast:
                greater_nowcast = pol["properties"]["nowcast"]

            if greater_nowcast == 2:
                return greater_nowcast

        for coord in pol["geometry"]["coordinates"][0]:
            if dist_between(long_lat, coord):
                if pol["properties"]["nowcast"] > greater_nowcast:
                    greater_nowcast = pol["properties"]["nowcast"]

                if greater_nowcast == 2:
                    return greater_nowcast

    return greater_nowcast


def main():
    tomtom = TomTomNearBy()
    resp = int(input("\nChoose what to insert\n0: CEP\n1: Long;Lat\n>> "))

    if resp == 0:
        adr = get_address_from_cep(input("\n\nInsira o CEP\n>>"))
        dict_lat_long = tomtom.get_lat_long_from_address(adr)
        long_lat = (dict_lat_long["lon"], dict_lat_long["lat"])
    elif resp == 1:
        long, lat = input(
            "\nInsirt long and lat in the following format: 00.00;00.00\n>> "
        ).split(";")
        long_lat = (float(long), float(lat))

    print_message("Success", f"Long: {long_lat[0]}; Lat: {long_lat[1]}", "s")

    print_message(
        "Warning", "Accessing NASA API to get nowcast data of Landslide Risk", "n"
    )
    current_day = datetime.now()
    yesterday = get_yesterday(current_day).strftime("%Y%m%d")

    obj_data = get_geodata(yesterday)
    print_message("Success", "Data collected!", "s")
    print_message("Loading", "Checking Landslide Risk at your area...", "n")
    nowcast = get_nowcast(obj_data, long_lat)

    print_final_message(
        "Risk at your area",
        f"{['None', 'Moderate', 'High'][nowcast]}",
        f"{['s', 'n', 'e'][nowcast]}",
    )


if __name__ == "__main__":
    main()
