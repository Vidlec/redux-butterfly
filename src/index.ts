import { Config } from './types'
import get from 'lodash-es/get'
import { Dispatch, Middleware, MiddlewareAPI } from 'redux'

enum Types {
  START = 'START',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

const isPromise = value =>
  !!value && typeof value === 'object' && typeof value.then === 'function'

const getPartialAction = (status, type, rest) => ({
  type: `${type}_${status}`,
  ...rest,
})

const resultHandler = (
  type,
  dispatch,
  onSuccess,
  onFailure,
  andThen,
  enums,
  rest
) => status => value => {
  if (onSuccess && status === enums.success) onSuccess(value)
  if (onFailure && status === enums.failure) onFailure(value)
  if (andThen) andThen(value)
  dispatch({
    ...getPartialAction(status, type, rest),
    payload: value,
  })
}

export default function butterfly<S>(config: Config<S> = {}) {
  const statics = get(config, ['enhancers', 'statics']) || {}
  const dynamics = get(config, ['enhancers', 'dynamics']) || {}

  const enums = get(config, ['enums']) || {}
  const {
    start = Types.START,
    success = Types.SUCCESS,
    error = Types.ERROR,
  } = enums

  const mw: Middleware = ({ dispatch, getState }: MiddlewareAPI) => (
    next: Dispatch
  ) => action => {
    // If its a normal action, pass it to next mw
    if (typeof action !== 'function') return next(action)

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

    const {
      type,
      payload,
      sideActions,
      onSuccess,
      onFailure,
      andThen,
      ...rest
    } = actionResult

    // Side actions
    if (sideActions)
      Promise.resolve(action.sideActions).then(actions =>
        actions.forEach(dispatch)
      )

    // Dispatched regular action, just pass to the next middleware
    if (!payload || !isPromise(payload)) {
      return next(actionResult)
    }

    // Dispatch "start" action
    next(getPartialAction(start, type, rest))
    const handleResult = resultHandler(
      type,
      dispatch,
      onSuccess,
      onFailure,
      andThen,
      { start, success, error },
      rest
    )

    // Dispatch proper action based on result of promise from payload
    return payload.then(handleResult(success)).catch(handleResult(error))
  }

  return mw
}
