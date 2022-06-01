
/**
 * @param asyncFn - A promise-returning function. e.g. an HTTP call.
 * @param expiresIn - The number of milliseconds for the result from calling `asyncFn` to expire.
 * @returns A memoized function that will always resolve to the first result of calling `asyncFn`,
 * as long as the result has not expired.
 */
export function memoPromise(asyncFn, expiresIn) {
    const emptyId = Symbol("empty")
    const memo = {}
    const statusMap = {}
    const resolves = {}
    const rejects = {}

    return async function memoizedFn(...args) {
        const memoKey = args.length === 0 ? emptyId : args.toString()

        if (memo[memoKey]) {
            return Promise.resolve(memo[memoKey]())
        }

        if (statusMap[memoKey] === "pending") {
            return new Promise((_res, _rej) => {
                if (!resolves[memoKey]) {
                    resolves[memoKey] = []
                }
                if (!rejects[memoKey]) {
                    rejects[memoKey] = []
                }
                resolves[memoKey].push(_res)
                rejects[memoKey].push(_rej)
            })
        }

        try {
            statusMap[memoKey] = "pending"
            const result = await asyncFn(...args)
            statusMap[memoKey] = "success"
            memo[memoKey] = function get() {
                if (typeof expiresIn === "number" && expiresIn > 0) {
                    setTimeout(() => {
                        memo[memoKey] = null
                    }, expiresIn)
                }

                return result
            }
            if (resolves[memoKey]) {
                resolves[memoKey].forEach(res => res(result))
                resolves[memoKey].length = 0
            }
        } catch (err) {
            statusMap[memoKey] = "error"
            if (rejects[memoKey]) {
                rejects[memoKey].forEach(rej => rej(err))
                rejects[memoKey].length = 0
            }
            throw err
        }

        return memo[memoKey]()
    }
}

