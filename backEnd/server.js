fetch("https://dummyjson.com/products/category/sports-accessories")
  .then(res => res.json())
  .then(data => {
    console.log(data.products);
  });