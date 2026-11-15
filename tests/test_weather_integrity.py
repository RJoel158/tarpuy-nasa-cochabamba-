from copy import deepcopy
import pytest
from etl.realtime_weather_client import validate_forecast_response


def payload():
    return {'daily_units':{'temperature_2m_max':'°C','temperature_2m_min':'°C','precipitation_sum':'mm','precipitation_probability_max':'%','et0_fao_evapotranspiration':'mm','wind_speed_10m_max':'km/h'},'daily':{'time':['2026-11-15'],'temperature_2m_max':[25],'temperature_2m_min':[12],'precipitation_sum':[1],'precipitation_probability_max':[65],'et0_fao_evapotranspiration':[4],'wind_speed_10m_max':[12]}}


def test_valid_forecast_integrity():
    validate_forecast_response(payload())


@pytest.mark.parametrize('field,value', [('precipitation_sum',-1),('precipitation_sum',None),('precipitation_sum',float('nan')),('precipitation_probability_max',101),('temperature_2m_min',30)])
def test_invalid_forecast_is_rejected(field,value):
    data=payload(); data['daily'][field]=[value]
    with pytest.raises(ValueError): validate_forecast_response(data)


def test_wrong_unit_or_incomplete_series_is_rejected():
    data=payload();data['daily_units']['precipitation_sum']='inch'
    with pytest.raises(ValueError):validate_forecast_response(data)
    data=payload();data['daily']['precipitation_sum']=[]
    with pytest.raises(ValueError):validate_forecast_response(data)
