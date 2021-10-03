from apiservice.cep import get_address_from_cep
from apiservice.tomtom_api import TomTomNearBy


def main():
    tomtom = TomTomNearBy()

    print("Insira o CEP\n>>")
    adr = get_address_from_cep(input())
    lat_long = tomtom.get_lat_long_from_address(adr)

    print(lat_long)


if __name__ == "__main__":
    main()
