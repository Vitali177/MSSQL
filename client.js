const buttonSubmit = document.querySelector(".button-submit");
const dataArea = document.querySelector(".data");
const resultArea = document.querySelector(".result");
const inputsRequest = [...document.querySelectorAll("input[name=request]")];

buttonSubmit.addEventListener("click", (e) => {
  e.preventDefault();
  const chosenRequest = inputsRequest.filter((input) => input.checked)[0];
  const reqMethod = chosenRequest.parentNode.innerText.split(" ")[0];  

  if (reqMethod === "GET") {
    fetch("http://localhost:3000/api/pulpits", {
      method: "GET",
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin', 
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(res => res.json())
    .then(data => resultArea.innerHTML = JSON.stringify(data));
  } 
  else if (reqMethod === "POST" || reqMethod === "PUT") {
    const dataBody = JSON.parse(dataArea.value.trim());

    fetch("http://localhost:3000/api/pulpits", {
      method: reqMethod,
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin', 
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dataBody)
    })
    .then((res) => {
      res.text().then(text => resultArea.innerHTML = text)
    });
  } else if (reqMethod === "DELETE") {
    const key = dataArea.value.trim();

    fetch(`http://localhost:3000/api/pulpits/${key}`, {
      method: reqMethod,
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin', 
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then((res) => {
      res.text().then(text => resultArea.innerHTML = text)
    });
  }
});