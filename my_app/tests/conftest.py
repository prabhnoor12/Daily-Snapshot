import pytest
from flask import Flask
from my_app.app import app as flask_app

@pytest.fixture(scope='module')
def test_client():
    flask_app.config['TESTING'] = True
    with flask_app.test_client() as client:
        yield client
