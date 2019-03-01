import { AnyAction, Dispatch } from 'redux'

export interface StaticEnhancers {
  [key: string]: (...args: any) => any
}

export interface DynamicEnhancers<S> {
  [key: string]: (store: S) => any
}

export interface Enums {
  start?: string
  success?: string
  error?: string
}

export interface Enhancers<S> {
  statics?: StaticEnhancers
  dynamics?: DynamicEnhancers<S>
}

export interface Config<S> {
  enhancers?: Enhancers<S>
  enums?: Enums
}

export interface ButterflyAction extends AnyAction {
  payload?: Promise<any> | any
  sideActions?: AnyAction[] | ButterflyAction[]
  onSuccess?: (data: any) => void
  onFailure?: (data: any) => void
  andThen?: (data: any) => void
}

export interface ButterflyProps<S> {
  getState: () => S
  dispatch: Dispatch
  [enhancers: string]: any
}

export interface ButterflyResult<T, P, R = {}> {
  type: T
  payload?: P
  rest?: R
}
