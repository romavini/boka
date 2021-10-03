from apiservice.tomtom_api import TomTomNearBy
from apiservice.mapbox_api import MapBoxTypes
from apiservice.mapquest_api import MapQuest
from apiservice.pickpoint_api import PickPoint
from apiservice.here_api import Here
from apiservice.geopy_lib import GeoPy
import requests
import pytest

# TomTom
def test_tomtom_categories():
    tomtom = TomTomNearBy()
    print(tomtom.categories())


def test_search_address():
    tomtom = TomTomNearBy()
    tomtom.search_address()


# MapBox
def test_find_city_by_region():
    mapbox = MapBoxTypes()
    mapbox.find_city_by_region()


def test_find_city_or_poi():
    mapbox = MapBoxTypes()
    mapbox.find_city_or_poi()


def test_find_city_or_poi_close_to_coordenate():
    mapbox = MapBoxTypes()
    mapbox.find_city_or_poi_close_to_coordenate()


def test_find_city_or_poi_close_to_coordenate():
    mapbox = MapBoxTypes()
    mapbox.find_city_or_poi_close_to_coordenate(query="restaurant")


def test_get_route():
    mapbox = MapBoxTypes()
    mapbox.get_route()


def test_mapbox_categories():
    mapbox = MapBoxTypes()
    mapbox._get_categories()


# GeoPy
def test_search():
    geopy = GeoPy()
    geopy.search()


def test_reverse_search():
    geopy = GeoPy()
    geopy.reverse_search()


# MapQuest
def test_find_lat_lon():
    mapquest = MapQuest()
    mapquest.find_lat_lon()


# PickPoint
def test_find_point():
    pickpoint = PickPoint()
    pickpoint.find_point()


# HERE
def test_get_route():
    here = Here()
    here.get_route()


def test_find_point():
    here = Here()
    here.find_point()


def test_discover_place():
    here = Here()
    here.discover_place()


def test_get_poi_nearby():
    here = Here()
    here.get_poi_nearby()


def test_browse_poi_nearby():
    here = Here()
    here.browse_poi_nearby()
