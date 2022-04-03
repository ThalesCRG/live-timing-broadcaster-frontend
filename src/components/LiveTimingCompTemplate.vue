<template>
  <v-container app>
    <v-tooltip bottom>
      <template v-slot:activator="{on, attrs}">
        <v-simple-table dark>
          <thead
            v-bind="attrs"
            v-on="on"
            @click="weatherdialog = true"
            onMouseOver="this.style.cursor='pointer'"
          >
            <td>
              {{
                SESSION_TYPES[session.sessionType] === 'R'
                  ? 'Race'
                  : SESSION_TYPES[session.sessionType] || 'unknown session type'
              }}
            </td>
            <td>
              {{ TRACKS[session.track] }}
            </td>
            <td>Weather: {{ WEATHER[session.currentWeather] }}</td>

            <v-dialog v-model="weatherdialog">
              <v-simple-table>
                <tbody>
                  <tr
                    v-for="(forecast, index) in session.weatherForecasts"
                    :key="'Forecast' + index"
                  >
                    <td>
                      {{ SESSION_TYPES[forecast.m_sessionType] }}: Weather in
                      {{ forecast.m_timeOffset }} minutes will be
                      {{ WEATHER[forecast.m_weather] }}
                      with {{ forecast.m_rainPercentage }}% Rain.
                    </td>
                  </tr>
                </tbody>
              </v-simple-table>
            </v-dialog>
            <td>Air: {{ session.airTemperature }}°C</td>
            <td>Track Temperature: {{ session.trackTemperature }}°C</td>
            <td v-if="session.sessionType == 10 || session.sessionType == 11">
              Lap {{ getLapLeader() }}/{{ session.totalLaps }}
            </td>

            <td>
              <!-- Convert Time left to Time remaining -->

              {{
                SESSION_TYPES[session.sessionType] === 'R' ||
                SESSION_TYPES[session.sessionType] === 'R2'
                  ? 'Race Duration: ' +
                    new Date((7200 - session.sessionTimeLeft || 0) * 1000)
                      .toISOString()
                      .substr(11, 8)
                  : 'Time Left: ' +
                    new Date((session.sessionTimeLeft || 0) * 1000)
                      .toISOString()
                      .substr(11, 8)
              }}
            </td>
          </thead>
        </v-simple-table>
      </template>
      <span>Click for Weather Forecasts</span>
    </v-tooltip>
    <v-simple-table dark>
      <thead>
        <tr>
          <th>Pos</th>
          <th>#</th>
          <th width="1"></th>
          <th>Name</th>
          <th>Lap No</th>
          <th>Last Lap</th>
          <th>Sector 1</th>
          <th>Sector 2</th>
          <th>Best Lap</th>
          <th>Pitstops</th>
          <th>Tyre</th>
          <th>Age</th>
          <th>Penalties</th>
        </tr>
      </thead>
      <tbody>
        <!-- Convert Time left to Time remaining -->

        <tr
          v-for="(driver, index) in getSortedDrivers()"
          :key="'Driver' + index"
          @click="openLapHistory(driver)"
          onMouseOver="this.style.cursor='pointer'"
          :style="driver._resultStatus > 4 ? 'color: grey' : ' '"
        >
          <td>{{ driver._carPosition }}.</td>
          <td>{{ driver._driverNumber }}</td>
          <td :bgcolor="Teamcolor[driver._team]" width="1"></td>

          <td>{{ driver._driverName }}</td>
          <td>{{ driver._currentLapNum }}</td>
          <td :style="getTimeColor(driver._lastLapTime, driver._bestLapTime)">
            {{ formatTime(driver._lastLapTime) }}
          </td>
          <td>{{ formatTime(driver._sector1Time) }}</td>
          <td>{{ formatTime(driver._sector2Time) }}</td>
          <td :style="getTimeColor(driver._bestLapTime, 0)">
            {{ formatTime(driver._bestLapTime) }}
          </td>

          <td>{{ driver._pitCount }}</td>
          <td width="5%" center>
            <v-img
              contain
              center
              max-height="50px"
              :src="getTyreImgPath(driver._currentTyre.tyre)"
            />
          </td>
          <td>{{ driver._currentTyre.age }}</td>
          <td>
            {{
              SESSION_TYPES[session.sessionType] == 'R' ||
              SESSION_TYPES[session.sessionType] == 'R2'
                ? driver._numUnservedDriveThroughPens !== 0 &&
                  typeof driver._numUnservedDriveThroughPens !== 'undefined'
                  ? 'DRIVE THROUGH'
                  : driver._penaltyTime === 0 &&
                    driver._numUnservedStopGoPens === 0
                  ? ' '
                  : driver._penaltyTime +
                    (driver._numUnservedStopGoPens || 0) * 5 +
                    's'
                : driver._currentLapInvalid == 1
                ? 'Invalid Lap'
                : ''
            }}
          </td>

          <template
            v-if="!(session.sessionType === 10 || session.sessionType === 11)"
          >
            <td v-if="driver._driverStatus !== 1">
              {{ DRIVER_STATUS[driver._driverStatus] }}
            </td>
          </template>
          <v-dialog v-model="lapDialog">
            <v-simple-table>
              <template v-slot:default>
                <thead>
                  <tr>
                    <th></th>
                    <th>Sector 1</th>
                    <th>Sector 2</th>
                    <th>Sector 3</th>
                    <th>Laptime</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(lap, index) in lapHistory" :key="'Lap' + index">
                    <td>Lap {{ index + 1 }}</td>
                    <td>{{ formatTime(lap.m_sector1TimeInMS) }}</td>
                    <td>{{ formatTime(lap.m_sector2TimeInMS) }}</td>
                    <td>{{ formatTime(lap.m_sector3TimeInMS) }}</td>
                    <td
                      :style="
                        getTimeColor(
                          driver._bestLapTime,
                          session.fastestLap.time
                        )
                      "
                    >
                      {{ formatTime(lap.m_lapTimeInMS) }}
                    </td>
                    <td>
                      {{ lap.m_lapValidBitFlags !== 15 ? 'Invalid' : '' }}
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
          </v-dialog>
        </tr>
      </tbody>
    </v-simple-table>
    <template>
      <div class="text-center">
        <v-snackbar
          color="transparent"
          v-model="safetyCarStatus"
          elevation="0"
          timeout="-1"
          top
          right
          max-width="110px"
          max-height="110px"
        >
          <center>
            <div background-color="black">
              <v-img
                src="../ltb-ressources/flags/SCBlack.gif"
                contain
                max-width="100px"
                max-height="100px"
              />
            </div>
          </center>
        </v-snackbar>
        <v-snackbar
          color="transparent"
          v-model="virtualSafetyCarStatus"
          elevation="0"
          timeout="-1"
          top
          right
          max-width="110px"
          max-height="110px"
        >
          <v-img
            src="../ltb-ressources/flags/VSCBlack.gif"
            contain
            max-width="100px"
            max-height="100px"
          />
        </v-snackbar>
        <v-snackbar
          color="transparent"
          v-model="startingLightSnackbar"
          elevation="0"
          timeout="-1"
          center
          top
          max-width="500px"
          max-height="110px"
        >
          <v-img :src="getStartingLightImg(numLights)" contain />
        </v-snackbar>

        <v-snackbar v-model="formationLapStatus" timeout="-1" top center>
          <div center>Formation Lap</div>
        </v-snackbar>
      </div>
    </template>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import {SESSION_TYPES, TYRES, WEATHER} from 'f1-2021-udp/build/src/constants';
import {Driver} from 'f1-2021-udp/build/src/constants/types';

enum TRACKS {
  'Melbourne',
  'Paul Ricard',
  'Shanghai',
  'Sakhir (Bahrain)',
  'Catalunya',
  'Monaco',
  'Montreal',
  'Silverstone',
  'Hockenheim',
  'Hungaroring',
  'Spa',
  'Monza',
  'Singapore',
  'Suzuka',
  'Abu Dhabi',
  'Texas',
  'Brazil',
  'Austria',
  'Sochi',
  'Mexico',
  'Baku (Azerbaijan)',
  'Sakhir Short',
  'Silverstone Short',
  'Texas Short',
  'Suzuka Short',
  'Hanoi',
  'Zandvoort',
  'Imola',
  'Portimão',
  'Jeddah',
}
enum DRIVER_STATUS {
  'in Garage',
  'flying lap',
  'in lap',
  'out lap',
  'on track',
}
enum TEAMS {
  'Mercedes',
  'Ferrari',
  'Red Bull Racing',
  'Williams',
  'Aston Martin',
  'Alpine',
  'Alpha Tauri',
  'Haas',
  'McLaren',
  'Alfa Romeo',
  'Art GP ’19',
  'Campos ’19',
  'Carlin ’19',
  'Sauber Junior Charouz ’19',
  'Dams ’19',
  'Uni-Virtuosi ‘19',
  'MP Motorsport ‘19',
  'Prema ’19',
  'Trident ’19',
  'Arden ’19',
  'Art GP ‘20',
  'Campos ‘20',
  'Carlin ‘20',
  'Charouz ‘20',
  'Dams ‘20',
  'Uni-Virtuosi ‘20',
  'MP Motorsport ‘20',
  'Prema ‘20',
  'Trident ‘20',
  'BWT ‘20',
  'Hitech ‘20',
  'Mercedes 2020',
  'Ferrari 2020',
  'Red Bull 2020',
  'Williams 2020',
  'Racing Point 2020',
  'Renault 2020',
  'Alpha Tauri 2020',
  'Haas 2020',
  'McLaren 2020',
  'Alpha Romeo 2020',
}
enum Teamcolor {
  '#00D2BE', //merc
  '#DC0000', //ferrar
  '#0600EF', //rb
  '#005AFF', //WIL
  '#006F62', //AM
  '#0090FF', //alpine
  '#2B4562', //AT
  '#FFFFFF', //Haas
  '#FF8700', //MCL
  '#900000', //AR
  //
}
export default Vue.extend({
  props: ['url'],
  data: function () {
    return {
      weatherdialog: false,
      lapDialog: false,
      safetyCarStatus: false,
      virtualSafetyCarStatus: false,
      formationLapStatus: false,
      connection: null,
      drivers: new Array<Driver>(),
      session: {
        trackLenght: 0,
        bestSector1: 0,
        bestSector2: 0,
        bestSector3: 0,
        track: 0,
        fastestLap: {time: 0, driver: null},
        lightsOutTime: 0,
        safetyCarStatus: 0,
        airTemperature: 0,
        trackTemperature: 0,
        sessionType: 0,
        sessionTimeLeft: 0,
        pitSpeedLimit: 0,
        currentWeather: 0,
        weatherForecasts: [],
        totalLaps: 0,
        drivers: new Array<Driver>(),
      },
      lapHistory: [],
      TEAMS: TEAMS,
      startingLightSnackbar: false,
      numLights: 0,
      SESSION_TYPES: SESSION_TYPES,
      TRACKS: TRACKS,
      TYRE_TYPES: TYRES,
      DRIVER_STATUS: DRIVER_STATUS,
      Teamcolor: Teamcolor,
      WEATHER: WEATHER,
    };
  },
  methods: {
    getLapLeader() {
      let drivers = this.getSortedDrivers();
      return drivers[0]?._currentLapNum ?? 0;
    },
    getStartingLight(event: number) {
      this.$data.startingLightSnackbar = true;
      this.$data.numLights = event;
    },
    // Any for missing type in f1-2021-udp
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    openLapHistory(driver: any) {
      this.$data.lapHistory = driver._lapHistory;
      this.$data.lapDialog = true;
    },
    getTyreImgPath(tyre: string) {
      try {
        return require(`../ltb-ressources/tyres/${tyre}.svg`);
      } catch (err) {
        console.error(err);
      }
      return '';
    },
    getStartingLightImg(numLights: number) {
      try {
        return require(`../ltb-ressources/starting_lights/Starting Light ${numLights}.png`);
      } catch (err) {
        // console.error(err);
      }
      return '';
    },
    updateFromWebsocket(messageEvent: MessageEvent) {
      let eventData = JSON.parse(messageEvent.data);

      this.$data.session = eventData.session;
      this.$data.drivers = eventData.drivers;

      switch (this.$data.session.safetyCarStatus) {
        case 0:
          this.$data.safetyCarStatus = false;
          this.$data.virtualSafetyCarStatus = false;
          this.$data.formationLapStatus = false;
          break;
        case 1:
          this.$data.safetyCarStatus = true;
          this.$data.virtualSafetyCarStatus = false;
          this.$data.formationLapStatus = false;
          break;
        case 2:
          this.$data.safetyCarStatus = false;
          this.$data.virtualSafetyCarStatus = true;
          this.$data.formationLapStatus = false;
          break;
        case 3:
          this.$data.safetyCarStatus = false;
          this.$data.virtualSafetyCarStatus = false;
          this.$data.formationLapStatus = true;
          break;
      }
      if (eventData.event !== undefined)
        switch (eventData.event.type) {
          case 'startingLights':
            this.getStartingLight(eventData.event.number);
            break;
          case 'Lights out':
            this.getStartingLight(0);
            setTimeout(() => (this.$data.startingLightSnackbar = false), 2000);
            break;
        }
    },
    getSortedDrivers() {
      const _drivers = this.$data.drivers.slice();
      return (
        //Workaround with any because f1-2021-udp provides us with this data but no type
        _drivers
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ?.filter((a: any) => a !== null)
          ?.sort(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (a: any, b: any) => (a?._carPosition ?? 0) - (b?._carPosition ?? 0)
          )
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ?.filter((a: any) => a?._carPosition !== 0)
      );
    },
    formatTime(time: number) {
      if (typeof time === 'number' && time !== 0) {
        let result = '';
        var milliseconds = ('000' + (time % 1000)).substr(-3);
        var seconds = ('00' + (Math.floor(time / 1000) % 60)).substr(-2);
        var minutes = Math.floor((time / (60 * 1000)) % 60);
        if (time > 60000) result += minutes + ':';
        result += seconds + '.' + milliseconds;
        return result;
      } else return ' - ';
    },
    getTimeColor(actualTime: number, personalBest: number) {
      if (
        actualTime <= Math.floor(this.$data.session?.fastestLap?.time * 1000) &&
        actualTime !== 0
      ) {
        return 'color: purple';
      }
      if (actualTime === personalBest) {
        return 'color: green';
      }
      return '';
    },
  },
  computed: {},

  beforeMount: function () {
    this.$data.connection = new WebSocket(this.url);
    this.$data.connection?.addEventListener(
      'message',
      (event: MessageEvent) => {
        this.updateFromWebsocket(event);
      }
    );
  },
});
</script>
