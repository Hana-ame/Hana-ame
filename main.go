package main

import (
	"flag"
	"fmt"
	"io"
	"log"
	"net"
	"os"
	"strconv"

	_ "github.com/joho/godotenv/autoload"
)

// const key = 0x37 // 用于XOR加密的密钥

func handleConnection(local, remote net.Conn) {
	defer local.Close()
	defer remote.Close()
	key := func() byte {
		key, err := strconv.Atoi(os.Getenv("KEY"))
		if err != nil {
			log.Printf("error parsing key: %v", err)
		}
		return (byte(key))
	}()
	xorLocal := NewXorStream(key, local, local)
	xorRemote := NewXorStream(key, remote, remote)

	go func() {
		// 从本地连接复制到远程连接
		_, err := io.Copy(xorRemote, xorLocal)
		if err != nil {
			log.Printf("error copying from local to remote: %v", err)
		}
	}()

	// 从远程连接复制到本地连接
	_, err := io.Copy(xorLocal, xorRemote)
	if err != nil {
		log.Printf("error copying from remote to local: %v", err)
	}
}

func main() {
	listen := flag.String("listen", ":8080", "Address to listen on")
	forward := flag.String("forward", "localhost:80", "Address to forward connections to")
	flag.Parse()

	fmt.Printf("listen at %s \n", *listen)
	fmt.Printf("forward to %s \n", *forward)

	listener, err := net.Listen("tcp", *listen)
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}
	log.Printf("Listening on %s", *listen)

	for {
		local, err := listener.Accept()
		if err != nil {
			log.Printf("failed to accept connection: %v", err)
			continue
		}

		remote, err := net.Dial("tcp", *forward)
		if err != nil {
			log.Printf("failed to connect to remote: %v", err)
			local.Close()
			continue
		}

		go handleConnection(local, remote)
	}
}
