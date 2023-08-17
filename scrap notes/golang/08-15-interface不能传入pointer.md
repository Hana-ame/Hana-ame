# interface不能传入pointer

## 解答

```go
type A interface {
	Get() any
}

type o struct {
	v string
}

func (o *o) Get() any {
	return o.v
}

type O struct {
	o
}

func TestXxx(t *testing.T) {
	o := &o{"123"}
	// o := &O{o{"123"}} // 这个也行
	func(a A) {
		fmt.Println(a.Get())
	}(o)
}
```

作为一个pointer传入interface时可以用pointer作为函数

总觉得要多学学golang，以后还要学java吧

## 


```go

type A interface {
	Get() any
}

type O struct {
	v string
}

func (o *O) Get() any {
	return o.v
}

func TestXxx(t *testing.T) {
	o := O{"123"}
	func(a A) {
		fmt.Println(a.Get())
	}(o)
}

```

起因是这段代码会报错
> cannot use o (variable of type O) as A value in argument to (func(a A) literal): O does not implement A (method Get has pointer receiver)compilerInvalidIfaceAssign

那不对啊，为什么net.Conn可以用interface呢。

```go

type conn struct {
	fd *netFD
}

func (c *conn) ok() bool { return c != nil && c.fd != nil }

// Implementation of the Conn interface.

// Read implements the Conn Read method.
func (c *conn) Read(b []byte) (int, error) {
	if !c.ok() {
		return 0, syscall.EINVAL
	}
	n, err := c.fd.Read(b)
	if err != nil && err != io.EOF {
		err = &OpError{Op: "read", Net: c.fd.net, Source: c.fd.laddr, Addr: c.fd.raddr, Err: err}
	}
	return n, err
}

```

你看这个conn不是pointer么

```go

// dialSingle attempts to establish and returns a single connection to
// the destination address.
func (sd *sysDialer) dialSingle(ctx context.Context, ra Addr) (c Conn, err error) {
	trace, _ := ctx.Value(nettrace.TraceKey{}).(*nettrace.Trace)
	if trace != nil {
		raStr := ra.String()
		if trace.ConnectStart != nil {
			trace.ConnectStart(sd.network, raStr)
		}
		if trace.ConnectDone != nil {
			defer func() { trace.ConnectDone(sd.network, raStr, err) }()
		}
	}
	la := sd.LocalAddr
	switch ra := ra.(type) {
	case *TCPAddr:
		la, _ := la.(*TCPAddr)
		c, err = sd.dialTCP(ctx, la, ra)
	case *UDPAddr:
		la, _ := la.(*UDPAddr)
		c, err = sd.dialUDP(ctx, la, ra)
	case *IPAddr:
		la, _ := la.(*IPAddr)
		c, err = sd.dialIP(ctx, la, ra)
	case *UnixAddr:
		la, _ := la.(*UnixAddr)
		c, err = sd.dialUnix(ctx, la, ra)
	default:
		return nil, &OpError{Op: "dial", Net: sd.network, Source: la, Addr: ra, Err: &AddrError{Err: "unexpected address type", Addr: sd.address}}
	}
	if err != nil {
		return nil, &OpError{Op: "dial", Net: sd.network, Source: la, Addr: ra, Err: err} // c is non-nil interface containing nil pointer
	}
	return c, nil
}

```

*UDPConn完全是可以作为Conn的，就很怪异

那好吧，总之先看为什么

```go
type UDPConn struct {
	conn
}
```

套两层就可以了么

```go
// Read implements the Conn Read method.
func (c *conn) Read(b []byte) (int, error) {
	if !c.ok() {
		return 0, syscall.EINVAL
	}
	n, err := c.fd.Read(b)
	if err != nil && err != io.EOF {
		err = &OpError{Op: "read", Net: c.fd.net, Source: c.fd.laddr, Addr: c.fd.raddr, Err: err}
	}
	return n, err
}
```

conn的Read明显也是指针

不太清楚内存里面是怎么弄的，而且我也不会看，完犊子

好吧，是pointer

```go
type A interface {
	Get() any
}

type o struct {
	v string
}

func (o *o) Get() any {
	return o.v
}

type O struct {
	o
}

func TestXxx(t *testing.T) {
	o := &o{"123"}
	// o := &O{o{"123"}} // 这个也行
	func(a A) {
		fmt.Println(a.Get())
	}(o)
}
```

作为一个pointer传入interface时可以用pointer作为函数

总觉得要多学学golang，以后还要学java吧