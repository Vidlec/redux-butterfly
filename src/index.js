const SUCCESS = 'SUCCESS'
const START = 'START'
const ERROR = 'ERROR'

const isPromise = value =>
  !!value && typeof value === 'object' && typeof value.then === 'function'

export default function butterfly(config) {
  const {
    enhancers: { statics = {}, dynamics = {} },
    enums: { start = START, success = SUCCESS, error = ERROR },
  } = config

  return ({ dispatch, getState }) => next => action => {
    // Normal action pass it to next mw
    if (typeof action !== 'function') return next(action)

    // Side actions
    if (action.sideActions)
      Promise.resolve(action.sideActions).then(actions =>
        actions.forEach(dispatch)
      )

    // Compose enhancers
    const enhancers = {
      ...statics,
      ...Object.keys(dynamics).reduce(
        (acc, key) => ({
          ...acc,
          [key]: dynamics[key](getState()),
        }),
        {}
      ),
    }

    // If action is a function, call the action with enhancments
    const actionResult = action({ ...enhancers, getState, dispatch })

    const { type, payload, ...rest } = actionResult

    // Dispatched regular action, just pass to the next middleware
    if (!payload || !isPromise(payload)) {
      return next(actionResult)
    }

    // This function returns partial action
    const getPartialAction = status => ({
      type: `${type}_${status}`,
      ...rest,
    })

    // Dispatch "start" action
    next(getPartialAction(start))

    // Given action type, returns a function  dipatches action with said action type
    const handleResult = type => value =>
      dispatch({
        ...getPartialAction(type),
        payload: { ...value },
        ...rest,
      })

    // Dispatch proper action based on result of promise from payload
    return payload.then(handleResult(success)).catch(handleResult(error))
  }
}

export const actionCreator = value => async () => {
  const result = await fetch(value)
  return {
    type: 'BLAH',
    payload: result,
  }
}
