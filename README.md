# memo-promise

## Motivation

Sometimes when two components far away from each other in the same page need to make the same HTTP call, we get duplicate requests. We can solve this problem by lifting up the common request to a higher level, but we'll get unneccessary network requests when the consumer components are shown conditionally.

The `memoPromise` function in this module aimes to solve this problem. It caches the result of the first async call, later calls will all resolve with the first result. It also supports cache timeout. When supplied with a timeout value, subsequent calls that happen after the timeout limit will trigger a new request.

## Example

```js
const request = id => fetch(`https://some.endpoints.com/api?id=${id}`).then(res => res.json())

const cachedRequest = memoPromise(request, 3 * 60 * 1000)

// component A
const res = await cachedRequest(123)

// component B
const res = await cachedRequest(123)
```
