
import { ref } from 'vue'

function apiWithErrorWrapper(api) {
  return function apiWithError(...args) {
    return api(...args).then(res => {
      if (typeof res === 'object' && res !== null) {
        if (Object.hasOwn(res, 'error')) {
          return Promise.reject(new Error(res.error))
        }
        if (res.isError) {
          return Promise.reject(new Error(500))
        }
      }
      return res
    })
  }
}

/**
 * @param {(...args:Array<any>) => Promise} api
 * @param {{ retryCount?:number, initData?:any, immediate?:boolean, initParams?:Array<any>}} config
 */
export function useRequest(api, config) {
  const {
    retryCount = 0,
    initData = undefined,
    immediate = false,
    initParams = [],
    processResErr = true,
    processResData = res => Promise.resolve(res)
  } = {
    ...config
  }

  const loading = ref(false)
  const data = ref(initData)
  const error = ref()
  let resolve, reject
  let count = ref(0)
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })

  let ps = Promise.resolve()

  const apiFunc = processResErr ? apiWithErrorWrapper(api) : api

  function run(...args) {
    if (count.value > retryCount) {
      loading.value = false
      count.value = 0
      reject(error.value)
      return ps
    }
    loading.value = true
    error.value = undefined
    count.value++
    ps = apiFunc(...args)
      .then(processResData)
      .then(res => {
        data.value = res
        count.value = 0
        loading.value = false
        resolve(res)
        return data.value
      })
      .catch(err => {
        if (err instanceof Error) {
          error.value = err
        } else if (`${err}` == err) {
          error.value = new Error(err)
        } else {
          error.value = new Error('Unknown error')
        }
        ps = run(...args)
        return ps
      })

    return ps
  }

  if (immediate) {
    run(...initParams)
  }

  return { loading, data, error, run, promise }
}