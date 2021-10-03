from datetime import datetime
from apiservice.helpers import point_in_poygon, read_json
from apiservice.helpers import print_message, print_final_message
from apiservice.cep import get_address_from_cep
from apiservice.get_geojson import get_geodata
from apiservice.tomtom_api import TomTomNearBy


class GeoData:
    def __init__(self, print_status=False, data=None):
        self.tomtom = TomTomNearBy()
        self.print_status = print_status
        self.yesterday = self.get_yesterday()
        if data is None:
            self.data = get_geodata(self.yesterday)
        elif data == "all":
            self.data = [read_json("risk"), read_json("precip")]

    def get_yesterday(self):
        current_day = datetime.now()
        yesterday = datetime.fromtimestamp(
            datetime.timestamp(current_day) - (60 * 60 * 24)
        )
        yesterday = yesterday.strftime("%Y%m%d")

        return yesterday

    def get_precip(self, obj_data, long_lat) -> int:
        greater_precip = 0
        for pol in obj_data["features"]:
            if point_in_poygon(long_lat, pol["geometry"]["coordinates"][0]):
                if pol["properties"]["precip"] > greater_precip:
                    greater_precip = pol["properties"]["precip"]

        return greater_precip

    def long_lat_from_cep(self, cep):
        adr = get_address_from_cep(cep)
        long_lat = self.long_lat_from_address(adr)

        return long_lat

    def long_lat_from_address(self, adr):
        dict_lat_long = self.tomtom.get_lat_long_from_address(adr)
        long_lat = (dict_lat_long["lon"], dict_lat_long["lat"])

        return long_lat

    def get_nowcast(self, obj_data, long_lat):
        greater_nowcast = 0
        for pol in obj_data["features"]:
            if point_in_poygon(long_lat, pol["geometry"]["coordinates"][0]):
                if pol["properties"]["nowcast"] > greater_nowcast:
                    greater_nowcast = pol["properties"]["nowcast"]

                if greater_nowcast == 2:
                    return greater_nowcast

            # for coord in pol["geometry"]["coordinates"][0]:
            #     if self.dist_between(long_lat, coord):
            #         if pol["properties"]["nowcast"] > greater_nowcast:
            #             greater_nowcast = pol["properties"]["nowcast"]

            #         if greater_nowcast == 2:
            #             return greater_nowcast

        return greater_nowcast

    def format_long_lat(self, resp):
        long, lat = resp.split(";")
        long_lat = (float(long), float(lat))

        return long_lat

    def main(self):
        resp = int(input("\nChoose what to insert\n0: CEP\n1: Long;Lat\n2: Address\n>> "))

        if resp == 0:
            long_lat = self.long_lat_from_cep(input("\n\nInsert the CEP\n>>"))

        elif resp == 1:
            self.format_long_lat(
                input("\nInsirt long and lat in the following format: 00.00;00.00\n>> ")
            )

        elif resp == 2:
            long_lat = self.long_lat_from_address(input("\nInsert the address\n>>"))

        print_message("Success", f"Long: {long_lat[0]}; Lat: {long_lat[1]}", "s")

        print_message("Loading", "Checking Landslide Risk at your area...", "n")
        nowcast = self.get_nowcast(self.data[0], long_lat)
        precip = self.get_precip(self.data[1], long_lat)

        print_final_message(
            "Risk at your area",
            f"{['None', 'Moderate', 'High'][nowcast]}",
            f"{['s', 'n', 'e'][nowcast]}",
        )
        print_final_message(
            "Preciptation at your area",
            f"{precip}mm",
            f"{['s', 'n', 'e'][0 if precip == 0 else 1 if precip < 7 else 2]}",
        )
        print("\n")


if __name__ == "__main__":
    geo_data = GeoData(data="all")
    print_status = True

    while True:
        geo_data.main()
