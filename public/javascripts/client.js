const socket = io();
let el;

document.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    const input =  e.target.childNodes[0];
    socket.emit('broadcast', input.value);
  input.value = '';
})

socket.on('connect', () => {
  // console.log(socket); // x8WIv7-mJelg7on_ALbx
});

socket.on('broadcast', (...msg) => {
  console.log(msg);
    document.querySelector('#messanges').innerHTML += `<p>${msg}</p>`;
    // window.scrollTo(0, document.body.scrollHeight);
});


    