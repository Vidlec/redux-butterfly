import configureMockStore from 'redux-mock-store'
import butterfly from '../src'

export const mockStore = configureMockStore([butterfly()])

const regularAction = value => ({
  type: 'REGULAR_ACTION',
  value,
})

const asyncAction = () => () => ({
  type: 'ASYNC_FUNCTION',
  payload: new Promise(resolve => {
    resolve('I am async function')
  }),
  someData: 'some Data',
})

const asyncActionStart = () => ({
  type: 'ASYNC_FUNCTION_START',
  someData: 'some Data',
})

const asyncActionSuccess = () => ({
  type: 'ASYNC_FUNCTION_SUCCESS',
  payload: 'I am async function',
  someData: 'some Data',
})

it('Dispatches regular action', () => {
  const store = mockStore({})

  store.dispatch(regularAction('Regular action'))

  const expectedActions = store.getActions()
  expect(expectedActions.length).toBe(1)
  expect(expectedActions).toContainEqual(regularAction('Regular action'))
})

it('Dispatches async action', () => {
  const store = mockStore({})

  store.dispatch(asyncAction()).then(() => {
    const expectedActions = store.getActions()
    expect(expectedActions.length).toBe(2)
    expect(expectedActions).toContainEqual(asyncActionStart())
    expect(expectedActions).toContainEqual(asyncActionSuccess())
  })
})
