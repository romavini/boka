import os
import json
from typing import Any, Dict
from dotenv import load_dotenv  # type: ignore
from shapely.geometry import Point  # type: ignore
from shapely.geometry import Polygon  # type: ignore
import haversine as hs  # type: ignore


def read_json(filename: str):
    path_to_exit = os.getcwd().split(os.sep)
    path_to_exit.extend(["..", "/api"])
    path_to_exit = f"{os.sep}".join(path_to_exit)  # type: ignore

    os.chdir(path_to_exit)  # type: ignore

    path_to_enter = os.getcwd().split(os.sep)
    path_to_enter.extend(["apiservice", "data_nasa"])
    path_to_enter = f"{os.sep}".join(path_to_enter)  # type: ignore
    os.chdir(path_to_enter)  # type: ignore

    with open(f"{filename}.json", "r") as f:
        data = json.loads(f.read())

    path_to_exit = os.getcwd().split(os.sep)
    path_to_exit.extend(["..", ".."])
    path_to_exit = f"{os.sep}".join(path_to_exit)  # type: ignore

    os.chdir(path_to_exit)  # type: ignore

    return data


def create_json(data: Dict[Any, Any], filename: str, folder="data_nasa"):
    json_object = json.dumps(data, indent=4)

    path_to_enter = os.getcwd().split(os.sep)
    path_to_enter.extend(["apiservice", folder])
    path_to_enter = f"{os.sep}".join(path_to_enter)  # type: ignore
    os.chdir(path_to_enter)  # type: ignore

    with open(f"{filename}.json", "w") as f:
        f.write(json_object)

    path_to_exit = os.getcwd().split(os.sep)
    path_to_exit.extend(["..", ".."])
    path_to_exit = f"{os.sep}".join(path_to_exit)  # type: ignore

    os.chdir(path_to_exit)  # type: ignore
    print(os.getcwd())


def dist_between(coord1, coord2, radius=5000):
    """"""
    return hs.haversine(coord1, coord2) * 1000 <= radius


def point_in_poygon(coord, poly):
    point = Point(coord)
    polygon = Polygon(poly)

    return polygon.contains(point)


def get_apikey(key_name: str) -> Any:
    load_dotenv()
    return os.getenv(key_name)


def print_final_message(status: str, text: str, message_type: str = "n"):
    """Print final message.

    Keyword argument: \n
    status -- message type \n
    text -- text of message \n
    message_type -- type of message print. can be 'e' for error, 's' for
    success, and 'n' for notification.
    """
    if message_type == "e":
        message_color = "\033[91m"
        eom = "\n"
    elif message_type == "s":
        message_color = "\033[32m"
        eom = "\n"
    elif message_type == "n":
        message_color = "\033[33m"
        eom = "\n"

    print(
        message_color
        + "\n["
        + "\033[0m"
        + f"{status}"
        + message_color
        + "]"
        + " -> "
        + message_color
        + f"{text}{eom}"
        + "\033[0m"
    )


def print_message(status: str, text: str, message_type: str = "n"):
    """Print message.

    Keyword argument: \n
    status -- message type \n
    text -- text of message \n
    message_type -- type of message print. can be 'e' for error, 's' for
    success, and 'n' for notification.
    """
    if message_type == "e":
        message_color = "\033[91m"
        eom = ""
    elif message_type == "s":
        message_color = "\033[32m"
        eom = "\n"
    elif message_type == "n":
        message_color = "\033[33m"
        eom = ""

    print(
        "["
        + message_color
        + f"{status}"
        + "\033[0m"
        + "]"
        + message_color
        + " -> "
        + "\033[0m"
        + f"{text}{eom}"
    )
