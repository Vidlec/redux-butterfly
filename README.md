# Redux Butterfly

Side effects [middleware](https://redux.js.org/advanced/middleware) for Redux.

[![npm version](https://img.shields.io/npm/v/redux-butterfly.svg?style=flat-square)](https://www.npmjs.com/package/redux-butterfly)
[![npm downloads](https://img.shields.io/npm/dm/redux-butterfly.svg?style=flat-square)](https://www.npmjs.com/package/redux-butterfly)

```js
npm install redux-butterfly
```

or

```js
yarn add redux-butterfly
```

## Attention

**If you use Butterfly in CommonJS environment, don’t forget to add `.default` to your import**

```js
var butterfly = require('redux-butterfly').default
```

## What this does?

This library acts similary to [`redux-thunk`](https://www.npmjs.com/package/redux-thunk)

Its a [middleware](https://github.com/reactjs/redux/blob/master/docs/advanced/Middleware.md) which alows you to use action creators which return a function. This function recieves set of `enhancments`. Those enhancments are then available on action creator. More on that below.

## Usage

```js
import { applyMiddleware, createStore } from 'redux'
import butterfly from 'redux-butterfly'

import rootReducer from './reducers'

const config = {
  enhancers: {
    statics, // default: {}
    dynamics, // default: {}
  },
  enums: {
    start: START, // default: "START"
    success: SUCCESS, // default: "SUCCESS"
    error: ERROR, // default: "ERROR"
  },
}

const store = createStore(
  reducers,
  devToolsEnhancer(),
  applyMiddleware(butterfly(config), ...othermidlewares)
)
```

You may notice two config keys.

`enhancers` - this is where your enhancers will go

`enums` - define enum values for actions. MW will dispatch `ACTION_TYPE_{value}` for you automaticaly.

## Enhancers

Enhancers are a functions which are provided to the function returned by the action creator. There are two types: `statics` and `dynamics`

`statics` looks like this:

```js
someValue => console.log(someValue)
```

`dynamics`:

```js
(store) => store.someValue
(store) => (value) => `${store.someValue}_${value}`
```

As you can see dynamic enhancment gets a redux store as an input parameter, then its up to you what you want to do with it. For example you can have function which makes an API calls and always takes user token from the redux store. This function is then available in action creator.

**Action creator**

```js
export const logIn = (username, password) => ({ api }) => ({
  type: LOG_IN,
  payload: api.login(username, password),
})
```
