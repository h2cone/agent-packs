# Chapter 15: Concurrency

## Core Idea
Go's slogan: **"Do not communicate by sharing memory; instead, share memory by communicating."** Shared values are passed on channels and never actively shared by separate goroutines - only one goroutine has access at a time, so data races cannot occur by design. This CSP-derived model (a type-safe generalization of Unix pipes) is expressed through goroutines and channels, and it scales from semaphores and rate limiters to parallel computation and free lists.

## Frameworks Introduced
- **Share by communicating**: Pass values on channels rather than guarding shared variables with locks.
  - When to use: As the *default* high-level approach to concurrent access.
  - How: If communication is the synchronizer, no other synchronization is needed. (Reference counts may still warrant a mutex - don't take the slogan too far.)
- **Goroutines**: A function executing concurrently with others in the same address space; lightweight, with small growable stacks, multiplexed onto OS threads.
  - When to use: Any independent concurrent task.
  - How: Prefix a call with `go`: `go list.Sort()`. Function literals are closures (captured vars survive); `go func() { ... }()`.
- **Channels - unbuffered = synchronous**: `make(chan T)` (or buffer 0) combines communication with synchronization.
  - When to use: Signaling completion, handoffs.
  - How: Receivers always block until data; on an unbuffered channel the *sender* blocks until the receiver receives. `c <- 1` signals; `<-c` waits.
- **Buffered channel as semaphore (throughput limiter)**: A buffered channel of capacity N limits N concurrent operations.
  - When to use: Capping concurrent work.
  - How: `sem := make(chan int, MaxOutstanding)`; send before work (`sem <- 1`), receive after (`<-sem`).
- **Gate goroutine creation, not just execution**: Limiting *running* handlers still leaks goroutines if you spawn one per request; gate *creation* instead, or run a fixed pool of handlers reading from a channel.
  - When to use: Bounding total resource use under load.
  - How: `for req := range queue { sem <- 1; go func() { process(req); <-sem }() }` - or a fixed `MaxOutstanding` handlers all reading `clientRequests`, with a `quit` channel to stop.
- **Channels of channels (parallel demultiplexing)**: A channel is a first-class value; put a reply channel inside a request so each client gets its own answer path.
  - When to use: Non-blocking RPC-style fan-out.
  - How: `type Request struct { args []int; f func([]int) int; resultChan chan int }`; handler sends `req.f(req.args)` to `req.resultChan`.
- **Parallelization via completion signals**: Split a calculation into independent pieces, one goroutine per CPU, drain a channel to wait for all.
  - When to use: CPU-bound independent sub-computations.
  - How: `c := make(chan int, numCPU)`; launch pieces; drain `numCPU` times. Use `runtime.GOMAXPROCS(0)` (honors user config) over `runtime.NumCPU()`.
- **Leaky buffer free list**: Use a buffered channel as a self-limiting free list, with non-blocking `select`/`default`.
  - When to use: Reusing buffers across producer/consumer goroutines without explicit locking.
  - How: `select { case b = <-freeList: default: b = new(Buffer) }` to get; `select { case freeList <- b: default: }` to return (drops on full). The GC reclaims overflow.

## Key Concepts
- **Concurrency vs. parallelism**: Concurrency = structuring a program as independently executing components; parallelism = executing calculations in parallel for speed. Go is a *concurrent* language, not a parallel one; not all parallel problems fit its model.
- **`runtime.NumCPU()` / `runtime.GOMAXPROCS(0)`**: hardware cores vs. user-configured parallelism; prefer the latter to honor the user's request.
- **`select` with `default`**: makes a channel operation non-blocking; the `default` case runs when no other case is ready.
- **Loop variables are per-iteration as of Go 1.22**: do not write `item := item` before a goroutine. Pre-1.22 the loop variable was shared and that copy was required; treat it as history unless go.mod is older than 1.22. See [modern.md](../references/modern.md).

## Mental Models
- Think of a channel as both a queue *and* a synchronizer: sending/receiving is the handshake.
- Think of a buffered channel as a cheap semaphore: the buffer capacity *is* the permit count.
- Think of a free list as a buffered channel plus `select`/`default`: never blocks, never locks, lets the GC mop up.

## Anti-patterns
- **Sharing a variable across goroutines with a lock when a channel would do**: prefer communication.
- **Spawning a goroutine per request while only limiting *running* ones**: unbounded goroutine growth; gate creation or use a fixed pool.
- **Confusing concurrency with parallelism**: structuring concurrently doesn't guarantee parallel speedup.
- **Blocking on a channel without a `default` when you wanted non-blocking**: use `select`/`default`.
- **`item := item` before `go` on Go 1.22+**: unnecessary; per-iteration variables already exist.

## Code Examples
```go
// Unbuffered channel: signal completion
c := make(chan int)
go func() {
    list.Sort()
    c <- 1 // signal; value irrelevant
}()
doSomethingForAWhile()
<-c // wait for sort to finish

// Buffered channel as semaphore
var sem = make(chan int, MaxOutstanding)
func handle(r *Request) {
    sem <- 1    // wait for a slot
    process(r)
    <-sem       // free the slot
}

// Fixed pool of handlers + quit channel
func Serve(clientRequests chan *Request, quit chan bool) {
    for i := 0; i < MaxOutstanding; i++ {
        go handle(clientRequests)
    }
    <-quit // wait to be told to exit
}

// Leaky buffer free list
func client() {
    var b *Buffer
    select {
    case b = <-freeList:
    default:
        b = new(Buffer)
    }
    load(b)
    serverChan <- b
}
```
- **What it demonstrates**: completion signaling, semaphore throughput limiting, a fixed handler pool, and a non-blocking free list.

## Reference Tables
| Channel form | Meaning |
|---|---|
| `make(chan T)` | unbuffered (synchronous) |
| `make(chan T, 0)` | unbuffered (synchronous) |
| `make(chan T, N)` | buffered, capacity N |

| Who blocks, and when | Unbuffered | Buffered |
|---|---|---|
| Receiver | until data available | until data available |
| Sender | until receiver receives | until buffer has room (full -> waits) |

## Worked Example
A rate-limited, non-blocking RPC skeleton with no mutex. The client builds a `Request` carrying its own reply channel and sends it; the handler computes and replies on *that* channel:
```go
type Request struct {
    args       []int
    f          func([]int) int
    resultChan chan int
}

request := &Request{[]int{3, 4, 5}, sum, make(chan int)}
clientRequests <- request               // send
fmt.Printf("answer: %d\n", <-request.resultChan) // wait on own channel

func handle(queue chan *Request) {
    for req := range queue {
        req.resultChan <- req.f(req.args)
    }
}
```
Each client gets a private path for its answer, so replies never get mixed up; the server just fans work to `handle` goroutines. There's not a mutex in sight - synchronization is the channel send/receive itself. Applied: when you'd reach for a shared map + lock to correlate requests and replies, instead embed a reply channel in each request.

## Key Takeaways
1. Share memory by communicating; pass values on channels, don't lock shared variables.
2. Goroutines are cheap; `go f()` runs `f` concurrently.
3. Unbuffered channels synchronize; buffered channels limit throughput (semaphore).
4. Gate goroutine *creation* (or use a fixed pool) to bound resources, not just running count.
5. Channels are first-class - embed a reply channel for parallel demux/RPC.
6. `select`/`default` gives non-blocking channel ops (free lists, peeking).
7. Concurrency (structure) ≠ parallelism (speed); Go is concurrent, not parallel.

## Connects To
- **Ch 8 (Functions)**: `defer` + closures power goroutine setup and cleanup.
- **Ch 16 (Errors)**: `recover` in a deferred function saves a failing goroutine without killing siblings.
- **Ch 17 (A web server)**: `net/http` servers run handlers as goroutines per request.
