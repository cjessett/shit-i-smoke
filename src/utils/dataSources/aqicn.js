// Copyright (c) 2018, Amaury Martiny and the Shoot! I Smoke contributors
// SPDX-License-Identifier: GPL-3.0

import axios from 'axios';

const token = process.env.REACT_APP_AQI_TOKEN;
/**
 * Fetch the PM2.5 level from http://api.waqi.info.
 */
const aqicn = async ({ latitude, longitude }) => {
  const { data: response } = await axios.get(
    `https://api.waqi.info/feed/geo:${latitude};${longitude}/?token=${token}`,
    { timeout: 6000 }
  );

  // Example response
  // Object {
  //   "data": Object {
  //     "aqi": 51,
  //     "attributions": Array [
  //       Object {
  //         "name": "Air Lorraine - Surveillance et étude de la qualité de l'air en Lorraine",
  //         "url": "http://air-lorraine.org/",
  //       },
  //       Object {
  //         "name": "European Environment Agency",
  //         "url": "http://www.eea.europa.eu/themes/air/",
  //       },
  //     ],
  //     "city": Object {
  //       "geo": Array [
  //         49.39429190887402,
  //         6.201473467510839,
  //       ],
  //       "name": "Garche, Thionville-Nord",
  //       "url": "http://aqicn.org/city/france/lorraine/thionville-nord/garche/",
  //     },
  //     "dominentpol": "pm25",
  //     "iaqi": Object {
  //       "no2": Object {
  //         "v": 3.2,
  //       },
  //       "o3": Object {
  //         "v": 34.6,
  //       },
  //       "p": Object {
  //         "v": 1012.5,
  //       },
  //       "pm10": Object {
  //         "v": 20,
  //       },
  //       "pm25": Object {
  //         "v": 51,
  //       },
  //       "so2": Object {
  //         "v": 1.6,
  //       },
  //       "t": Object {
  //         "v": 21.6,
  //       },
  //     },
  //     "idx": 7751,
  //     "time": Object {
  //       "s": "2018-08-09 14:00:00",
  //       "tz": "+01:00",
  //       "v": 1533823200,
  //     },
  //   },
  //   "status": "ok",
  // }

  if (response.status !== 'ok') {
    throw new Error(response.data);
  }

  if (
    !response.data ||
    !response.data.iaqi ||
    !response.data.iaqi.pm25 ||
    response.data.iaqi.pm25.v === undefined
  ) {
    throw new Error('PM2.5 not defined in response.');
  }

  return {
    pm25: response.data.iaqi.pm25.v,
    city: {
      name: response.data.city.name,
      geo: [+response.data.city.geo[0], +response.data.city.geo[1]]
    }
  };
};

export default aqicn;
