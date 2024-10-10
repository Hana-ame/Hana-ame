```go


func TestPanic(t *testing.T) {
	a := func() (r int) {
		defer func() {
			e := recover()
			fmt.Println(e)

			if e != nil {
				r = 999
			}
		}()
		// panic(errors.New("what's going on"))
		return 1
	}
	r := a()
	fmt.Println(r)
}


```

懒得返回error的时候可以用defer func() 里面 加入 recover