import json
from copy import deepcopy
from pathlib import Path
from fastapi.testclient import TestClient
from backend.main import create_app
from etl.realtime_weather_client import RealtimeWeatherClient


def test_point_weather_uses_selected_coordinates_and_caches_without_nasa_relabeling(monkeypatch):
    calls = []
    stored = json.loads(Path('data/zones/realtime_weather_telemetry.json').read_text())
    def fetch(self, lat, lon, forecast_days=14, include_nasa=True):
        calls.append((lat, lon, include_nasa))
        value = deepcopy(stored['zones']['punata_valle_alto'])
        value.update(lat=lat, lon=lon)
        value['daily_forecast'][0]['precip_mm'] = 12
        return value
    monkeypatch.setattr(RealtimeWeatherClient, 'fetch_zone_realtime', fetch)
    client = TestClient(create_app())
    url = '/api/alerts/punata_valle_alto?lat=-17.39919&lon=-66.190703&district_code=D4'
    first = client.get(url)
    assert first.status_code == 200
    result = first.json()
    assert result['weather_scope'] == 'selected_point_model'
    assert result['weather_location']['lat'] == -17.3992
    assert result['seven_day_forecast'][0]['precip_mm'] == 12
    assert calls == [(-17.3992, -66.1907, False)]
    assert client.get(url).json()['fetched_at_utc'] == result['fetched_at_utc']
    assert len(calls) == 1
    assert result['nasa_recent_daily'] == stored['zones']['punata_valle_alto']['nasa_recent_daily']


def test_point_failure_exposes_zonal_fallback_and_partial_coordinate_is_rejected(monkeypatch):
    def unavailable(*args, **kwargs):
        raise RuntimeError('provider unavailable')
    monkeypatch.setattr(RealtimeWeatherClient, 'fetch_zone_realtime', unavailable)
    client = TestClient(create_app())
    result = client.get('/api/alerts/punata_valle_alto?lat=-17.4&lon=-66.19').json()
    assert result['weather_scope'] == 'stored_pilot_zone'
    assert result['weather_refresh_error'] is True
    assert client.get('/api/alerts/punata_valle_alto?lat=-17.4').status_code == 422

def test_zonal_refresh_fetches_provider_and_renews_after_five_minutes(monkeypatch):
    import importlib
    main = importlib.import_module('backend.main')
    clock = [100.0]
    calls = []
    stored = json.loads(Path('data/zones/realtime_weather_telemetry.json').read_text())
    def fetch(self, lat, lon, **kwargs):
        calls.append((lat, lon))
        data = deepcopy(stored['zones']['punata_valle_alto'])
        data.update(lat=lat, lon=lon)
        return data
    monkeypatch.setattr(main, 'monotonic', lambda: clock[0])
    monkeypatch.setattr(RealtimeWeatherClient, 'fetch_zone_realtime', fetch)
    client = TestClient(create_app())
    url = '/api/alerts/punata_valle_alto?refresh=true'
    assert client.get(url).json()['weather_scope'] == 'zone_reference_model'
    client.get(url)
    assert len(calls) == 1
    clock[0] += 301
    client.get(url)
    assert len(calls) == 2

def test_weatherapi_failure_is_identified_and_preserves_open_meteo(monkeypatch):
    from backend.config import Settings
    from etl.weatherapi_client import WeatherApiClient
    stored = json.loads(Path('data/zones/realtime_weather_telemetry.json').read_text())
    def reference(self, lat, lon, **kwargs):
        result = deepcopy(stored['zones']['punata_valle_alto'])
        result.update(lat=lat,lon=lon)
        return result
    def broken(*args, **kwargs):raise RuntimeError('unavailable')
    monkeypatch.setattr(RealtimeWeatherClient,'fetch_zone_realtime',reference)
    monkeypatch.setattr(WeatherApiClient,'enrich',broken)
    client=TestClient(create_app(settings=Settings(WEATHERAPI_KEY='test')))
    result=client.get('/api/alerts/punata_valle_alto?lat=-17.4&lon=-66.19').json()
    assert result['weather_provider']=='Open-Meteo'
    assert result['primary_provider_status']=='unavailable_using_open_meteo'
    assert result['seven_day_forecast'][0]['precip_mm']==stored['zones']['punata_valle_alto']['daily_forecast'][0]['precip_mm']
