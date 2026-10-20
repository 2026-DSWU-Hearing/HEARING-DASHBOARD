import { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from 'axios'
import { describe, expect, it } from 'vitest'
import { getLoginErrorMessage } from './getLoginErrorMessage'

const config = { headers: new AxiosHeaders() } as InternalAxiosRequestConfig

const createResponseError = (status: number, data: unknown) =>
  new AxiosError('Request failed', 'ERR_BAD_REQUEST', config, undefined, {
    status,
    statusText: '',
    headers: {},
    config,
    data,
  })

describe('getLoginErrorMessage', () => {
  it('서버 응답이 있으면 상태 코드와 detail 을 보여준다', () => {
    expect(getLoginErrorMessage(createResponseError(401, { detail: 'Invalid Google token' }))).toBe(
      '서버 응답 401 · Invalid Google token',
    )
    expect(
      getLoginErrorMessage(createResponseError(500, '<html>Internal Server Error</html>')),
    ).toBe('서버 응답 500 · <html>Internal Server Error</html>')
    expect(getLoginErrorMessage(createResponseError(422, { detail: [{ loc: ['body'] }] }))).toBe(
      '서버 응답 422 · [{"loc":["body"]}]',
    )
    expect(getLoginErrorMessage(createResponseError(502, null))).toBe('서버 응답 502')
  })

  it('타임아웃은 시간 초과로 안내한다', () => {
    const error = new AxiosError('timeout of 10000ms exceeded', 'ECONNABORTED', config)
    expect(getLoginErrorMessage(error)).toMatch(/시간 초과/)
  })

  it('응답이 없으면 CORS 또는 네트워크 문제로 안내한다', () => {
    const error = new AxiosError('Network Error', 'ERR_NETWORK', config)
    expect(getLoginErrorMessage(error)).toMatch(/CORS/)
  })

  it('axios 오류가 아니면 알 수 없는 오류로 안내한다', () => {
    expect(getLoginErrorMessage(new Error('boom'))).toMatch(/알 수 없는 오류/)
  })
})
