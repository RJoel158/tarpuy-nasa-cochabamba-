from copy import deepcopy
from unittest.mock import patch, Mock
import pytest
import requests
from etl.weatherapi_client import merge_weatherapi, WeatherApiClient


def reference():
    return {'current':{'soil_moisture_top_pct':25}, 'daily_forecast':[{'date':f'2026-11-{d}','precip_mm':0,'et0_mm':4,'temp_min_c':10,'temp_max_c':20} for d in range(15,22)]}


def payload():
    return {'location':{'lat':-17.4,'lon':-66.19,'tz_id':'America/La_Paz'}, 'current':{'last_updated':'2026-11-15 01:00','temp_c':18,'humidity':80,'precip_mm':2,'wind_kph':8}, 'forecast':{'forecastday':[{'date':f'2026-11-{d}', 'day':{'mintemp_c':12,'maxtemp_c':24,'totalprecip_mm':10,'daily_chance_of_rain':85,'maxwind_kph':12}} for d in range(15,18)]}}


def test_primary_dates_replace_weather_not_agronomic_fields_or_extra_days():
    original=reference()
    result=merge_weatherapi(original,payload())
    assert result['provider_forecast_days']==3
    assert result['daily_forecast'][0]['precip_mm']==10
    assert result['daily_forecast'][0]['et0_mm']==4
    assert result['daily_forecast'][0]['forecast_provider']=='WeatherAPI'
    assert result['daily_forecast'][3]['forecast_provider']=='Open-Meteo'
    assert result['current']['soil_moisture_top_pct']==25
    assert result['current']['precip_mm']==2
    assert original['daily_forecast'][0]['precip_mm']==0


@pytest.mark.parametrize('field,value',[('daily_chance_of_rain',101),('totalprecip_mm',None),('totalprecip_mm',-1),('mintemp_c',50)])
def test_invalid_primary_data_is_rejected(field,value):
    body=payload();body['forecast']['forecastday'][0]['day'][field]=value
    with pytest.raises(ValueError):merge_weatherapi(reference(),body)


def test_unrelated_timezone_is_rejected():
    body=payload();body['location']['tz_id']='Europe/London'
    with pytest.raises(ValueError):merge_weatherapi(reference(),body)


def test_connection_failure_never_exposes_key():
    with patch('etl.weatherapi_client.requests.get',side_effect=requests.ConnectionError('secret-key-in-url')):
        with pytest.raises(RuntimeError) as caught:WeatherApiClient('secret-key').enrich(reference(),-17.4,-66.19)
    assert 'secret-key' not in str(caught.value)


def test_http_failure_does_not_parse_or_merge_error_payload():
    with patch('etl.weatherapi_client.requests.get',return_value=Mock(status_code=403)):
        with pytest.raises(RuntimeError,match='HTTP 403'):WeatherApiClient('test').enrich(reference(),-17.4,-66.19)

def test_full_fourteen_day_forecast_is_preserved_when_supplied():
    base=reference();body=payload()
    base['daily_forecast']=[{'date':f'2026-11-{d}','precip_mm':0,'et0_mm':4,'temp_min_c':10,'temp_max_c':20} for d in range(15,29)]
    day=body['forecast']['forecastday'][0]['day']
    body['forecast']['forecastday']=[{'date':f'2026-11-{d}','day':dict(day)} for d in range(15,29)]
    result=merge_weatherapi(base,body)
    assert result['provider_forecast_days']==14
    assert all(d['forecast_provider']=='WeatherAPI' for d in result['daily_forecast'])
    assert result['daily_forecast'][-1]['date']=='2026-11-28'


def test_client_requests_fourteen_days_without_changing_point():
    response=Mock(status_code=200)
    response.json.return_value=payload()
    with patch('etl.weatherapi_client.requests.get',return_value=response) as get:
        WeatherApiClient('test').enrich(reference(),-17.4,-66.19)
    assert get.call_args.kwargs['params']['days']==14
    assert get.call_args.kwargs['params']['q']=='-17.4,-66.19'
