import sys
from apiservice.helpers import create_json
from apiservice.main import GeoData


def main(geo_data):
    # CEP
    if int(sys.argv[1]) == 0:
        long_lat = geo_data.long_lat_from_cep(str(sys.argv[2]))
        nowcast = geo_data.get_nowcast(geo_data.data[0], long_lat)
        precip = geo_data.get_precip(geo_data.data[1], long_lat)
    elif int(sys.argv[1]) == 1:
        long_lat = geo_data.format_long_lat(str(sys.argv[2]))
        nowcast = geo_data.get_nowcast(geo_data.data[0], long_lat)
        precip = geo_data.get_precip(geo_data.data[1], long_lat)

    return {"risk": nowcast, "precip": precip}


if __name__ == "__main__":
    if len(sys.argv) == 4:
        filename = str(sys.argv[3])
    else:
        filename = "response_dict"

    geo_data = GeoData(data="all")
    dict_data = main(geo_data)
    create_json(dict_data, filename, "response")
