<template>
  <v-container app>
    <v-simple-table dark>
      <tr>
        <th>
          {{
            SESSION_TYPES[session.sessionType] === 'R'
              ? 'Race'
              : SESSION_TYPES[session.sessionType]
          }}
        </th>
        <th>Weather: {{ WEATHER[session.currentWeather] }}</th>

        <th>Air: {{ session.airTemperature + '°C' }}</th>
        <th>Track Temperature: {{ session.trackTemperature }}°C</th>

        <th>
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
        </th>
      </tr>
    </v-simple-table>

    <v-simple-table dark>
      <thead>
        <tr>
          <th>Pos</th>
          <th>#</th>
          <th>Name</th>
          <th>Tyre FL</th>
          <th>Tyre FR</th>
          <th>Tyre RL</th>
          <th>Tyre RR</th>
          <th>Wing left</th>
          <th>Wing Right</th>
          <th>ERS</th>
          <th>Flag</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="(driver, index) in getSortedDrivers()" :key="index">
          <td>{{ driver._carPosition }}.</td>
          <td>{{ driver._driverNumber }}</td>
          <td>{{ driver._driverName }}</td>
          <td :style="getPercentageColor(driver._tyreWear[2], 60)">
            {{ Math.floor(driver._tyreWear[2]) }}%
          </td>
          <td :style="getPercentageColor(driver._tyreWear[3], 60)">
            {{ Math.floor(driver._tyreWear[3]) }}%
          </td>
          <td :style="getPercentageColor(driver._tyreWear[0], 60)">
            {{ Math.floor(driver._tyreWear[0]) }}%
          </td>
          <td :style="getPercentageColor(driver._tyreWear[1], 60)">
            {{ Math.floor(driver._tyreWear[1]) }}%
          </td>
          <td :class="driver._wingdamage.left !== 0 ? 'red--text' : ''">
            {{
              driver._wingdamage.left !== 0
                ? Math.floor(driver._wingdamage.left) + '%'
                : '-'
            }}
          </td>
          <td :class="driver._wingdamage.right !== 0 ? 'red--text' : ''">
            {{
              driver._wingdamage.right !== 0
                ? Math.floor(driver._wingdamage.right) + '%'
                : '-'
            }}
          </td>
          <td :style="getPercentageColor(100 - driver._ers, 100)">
            {{ Math.floor(driver._ers) }}%
          </td>
          <td width="3%">
            <v-img max-width="50px" contain :src="getFlag(driver._flag)" />
          </td>
          <td>
            <!-- Even if the mouseover seems rather inconvenient, 
        it is important for commentators who are still in the game and are not allowed to tab out, to use mouseover functions here. -->

            <img
              @mouseover="openLapHistory(driver)"
              src="../ltb-ressources/i.svg"
            />
          </td>
          <td v-if="driver._yourTelemetry == 0">Telemetry Restricted</td>

          <v-dialog v-model="infringementDialog">
            <v-simple-table>
              <template v-slot:default>
                <thead>
                  <tr>
                    <th></th>
                    <th>Infringement</th>
                    <th>Penalty</th>
                    <th></th>
                    <th>
                      <!-- Even if the mouseover seems rather inconvenient, 
        it is important for commentators who are still in the game and are not allowed to tab out, to use mouseover functions here. -->

                      <img
                        @mouseover="infringementDialog = false"
                        src="../ltb-ressources/x.svg"
                      />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(infringement, index) in infringements"
                    :key="'Infringement' + index"
                  >
                    <td>Lap: {{ infringement.lapNum }}</td>
                    <td>{{ InfringementTypes[infringement.penaltyType] }}</td>
                    <td>
                      {{ PenaltyTypes[infringement.infringementType] }}
                    </td>
                    <td v-if="infringement.time > 0">
                      {{ infringement.time }}s
                    </td>
                    <td v-if="infringement.placesGained > 0">
                      {{ infringement.placesGained }} Places Grid Penalty
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
          </v-dialog>
        </tr>
      </tbody>
    </v-simple-table>
    <v-btn @click="saveFile">Download Session</v-btn>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import {SESSION_TYPES, TYRES, WEATHER} from 'f1-2021-udp/build/src/constants';
import {Driver} from 'f1-2021-udp/build/src/constants/types';
export enum FLAGS {
  'none',
  'green',
  'blue',
  'yellow',
  'red',
}
enum PenaltyTypes {
  'Drive through',
  'Stop Go',
  'Grid penalty',
  'Penalty reminder',
  'Time penalty',
  'Warning',
  'Disqualified',
  'Removed from formation lap',
  'Parked too long timer',
  'Tyre regulations',
  'This lap invalidated',
  'This and next lap invalidated',
  'This lap invalidated without reason',
  'This and next lap invalidated without reason',
  'This and previous lap invalidated',
  'This and previous lap invalidated without reason',
  'Retired',
  'Black flag timer',
}
enum InfringementTypes {
  'Blocking by slow driving',
  'Blocking by wrong way driving',
  'Reversing off the start line',
  'Big Collision',
  'Small Collision',
  'Collision failed to hand back position single',
  'Collision failed to hand back position multiple',
  'Corner cutting gained time',
  'Corner cutting overtake single',
  'Corner cutting overtake multiple',
  'Crossed pit exit lane',
  'Ignoring blue flags',
  'Ignoring yellow flags',
  'Ignoring drive through',
  'Too many drive throughs',
  'Drive through reminder serve within n laps',
  'Drive through reminder serve this lap',
  'Pit lane speeding',
  'Parked for too long',
  'Ignoring tyre regulations',
  'Too many penalties',
  'Multiple warnings',
  'Approaching disqualification',
  'Tyre regulations select single',
  'Tyre regulations select multiple',
  'Lap invalidated corner cutting',
  'Lap invalidated running wide',
  'Corner cutting ran wide gained time minor',
  'Corner cutting ran wide gained time significant',
  'Corner cutting ran wide gained time extreme',
  'Lap invalidated wall riding',
  'Lap invalidated flashback used',
  'Lap invalidated reset to track',
  'Blocking the pitlane',
  'Jump start',
  'Safety car to car collision',
  'Safety car illegal overtake',
  'Safety car exceeding allowed pace',
  'Virtual safety car exceeding allowed pace',
  'Formation lap below allowed speed',
  'Retired mechanical failure',
  'Retired terminally damaged',
  'Safety car falling too far back',
  'Black flag timer',
  'Unserved stop go penalty',
  'Unserved drive through penalty',
  'Engine component change',
  'Gearbox change',
  'League grid penalty',
  'Retry penalty',
  'Illegal time gain',
  'Mandatory pitstop',
}
export default Vue.extend({
  props: ['url'],
  data: function () {
    return {
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
      infringementDialog: false,
      SESSION_TYPES: SESSION_TYPES,
      InfringementTypes: InfringementTypes,
      TYRE_TYPES: TYRES,
      WEATHER: WEATHER,
      infringements: [],
      FLAGS: FLAGS,
      PenaltyTypes: PenaltyTypes,
    };
  },
  methods: {
    openLapHistory(event: {_infrigements: unknown}) {
      this.$data.infringements = event._infrigements;
      this.$data.infringementDialog = true;
    },
    saveFile() {
      let obj = [this.$data.drivers, this.$data.session];
      const data = JSON.stringify(obj);
      const blob = new Blob([data], {type: 'text/plain'});
      const e = document.createEvent('MouseEvents'),
        a = document.createElement('a');
      a.download = 'test.json';
      a.href = window.URL.createObjectURL(blob);
      a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
      e.initEvent('click', true, false);
      a.dispatchEvent(e);
    },
    getImgPath(tyre: string) {
      try {
        return require(`../ltb-ressources/tyres/${tyre}.svg`);
      } catch (err) {
        console.error(err);
      }
      return '';
    },
    getPercentageColor(wear: number, multiplicator: number) {
      if (multiplicator !== 0) {
        wear *= 100 / multiplicator;
      }

      const greenvalue = Math.round(
        Math.min(Math.max(1 - (wear - 50) / 50, 0), 1) * 255
      );
      const redvalue = Math.round(Math.min(Math.max(wear / 50, 0), 1) * 255);

      return (
        'color: #' + this.rgbToHex(redvalue) + this.rgbToHex(greenvalue) + '00'
      );
    },
    getFlag(flagNr: number) {
      try {
        switch (flagNr) {
          case 1:
            return require(`../ltb-ressources/flags/Green.gif`);
          case 2:
            return require(`../ltb-ressources/flags/Blue.gif`);
          case 3:
            return require(`../ltb-ressources/flags/Yellow.gif`);
        }
      } catch (err) {
        console.error(err);
      }
      return '';
    },
    rgbToHex(rgb: number) {
      var hex = Number(rgb).toString(16);
      if (hex.length < 2) {
        hex = '0' + hex;
      }
      return hex;
    },
    updateFromWebsocket(event: MessageEvent) {
      let messageEvent = event;
      let eventData = JSON.parse(messageEvent.data);

      this.$data.session = eventData.session;
      this.$data.drivers = eventData.drivers;
    },
    getSortedDrivers() {
      const _driver = this.drivers.slice();
      return (
        _driver
          // Need to do Any because data is provided but not in f1-2021-udp types
          ?.filter(driver => driver !== null)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ?.sort((a, b) => (a as any)._carPosition - (b as any)._carPosition)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ?.filter(a => (a as any)._carPosition !== 0)
      );
    },
    formatTime(time: number) {
      if (typeof time === 'number' && time !== 0) {
        let result = '';
        var milliseconds = ('000' + (time % 1000)).substr(-3);
        var seconds = Math.floor((time / 1000) % 60);
        var minutes = Math.floor((time / (60 * 1000)) % 60);
        if (time > 60000) result += minutes + ':';
        result += seconds + '.' + milliseconds;
        return result;
      } else return ' - ';
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
