const socket = io();

console.log(123123123);
let question = 'Введите ваш ник!';
let nik = prompt(question);


document.querySelector('.login__crate-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const input =  e.target.childNodes[0];
  socket.emit('broadcast', input.value);
  input.value = '';
})

socket.on('connect', () => {
  socket.emit('name', nik);
});

socket.on('broadcast', (...msg) => {
  document.querySelector('#messanges').innerHTML += `<p>${msg[0]}: ${msg[1]}</p>`;
  // window.scrollTo(0, document.body.scrollHeight);
});


    