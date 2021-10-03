import os
from typing import Any
from dotenv import load_dotenv


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
