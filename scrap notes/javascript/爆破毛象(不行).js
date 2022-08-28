


function deleteById(id){
    path = `/api/v1/statuses/` + id
    fetch( path, {
        method:"DELETE",
        headers :{
            "csrf-token": "shDjO4cfVPteYU--ySCth0_ByruFLwphvCeC-oP6YpLygDAWJVzx7GDpWcd2CGZzxxRDBhYARVWXEwgIhNsdsA",
        },        
    }).then(response => response.json())
      .then(data => console.log(data));
}