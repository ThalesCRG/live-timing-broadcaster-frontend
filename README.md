# live-timing-broadcaster.com

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration

Use `store.ts` as config. There are Options for `WS_URI` and `API_URI`
`WS_URI` represents where your websocket connection will be established. If you have more leagues we suggest to have a `URI/League1`,`URI/League2`... structure since that is what I did in the SampleLeague.

on default it is
```
WS_URI: 'ws://localhost:8999',
API_URI: 'http://localhost:3000'
```