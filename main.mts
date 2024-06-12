let data = await fetch("https://en.wikipedia.org/w/api.php?action=history&page=MIT_License&format=json").then(res => res.json());
console.log(data);

export {}
