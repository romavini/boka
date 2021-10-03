import requests
from typing import Any, Dict, Type

pontuations = "-.,;' _"
bars = ".,\\/\"'"


def clear_cep(cep: Any) -> str:
    """Return CEP formated 00000-000"""
    cep = str(cep)
    new_cep = ""

    for e in cep:
        new_cep += e if e not in pontuations else ""

    if len(new_cep) != 8:
        raise TypeError

    cep = new_cep[:5] + "-" + new_cep[5:]

    return cep


def format_adress(obj: Dict[str, str]) -> str:
    adr = "Brasil, "
    adr += obj["state"]
    adr += " "
    adr += obj["city"]
    adr += " "
    adr += obj["address"]
    new_adr = ""

    for e in adr:
        new_adr += e if e not in bars else ""

    return new_adr


def get_address_from_cep(cep: Any) -> str:
    """Return the address given CEP number."""
    cep = clear_cep(cep)
    req = requests.get(f"https://ws.apicep.com/cep/{cep}.json")
    obj = req.json()
    adr = format_adress(obj)

    return adr


if __name__ == "__main__":
    obj = get_address_from_cep(input())
    print(obj)
