package main

import "io"

type xorStream struct {
	key byte
	r   io.Reader
	w   io.Writer
}

func (x *xorStream) Read(p []byte) (int, error) {
	n, err := x.r.Read(p)
	for i := 0; i < n; i++ {
		p[i] ^= x.key
	}
	return n, err
}

func (x *xorStream) Write(p []byte) (int, error) {
	enc := make([]byte, len(p))
	copy(enc, p)
	for i := range enc {
		enc[i] ^= x.key
	}
	return x.w.Write(enc)
}

func NewXorStream(key byte, reader io.Reader, writer io.Writer) *xorStream {
	stream := &xorStream{
		key: key,
		r:   reader,
		w:   writer,
	}
	return stream
}
