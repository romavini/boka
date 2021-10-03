import os
from typing import Any
from dotenv import load_dotenv


def get_apikey(key_name: str) -> Any:
    load_dotenv()
    return os.getenv(key_name)
