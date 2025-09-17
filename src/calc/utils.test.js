import {  myFormat } from "./utils";

test('renders learn react link', () => {
    let a = ""
    a = myFormat("")
    console.log(a)
    a = myFormat("1")
    console.log(a)
    a = myFormat("12")
    console.log(a)
    a =     myFormat("123")
    console.log(a)
    a =     myFormat("1234")
    console.log(a)
    a =     myFormat("12345")
    console.log(a)
    a =     myFormat("123456")
    console.log(a)
    a =     myFormat("12345678901234567890")
    console.log(a)
  });
  