import { Action } from 'redux'

export interface StaticEnhancer {
  [key: string]: (...args: any) => any
}

export interface DynamicEnhancer<S> {
  [key: string]: (store: S) => any
}

export interface Enums {
  start?: string
  success?: string
  error?: string
}

export interface Enhancers<S> {
  statics?: StaticEnhancer[]
  dynamics?: DynamicEnhancer<S>[]
}

export interface Config<S> {
  enhancers?: Enhancers<S>
  enums?: Enums
}
