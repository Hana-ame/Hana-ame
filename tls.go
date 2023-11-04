
package main

import (
	"flag"
	"log"
	"net/http"
)

func main() {
	port := flag.String("p", "443", "port to serve on")
	directory := flag.String("d", ".", "the directory of static file to host")
	certificates := flag.String("c", ".acme.sh/_.d.moonchan.xyz", "the directory of acme.sh/_.d.moonchan.xyz")
	flag.Parse()

	http.Handle("/", http.FileServer(http.Dir(*directory)))

	log.Printf("Serving %s on HTTPS port: %s\n", *directory, *port)
	log.Fatal(http.ListenAndServeTLS(":"+*port, *certificates+"/fullchain.cer", *certificates+"/_.d.moonchan.xyz.key", nil))
}
