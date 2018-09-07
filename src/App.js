import React, { Component } from 'react';

import About from './About';
import logo from './logo.png';
import './App.css';
import getCurrentPosition from './utils/getCurrentPosition';
import getCorrectLatLng from './utils/getCorrectLatLng';
import getDistance from './utils/getDistance';
import * as dataSources from './utils/dataSources';
import pm25ToCigarettes from './utils/pm25ToCigarettes';
import retry from './utils/retry';

const initialState = {
  api: { city: {}, pm25: null },
  error: null,
  loading: true,
};

class App extends Component {
  constructor() {
    super();
    this.state = initialState;
  }

  componentWillMount() {
    this.fetchData();
  }

  async fetchData () {
    const { location } = this.state;
    try {
      this.setState(initialState);

      // If the location has been set by the user, then we don't refetch
      // the user's GPS
      let coords;
      if (!location) {
        const response = await getCurrentPosition();
        coords = response.coords;
        const { longitude, latitude } = coords;

        this.setState({ location: { longitude, latitude } });
      }

      // We currently have 2 sources, aqicn, and windWaqi
      // We put them in an array
      const sources = [dataSources.aqicn, dataSources.windWaqi];

      const api = await retry(
        async (_, attempt) => {
          // Attempt starts at 1
          const result = await sources[(attempt - 1) % 2](location || coords);
          return result;
        }
      );
      this.setState({ api, loading: false });
    } catch (error) {
      this.setState({ error: true, loading: false });
      console.error(error);
    }
  }

  getCigarettes(pm25) {
    return Math.round(pm25ToCigarettes(pm25) * 10) / 10;
  }

  getDistanceAway() {
    const { api, location } = this.state;
    const correctLagLng = getCorrectLatLng(
      location,
      { latitude: api.city.geo[0], longitude: api.city.geo[1] },
    );
    return Math.round(getDistance(location, correctLagLng)
  );
  }

  renderPresentPast() {
    const time = new Date().getHours();

    if (time < 15) return "You'll smoke";
    return 'You smoked';
  };

  renderInfo() {
    const { error, loading } = this.state;
    if (error) return 'Error fetching location, please try again later.';
    if (loading) return 'Waiting for results...';
    return null;
  }

  renderShit() {
    const { api: { pm25 } } = this.state;
    const cigarettes = pm25ToCigarettes(pm25);

    if (cigarettes <= 1) return 'Oh';
    if (cigarettes < 5) return 'Sh*t';
    if (cigarettes < 15) return 'F*ck';
    return 'WTF';
  };

  render() {
    const { api: { pm25, city }, loading, error } = this.state;
    const cigarettes = pm25 && this.getCigarettes(pm25);
    const distance = city.name && this.getDistanceAway();
    const stationName = city.name && city.name.split(',')[0];
    const stationCity = city.name && city.name.split(',').slice(1).join(', ');

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} alt="logo" />
          <h1 className="App-title">Sh*t, I Smoke.</h1>
        </header>
        <div id="content">
          {/* Loading / Error */}
          <h2>{this.renderInfo()}</h2>
          {/* Location */}
          {city.name &&
            <div>
              <h3 style={{ margin: 0, padding: 0 }}>{stationName},</h3>
              <h3 style={{ margin: 0, padding: 0 }}>{stationCity}</h3>
              <p>Measured {distance}km from you.</p>
            </div>}
          {/* Cigarrettes */}
          {cigarettes &&
            <h1>{this.renderShit()}! {this.renderPresentPast()}{' '}
              <span className="primary">{cigarettes} cigarettes </span> today.
            </h1>}
          {/* About */}
          {!loading && !error && <About />}
        </div>
      </div>
    );
  }
}

export default App;
